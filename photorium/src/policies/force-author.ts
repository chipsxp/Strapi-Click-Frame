import type { Core } from '@strapi/strapi';

interface ForceAuthorConfig {
  field: 'author' | 'user';
}

interface AuthoredBody {
  data?: {
    author?: string;
    user?: string;
  };
}

interface AuthenticatedUser {
  documentId: string;
}

// Strapi's PolicyContext omits Koa's `state`, so declare the part we rely on.
interface AuthorPolicyContext extends Core.PolicyContext {
  state: {
    user?: AuthenticatedUser;
  };
}

/**
 * Overwrites the ownership relation on create requests with the
 * authenticated caller, so clients cannot attribute content to other users.
 */
export default (policyContext: AuthorPolicyContext, config: ForceAuthorConfig): boolean => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  const body: AuthoredBody = (policyContext.request.body as AuthoredBody | undefined) ?? {};
  const data = body.data ?? {};

  if (config.field === 'author') {
    data.author = user.documentId;
  } else {
    data.user = user.documentId;
  }

  body.data = data;
  policyContext.request.body = body;

  return true;
};
