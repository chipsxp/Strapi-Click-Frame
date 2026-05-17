async function checkAdmins() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  
  try {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    
    // Fetch all admin users
    const admins = await app.db.query('admin::user').findMany();
    console.log('--- Admin Users ---');
    console.table(admins.map(u => ({ id: u.id, username: u.username, email: u.email, isActive: u.isActive })));
    
    await app.destroy();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkAdmins();