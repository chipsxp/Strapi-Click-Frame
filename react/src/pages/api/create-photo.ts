import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, image, category: categoryInput } = body;

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // 1. Resolve Categories (Split by comma)
    const categoryNames = typeof categoryInput === 'string' 
      ? categoryInput.split(',').map(n => n.trim()).filter(n => n.length > 0)
      : [];
    
    const categoryDocIds: string[] = [];

    for (const name of categoryNames) {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      
      // Check if category exists
      const catSearchRes = await fetch(`${strapiUrl}/api/categories?filters[slug][$eq]=${slug}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const catSearchData = await catSearchRes.json();

      if (catSearchData.data && catSearchData.data.length > 0) {
        categoryDocIds.push(catSearchData.data[0].documentId);
      } else {
        // Create new category
        const catCreateRes = await fetch(`${strapiUrl}/api/categories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            data: {
              name,
              slug,
              user: user.documentId,
            },
          }),
        });
        const catCreateData = await catCreateRes.json();
        if (catCreateRes.ok) {
          categoryDocIds.push(catCreateData.data.documentId);
        }
      }
    }

    // 2. Create the Photo entry in Strapi
    const response = await fetch(`${strapiUrl}/api/photos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: {
          title,
          description,
          image,
          categories: categoryDocIds, // Plural categories array
          author: user.documentId,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to create photo' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error) {
    console.error('Create photo error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
