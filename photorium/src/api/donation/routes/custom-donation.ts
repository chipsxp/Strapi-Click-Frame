export default {
  routes: [
    {
      method: 'POST',
      path: '/donations/record',
      handler: 'donation.record',
      config: {
        policies: [],
      },
    },
  ],
};
