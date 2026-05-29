import type { APIRoute } from 'astro';
import type { StrapiCategory } from '../../types/strapi';

interface RenameCategoryRequest {
  documentId: string;
  name: string;
}

interface StrapiErrorResponse {
  error?: {
    message?: string;
  };
}

export const PUT: APIRoute = async ({ request, cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await request.json() as RenameCategoryRequest;
    const { documentId, name } = body;

    if (!documentId || !name) {
      return new Response(JSON.stringify({ error: 'Document ID and Name are required' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

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
       return new Response(JSON.stringify({ error: 'Forbidden: You do not have permission to rename this category' }), { status: 403 });
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

    // 2. Update the Category entry in Strapi
    const response = await fetch(`${strapiUrl}/api/categories/${documentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        data: { name, slug },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errData = data as StrapiErrorResponse;
      return new Response(JSON.stringify({ error: errData.error?.message || 'Failed to rename category' }), { 
        status: response.status 
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Rename category error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
