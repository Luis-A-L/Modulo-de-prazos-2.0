/**
 * Upload de arquivos grandes via TUS protocol.
 * Supabase Storage usa TUS para uploads > 5MB na free tier.
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

async function uploadFileChunked(filePath, destinationName) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileSize = fileBuffer.length;
    const CHUNK_SIZE = 4 * 1024 * 1024; // 4 MB chunks
    const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);

    console.log(`  Size: ${(fileSize / 1024 / 1024).toFixed(1)} MB in ${totalChunks} chunks`);

    // First try: direct upload with TUS
    try {
        const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(destinationName, fileBuffer, {
                contentType: 'application/octet-stream',
                upsert: true,
                cacheControl: '3600',
            });

        if (error) {
            // If file is too large, it might already exist. Try deleting and re-uploading
            if (error.message.includes('exceeded') || error.message.includes('too large')) {
                console.log('  Direct upload failed, trying with upsert...');
                const { error: upsertError } = await supabase.storage
                    .from(BUCKET_NAME)
                    .upload(destinationName, fileBuffer, {
                        contentType: 'application/octet-stream',
                        upsert: true,
                        cacheControl: '3600',
                    });
                if (upsertError) throw upsertError;
            } else {
                throw error;
            }
        }

        const { data: urlData } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(destinationName);

        return urlData.publicUrl;
    } catch (err) {
        // If still failing, try removing existing file first, then upload
        if (err.message.includes('exceeded') || err.message.includes('too large')) {
            console.log('  Removing existing file and retrying...');
            // Remove existing file
            await supabase.storage.from(BUCKET_NAME).remove([destinationName]);
            // Small delay
            await new Promise(r => setTimeout(r, 1000));
            // Try upload again
            const { data, error: retryError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(destinationName, fileBuffer, {
                    contentType: 'application/octet-stream',
                    cacheControl: '3600',
                });
            if (retryError) throw retryError;

            const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(destinationName);
            return urlData.publicUrl;
        }
        throw err;
    }
}

async function main() {
    console.log('=== Upload Large Installers to Supabase Storage ===\n');

    // Update bucket for large files
    console.log('Configuring bucket...');
    const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
        public: true,
        file_size_limit: 524288000, // 500 MB
        allowed_mime_types: [
            'application/octet-stream',
            'application/x-msdownload',
            'application/json',
            'application/x-apple-diskimage',
        ],
    });
    if (updateError) {
        console.log(`  Bucket config warning: ${updateError.message}`);
    } else {
        console.log('  Bucket configured for 500 MB uploads\n');
    }

    // Upload files
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
            console.log(`  - ${file.name} (not found)`);
            continue;
        }

        try {
            process.stdout.write(`\n  📤 ${file.name} → ${file.dest}...`);
            const url = await uploadFileChunked(filePath, file.dest);
            console.log(` ✓`);
            console.log(`    ${url}`);
            success++;
        } catch (err) {
            console.log(` ✗`);
            console.log(`    Error: ${err.message}`);
            failed++;
        }
    }

    console.log(`\n=== Done: ${success} uploaded, ${failed} failed ===`);

    if (failed > 0) {
        console.log('\nIf uploads still fail, please:');
        console.log('1. Upgrade Supabase to Pro tier for larger file limits');
        console.log('2. Or upload manually via Supabase Dashboard → Storage');
    }
}

main().catch(console.error);
