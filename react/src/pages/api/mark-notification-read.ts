import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({ error: 'Notification ID required' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // Verify the notification belongs to the user first (or let Strapi do it, but simple update is best)
    const updateRes = await fetch(`${strapiUrl}/api/notifications/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: {
          is_read: true
        }
      })
    });

    if (!updateRes.ok) {
      throw new Error('Failed to mark notification as read');
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Mark notification error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
