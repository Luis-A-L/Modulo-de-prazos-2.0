const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'minutario-installers';

if (!SERVICE_ROLE_KEY) {
    console.error('Defina SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
    console.log('Atualizando configuração do bucket...');

    const { data, error } = await supabase.storage.updateBucket(BUCKET_NAME, {
        public: true,
        file_size_limit: 209715200,
        allowed_mime_types: [
            'application/octet-stream',
            'application/x-msdownload',
            'application/json',
            'application/x-apple-diskimage',
            'application/vnd.apple.installer+xml',
        ],
    });

    if (error) {
        console.error('Erro ao atualizar bucket:', error.message);
        process.exit(1);
    }

    console.log('✓ Bucket atualizado:');
    console.log(`  file_size_limit: 200 MB`);
    console.log(`  public: true`);
}

main();
