import type { APIRoute } from 'astro';
import type { StrapiUser } from '../../types/strapi';

interface ToggleFollowRequest {
  targetUserDocumentId: string;
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
    const body = await request.json() as ToggleFollowRequest;
    const { targetUserDocumentId } = body;

    if (!targetUserDocumentId) {
      return new Response(JSON.stringify({ error: 'Target User Document ID is required' }), { status: 400 });
    }

    const strapiUrl = import.meta.env.STRAPI_URL || 'http://localhost:1337';

    // 1. Resolve the target user's numeric ID
    // Although the button sends documentId, the users-permissions plugin relation update needs numeric IDs
    const targetUserRes = await fetch(`${strapiUrl}/api/users?filters[documentId][$eq]=${targetUserDocumentId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    
    if (!targetUserRes.ok) {
        throw new Error('Failed to resolve target user');
    }
    
    const targetUserData = await targetUserRes.json() as StrapiUser[];
    if (targetUserData.length === 0) {
        return new Response(JSON.stringify({ error: 'Target artist not found' }), { status: 404 });
    }
    
    const targetUserId = targetUserData[0].id;

    if (targetUserId === user.id) {
      return new Response(JSON.stringify({ error: 'You cannot follow yourself' }), { status: 400 });
    }

    // 2. Fetch current user with their following list (as objects with IDs)
    const meRes = await fetch(`${strapiUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    
    if (!meRes.ok) {
      throw new Error(`Strapi /me returned ${meRes.status}`);
    }
    
    const meData = await meRes.json() as StrapiUser;
    const followingList = meData.following || [];
    
    // Check if following by numeric id
    const isFollowing = followingList.some((u: StrapiUser) => u.id === targetUserId);

    // Prepare the list of following numeric IDs
    let newFollowingIds = followingList
      .map((u: StrapiUser) => u.id)
      .filter((id): id is number => typeof id === 'number');

    if (isFollowing) {
      // Unfollow: remove the ID
      newFollowingIds = newFollowingIds.filter(id => id !== targetUserId);
    } else {
      // Follow: add the ID
      newFollowingIds.push(targetUserId);
    }

    // 3. Update the user's following relationship
    // For the users-permissions plugin, we use the numeric IDs in the array
    const updateRes = await fetch(`${strapiUrl}/api/users/${user.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        following: newFollowingIds
      }),
    });

    if (!updateRes.ok) {
       const errData = await updateRes.json() as StrapiErrorResponse;
       console.error('Update user failed in toggle-follow:', JSON.stringify(errData, null, 2));
       
       // Retrying with 'set' syntax just in case, though numeric IDs usually work directly
       const retryRes = await fetch(`${strapiUrl}/api/users/${user.id}`, {
         method: 'PUT',
         headers: {
           'Content-Type': 'application/json',
           Authorization: `Bearer ${jwt}`,
         },
         body: JSON.stringify({
           following: { set: newFollowingIds }
         }),
       });

       if (!retryRes.ok) {
         const retryErr = await retryRes.json() as StrapiErrorResponse;
         return new Response(JSON.stringify({ error: retryErr.error?.message || 'Failed to update follow status' }), { status: retryRes.status });
       }
    }

    return new Response(JSON.stringify({ success: true, isFollowing: !isFollowing }), { status: 200 });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Toggle follow error details:', message);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
};
