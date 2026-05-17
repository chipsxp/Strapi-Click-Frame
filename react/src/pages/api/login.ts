import type { APIRoute } from 'astro';

interface LoginRequest {
  identifier?: string;
  password?: string;
}

interface StrapiLoginResponse {
  jwt: string;
  user: any; // user object structure varies, but we mainly care about JWT here
  error?: {
    message?: string;
  };
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json() as LoginRequest;
    const { identifier, password } = body;

    if (!identifier || !password) {
      return new Response(
        JSON.stringify({ error: 'Identifier and password are required' }), 
        { status: 400 }
      );
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
    console.log('Attempting login to Strapi at:', `${strapiUrl}/api/auth/local`);
    
    const response = await fetch(`${strapiUrl}/api/auth/local`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ identifier, password }),
    }).catch((err: Error) => {
      console.error('Fetch to Strapi failed:', err);
      throw new Error(`Failed to connect to Strapi: ${err.message}`);
    });

    const data = await response.json() as StrapiLoginResponse;

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Login failed' }), 
        { status: response.status }
      );
    }

    const { jwt, user } = data;

    // Set HttpOnly cookie for security
    cookies.set('strapi_jwt', jwt, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return new Response(JSON.stringify({ user }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Login error details:', message);
    return new Response(
      JSON.stringify({ error: message }), 
      { status: 500 }
    );
  }
};
