import { Context } from 'koa';

export default {
  async incrementView(ctx: Context) {
    try {
      const { id } = ctx.params; // documentId in Strapi 5

      if (!id) {
        return ctx.badRequest('Photo ID is required.');
      }

      // Fetch the photo first to get current views
      const photo = await strapi.documents('api::photo.photo').findOne({
        documentId: id
      }) as any;

      if (!photo) {
        return ctx.notFound('Photo not found.');
      }

      // Increment views
      // We use updateMany on db.query to ensure it hits all versions if needed, 
      // but document service update is cleaner for specific documentId.
      await strapi.documents('api::photo.photo').update({
        documentId: id,
        data: {
          views: (photo.views || 0) + 1
        }
      });

      return ctx.send({ message: 'Success', views: (photo.views || 0) + 1 });
    } catch (err: unknown) {
      console.error('Error incrementing view:', err);
      return ctx.internalServerError('Error incrementing view.');
    }
  }
};
