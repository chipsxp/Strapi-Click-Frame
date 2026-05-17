const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%photo%'" ).all();
  console.log('--- Photo related tables ---');
  for (const t of tables) {
    console.log(`
Table: ${t.name}`);
    const cols = db.prepare(`PRAGMA table_info(${t.name})`).all().map(c => c.name);
    console.log(`Columns: ${cols.join(', ')}`);
    const count = db.prepare(`SELECT count(*) as c FROM ${t.name}`).get().c;
    console.log(`Count: ${count}`);
    if (count > 0) {
        const rows = db.prepare(`SELECT * FROM ${t.name} LIMIT 5`).all();
        console.log('Sample rows:');
        console.table(rows);
    }
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}

