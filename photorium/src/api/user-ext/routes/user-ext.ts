export default {
  routes: [
    {
      method: 'PUT',
      path: '/user-ext/me',
      handler: 'user-ext.updateMe',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/user-ext/toggle-follow',
      handler: 'user-ext.toggleFollow',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/user-ext/public-profile/:username',
      handler: 'user-ext.publicProfile',
      config: {
        auth: false,
      },
    },
  ],
};
