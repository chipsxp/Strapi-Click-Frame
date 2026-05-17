const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', '.tmp', 'data.db');
const db = new Database(dbPath);

try {
  const key = 'plugin_users-permissions_email';
  const settingsRes = db.prepare('SELECT value FROM strapi_core_store_settings WHERE key = ?').get(key);
  
  if (settingsRes) {
    let settings = JSON.parse(settingsRes.value);
    
    // Update confirmation email template to point to ASTRO frontend
    settings.email_confirmation.options.message = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3d2b1f;">Welcome to Photorium!</h2>
        <p>Your stash is almost ready. Please confirm your email by clicking the link below:</p>
        <p style="margin: 30px 0;">
          <a href="http://localhost:4321/confirm?token=<%= CODE %>" 
             style="background: #ffc107; color: #3d2b1f; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
            Confirm My Stash
          </a>
        </p>
        <p style="font-size: 0.8rem; color: #666;">
          If the button doesn't work, copy and paste this link into your browser: <br>
          <span style="color: #ff9800;">http://localhost:4321/confirm?token=<%= CODE %></span>
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 0.8rem; color: #999;">Happy Munching,<br>The Photorium Team</p>
      </div>
    `.trim();

    db.prepare('UPDATE strapi_core_store_settings SET value = ? WHERE key = ?').run(JSON.stringify(settings), key);
    console.log('✅ Email confirmation template updated with clickable link and styling');
  } else {
    console.log('❌ Settings not found');
  }
} catch (err) {
  console.error('Error:', err.message);
} finally {
  db.close();
}
