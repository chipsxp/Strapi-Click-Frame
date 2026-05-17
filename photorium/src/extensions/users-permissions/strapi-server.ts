
export default (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    // 1. Call the original 'me' controller to handle authentication and basic data
    await originalMe(ctx);

    // 2. If the original controller succeeded, it will have set ctx.body
    if (ctx.state.user && ctx.body) {
      try {
        // Fetch the user with role and following populated
        const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: ctx.state.user.id },
          populate: ['role', 'following', 'avatar'],
        });

        if (userWithRole) {
          if (userWithRole.role) {
            ctx.body.role = {
              id: userWithRole.role.id,
              name: userWithRole.role.name,
              type: userWithRole.role.type
            };
          }
          if (userWithRole.following) {
            ctx.body.following = userWithRole.following.map(u => ({
              id: u.id,
              documentId: u.documentId,
              username: u.username
            }));
          }
          if (userWithRole.avatar) {
            ctx.body.avatar = userWithRole.avatar;
          }
        }
      } catch (error) {
        console.error('Error populating role in custom /me controller:', error);
        // We don't want to crash the whole request if just the role fetch fails
      }
    }
  };

  return plugin;
};
