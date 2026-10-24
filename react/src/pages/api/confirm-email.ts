import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  let body: { token?: string } = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { token } = body;
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing confirmation token' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

  try {
    const res = await fetch(
      `${strapiUrl}/api/auth/email-confirmation?confirmation=${encodeURIComponent(token)}`,
      {
        method: 'GET',
        redirect: 'manual',
        headers: { Accept: 'application/json' },
      }
    );

    let data: { ok?: boolean; alreadyConfirmed?: boolean; error?: { message?: string } } = {};
    try {
      data = await res.json();
    } catch {
      // Strapi sometimes returns an empty body with a 302 redirect.
    }

    if (res.status === 302 || res.status === 200 || res.ok || data.ok) {
      return new Response(
        JSON.stringify({ success: true, alreadyConfirmed: !!data.alreadyConfirmed }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: data.error?.message || 'Verification failed.' }),
      { status: res.status || 400, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
