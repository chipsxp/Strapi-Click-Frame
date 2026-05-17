import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get('strapi_jwt')?.value;

  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const formData = await request.formData();
    const strapiUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';

    // Forward the multipart request to Strapi
    const response = await fetch(`${strapiUrl}/api/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData, // fetch handles multipart/form-data boundary automatically when passing formData
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Upload failed' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
