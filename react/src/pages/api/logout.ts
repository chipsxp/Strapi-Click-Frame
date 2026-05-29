import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  console.log('[Logout API] Clearing strapi_jwt cookie and redirecting...');
  
  // Use exact same attributes as set in login.ts to ensure match
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: 'lax' as const,
  };

  cookies.delete('strapi_jwt', cookieOptions);

  // Aggressive expiration for older browsers or proxy layers
  cookies.set('strapi_jwt', '', {
    ...cookieOptions,
    maxAge: 0,
    expires: new Date(0),
  });

  return redirect('/', 302);
};

// Also support GET for easier manual testing/links
export const GET: APIRoute = async (context) => {
  return POST(context);
};
