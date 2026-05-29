import type { Core } from '@strapi/strapi';

export default {
  register() {},
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const users = await strapi.query('plugin::users-permissions.user').findMany({
        populate: ['role']
      });
      console.log('--- Current Users ---');
      users.forEach((u: any) => {
        console.log(`- ID: ${u.id}, Username: ${u.username}, Email: ${u.email}, Role: ${u.role?.type}, Confirmed: ${u.confirmed}`);
      });
    } catch (e) {
      console.error(e);
    }
  },
};
