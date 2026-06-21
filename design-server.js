/**
 * Last Round — Design Server
 * Serves www/ locally and accepts CSS saves from the in-browser design mode.
 *
 * Usage:  node design-server.js
 * Then open http://localhost:3001 in Chrome and press Ctrl+Shift+D
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const WWW  = path.join(__dirname, 'www');
const CSS  = path.join(WWW, 'style.css');
const PORT = 3001;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css' : 'text/css',
  '.js'  : 'text/javascript',
  '.png' : 'image/png',
  '.ico' : 'image/x-icon',
  '.json': 'application/json',
  '.svg' : 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const server = http.createServer((req, res) => {
  // CORS — design mode fetches from the same localhost origin, but keep it open
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // ── POST /save-css ────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/save-css') {
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        const { marker, css } = JSON.parse(body);
        if (!marker || typeof css !== 'string') throw new Error('Bad payload');

        const startTag = `/* DESIGN_MODE_START: ${marker} */`;
        const endTag   = `/* DESIGN_MODE_END: ${marker} */`;
        const block    = `${startTag}\n${css}\n${endTag}`;

        let src = fs.readFileSync(CSS, 'utf8');

        if (src.includes(startTag)) {
          // Replace existing block
          const re = new RegExp(
            escapeRegex(startTag) + '[\\s\\S]*?' + escapeRegex(endTag)
          );
          src = src.replace(re, block);
        } else {
          // Append at end
          src = src.trimEnd() + '\n\n' + block + '\n';
        }

        fs.writeFileSync(CSS, src, 'utf8');
        console.log(`[design] Saved block "${marker}" → style.css`);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error('[design] Save error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // ── Static file serving ───────────────────────────────────────────────────
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(WWW, urlPath);

  // Security: stay inside WWW
  if (!filePath.startsWith(WWW)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n🎨  Last Round Design Server');
  console.log(`    http://localhost:${PORT}`);
  console.log('');
  console.log('    Open the URL above in Chrome.');
  console.log('    Press  Ctrl+Shift+D  to toggle design mode.');
  console.log('    Drag elements, then click  💾 Save to File.');
  console.log('    style.css is updated in place — just reload the browser.\n');
});
