export default {
  routes: [
    {
      method: 'POST',
      path: '/photos/:id/view',
      handler: 'custom-photo.incrementView',
      config: {
        auth: false, // Anyone can trigger a view increment
      },
    },
  ],
};
