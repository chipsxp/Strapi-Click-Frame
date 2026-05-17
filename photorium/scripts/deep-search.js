const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  console.log('--- Checking ALL tables for "Post-Lunch" ---');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  
  for (const t of tables) {
    try {
      // Get column names
      const cols = db.prepare(`PRAGMA table_info(${t.name})`).all().map(c => c.name);
      const textCols = cols.filter(c => c.toLowerCase().includes('name') || c.toLowerCase().includes('title') || c.toLowerCase().includes('description') || c.toLowerCase().includes('caption'));
      
      if (textCols.length > 0) {
        for (const col of textCols) {
          const results = db.prepare(`SELECT * FROM ${t.name} WHERE ${col} LIKE ?`).all('%Post-Lunch%');
          if (results.length > 0) {
            console.log(`\nFound in table ${t.name}, column ${col}:`);
            console.table(results);
          }
        }
      }
    } catch (e) {}
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
