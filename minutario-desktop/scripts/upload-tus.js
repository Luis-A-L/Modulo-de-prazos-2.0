/**
 * Upload using TUS resumable protocol (chunked uploads).
 * This bypasses the 5 MB Kong proxy limit.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'minutario-installers';
const DIST_DIR = path.join(__dirname, '..', 'dist');

if (!SERVICE_ROLE_KEY) {
    console.error('Defina SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function ensureBucket() {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET_NAME);
    if (!exists) {
        const { error } = await supabase.storage.createBucket(BUCKET_NAME, { public: true });
        if (error && !error.message.includes('already exists')) throw error;
    }
}

async function uploadTus(filePath, destName) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;
    const sizeMB = (fileSize / 1024 / 1024).toFixed(1);

    console.log(`\n  📤 ${destName} (${sizeMB} MB)`);

    // First, remove existing file
    try { await supabase.storage.from(BUCKET_NAME).remove([destName]); } catch (_) {}

    // Get authentication token for TUS
    const { data: { session } } = await supabase.auth.getSession();
    const token = SERVICE_ROLE_KEY;

    // TUS upload URL - includes object path
    const objectName = encodeURIComponent(destName);
    const tusEndpoint = `${SUPABASE_URL}/storage/v1/upload/resumable/${BUCKET_NAME}/${objectName}`;

    // Use Node.js built-in fetch with chunked upload
    // TUS protocol: send PATCH requests with content-range

    // Step 1: Create TUS upload (POST with metadata)
    const headers = {
        'Tus-Resumable': '1.0.0',
        'Upload-Length': String(fileSize),
        'Upload-Metadata': `filename ${Buffer.from(destName).toString('base64')}`,
        'Authorization': `Bearer ${token}`,
        'apikey': token,
    };

    console.log(`    Creating TUS upload...`);

    const createResponse = await fetch(tusEndpoint, {
        method: 'POST',
        headers,
    });

    if (!createResponse.ok) {
        const errText = await createResponse.text();
        // If 409 Conflict, the upload already exists - we'll try PATCH
        if (createResponse.status !== 409) {
            throw new Error(`Create failed (${createResponse.status}): ${errText.substring(0, 200)}`);
        }
    }

    const location = createResponse.headers.get('Location');
    if (!location) {
        throw new Error('No Location header in TUS response');
    }

    const uploadUrl = location.startsWith('http') ? location : `${SUPABASE_URL}${location}`;
    console.log(`    Upload URL: ${uploadUrl}`);

    // Step 2: Upload chunks
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB chunks
    let offset = 0;

    while (offset < fileSize) {
        const end = Math.min(offset + CHUNK_SIZE, fileSize);
        const chunk = fileBuffer.slice(offset, end);

        const patchResponse = await fetch(uploadUrl, {
            method: 'PATCH',
            headers: {
                'Tus-Resumable': '1.0.0',
                'Upload-Offset': String(offset),
                'Content-Type': 'application/offset+octet-stream',
                'Authorization': `Bearer ${token}`,
            },
            body: chunk,
        });

        if (!patchResponse.ok) {
            const errText = await patchResponse.text();
            throw new Error(`Chunk failed at offset ${offset} (${patchResponse.status}): ${errText.substring(0, 200)}`);
        }

        const newOffset = parseInt(patchResponse.headers.get('Upload-Offset') || String(end));
        offset = newOffset;

        const progress = ((offset / fileSize) * 100).toFixed(0);
        process.stdout.write(`\r    Progress: ${progress}% (${(offset / 1024 / 1024).toFixed(1)}/${sizeMB} MB)`);
    }

    console.log(`\n    Upload complete!`);

    // Step 3: Get public URL
    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(destName);

    return urlData.publicUrl;
}

async function main() {
    console.log('=== TUS Resumable Upload ===\n');

    await ensureBucket();
    console.log('Bucket ready');

    const files = [
        { name: 'Minutario Setup 1.0.0.exe', dest: 'Minutario-Setup-latest.exe' },
        { name: 'Minutario Setup 1.0.0.exe', dest: 'Minutario-Setup-1.0.0.exe' },
        { name: 'Minutario-1.0.0-portable.exe', dest: 'Minutario-Portable-latest.exe' },
        { name: 'latest.yml', dest: 'latest.yml' },
    ];

    let success = 0;
    let failed = 0;

    for (const file of files) {
        const filePath = path.join(DIST_DIR, file.name);
        if (!fs.existsSync(filePath)) {
            console.log(`  - ${file.name} not found`);
            continue;
        }

        try {
            const url = await uploadTus(filePath, file.dest);
            console.log(`    ✓ ${url}`);
            success++;
        } catch (err) {
            console.log(`    ✗ ${err.message}`);
            failed++;
        }
    }

    console.log(`\n=== Done: ${success} uploaded, ${failed} failed ===`);
}

main().catch(console.error);
