export default {
  routes: [
    {
      method: 'POST',
      path: '/categories/:documentId/merge',
      handler: 'api::category.category.merge',
      config: {
        policies: ['global::is-editor'],
        middlewares: [],
      },
    },
  ],
};
