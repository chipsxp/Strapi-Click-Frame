const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'photorium', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  // Strapi 5 table name for users
  const users = db.prepare('SELECT id, username, email FROM up_users').all();
  console.log('--- Registered Users ---');
  console.table(users);
  
  const roles = db.prepare('SELECT id, name, type FROM up_roles').all();
  console.log('\n--- Available Roles ---');
  console.table(roles);
} catch (err) {
  console.error('Error reading database:', err.message);
  // Try alternative table name if up_users fails
  try {
    const users = db.prepare('SELECT id, username, email FROM users_permissions_user').all();
    console.log('--- Registered Users (Alternative Table) ---');
    console.table(users);
  } catch (err2) {
    console.error('Final attempt failed:', err2.message);
  }
} finally {
  db.close();
}
