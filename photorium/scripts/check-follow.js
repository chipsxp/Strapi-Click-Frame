const sqlite = require('better-sqlite3');
const db = new sqlite('.tmp/data.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

const users = db.prepare("SELECT id, username, nickname FROM up_users").all();
console.log('Users:', users);

// Try to find the join table for following
const joinTable = tables.find(t => t.name.includes('following') || t.name.includes('followers'));
if (joinTable) {
    console.log('Join Table:', joinTable.name);
    console.log('Data:', db.prepare(`SELECT * FROM ${joinTable.name}`).all());
}
