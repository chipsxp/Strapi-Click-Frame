import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  const jwt = cookies.get('strapi_jwt')?.value;

  if (!jwt) {
    return new Response(JSON.stringify({ error: 'Please log in to comment!' }), { status: 401 });
  }

  try {
    const { photoId, content, parentId } = await request.json();
    
    if (!content || content.length > 500) {
      return new Response(JSON.stringify({ error: 'Comment must be between 1 and 500 characters.' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // Get user info to associate the comment with the correct author
    const userRes = await fetch(`${strapiUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    const user = await userRes.json();
    console.log('DEBUG: /api/users/me response:', user);

    if (!user || (!user.documentId && !user.id)) {
      return new Response(JSON.stringify({ error: 'User session invalid' }), { status: 401 });
    }

    const commentData: any = {
      photo: { connect: [photoId] },
      author: { connect: [user.documentId || user.id] },
      content: content,
    };

    if (parentId) {
      commentData.parent = { connect: [parentId] };
    }

    const response = await fetch(`${strapiUrl}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: commentData,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Strapi comment error:', data.error);
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to post comment' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify(data), { status: 201 });
  } catch (error: any) {
    console.error('Comment API exception:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500 });
  }
};
