import { Context } from 'koa';

interface StrapiUserStats {
  id: number;
  documentId: string;
  classic_munch_given_total: number;
  cheddar_munch_balance: number;
  cheddar_given_total: number;
  last_classic_munch_at: string;
}

interface StrapiPhotoStats {
  id: number;
  documentId: string;
  classic_munch_count: number;
  cheddar_munch_count: number;
}

export default {
  async give(ctx: Context) {
    try {
      const user = ctx.state.user as { id: number; documentId: string } | undefined;
      if (!user) {
        return ctx.unauthorized('You must be logged in.');
      }

      const body = (ctx.request.body as { data?: { photoId?: string; type?: string } }) || {};
      const data = body.data || body;
      const { photoId, type } = data as { photoId?: string; type?: string };

      if (!photoId || !type) {
        return ctx.badRequest('photoId and type are required.');
      }

      if (type !== 'classic' && type !== 'cheddar') {
        return ctx.badRequest('type must be classic or cheddar.');
      }

      // Fetch the full user using Document Service to ensure consistency
      const fullUser = (await strapi.documents('plugin::users-permissions.user').findOne({
        documentId: user.documentId,
      })) as unknown as StrapiUserStats | null;

      if (!fullUser) {
        return ctx.notFound('User not found.');
      }

      const userDocId = fullUser.documentId;
      console.log('Creating reaction...');
      // Create reaction record using Document Service
      await strapi.documents('api::reaction.reaction').create({
        data: {
          user: userDocId,
          photo: photoId,
          type: type,
          status: 'published' // Strapi 5 specific status for draft/publish
        },
      });

      // Refetch user and photo to return updated stats
      const updatedUser = (await strapi.documents('plugin::users-permissions.user').findOne({
        documentId: fullUser.documentId,
      })) as unknown as StrapiUserStats;
      
      const updatedPhoto = (await strapi.documents('api::photo.photo').findOne({
        documentId: photoId,
      })) as unknown as StrapiPhotoStats;

      return ctx.send({ 
        message: 'Success', 
        type, 
        user: {
            classic_munch_given_total: updatedUser.classic_munch_given_total,
            cheddar_munch_balance: updatedUser.cheddar_munch_balance,
            cheddar_given_total: updatedUser.cheddar_given_total,
            last_classic_munch_at: updatedUser.last_classic_munch_at
        },
        photo: {
            classic_munch_count: updatedPhoto.classic_munch_count,
            cheddar_munch_count: updatedPhoto.cheddar_munch_count
        }
      });
    } catch (err: any) {
      if (err.name === 'ApplicationError' || err.name === 'ForbiddenError' || err.status === 403) {
          return ctx.badRequest(err.message);
      }
      console.error('Error giving chip:', err);
      return ctx.internalServerError('Internal server error.');
    }
  }
};
