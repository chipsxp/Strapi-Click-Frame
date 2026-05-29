import type { APIRoute } from 'astro';
import type { StrapiUser } from '../../types/strapi';

export const GET: APIRoute = async ({ cookies, locals }) => {
  const jwt = cookies.get('strapi_jwt')?.value;
  const user = locals.user;

  if (!jwt || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const strapiUrl = import.meta.env.STRAPI_URL || 'http://127.0.0.1:1337';

    // 1. Get the list of users this user follows
    const following = user.following || [];
    
    if (following.length === 0) {
      return new Response(JSON.stringify({ data: [] }), { status: 200 });
    }

    const followingIds = following
      .map((u: StrapiUser) => u.documentId)
      .filter((id): id is string => typeof id === 'string');

    // 2. Query photos where author's documentId is in the following list
    let filterString = '';
    followingIds.forEach((id: string, index: number) => {
      filterString += `&filters[author][documentId][$in][${index}]=${id}`;
    });

    const photosRes = await fetch(
      `${strapiUrl}/api/photos?${filterString}&sort=createdAt:desc&pagination[limit]=10&populate[author][populate]=*`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    if (!photosRes.ok) {
      throw new Error('Failed to fetch following feed');
    }

    const photosData = await photosRes.json();
    return new Response(JSON.stringify(photosData), { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Fetch notifications error:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
