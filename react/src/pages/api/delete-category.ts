import type { APIRoute } from 'astro';
import type { StrapiCategory } from '../../types/strapi';

interface DeleteCategoryRequest {
  documentId: string;
}

interface StrapiErrorResponse {
  error?: {
    message?: string;
  };
}

export const DELETE: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json() as DeleteCategoryRequest;
    const { documentId } = body;

    if (!documentId) {
      return new Response(JSON.stringify({ error: 'Document ID is required' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';

    // 1. Verify permissions (Owner or Editor/Admin)
    const checkRes = await fetch(`${strapiUrl}/api/categories/${documentId}?populate=user`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    
    if (!checkRes.ok) {
      return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404 });
    }
    
    const checkData = await checkRes.json() as { data: StrapiCategory };
    const category = checkData.data;
    
    const isOwner = category?.user?.id === user.id || category?.user?.documentId === user.documentId;
    const isEditor = user.role?.type === 'editor' || user.role?.type === 'admin';

    if (!isOwner && !isEditor) {
       return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to delete this category' }), { status: 403 });
    }

    // 2. Delete the Category entry in Strapi
    const response = await fetch(`${strapiUrl}/api/categories/${documentId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!response.ok) {
      const data = await response.json() as StrapiErrorResponse;
      return new Response(JSON.stringify({ error: data.error?.message || 'Failed to delete category' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Delete category error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
