import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  upload: {
    config: {
      provider: 'strapi-provider-upload-imagekit',
      providerOptions: {
        publicKey: env('IMAGEKIT_PUBLIC_KEY', 'dummy_public_key'),
        privateKey: env('IMAGEKIT_PRIVATE_KEY', 'dummy_private_key'),
        urlEndpoint: env('IMAGEKIT_URL_ENDPOINT', 'https://ik.imagekit.io/dummy'),
        transformation: {
          format: 'webp,avif',
          quality: 80,
        },
      },
      sizeLimit: 15 * 1024 * 1024, // 15MB max
    },
  },
  imagekit: {
    enabled: true,
    config: {
      publicKey: env('IMAGEKIT_PUBLIC_KEY', 'dummy_public_key'),
      privateKey: env('IMAGEKIT_PRIVATE_KEY', 'dummy_private_key'),
      urlEndpoint: env('IMAGEKIT_URL_ENDPOINT', 'https://ik.imagekit.io/dummy'),
    },
  },
});

export default config;
