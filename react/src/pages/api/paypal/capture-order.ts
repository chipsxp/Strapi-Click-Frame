import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  
  try {
    const body = await request.json();
    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (jwt) {
      headers['Authorization'] = `Bearer ${jwt}`;
    }

    const response = await fetch(`${strapiUrl}/api/donations/paypal/capture-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: response.status });
  } catch (error) {
    console.error('PayPal capture-order proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
