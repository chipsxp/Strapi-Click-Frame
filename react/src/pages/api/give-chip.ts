import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get('strapi_jwt')?.value;

  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { photoId, type } = body;

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // Forward the request to the Strapi custom reaction endpoint
    const response = await fetch(`${strapiUrl}/api/reactions/give`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: {
          photoId,
          type,
        }
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      // Strapi 5 errors are usually in data.error
      const errorObj = data.error || data;
      const errorMessage = errorObj.message || 'Failed to give chip';
      console.error('Give chip error:', errorObj);
      
      return new Response(JSON.stringify({ 
        error: errorMessage,
        details: errorObj.details || {}
      }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Give chip proxy error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
