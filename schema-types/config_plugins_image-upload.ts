export default {
  upload: {
    config: {
      provider: '@strapi-community/provider-upload-imagekit',
      providerOptions: {
        publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        // Force modern formats
        transformation: {
          format: 'webp,avif',
          quality: 80,
        },
      },
      sizeLimit: 15 * 1024 * 1024, // 15MB max
    },
  },
};