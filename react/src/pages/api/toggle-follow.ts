import type { APIRoute } from 'astro';

interface ToggleFollowRequest {
  targetUserDocumentId: string;
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json() as ToggleFollowRequest;
    const { targetUserDocumentId } = body;

    if (!targetUserDocumentId) {
      return new Response(JSON.stringify({ error: 'Target User Document ID is required' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    const res = await fetch(`${strapiUrl}/api/user-ext/toggle-follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ targetUserDocumentId }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || 'Failed to update follow status' }),
        { status: res.status }
      );
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Toggle follow error details:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
