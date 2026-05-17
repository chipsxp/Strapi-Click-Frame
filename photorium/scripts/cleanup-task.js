const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  console.log('--- Database Cleanup Task ---');

  // 1. Delete the stubborn photo
  // Use exact title from user hint
  const photoTitle = 'Post-Lunch Experiment Photo';
  const photo = db.prepare('SELECT id, title, document_id FROM photos WHERE title = ? COLLATE NOCASE').get(photoTitle);
  
  if (photo) {
    console.log(`Found photo: "${photo.title}" (ID: ${photo.id}, DocID: ${photo.document_id})`);
    
    // Delete from photos table
    const deletePhoto = db.prepare('DELETE FROM photos WHERE id = ?').run(photo.id);
    console.log(`Deleted photo record from 'photos': ${deletePhoto.changes} row(s)`);
    
    // We should also check for related entries in link tables if they exist
    // Strapi 5 uses document_id for relations usually, but let's stick to the main record for now
  } else {
    console.log(`Photo "${photoTitle}" not found in 'photos' table.`);
    // Search again with partial match just in case
    const partialMatch = db.prepare('SELECT id, title FROM photos WHERE title LIKE ?').get('%Post-Lunch%');
    if (partialMatch) {
       console.log(`Found similar: "${partialMatch.title}" (ID: ${partialMatch.id})`);
       const deleteSimilar = db.prepare('DELETE FROM photos WHERE id = ?').run(partialMatch.id);
       console.log(`Deleted similar photo record: ${deleteSimilar.changes} row(s)`);
    }
  }

  // 2. Confirm all unconfirmed users
  const unconfirmed = db.prepare('SELECT id, username, email FROM up_users WHERE confirmed = 0 OR confirmed IS NULL').all();
  console.log(`
Found ${unconfirmed.length} unconfirmed users.`);
  
  for (const user of unconfirmed) {
    const update = db.prepare('UPDATE up_users SET confirmed = 1 WHERE id = ?').run(user.id);
    console.log(`Updated user "${user.username}" (ID: ${user.id}) to confirmed: true`);
  }

  // 3. Verify final state
  const users = db.prepare('SELECT id, username, email, confirmed FROM up_users').all();
  console.log('
--- Final User States ---');
  console.table(users);

} catch (err) {
  console.error('Error during cleanup:', err.message);
} finally {
  db.close();
}
