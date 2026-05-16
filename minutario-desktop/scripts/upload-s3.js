/**
 * Upload via presigned URL (bypasses Kong proxy limit).
 * Supabase Storage creates S3 presigned URLs for direct upload.
 */
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const http = require('https');

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
        const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            file_size_limit: 524288000,
        });
        if (error && !error.message.includes('already exists')) {
            throw error;
        }
    }
}

async function uploadViaPresignedUrl(filePath, destName) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;
    const sizeMB = (fileSize / 1024 / 1024).toFixed(1);

    console.log(`\n  📤 ${destName} (${sizeMB} MB)`);

    // Step 1: Remove existing file if any
    try {
        await supabase.storage.from(BUCKET_NAME).remove([destName]);
    } catch (_) {}

    // Step 2: Get presigned upload URL
    const { data, error: urlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUploadUrl(destName);

    if (urlError) {
        throw new Error(`Presigned URL failed: ${urlError.message}`);
    }

    const presignedUrl = data?.url || data?.signedUrl;
    if (!presignedUrl) {
        throw new Error('No presigned URL returned');
    }

    console.log(`    Got presigned URL, uploading...`);

    // Step 3: Upload directly to the presigned URL (S3, bypasses Kong)
    const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Length': String(fileSize),
        },
        body: fileBuffer,
    });

    if (!uploadResponse.ok) {
        const errText = await uploadResponse.text();
        throw new Error(`Upload failed (${uploadResponse.status}): ${errText}`);
    }

    // Step 4: Get public URL
    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(destName);

    return publicUrlData.publicUrl;
}

async function main() {
    console.log('=== Upload via Presigned S3 URLs ===\n');

    await ensureBucket();
    console.log('Bucket ready\n');

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
            console.log(`  - ${file.name} not found, skipping`);
            continue;
        }

        try {
            const url = await uploadViaPresignedUrl(filePath, file.dest);
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
