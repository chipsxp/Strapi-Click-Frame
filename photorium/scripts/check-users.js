async function checkUsers() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  
  try {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    
    const adminUsers = await app.db.query('admin::user').findMany();
    console.log('--- ADMIN USERS ---');
    adminUsers.forEach(u => console.log(`Username: ${u.username}, Email: ${u.email}`));
    
    const upUsers = await app.db.query('plugin::users-permissions.user').findMany();
    console.log('--- UP USERS ---');
    upUsers.forEach(u => console.log(`Username: ${u.username}, Email: ${u.email}`));
    
    await app.destroy();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

checkUsers();
