export default {
  async beforeCreate(event) {
    const { parent } = event.params.data;
    if (parent) {
      const parentComment = await strapi.entityService.findOne(
        'api::comment.comment',
        parent,
        { populate: { reply: true } }
      );
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