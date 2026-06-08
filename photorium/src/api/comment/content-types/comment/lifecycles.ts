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
    let { parent } = event.params.data;

    // Handle Strapi 5 relation formats (could be a string documentId, or a numeric ID, or an object)
    let parentDocId: string | undefined;

    if (typeof parent === 'string') {
      parentDocId = parent;
    } else if (typeof parent === 'object' && parent !== null) {
      // Handle potential connect/disconnect format or populated object
      parentDocId = (parent as any).documentId || (parent as any).id?.toString();
    } else if (typeof parent === 'number') {
      parentDocId = parent.toString();
    }

    if (parentDocId) {
      try {
        const parentComment = (await strapi.documents('api::comment.comment').findOne({
          documentId: parentDocId,
          populate: {
            reply: true,
            parent: true
          }
        })) as unknown as CommentWithRelations;

        if (parentComment) {
          if (parentComment.reply) {
            throw new Error('This comment already has a reply. Maximum 1 reply allowed.');
          }
          // Prevent replies to replies (max depth 2)
          if (parentComment.parent) {
            throw new Error('Cannot reply to a reply. Maximum depth is 2.');
          }
        }
      } catch (err: any) {
        if (err.message.includes('Maximum') || err.message.includes('already has a reply')) {
          throw err;
        }
        console.error('Lifecycle error in comment.beforeCreate:', err);
        // Don't crash the server for lookup errors, but log them
      }
    }
  },

  async afterCreate(event: any) {
    const { result } = event;
    if (!result || !result.documentId) return;

    try {
      // Fetch the fully populated comment
      const newComment = await strapi.documents('api::comment.comment').findOne({
        documentId: result.documentId,
        populate: {
          author: true,
          photo: { populate: { author: true } },
          parent: { populate: { author: true } }
        }
      }) as any;

      if (!newComment || !newComment.author) return;

      const senderId = newComment.author.documentId;
      let recipientId: string | undefined = undefined;
      let notificationType: 'comment_on_photo' | 'reply_to_comment' | undefined = undefined;
      let photoId = newComment.photo?.documentId;

      if (newComment.parent) {
        // It's a reply
        notificationType = 'reply_to_comment';
        recipientId = newComment.parent.author?.documentId;
      } else if (newComment.photo) {
        // It's a root comment
        notificationType = 'comment_on_photo';
        recipientId = newComment.photo.author?.documentId;
      }

      // Don't notify if the user is replying to/commenting on their own stuff
      if (recipientId && recipientId !== senderId && notificationType) {
        await strapi.documents('api::notification.notification').create({
          data: {
            type: notificationType,
            recipient: recipientId,
            sender: senderId,
            photo: photoId,
            comment: newComment.documentId,
            is_read: false
          }
        });
      }
    } catch (err) {
      console.error('Error creating notification for comment:', err);
    }
  }
};