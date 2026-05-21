export default {
  routes: [
    {
      method: 'POST',
      path: '/donations/paypal/create-order',
      handler: 'paypal.createOrder',
    },
    {
      method: 'POST',
      path: '/donations/paypal/capture-order',
      handler: 'paypal.captureOrder',
    },
  ],
};
