const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  // 1. Search for the photo with improved matching
  console.log('--- Searching for "Post-Lunch Experiment Photo" ---');
  // Strapi 5 often uses 'title' for content types, but let's check what's in 'photos' table
  const photosTable = db.prepare("SELECT * FROM photos").all();
  console.log(`Total photos in table: ${photosTable.length}`);
  
  const targetPhoto = photosTable.find(p => 
    (p.title && p.title.toLowerCase().includes('post-lunch')) || 
    (p.name && p.name.toLowerCase().includes('post-lunch'))
  );

  if (targetPhoto) {
    console.log('Found target photo:', JSON.stringify(targetPhoto, null, 2));
    
    // Delete relations first if needed (Strapi 5 usually handles this via join tables)
    // Join tables for photos: comments_photo_lnk, photos_author_lnk, photos_category_lnk, photos_tags_lnk, reactions_photo_lnk
    const joinTables = [
        'comments_photo_lnk', 
        'photos_author_lnk', 
        'photos_category_lnk', 
        'photos_tags_lnk', 
        'reactions_photo_lnk',
        'reactions' // Strapi 5 might have direct link or separate table
    ];

    for (const table of joinTables) {
        try {
            const result = db.prepare(`DELETE FROM ${table} WHERE photo_id = ?`).run(targetPhoto.id);
            console.log(`Deleted from ${table}: ${result.changes} rows`);
        } catch (e) {
            // Might use a different column name or table might not exist
            try {
                const result = db.prepare(`DELETE FROM ${table} WHERE entity_id = ?`).run(targetPhoto.id);
                 console.log(`Deleted from ${table} (entity_id): ${result.changes} rows`);
            } catch (e2) {}
        }
    }

    // Delete the photo itself
    const deleteResult = db.prepare('DELETE FROM photos WHERE id = ?').run(targetPhoto.id);
    console.log(`Deleted photo record from 'photos': ${deleteResult.changes} rows`);
  } else {
    console.log('Photo NOT found in "photos" table. Full titles found:');
    console.log(photosTable.map(p => p.title || p.name).join(', '));
  }

  // 2. Confirm Users (chipsxp and any other test users)
  console.log('\n--- Managing Users ---');
  const users = db.prepare('SELECT id, username, email, confirmed FROM up_users').all();
  console.table(users);

  for (const user of users) {
    // Confirm ALL users for now as requested or specifically chipsxp
    if (user.confirmed === 0 || user.confirmed === false || user.username === 'chipsxp') {
        const update = db.prepare('UPDATE up_users SET confirmed = 1 WHERE id = ?').run(user.id);
        console.log(`Set confirmed=1 for user: ${user.username} (${update.changes} updated)`);
    }
  }

} catch (err) {
  console.error('Error:', err.message);
  console.error(err.stack);
} finally {
  db.close();
}
