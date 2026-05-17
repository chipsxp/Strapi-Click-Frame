const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  const files = db.prepare("SELECT * FROM files").all();
  console.log('--- Files Table ---');
  console.table(files.map(f => ({ id: f.id, name: f.name, caption: f.caption })));

} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
