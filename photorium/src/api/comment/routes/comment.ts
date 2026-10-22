/**
 * comment router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::comment.comment', {
  config: {
    create: {
      policies: [{ name: 'global::force-author', config: { field: 'author' } }],
    },
  },
});
