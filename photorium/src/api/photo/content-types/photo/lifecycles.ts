interface BeforeEvent {
  params: {
    data: {
      tags?: Array<string | number | { id: number }>;
    };
  };
}

interface AfterEvent {
  result: {
    id: string | number;
    documentId: string;
    image?: {
      provider: string;
      fileId: string;
      url: string;
      thumbnailUrl: string;
    };
  };
}

export default {
  async beforeCreate(event: BeforeEvent) {
    const { tags } = event.params.data;
    if (tags && tags.length > 3) {
      throw new Error('Maximum 3 tags allowed per photo');
    }
  },
  async beforeUpdate(event: BeforeEvent) {
    const { tags } = event.params.data;
    if (tags && tags.length > 3) {
      throw new Error('Maximum 3 tags allowed per photo');
    }
  },
  async afterCreate(event: AfterEvent) {
    const { image, documentId } = event.result;
    if (image && image.provider === 'imagekit') {
      await strapi.documents('api::photo.photo').update({
        documentId,
        data: {
          ik_file_id: image.fileId,
          ik_url: image.url,
          ik_thumbnail_url: image.thumbnailUrl
        }
      });
    }
  }
};
