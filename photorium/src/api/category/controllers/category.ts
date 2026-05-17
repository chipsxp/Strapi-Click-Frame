/**
 *  category controller
 */

import { factories } from '@strapi/strapi';
import { Context } from 'koa';

interface CategoryWithUser {
  id: number;
  documentId: string;
  user?: {
    id: number;
    documentId: string;
  };
}

export default factories.createCoreController('api::category.category', ({ strapi }) => ({
  /**
   * Merges one category into another.
   * All photos from the source category are moved to the target category.
   * The source category is then deleted.
   */
  async merge(ctx: Context) {
    const { documentId } = ctx.params; // Source Document ID
    const body = ctx.request.body as { data?: { targetDocumentId?: string } };
    const targetDocumentId = body.data?.targetDocumentId;
    const user = ctx.state.user as { id: number; documentId: string } | undefined;

    if (!user) {
      return ctx.unauthorized();
    }

    if (!documentId || !targetDocumentId) {
      return ctx.badRequest('Source and target document IDs are required');
    }

    if (documentId === targetDocumentId) {
      return ctx.badRequest('Source and target categories must be different');
    }

    // Verify ownership of source
    const sourceCategory = (await strapi.documents('api::category.category').findOne({
      documentId,
      populate: { user: true },
    })) as unknown as CategoryWithUser | null;

    if (!sourceCategory) {
      return ctx.notFound('Source category not found');
    }

    if (sourceCategory.user?.id !== user.id) {
      return ctx.forbidden('You do not own the source category');
    }

    // Verify ownership of target
    const targetCategory = (await strapi.documents('api::category.category').findOne({
      documentId: targetDocumentId,
      populate: { user: true },
    })) as unknown as CategoryWithUser | null;

    if (!targetCategory) {
      return ctx.notFound('Target category not found');
    }

    if (targetCategory.user?.id !== user.id) {
      return ctx.forbidden('You do not own the target category');
    }

    // Get all photos associated with the source category
    const photosToMove = await strapi.documents('api::photo.photo').findMany({
      filters: {
        categories: {
          documentId: documentId,
        },
      },
    });

    // Move each photo to the target category
    if (photosToMove.length > 0) {
      const updatePromises = photosToMove.map((photo) =>
        strapi.documents('api::photo.photo').update({
          documentId: photo.documentId,
          data: {
            categories: [targetCategory.documentId],
          },
        })
      );
      await Promise.all(updatePromises);
    }

    // Delete the source category
    await strapi.documents('api::category.category').delete({
      documentId,
    });

    return { data: { success: true } };
  },
}));
