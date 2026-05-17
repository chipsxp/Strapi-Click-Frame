async function inspectTable() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  
  try {
    const appContext = await compileStrapi();
    const app = await createStrapi(appContext).load();
    
    const columns = await app.db.getConnection().table('up_users').columnInfo();
    console.log('--- UP_USERS COLUMNS ---');
    console.log(Object.keys(columns));
    
    await app.destroy();
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

inspectTable();
