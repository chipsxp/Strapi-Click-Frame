import type { APIRoute } from 'astro';

export const DELETE: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { photoId } = await request.json();

    if (!photoId) {
      return new Response(JSON.stringify({ error: 'Photo ID is required' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';

    // Verify ownership
    const checkRes = await fetch(`${strapiUrl}/api/photos/${photoId}?populate=author`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    
    if (!checkRes.ok) {
      return new Response(JSON.stringify({ error: 'Photo not found' }), { status: 404 });
    }
    
    const checkData = await checkRes.json();
    const isOwner = checkData.data?.author?.id === user.id || checkData.data?.author?.documentId === user.documentId;
    const isEditor = user.role?.type === 'editor' || user.role?.type === 'admin';

    if (!isOwner && !isEditor) {
       return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to delete this photo' }), { status: 403 });
    }

    // Delete the Photo entry in Strapi
    const response = await fetch(`${strapiUrl}/api/photos/${photoId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to delete photo' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Delete photo error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
};
