
export default (policyContext, config, { strapi }) => {
  const userRoleType = policyContext.state.user?.role?.type;
  
  if (userRoleType === 'editor' || userRoleType === 'admin') {
    return true;
  }

  return false;
};
