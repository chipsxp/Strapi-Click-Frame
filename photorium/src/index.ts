import type { Core } from '@strapi/strapi';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const ensurePermission = async (roleId: number, action: string) => {
      const existing = await strapi.query('plugin::users-permissions.permission').findOne({
        where: {
          action,
          role: roleId,
        },
      });

      if (!existing) {
        return strapi.query('plugin::users-permissions.permission').create({
          data: {
            action,
            role: roleId,
          },
        });
      }
      return null;
    };

    try {
      const publicRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });

      if (publicRole) {
        const controllers = ['photo', 'category', 'tag', 'reaction', 'comment', 'global', 'about', 'donation', 'community-stat'];
        const publicPermissionsToCreate = [];

        for (const controller of controllers) {
          const actions = ['find', 'findOne'];
          if (controller === 'donation') {
            actions.push('create');
          }
          if (controller === 'community-stat') {
            actions.push('getStats');
          }
          if (controller === 'photo') {
            actions.push('incrementView');
          }
          for (const action of actions) {
            let controllerName = controller;
            if (controller === 'photo' && action === 'incrementView') {
              controllerName = 'custom-photo';
            }
            
            const permission = await ensurePermission(
              publicRole.id,
              `api::${controller}.${controllerName}.${action}`
            );
            if (permission) {
              publicPermissionsToCreate.push(permission);
            }
          }
        }
        
        if (publicPermissionsToCreate.length > 0) {
          await Promise.all(publicPermissionsToCreate);
          console.log('✅ Public permissions established automatically on bootstrap');
        }
        
        const publicUserPerms = [
          'plugin::users-permissions.user.find',
          'plugin::users-permissions.user.findOne'
        ];
        
        for (const action of publicUserPerms) {
          await ensurePermission(publicRole.id, action);
        }
      }

      const authRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'authenticated' },
      });

      if (authRole) {
        const authPermissionsToCreate = [];
        const authActions = [
          'api::reaction.custom-reaction.give',
          'plugin::users-permissions.user.find',
          'plugin::users-permissions.user.findOne',
          'plugin::users-permissions.user.me',
          'plugin::users-permissions.user.update',
          'plugin::users-permissions.auth.callback',
          'plugin::upload.content-api.upload',
          'plugin::upload.api.upload',
          'api::photo.photo.create',
          'api::photo.photo.update',
          'api::photo.photo.delete',
          'api::photo.photo.find',
          'api::photo.photo.findOne',
          'api::category.category.create',
          'api::category.category.update',
          'api::category.category.delete',
          'api::category.category.find',
          'api::category.category.findOne',
          'api::category.category.merge',
          'api::comment.comment.create',
          'api::comment.comment.find',
          'api::comment.comment.findOne',
          'api::donation.donation.create',
          'api::community-stat.community-stat.getStats'
        ];

        for (const action of authActions) {
          const permission = await ensurePermission(authRole.id, action);
          if (permission) {
            authPermissionsToCreate.push(permission);
          }
        }

        if (authPermissionsToCreate.length > 0) {
          await Promise.all(authPermissionsToCreate);
          console.log('✅ Authenticated permissions established automatically on bootstrap');
        }
      }

      // Add Editor Role Permissions
      let editorRole = await strapi.query('plugin::users-permissions.role').findOne({
        where: { type: 'editor' },
      });

      // Create Editor role if it doesn't exist
      if (!editorRole) {
        editorRole = await strapi.query('plugin::users-permissions.role').create({
          data: {
            name: 'Editor',
            description: 'Can manage most content but has limited administrative power.',
            type: 'editor',
          },
        });
        console.log('✅ Editor role created');
      }

      if (editorRole) {
        const editorActions = [
          'api::reaction.custom-reaction.give',
          'plugin::users-permissions.user.find',
          'plugin::users-permissions.user.findOne',
          'plugin::users-permissions.user.me',
          'plugin::users-permissions.user.update',
          'plugin::users-permissions.auth.callback',
          'plugin::upload.content-api.upload',
          'plugin::upload.api.upload',
          'api::photo.photo.create',
          'api::photo.photo.update',
          'api::photo.photo.delete',
          'api::photo.photo.find',
          'api::photo.photo.findOne',
          'api::category.category.create',
          'api::category.category.update',
          'api::category.category.delete',
          'api::category.category.find',
          'api::category.category.findOne',
          'api::category.category.merge',
          'api::comment.comment.create',
          'api::comment.comment.find',
          'api::comment.comment.findOne',
          'api::comment.comment.delete',
          'api::community-stat.community-stat.getStats'
        ];

        for (const action of editorActions) {
          await ensurePermission(editorRole.id, action);
        }
        console.log('✅ Editor permissions established automatically on bootstrap');
      }
    } catch (e) {
      console.error('Error setting permissions on bootstrap:', e);
    }
  },
};
