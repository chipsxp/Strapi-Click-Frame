export default {
  routes: [
    {
      method: 'POST',
      path: '/reactions/give',
      handler: 'custom-reaction.give',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
