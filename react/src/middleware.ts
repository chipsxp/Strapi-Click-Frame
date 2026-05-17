import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const jwt = context.cookies.get('strapi_jwt')?.value;
  const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

  if (jwt) {
    try {
      // Fetch user info from Strapi using the JWT
      // This ensures the token is valid and gives us the user profile
      const response = await fetch(`${strapiUrl}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        context.locals.user = user;
        context.locals.token = jwt;
      } else {
        // Token might be invalid or expired
        context.cookies.delete('strapi_jwt', { path: '/' });
        context.locals.user = null;
      }
    } catch (error) {
      console.error('Middleware auth error:', error);
      context.locals.user = null;
    }
  } else {
    context.locals.user = null;
  }

  return next();
});
