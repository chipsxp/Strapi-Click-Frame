const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('--- Table Counts ---');
  for (const t of tables) {
    try {
      const count = db.prepare(`SELECT count(*) as c FROM ${t.name}`).get().c;
      if (count > 0) {
        console.log(`${t.name}: ${count}`);
      }
    } catch (e) {}
  }

  console.log('\n--- Checking Photos specifically ---');
  const photos = db.prepare("SELECT * FROM photos").all();
  console.log('Photos:', photos);

} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}

