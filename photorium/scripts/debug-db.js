const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('--- Tables ---');
  console.log(tables.map(t => t.name).join(', '));
  
  // Search for the photo in common table names
  const tableNames = ['photos', 'photo', 'files', 'upload_file'];
  for (const table of tableNames) {
    try {
      const results = db.prepare(`SELECT * FROM ${table} WHERE title LIKE ? OR name LIKE ?`).all('%post launch%', '%post launch%');
      if (results.length > 0) {
        console.log(`\nFound in ${table}:`);
        console.table(results);
      }
    } catch (e) {
      // Table might not exist
    }
  }

} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
