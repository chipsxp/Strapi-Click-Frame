import type { APIRoute } from 'astro';

interface MergeCategoryRequest {
  sourceDocumentId: string;
  targetDocumentId: string;
}

interface StrapiErrorResponse {
  error?: {
    message?: string;
  };
}

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json() as MergeCategoryRequest;
    const { sourceDocumentId, targetDocumentId } = body;

    if (!sourceDocumentId || !targetDocumentId) {
      return new Response(JSON.stringify({ error: 'Source and Target Document IDs are required' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';

    // Verify permissions (Only Editors/Admins can merge)
    const isEditor = user.role?.type === 'editor' || user.role?.type === 'admin';
    if (!isEditor) {
       return new Response(JSON.stringify({ error: 'Forbidden: Only Editors can merge community flavors' }), { status: 403 });
    }

    // Call custom Strapi merge endpoint
    const response = await fetch(`${strapiUrl}/api/categories/${sourceDocumentId}/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: { targetDocumentId },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errData = data as StrapiErrorResponse;
      return new Response(JSON.stringify({ error: errData.error?.message || 'Failed to merge categories' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Merge category error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
