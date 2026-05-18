import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return new Response(
        JSON.stringify({ error: 'Username, email, and password are required' }), 
        { status: 400 }
      );
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';
    
    // Call Strapi registration endpoint
    const response = await fetch(`${strapiUrl}/api/auth/local/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Strapi registration error:', JSON.stringify(data, null, 2));
      // Strapi provides detailed error messages (e.g., email already taken)
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Registration failed' }), 
        { status: response.status }
      );
    }

    // Success response
    // If Email Confirmation is ON, data.jwt will be undefined.
    // We only set the cookie if we actually got a JWT.
    if (data.jwt) {
      return new Response(
        JSON.stringify({ 
          message: 'Registration successful. Redirecting to dashboard...',
          user: data.user,
          jwt: data.jwt
        }), 
        {
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Set-Cookie': `strapi_jwt=${data.jwt}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Registration successful. Please check your email to confirm your account.',
        user: data.user 
      }), 
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }), 
      { status: 500 }
    );
  }
};
