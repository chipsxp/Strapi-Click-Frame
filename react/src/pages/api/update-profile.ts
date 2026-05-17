import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { bio, nickname, avatar, username } = body;

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';

    // Update the User entry in Strapi
    // Strapi 5 Users-Permissions endpoint for updating current user
    const response = await fetch(`${strapiUrl}/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        bio,
        nickname,
        avatar,
        username,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Strapi update error:', data.error);
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to update profile' }), { 
        status: response.status 
      });
    }

    // Update locals.user or return success for client-side reload
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
