import type { StrapiApp } from '@strapi/strapi/admin';

export default {
  config: {
    locales: [],
    // Strapi 5 Preview configuration
    preview: {
      enabled: true,
      config: {
        allowedOrigins: [
          'http://localhost:4321',
          'https://photorium-production.up.railway.app',
        ],
        handler(uid, { documentId, locale }) {
          const clientUrl = process.env.STRAPI_ADMIN_CLIENT_URL || 'http://localhost:4321';
          
          // Map UIDs to frontend paths
          const pathMap = {
            'api::photo.photo': '/photos',
            'api::category.category': '/categories',
            'api::post.post': '/blog',
            'plugin::users-permissions.user': '/profile',
          };

          const basePath = pathMap[uid] || '';
          if (!basePath) return null;

          // Use documentId for lookup on frontend
          const identifier = documentId || '';
          
          return `${clientUrl}${basePath}/${identifier}?preview=true`;
        },
      },
    },
  },
  bootstrap(app: StrapiApp) {
    // Admin customizations
    // Note: Third-party plugin deprecations (imagekit) should be addressed by the plugin authors.
    // Manual overrides are risky due to bundle encapsulation.
  },
};
