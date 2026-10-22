/**
 * photo router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::photo.photo', {
  config: {
    create: {
      policies: [{ name: 'global::force-author', config: { field: 'author' } }],
    },
    update: {
      policies: ['is-editor-or-owner'],
    },
    delete: {
      policies: ['is-editor-or-owner'],
    },
  },
});
