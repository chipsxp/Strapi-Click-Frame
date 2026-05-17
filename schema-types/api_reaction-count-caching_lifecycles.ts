export default {
  async afterCreate(event) {
    const { photo, type } = event.result;
    const countField = `${type}_count`;
    await strapi.entityService.update('api::photo.photo', photo.id, {
      data: { [countField]: { increment: 1 } }
    });
  },
  async afterDelete(event) {
    const { photo, type } = event.params.where;
    const countField = `${type}_count`;
    await strapi.entityService.update('api::photo.photo', photo, {
      data: { [countField]: { decrement: 1 } }
    });
  }
};