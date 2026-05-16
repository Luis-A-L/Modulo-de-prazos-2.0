/**
 * Script de upload dos instaladores para o Supabase Storage.
 * Uso: node scripts/upload-installer.js
 *
 * Pré-requisitos:
 * 1. Os instaladores devem estar na pasta dist/
 * 2. Configurar SUPABASE_SERVICE_ROLE_KEY como variável de ambiente
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = 'minutario-installers';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Erro: Defina SUPABASE_SERVICE_ROLE_KEY como variável de ambiente');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const DIST_DIR = path.join(__dirname, '..', 'dist');

async function ensureBucket() {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) throw error;

    const exists = buckets.find(b => b.name === BUCKET_NAME);
    if (!exists) {
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            allowedMimeTypes: [
                'application/x-msdownload',
                'application/x-apple-diskimage',
                'application/x-iso9660-image',
                'application/vnd.apple.installer+xml',
                'application/octet-stream',
            ],
        });
        if (createError) throw createError;
        console.log(`Bucket "${BUCKET_NAME}" criado.`);
    }
}

async function uploadFile(filePath, destinationName) {
    const fileBuffer = fs.readFileSync(filePath);
    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(destinationName, fileBuffer, {
            contentType: 'application/octet-stream',
            upsert: true,
        });

    if (error) throw error;

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(destinationName);

    console.log(`Uploaded: ${destinationName}`);
    console.log(`Public URL: ${urlData.publicUrl}`);
    return urlData.publicUrl;
}

async function uploadLatestYml() {
    const files = [
        { pattern: /latest\.yml$/i, name: 'latest.yml' },
        { pattern: /latest-mac\.yml$/i, name: 'latest-mac.yml' },
        { pattern: /latest-linux\.yml$/i, name: 'latest-linux.yml' },
    ];

    const distFiles = fs.readdirSync(DIST_DIR);

    for (const file of files) {
        const match = distFiles.find(f => file.pattern.test(f));
        if (match) {
            const filePath = path.join(DIST_DIR, match);
            await uploadFile(filePath, file.name);
        }
    }
}

async function main() {
    console.log('Iniciando upload dos instaladores...\n');

    try {
        await ensureBucket();

        const distFiles = fs.readdirSync(DIST_DIR);

        const installerPatterns = [
            /-Setup-\d+\.\d+\.\d+\.exe$/i,
            /-Setup-latest\.exe$/i,
            /-\d+\.\d+\.\d+\.dmg$/i,
            /-latest\.dmg$/i,
            /-\d+\.\d+\.\d+\.AppImage$/i,
            /-latest\.AppImage$/i,
            /_\d+\.\d+\.\d+_amd64\.deb$/i,
        ];

        for (const file of distFiles) {
            const isInstaller = installerPatterns.some(p => p.test(file));
            if (isInstaller) {
                const filePath = path.join(DIST_DIR, file);
                console.log(`Encontrado: ${file} (${(fs.statSync(filePath).size / 1024 / 1024).toFixed(1)} MB)`);
                await uploadFile(filePath, file);
            }
        }

        await uploadLatestYml();

        console.log('\nUpload concluído!');
    } catch (err) {
        console.error('Erro durante upload:', err);
        process.exit(1);
    }
}

main();
