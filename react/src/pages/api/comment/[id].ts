import type { APIRoute } from 'astro';

export const DELETE: APIRoute = async ({ params, cookies }) => {
  const { id } = params;
  const jwt = cookies.get('strapi_jwt')?.value;

  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Please log in to moderate!' }), { status: 401 });
  }

  try {
    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // Verify if the user is an Editor or Admin
    const userRes = await fetch(`${strapiUrl}/api/users/me?populate=role`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const user = await userRes.json();

    const isModerator = user.role?.type === 'editor' || user.role?.type === 'admin';

    if (!isModerator) {
      return new Response(JSON.stringify({ error: 'You do not have permission to delete comments.' }), { status: 403 });
    }

    // Delete the comment in Strapi
    const response = await fetch(`${strapiUrl}/api/comments/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to delete comment' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify({ message: 'Comment deleted successfully' }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500 });
  }
};
