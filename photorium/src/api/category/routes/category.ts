/**
 * category router.
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::category.category', {
  config: {
    update: {
      policies: ['global::is-editor'],
    },
    delete: {
      policies: ['global::is-editor'],
    },
  },
});
