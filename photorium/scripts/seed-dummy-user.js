async function seedTestUser() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  
  try {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    
    const testEmail = 'dummy@photorium.com';
    const testUsername = 'DummyUser';
    const testPassword = 'Password123';
    
    // Check if user exists
    const existing = await app.db.query('plugin::users-permissions.user').findOne({
      where: { email: testEmail }
    });
    
    if (existing) {
      console.log('Dummy user already exists.');
    } else {
      // Get the Authenticated role
      const authRole = await app.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' }
      });
      
      const user = await app.services['plugin::users-permissions.user'].add({
        username: testUsername,
        email: testEmail,
        password: testPassword,
        role: authRole.id,
        confirmed: true,
        blocked: false
      });
      
      console.log(`Created test user: ${testUsername} / ${testEmail} with password: ${testPassword}`);
    }
    
    await app.destroy();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

seedTestUser();