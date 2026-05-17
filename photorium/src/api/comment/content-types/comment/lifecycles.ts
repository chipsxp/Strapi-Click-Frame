interface LifecycleEvent {
  params: {
    data: {
      parent?: string | number;
    };
  };
}

interface CommentWithRelations {
  id: number;
  documentId: string;
  reply?: { id: number };
  parent?: { id: number };
}

export default {
  async beforeCreate(event: LifecycleEvent) {
    const { parent } = event.params.data;
    if (parent) {
      const parentComment = (await strapi.documents('api::comment.comment').findOne({
        documentId: parent as string,
        populate: {
          reply: true,
          parent: true
        }
      })) as unknown as CommentWithRelations;
      
      if (parentComment?.reply) {
        throw new Error('This comment already has a reply. Maximum 1 reply allowed.');
      }
      // Prevent replies to replies (max depth 2)
      if (parentComment?.parent) {
        throw new Error('Cannot reply to a reply. Maximum depth is 2.');
      }
    }
  }
};