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
  //
  // In Strapi 5, `plugin.controllers.auth` is a controller FACTORY
  // ({ strapi }) => ({ ...methods }) and @strapi/core's controller registry
  // instantiates that factory (and caches the instance) on first use.
  // Assigning a method on the factory function itself is therefore a silent
  // no-op — the registry only ever calls the factory. The wrapper must
  // REPLACE the factory and wrap the method on the instantiated controller,
  // the same pattern as the services.user override below.
  const originalAuthControllerFactory = plugin.controllers.auth;
  if (typeof originalAuthControllerFactory === 'function') {
    plugin.controllers.auth = ({ strapi: s }) => {
      const authController = originalAuthControllerFactory({ strapi: s });
      const originalEmailConfirmation = authController.emailConfirmation;
      authController.emailConfirmation = async (
        ctx: Context,
        next: Next,
        returnUser?: boolean
      ) => {
        try {
          await originalEmailConfirmation(ctx, next, returnUser);
        } catch (err) {
          const e = err as Error;
          // Match on the exact message rather than instanceof: keeps the
          // check robust regardless of which ValidationError class copy the
          // plugin throws.
          if (e?.message === 'Invalid token') {
            ctx.send({ ok: true, alreadyConfirmed: true });
            return;
          }
          throw err;
        }
      };
      return authController;
    };
  }

  // C2/C5 interaction: the plugin's sendConfirmationEmail runs the user through
  // contentAPI.sanitize.output, which strips 'private' fields — and 'email' is
  // private since the C2 fix. The sanitized object then lacks email, so
  // nodemailer fails with "No recipients defined" and register 400s whenever
  // email_confirmation is enabled. Override the service factory (Strapi docs:
  // a plugin service is a factory ({ strapi }) => object of methods; the
  // extension wraps the factory and returns a new factory whose instance gets
  // the wrapped method) so the instantiated service reattaches the real email
  // from the DB before sending.
  const originalUserServiceFactory = plugin.services.user;
  if (typeof originalUserServiceFactory === 'function') {
    plugin.services.user = ({ strapi: s }) => {
      const svc = originalUserServiceFactory({ strapi: s });
      if (svc && typeof svc.sendConfirmationEmail === 'function') {
        const originalSendConfirmationEmail = svc.sendConfirmationEmail.bind(svc);
        svc.sendConfirmationEmail = async (user) => {
          if (!user?.id) {
            return originalSendConfirmationEmail(user);
          }
          try {
            const fresh = await s.db.query('plugin::users-permissions.user').findOne({
              where: { id: user.id },
            });
            if (fresh?.email) {
              return originalSendConfirmationEmail({ ...user, email: fresh.email });
            }
          } catch (e) {
            s.log.error('[users-permissions] sendConfirmationEmail override: failed to fetch user email', e);
          }
          return originalSendConfirmationEmail(user);
        };
      }
      return svc;
    };
  }

  return plugin;
};

