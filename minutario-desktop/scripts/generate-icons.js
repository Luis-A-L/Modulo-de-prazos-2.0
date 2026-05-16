/**
 * Gera ícones do logo oficial do TJPR para o Electron.
 * Uso: node scripts/generate-icons.js
 *
 * Redimensiona o Logo.png oficial para todos os tamanhos de ícone necessários.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BUILD_DIR = path.join(__dirname, '..', 'build');
const LOGO_PATH = path.join(__dirname, '..', '..', 'Logo.png');

async function generateIcons() {
    const sizes = {
        'icon-16.png': 16,
        'icon-24.png': 24,
        'icon-32.png': 32,
        'icon-48.png': 48,
        'icon-64.png': 64,
        'icon-96.png': 96,
        'icon-128.png': 128,
        'icon-256.png': 256,
        'icon-512.png': 512,
        'icon.png': 256,
        'icon-tray.png': 32,
    };

    if (!fs.existsSync(LOGO_PATH)) {
        console.error(`Logo nao encontrado em: ${LOGO_PATH}`);
        process.exit(1);
    }

    try {
        execSync(`python -c "from PIL import Image; Image.open(r'${LOGO_PATH}')"`, { stdio: 'pipe' });
    } catch (e) {
        console.error('Python/PIL nao disponivel. Instale: pip install Pillow');
        process.exit(1);
    }

    for (const [filename, size] of Object.entries(sizes)) {
        const outPath = path.join(BUILD_DIR, filename);
        try {
            execSync(
                `python -c "from PIL import Image; img = Image.open(r'${LOGO_PATH}'); img.resize((${size}, ${size}), Image.LANCZOS).save(r'${outPath}')"`,
                { stdio: 'pipe' }
            );
            console.log(`Generated: ${outPath} (${size}x${size})`);
        } catch (err) {
            console.error(`Error generating ${filename}:`, err.message);
        }
    }

    console.log('\nAll icons generated from Logo.png!');
}

generateIcons().catch(console.error);
