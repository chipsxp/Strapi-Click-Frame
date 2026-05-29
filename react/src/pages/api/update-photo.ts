import type { APIRoute } from 'astro';
import type { StrapiPhoto } from '../../types/strapi';

interface UpdatePhotoRequest {
  photoId: string;
  title?: string;
  description?: string;
  category?: string;
}

interface PhotoUpdatePayload {
  title?: string;
  description?: string;
  categories?: string[];
}

export const PUT: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json() as UpdatePhotoRequest;
    const { photoId, title, description, category: categoryInput } = body;

    if (!photoId) {
      return new Response(JSON.stringify({ error: 'Photo ID is required' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // Verify ownership or editor role
    const checkRes = await fetch(`${strapiUrl}/api/photos/${photoId}?populate=author`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    
    if (!checkRes.ok) {
      return new Response(JSON.stringify({ error: 'Photo not found' }), { status: 404 });
    }
    
    const checkData = await checkRes.json() as { data: StrapiPhoto };
    const photo = checkData.data;
    const isOwner = photo?.author?.id === user.id || photo?.author?.documentId === user.documentId;
    const isEditor = user.role?.type === 'editor' || user.role?.type === 'admin';

    if (!isOwner && !isEditor) {
       return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to edit this photo' }), { status: 403 });
    }

    // Resolve Categories if provided (Split by comma)
    let categoryDocIds: string[] | undefined = undefined;
    if (typeof categoryInput === 'string') {
      const categoryNames = categoryInput.split(',').map(n => n.trim()).filter(n => n.length > 0);
      categoryDocIds = [];

      for (const name of categoryNames) {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        
        const catSearchRes = await fetch(`${strapiUrl}/api/categories?filters[slug][$eq]=${slug}`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const catSearchData = await catSearchRes.json() as { data: any[] };

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
          const catCreateData = await catCreateRes.json() as { data: { documentId: string } };
          if (catCreateRes.ok) {
            categoryDocIds.push(catCreateData.data.documentId);
          }
        }
      }
    }

    // Update the Photo entry in Strapi
    const updatePayload: PhotoUpdatePayload = { title, description };
    if (categoryDocIds !== undefined) {
      updatePayload.categories = categoryDocIds;
    }

    const response = await fetch(`${strapiUrl}/api/photos/${photoId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: updatePayload,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to update photo' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Update photo error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
