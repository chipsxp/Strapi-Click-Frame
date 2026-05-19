export default {
  routes: [
    {
      method: 'GET',
      path: '/community-stats',
      handler: 'community-stat.getStats',
      config: {
        // We remove auth: false to let Strapi populate ctx.state.user if a token exists.
        // Public access is handled by the users-permissions plugin (bootstrap settings).
      },
    },
  ],
};
