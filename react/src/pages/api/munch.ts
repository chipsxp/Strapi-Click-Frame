import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get('strapi_jwt')?.value;

  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Please log in to munch!' }), { status: 401 });
  }

  try {
    const { photoId, type } = await request.json();
    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // Get user info to pass their ID (Strapi reactions usually need the user ID)
    // We could also let Strapi handle this via the JWT in the controller, 
    // but the lifecycle expects 'user' in the data.
    const userRes = await fetch(`${strapiUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const user = await userRes.json();

    const response = await fetch(`${strapiUrl}/api/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: {
          photo: photoId,
          user: user.documentId || user.id,
          type: type,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Munch failed' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error('Munch error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
