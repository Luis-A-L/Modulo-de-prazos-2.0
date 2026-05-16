const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'minutario-installers';
const DIST_DIR = require('path').join(__dirname, '..', 'dist');

if (!SERVICE_ROLE_KEY) {
    console.error('Defina SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
    // Check bucket info
    const { data: bucket, error } = await supabase.storage.getBucket(BUCKET_NAME);
    if (error) {
        console.error('Error getting bucket:', error.message);
        return;
    }
    console.log('=== Bucket Info ===');
    console.log(JSON.stringify(bucket, null, 2));

    // Check file sizes
    console.log('\n=== Files to upload ===');
    const fs = require('fs');
    for (const f of fs.readdirSync(DIST_DIR)) {
        const filePath = require('path').join(DIST_DIR, f);
        if (fs.statSync(filePath).isFile()) {
            const sizeMB = fs.statSync(filePath).size / 1024 / 1024;
            console.log(`  ${f}: ${sizeMB.toFixed(1)} MB`);
        }
    }
}

main();
