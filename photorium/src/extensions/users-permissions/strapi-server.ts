import { errors } from '@strapi/utils';
import type { Context, Next } from 'koa';

export default (plugin) => {
  const originalMe = plugin.controllers.user.me;

  plugin.controllers.user.me = async (ctx) => {
    // 1. Call the original 'me' controller to handle authentication and basic data
    await originalMe(ctx);

    // 2. If the original controller succeeded, it will have set ctx.body
    if (ctx.state.user && ctx.body) {
      try {
        // Fetch the user with role and following populated
        const userWithRole = await strapi.db.query('plugin::users-permissions.user').findOne({
          where: { id: ctx.state.user.id },
          populate: ['role', 'following', 'avatar'],
        });

        if (userWithRole) {
          if (userWithRole.role) {
            ctx.body.role = {
              id: userWithRole.role.id,
              name: userWithRole.role.name,
              type: userWithRole.role.type
            };
          }
          if (userWithRole.following) {
            ctx.body.following = userWithRole.following.map(u => ({
              id: u.id,
              documentId: u.documentId,
              username: u.username
            }));
          }
          if (userWithRole.avatar) {
            ctx.body.avatar = userWithRole.avatar;
          }
        }
      } catch (error) {
        console.error('Error populating role in custom /me controller:', error);
        // We don't want to crash the whole request if just the role fetch fails
      }
    }
  };

  // Make email confirmation idempotent. Strapi nulls confirmationToken on first
  // use, so mail scanners / link prefetchers that open the link first make the
  // real click fail with ValidationError('Invalid token'). Treat exactly that
  // case as "already confirmed". Every other error is rethrown untouched.
  const originalEmailConfirmation = plugin.controllers.auth.emailConfirmation;

  plugin.controllers.auth.emailConfirmation = async (
    ctx: Context,
    next: Next,
    returnUser?: boolean
  ) => {
    try {
      await originalEmailConfirmation(ctx, next, returnUser);
    } catch (err) {
      if (err instanceof errors.ValidationError && err.message === 'Invalid token') {
        ctx.send({ ok: true, alreadyConfirmed: true });
        return;
      }
      throw err;
    }
  };

  return plugin;
};

