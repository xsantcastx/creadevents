/* Backfill Storage -> Firestore (/images)
 * - Scans gs://<bucket>/public/<section>/<file>
 * - Ensures a download URL (adds token if missing)
 * - Upserts a Firestore doc per file (id = sha1(path))
 *
 * Usage:
 *   # 1) Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON (do NOT commit)
 *   # 2) Optionally set STORAGE_BUCKET if not default (<project-id>.appspot.com)
 *   # 3) Optionally restrict sections: SECTIONS=hero,gallery node scripts/backfill-images.js
 */

const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const path = require('path');

const saPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!saPath) {
  console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS environment variable not set');
  console.error('');
  console.error('📋 Setup Instructions:');
  console.error('1. Download your Firebase Admin SDK service account JSON file');
  console.error('2. Save it securely (do NOT commit to git)');
  console.error('3. Set environment variable:');
  console.error('   Windows PowerShell:');
  console.error('   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\serviceAccount.json"');
  console.error('   ');
  console.error('   macOS/Linux:');
  console.error('   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json');
  console.error('');
  process.exit(1);
}

// Check if the file exists
const fs = require('fs');
if (!fs.existsSync(saPath)) {
  console.error(`❌ Error: Service account file not found at: ${saPath}`);
  console.error('');
  console.error('Please check:');
  console.error('1. The file path is correct');
  console.error('2. The file exists at that location');
  console.error('3. You have permission to read the file');
  console.error('');
  process.exit(1);
}

let sa;
try {
  sa = require(path.resolve(saPath));
} catch (error) {
  console.error(`❌ Error loading service account file: ${error.message}`);
  console.error('');
  console.error('Please check:');
  console.error('1. The file is valid JSON');
  console.error('2. It\'s a proper Firebase service account key');
  console.error('');
  process.exit(1);
}
const bucketName = process.env.STORAGE_BUCKET || `${sa.project_id}.appspot.com`;

admin.initializeApp({
  credential: admin.credential.cert(sa),
  storageBucket: bucketName,
});

const bucket = admin.storage().bucket();
const db = admin.firestore();

const allowedSections = process.env.SECTIONS
  ? new Set(process.env.SECTIONS.split(',').map(s => s.trim()).filter(Boolean))
  : null;

(async () => {
  console.log(`Using bucket: ${bucket.name}`);
  if (allowedSections) console.log(`Filtering sections: ${[...allowedSections].join(', ')}`);

  const [files] = await bucket.getFiles({ prefix: 'public/' });
  let created = 0, updated = 0, skipped = 0;

  for (const file of files) {
    if (file.name.endsWith('/')) continue; // skip folders
    const parts = file.name.split('/'); // ['public', '<section>', ...filename]
    const section = parts[1];
    if (!section) { skipped++; continue; }
    if (allowedSections && !allowedSections.has(section)) { skipped++; continue; }

    const name = parts.slice(2).join('/');        // filename (allows nested)
    const storagePath = file.name;

    // Ensure a download token exists, then construct URL
    const [meta] = await file.getMetadata();
    let token = meta.metadata && meta.metadata.firebaseStorageDownloadTokens;
    if (!token) {
      token = uuidv4();
      await file.setMetadata({
        metadata: { ...(meta.metadata || {}), firebaseStorageDownloadTokens: token },
      });
    }
    const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(storagePath)}?alt=media&token=${token}`;
    const createdAt = admin.firestore.Timestamp.fromDate(new Date(meta.timeCreated || Date.now()));

    // Deterministic doc id from path (so reruns are idempotent)
    const id = crypto.createHash('sha1').update(storagePath).digest('hex');
    const docRef = db.collection('images').doc(id);
    const snap = await docRef.get();

    if (snap.exists) {
      const existing = snap.data();
      await docRef.update({
        section,
        path: storagePath,
        url,
        name,
        // keep existing order if present, else seed with Date.now()
        order: typeof existing.order === 'number' ? existing.order : Date.now(),
        createdAt: existing.createdAt || createdAt,
      });
      updated++;
    } else {
      await docRef.set({
        section,
        path: storagePath,
        url,
        name,
        order: Date.now(),     // you can manually reorder later in the dashboard
        alt: '',
        caption: '',
        createdAt,
      });
      created++;
    }
  }

  console.log(`Done. created=${created}, updated=${updated}, skipped=${skipped}`);
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });