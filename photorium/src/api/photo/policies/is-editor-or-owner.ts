import { errors } from '@strapi/utils';
const { PolicyError } = errors;

export default async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;
  const { id } = policyContext.params;

  if (!user) {
    return false;
  }

  // Fetch the full user with role to check the role type
  // Using strapi.db.query for a direct ID lookup which is always available in the auth state
  const userRecord = await strapi.db.query('plugin::users-permissions.user').findOne({
    where: { id: user.id },
    populate: ['role'],
  });

  if (userRecord?.role?.type === 'editor' || userRecord?.role?.type === 'admin') {
    return true;
  }

  // For find/create actions (where no ID is in params), allow the request to proceed
  // Permissions are still checked by Strapi's core roles/permissions system
  if (!id) {
    return true;
  }

  // For targeted actions (update/delete), verify ownership
  const photo = await strapi.documents('api::photo.photo').findOne({
    documentId: id,
    populate: { author: true },
  });

  if (!photo) {
    return true; // Let the controller handle 404
  }

  // Check if the current user is the author of the photo
  if (photo.author && photo.author.id === user.id) {
    return true;
  }

  throw new PolicyError('You are not authorized to manage this stash entry. Only the author or an Editor can do this.', { policy: 'is-editor-or-owner' });
};
