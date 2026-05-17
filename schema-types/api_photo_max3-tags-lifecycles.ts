export default {
  async beforeCreate(event) {
    const { tags } = event.params.data;
    if (tags && tags.length > 3) {
      throw new Error('Maximum 3 tags allowed per photo');
    }
  },
  async beforeUpdate(event) {
    const { tags } = event.params.data;
    if (tags && tags.length > 3) {
      throw new Error('Maximum 3 tags allowed per photo');
    }
  }
};