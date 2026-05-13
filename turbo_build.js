const fs = require('fs');
const { execSync } = require('child_process');

// Lista de arquivos na ordem correta de dependência
const files = [
  'regrasCNJ.js',
  'regrasCivel.js',
  'regrasCrime.js',
  'utils.js',
  'contexts.js',
  'components.js',
  'login.js',
  'MinutasAdminPage.js',
  'CalendarAdminPage.js',
  'BugReportsPage.js',
  'MinutaPreparoPage.js',
  'app.js'
];

async function build() {
  console.log('🚀 Iniciando Turbo Build...');
  
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
  }

  // 2. Concatenar arquivos limpando redeclarações duplicadas
  console.log('📦 Agrupando arquivos e limpando redeclarações...');
  
  // Declaração única no topo para ser compartilhada por todos
  let combinedContent = `
// --- SHARED REACT HOOKS ---
const { useState, useEffect, useCallback, createContext, useContext, useRef, useMemo, Fragment } = React;
`;

  combinedContent += files.map(file => {
    if (!fs.existsSync(file)) {
        console.warn(`⚠️ Arquivo não encontrado: ${file}`);
        return '';
    }
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove declarações repetidas que causam erro no esbuild
    // 1. Remove: const { ... } = React;
    content = content.replace(/const\s+\{[^}]+\}\s*=\s*React;?/g, '// [Removido redeclaração de React hooks]');
    
    // 2. Remove: const { ... } = window; (comum no app.js para pegar componentes)
    content = content.replace(/const\s+\{[^}]+\}\s*=\s*window;?/g, '// [Removido extração redundante de window]');
    
    // 3. Remove: const { ... } = window.ReactChartjs2;
    content = content.replace(/const\s+\{[^}]+\}\s*=\s*window\.ReactChartjs2;?/g, '// [Removido extração de ReactChartjs2]');

    // Garante que contextos e funções globais sejam exportados para o window
    // para compatibilidade com o sistema de componentes legado
    if (file === 'contexts.js') {
        content += '\nwindow.AuthContext = AuthContext;\nwindow.SettingsContext = SettingsContext;\nwindow.BugReportContext = BugReportContext;\nwindow.useAuth = useAuth;';
    }

    return `\n// --- FILE: ${file} ---\n${content}`;
  }).join('\n');

  fs.writeFileSync('dist/raw_bundle.js', combinedContent);

  // 3. Usar esbuild para transpilar JSX e minificar
  console.log('⚡ Transpilando e Minificando com esbuild...');
  try {
    execSync('npx esbuild dist/raw_bundle.js --outfile=dist/bundle.min.js --minify --loader:.js=jsx --target=es2015', { stdio: 'inherit' });
    console.log('✅ Pronto! bundle.min.js gerado em dist/');
  } catch (e) {
    console.error('❌ Erro no build:', e.message);
  }
}

build();
