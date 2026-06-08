async function migrateCheddar() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  
  try {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    
    console.log('--- Migrating Cheddar Given Total ---');
    
    const users = await app.db.query('plugin::users-permissions.user').findMany({
      populate: ['reactions']
    });

    for (const user of users) {
      if (user.reactions && user.reactions.length > 0) {
        const cheddarCount = user.reactions.filter(r => r.type === 'cheddar').length;
        if (cheddarCount > 0) {
          console.log(`User ${user.username} (ID: ${user.id}) gave ${cheddarCount} cheddar(s). Updating...`);
          await app.documents('plugin::users-permissions.user').update({
            documentId: user.documentId,
            data: {
              cheddar_given_total: cheddarCount
            }
          });
        }
      }
    }
    
    console.log('--- Migration Complete ---');
    
    await app.destroy();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

migrateCheddar();
