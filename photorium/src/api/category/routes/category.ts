/**
 * category router.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::category.category', {
  config: {
    create: {
      policies: [{ name: 'global::force-author', config: { field: 'user' } }],
    },
    update: {
      policies: ['global::is-editor'],
    },
    delete: {
      policies: ['global::is-editor'],
    },
  },
});
