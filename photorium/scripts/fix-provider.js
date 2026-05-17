async function fixProvider() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  
  try {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    
    // Fetch all users
    const users = await app.db.query('plugin::users-permissions.user').findMany();
    console.log('--- Current Users ---');
    console.table(users.map(u => ({ id: u.id, username: u.username, email: u.email, provider: u.provider, confirmed: u.confirmed })));
    
    let updatedCount = 0;
    for (const user of users) {
      if (!user.provider) {
        await app.db.query('plugin::users-permissions.user').update({
          where: { id: user.id },
          data: { provider: 'local', confirmed: true }
        });
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} users to set provider = 'local' and confirmed = true.`);
    
    await app.destroy();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fixProvider();
