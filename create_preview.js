const fs = require('fs');
let html = fs.readFileSync('minutario-ext/popup/popup.html', 'utf8');
let css = fs.readFileSync('minutario-ext/popup/popup.css', 'utf8');
html = html.replace('<link rel="stylesheet" href="./popup.css" />', '<style>' + css + '</style>');
html = html.replace('style="display: none;"', 'style="display: flex;"'); // make login visible
fs.writeFileSync('temp_preview.html', html);
