import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // Fetch unread notifications for the user
    // Assuming Strapi creates /api/notifications for the notification collection
    const notificationsRes = await fetch(
      `${strapiUrl}/api/notifications?filters[recipient][documentId][$eq]=${user.documentId}&filters[is_read][$eq]=false&populate=*&sort=createdAt:desc`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!notificationsRes.ok) {
      console.warn('Strapi permissions might be missing for notifications:', notificationsRes.status);
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    }

    const data = await notificationsRes.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Fetch comment notifications error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
