import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const jwt = context.cookies.get('strapi_jwt')?.value;
  const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

  if (jwt) {
    console.log(`[Middleware] JWT detected (len: ${jwt.length}), fetching user...`);
    try {
      // Fetch user info from Strapi with role populated
      const response = await fetch(`${strapiUrl}/api/users/me?populate=role`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (response.ok) {
        const user = await response.json();
        console.log(`[Middleware] Auth SUCCESS for user: ${user.username} (${user.documentId})`);
        context.locals.user = user;
        context.locals.token = jwt;
      } else {
        // Token might be invalid or expired
        console.warn(`[Middleware] Auth FAILED (Status ${response.status}). Clearing cookie.`);
        context.cookies.delete('strapi_jwt', { path: '/' });
        context.locals.user = null;
      }
    } catch (error) {
      console.error('[Middleware] Auth critical fetch error:', error);
      context.locals.user = null;
    }
  } else {
    // Log once per session ideally, but for now just to confirm "no cookie" state
    // console.log('[Middleware] No JWT cookie found.');
    context.locals.user = null;
  }

  const response = await next();

  // STRESS TEST FIX: Prevent ANY caching of authenticated or potentially authenticated pages.
  // This ensures that when a user logs out, the browser MUST fetch the fresh "logged out" state.
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.append('Vary', 'Cookie');

  return response;
});
