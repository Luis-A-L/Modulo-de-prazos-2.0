/**
 * Upload script using the anon key (requires bucket with public RLS).
 * Se falhar, execute com SUPABASE_SERVICE_ROLE_KEY.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ifkhwqfxtdfbotifxfzq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlma2h3cWZ4dGRmYm90aWZ4ZnpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5OTc0ODksImV4cCI6MjA5MzU3MzQ4OX0.iN5PKFougk2xfpI_etHzJSJxn4egN6kd-_8dV-sSCwM';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET_NAME = 'minutario-installers';
const DIST_DIR = path.join(__dirname, '..', 'dist');

const client = createClient(
    SUPABASE_URL,
    SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
    SERVICE_ROLE_KEY ? {} : { auth: { persistSession: false } }
);

async function uploadFile(filePath, destinationName) {
    const content = fs.readFileSync(filePath);
    const { data, error } = await client.storage
        .from(BUCKET_NAME)
        .upload(destinationName, content, {
            contentType: 'application/octet-stream',
            upsert: true,
            cacheControl: '3600',
        });

    if (error) {
        throw new Error(`Upload failed for ${destinationName}: ${error.message}`);
    }

    const { data: urlData } = client.storage
        .from(BUCKET_NAME)
        .getPublicUrl(destinationName);

    console.log(`  ✓ ${destinationName} (${(content.length / 1024 / 1024).toFixed(1)} MB)`);
    console.log(`    URL: ${urlData.publicUrl}`);
    return urlData.publicUrl;
}

async function main() {
    console.log('=== Upload Minutário Installers para Supabase Storage ===\n');
    console.log(`Bucket: ${BUCKET_NAME}`);
    console.log(`Using: ${SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'ANON_KEY (pode falhar sem RLS)'}\n`);

    // Try to ensure bucket exists
    try {
        const { data: buckets } = await client.storage.listBuckets();
        const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

        if (!bucketExists) {
            console.log(`Criando bucket "${BUCKET_NAME}"...`);
            const { error: createError } = await client.storage.createBucket(BUCKET_NAME, {
                public: true,
                allowedMimeTypes: [
                    'application/x-msdownload',
                    'application/x-apple-diskimage',
                    'application/octet-stream',
                    'application/json',
                ],
            });
            if (createError) {
                console.log(`  ✗ Não foi possível criar bucket: ${createError.message}`);
                console.log('  Para criar o bucket manualmente:');
                console.log('  1. Acesse https://supabase.com/dashboard');
                console.log('  2. Vá em Storage → Create bucket');
                console.log(`  3. Nome: ${BUCKET_NAME}, Público: sim`);
                console.log('  4. Configure RLS policy para permitir INSERT anônimo\n');
                console.log('  Tentando continuar com upload mesmo assim...\n');
            } else {
                console.log('  ✓ Bucket criado!\n');
            }
        } else {
            console.log('  ✓ Bucket já existe\n');
        }
    } catch (err) {
        console.log(`  ⚠ Erro ao verificar bucket: ${err.message}\n`);
    }

    // Files to upload
    const files = [
        { name: 'Minutario Setup 1.0.0.exe', dest: 'Minutario-Setup-latest.exe' },
        { name: 'Minutario Setup 1.0.0.exe', dest: 'Minutario-Setup-1.0.0.exe' },
        { name: 'latest.yml', dest: 'latest.yml' },
    ];

    // Check for Mac/Linux builds too
    for (const f of fs.readdirSync(DIST_DIR)) {
        if (f.endsWith('.dmg')) files.push({ name: f, dest: f });
        if (f.endsWith('.AppImage')) files.push({ name: f, dest: f });
        if (f.endsWith('.deb')) files.push({ name: f, dest: f });
    }

    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
        const filePath = path.join(DIST_DIR, file.name);
        if (!fs.existsSync(filePath)) {
            console.log(`  - ${file.name} (não encontrado, pulando)`);
            continue;
        }

        try {
            process.stdout.write(`  Upload ${file.name}... `);
            await uploadFile(filePath, file.dest);
            successCount++;
        } catch (err) {
            console.log(`  ✗ ${file.name}: ${err.message}`);
            failCount++;
        }
    }

    console.log(`\n=== Resumo: ${successCount} enviados, ${failCount} falhas ===`);

    if (failCount > 0) {
        console.log('\nPara resolver, execute com a SERVICE_ROLE_KEY:');
        console.log('  $env:SUPABASE_SERVICE_ROLE_KEY = "sua-chave-service-role"');
        console.log('  node scripts/upload-now.js');
        console.log('\nA chave SERVICE_ROLE está em:');
        console.log('  https://supabase.com/dashboard → Project Settings → API → service_role key');
    }
}

main().catch(console.error);
