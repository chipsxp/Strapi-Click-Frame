const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  console.log('--- Verifying Photo Removal ---');
  const photos = db.prepare("SELECT id, title, document_id FROM photos").all();
  console.log('Current photos in DB:');
  console.table(photos);

  const targets = photos.filter(p => 
    (p.title && (p.title.toLowerCase().includes('post-lunch') || p.title.toLowerCase().includes('post-launch')))
  );

  if (targets.length > 0) {
    console.log(`Found ${targets.length} remaining target(s). Deleting...`);
    for (const p of targets) {
      db.prepare('DELETE FROM reactions_photo_lnk WHERE photo_id = ?').run(p.id);
      db.prepare('DELETE FROM photos WHERE id = ?').run(p.id);
      console.log(`Deleted ID: ${p.id}`);
    }
  } else {
    console.log('No matching photos found.');
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
