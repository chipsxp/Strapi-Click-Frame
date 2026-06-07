import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env('PORT', 1337) as unknown as number,
  app: {
    keys: env.array('APP_KEYS'),
  },
});

export default config;
