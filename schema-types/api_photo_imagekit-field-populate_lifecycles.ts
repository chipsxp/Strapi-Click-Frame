export default {
  async afterCreate(event) {
    const { image } = event.result;
    if (image && image.provider === 'imagekit') {
      await strapi.entityService.update('api::photo.photo', event.result.id, {
        data: {
          ik_file_id: image.fileId,
          ik_url: image.url,
          ik_thumbnail_url: image.thumbnailUrl
        }
      });
    }
  }
};