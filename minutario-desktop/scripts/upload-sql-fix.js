/**
 * Tenta aumentar o limite de upload via SQL management API.
 * E também tenta fazer o upload diretamente.
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

async function main() {
    console.log('=== Upload via Management API ===\n');

    // Try to run SQL to set file_size_limit at project level
    console.log('Attempting to set global file size limit via SQL API...');
    try {
        const { error: sqlError } = await supabase.rpc('exec_sql', {
            sql: `UPDATE storage.buckets 
                  SET file_size_limit = 524288000 
                  WHERE id = '${BUCKET_NAME}';`
        });
        if (sqlError) {
            console.log(`  SQL RPC not available: ${sqlError.message}`);
            console.log('  Trying alternative approach...\n');
        } else {
            console.log('  SQL executed successfully!\n');
        }
    } catch (err) {
        console.log(`  SQL not supported via RPC\n`);
    }

    // Try the raw management API
    console.log(`Trying Management API to update bucket...`);
    try {
        const url = `${SUPABASE_URL}/storage/v1/bucket/${BUCKET_NAME}`;
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
            },
            body: JSON.stringify({
                public: true,
                file_size_limit: 524288000,
                allowed_mime_types: ['*/*'],
            }),
        });
        const data = await response.json();
        console.log(`  Status: ${response.status}`);
        console.log(`  Response: ${JSON.stringify(data)}\n`);
    } catch (err) {
        console.log(`  Management API error: ${err.message}\n`);
    }

    // Now try uploading using raw fetch with the storage object API
    // This might bypass the proxy limit by using direct REST API
    console.log('Attempting direct upload via REST API...\n');

    const files = [
        { name: 'Minutario Setup 1.0.0.exe', dest: 'Minutario-Setup-latest.exe' },
        { name: 'latest.yml', dest: 'latest.yml' },
    ];

    for (const file of files) {
        const filePath = path.join(DIST_DIR, file.name);
        if (!fs.existsSync(filePath)) {
            console.log(`  - ${file.name} not found`);
            continue;
        }

        const fileBuffer = fs.readFileSync(filePath);
        const sizeMB = fileBuffer.length / 1024 / 1024;

        console.log(`  Uploading ${file.name} (${sizeMB.toFixed(1)} MB)...`);

        try {
            const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${file.dest}`;

            // Option 1: multipart/form-data
            const formData = new FormData();
            const blob = new Blob([fileBuffer]);
            formData.append('file', blob, file.name);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
                    'apikey': SERVICE_ROLE_KEY,
                },
                body: formData,
            });

            const result = await response.text();
            console.log(`    Status: ${response.status}`);
            console.log(`    Response: ${result.substring(0, 200)}`);

            if (response.ok) {
                console.log(`  ✓ ${file.dest} uploaded!\n`);
            } else {
                console.log(`  ✗ Failed\n`);
            }
        } catch (err) {
            console.log(`  ✗ Error: ${err.message}\n`);
        }
    }
}

main().catch(console.error);
