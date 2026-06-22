/**
 * Firebase Hosting deployer using service account (no CLI auth needed).
 * Uses Firebase Hosting REST API v1beta1.
 */
const fs   = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const zlib = require('zlib');

const SA_PATH  = 'D:\\Home\\Vault\\last-round-card-game-firebase-adminsdk-fbsvc-22ad50e10a.json';
const WWW_DIR  = path.join(__dirname, 'www');
const SITE_ID  = 'last-round-card-game';

const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));

// ── JWT / OAuth ───────────────────────────────────────────────────────────────
function base64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function getAccessToken() {
  const header  = base64url(Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const now     = Math.floor(Date.now() / 1000);
  const payload = base64url(Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })));
  const sig = base64url(crypto.createSign('RSA-SHA256').update(`${header}.${payload}`).sign(sa.private_key));
  const jwt = `${header}.${payload}.${sig}`;

  return new Promise((resolve, reject) => {
    const body = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req  = https.request({
      hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        const j = JSON.parse(d);
        if (j.access_token) resolve(j.access_token);
        else reject(new Error('Token error: ' + d));
      });
    });
    req.on('error', reject);
    req.write(body); req.end();
  });
}

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function apiReq(method, urlPath, token, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = https.request({
      hostname: 'firebasehosting.googleapis.com',
      path: urlPath, method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(bodyBuf ? { 'Content-Length': bodyBuf.length } : {}),
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    if (bodyBuf) req.write(bodyBuf);
    req.end();
  });
}

function uploadFile(uploadUrl, token, gzBuf) {
  return new Promise((resolve, reject) => {
    const u = new URL(uploadUrl);
    const req = https.request({
      hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': gzBuf.length,
      },
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(gzBuf); req.end();
  });
}

// ── File collection ───────────────────────────────────────────────────────────
function collectFiles(dir, base = dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...collectFiles(full, base));
    else results.push(full);
  }
  return results;
}

// ── Main deploy ───────────────────────────────────────────────────────────────
async function deploy() {
  console.log('🔑  Getting access token...');
  const token = await getAccessToken();
  console.log('✅  Authenticated');

  // 1. Create version
  console.log('📦  Creating hosting version...');
  const vRes = await apiReq('POST', `/v1beta1/sites/${SITE_ID}/versions`, token, {
    config: {}
  });
  if (vRes.status !== 200) { console.error('Create version failed:', vRes.body); process.exit(1); }
  const versionName = vRes.body.name;
  const versionId   = versionName.split('/').pop();
  console.log('  version:', versionId);

  // 2. Collect and hash files
  console.log('📂  Hashing files...');
  const files     = collectFiles(WWW_DIR);
  const fileMap   = {};  // urlPath → sha256 of gzipped content
  const gzBuffers = {};  // sha256 → gzipped buffer

  for (const f of files) {
    const rel  = '/' + path.relative(WWW_DIR, f).replace(/\\/g, '/');
    const raw  = fs.readFileSync(f);
    const gz   = zlib.gzipSync(raw);
    const hash = crypto.createHash('sha256').update(gz).digest('hex');
    fileMap[rel]    = hash;
    gzBuffers[hash] = gz;
  }
  console.log(`  ${files.length} files`);

  // 3. Populate files
  console.log('📋  Registering files...');
  const pRes = await apiReq('POST',
    `/v1beta1/sites/${SITE_ID}/versions/${versionId}:populateFiles`, token, { files: fileMap });
  if (pRes.status !== 200) { console.error('Populate failed:', pRes.body); process.exit(1); }

  const toUpload   = pRes.body.uploadRequiredHashes || [];
  const uploadUrl  = pRes.body.uploadUrl;
  console.log(`  ${toUpload.length} files need uploading`);

  // 4. Upload required files
  for (const hash of toUpload) {
    process.stdout.write(`  ↑ ${hash.slice(0, 12)}...`);
    const r = await uploadFile(`${uploadUrl}/${hash}`, token, gzBuffers[hash]);
    console.log(r.status === 200 ? ' ✓' : ` ✗ ${r.status}`);
  }

  // 5. Finalize version
  console.log('🔒  Finalizing version...');
  const fRes = await apiReq('PATCH',
    `/v1beta1/sites/${SITE_ID}/versions/${versionId}?update_mask=status`, token, { status: 'FINALIZED' });
  if (fRes.status !== 200) { console.error('Finalize failed:', fRes.body); process.exit(1); }

  // 6. Create release
  console.log('🚀  Creating release...');
  const rRes = await apiReq('POST',
    `/v1beta1/sites/${SITE_ID}/releases?versionName=${versionName}`, token, {});
  if (rRes.status !== 200) { console.error('Release failed:', rRes.body); process.exit(1); }

  console.log('\n✅  Deploy complete!');
  console.log('    https://last-round-card-game.web.app');
}

deploy().catch(e => { console.error('💥', e.message); process.exit(1); });
