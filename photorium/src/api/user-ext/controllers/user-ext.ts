import { Context } from 'koa';

interface AuthenticatedUser {
  id: number;
  documentId: string;
}

interface UpdateMeBody {
  bio?: string;
  nickname?: string;
  username?: string;
  real_name?: string;
  avatar?: number | null;
}

interface ToggleFollowBody {
  targetUserDocumentId?: string;
}

const USER_UID = 'plugin::users-permissions.user';

export default {
  /**
   * PUT /api/user-ext/me
   * Updates ONLY the authenticated caller, and ONLY whitelisted profile fields.
   * Economy counters, role, email, blocked and confirmed are never writable here.
   */
  async updateMe(ctx: Context) {
    const user = ctx.state.user as AuthenticatedUser | undefined;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const body = (ctx.request.body as UpdateMeBody | undefined) ?? {};
    const data: UpdateMeBody = {};

    if (typeof body.bio === 'string') data.bio = body.bio;
    if (typeof body.nickname === 'string') data.nickname = body.nickname;
    if (typeof body.username === 'string') data.username = body.username;
    if (typeof body.real_name === 'string') data.real_name = body.real_name;
    if (typeof body.avatar === 'number' || body.avatar === null) data.avatar = body.avatar;

    const updated = await strapi.documents(USER_UID).update({
      documentId: user.documentId,
      data,
    });

    return ctx.send({ data: { documentId: updated.documentId } });
  },

  /**
   * POST /api/user-ext/toggle-follow
   * Adds or removes ONE follow edge for the authenticated caller.
   * Uses relation connect/disconnect, so concurrent toggles never overwrite
   * each other's list.
   */
  async toggleFollow(ctx: Context) {
    const user = ctx.state.user as AuthenticatedUser | undefined;
    if (!user) {
      return ctx.unauthorized('You must be logged in.');
    }

    const body = (ctx.request.body as ToggleFollowBody | undefined) ?? {};
    const targetDocumentId = body.targetUserDocumentId;

    if (!targetDocumentId) {
      return ctx.badRequest('targetUserDocumentId is required.');
    }

    if (targetDocumentId === user.documentId) {
      return ctx.badRequest('You cannot follow yourself.');
    }

    const target = await strapi.documents(USER_UID).findOne({
      documentId: targetDocumentId,
    });

    if (!target) {
      return ctx.notFound('Target artist not found.');
    }

    const alreadyFollowing =
      (await strapi.documents(USER_UID).count({
        filters: {
          documentId: user.documentId,
          following: { documentId: targetDocumentId },
        },
      })) > 0;

    await strapi.documents(USER_UID).update({
      documentId: user.documentId,
      data: {
        following: alreadyFollowing
          ? { disconnect: [targetDocumentId] }
          : { connect: [targetDocumentId] },
      },
    });

    return ctx.send({ success: true, isFollowing: !alreadyFollowing });
  },

  /**
   * GET /api/user-ext/public-profile/:username
   * Public, read-only artist card. Returns an explicit allow-list of fields,
   * so private fields (email, real_name, special_date) can never leak here.
   */
  async publicProfile(ctx: Context) {
    const { username } = ctx.params as { username?: string };

    if (!username) {
      return ctx.badRequest('Username is required.');
    }

    const artist = await strapi.documents(USER_UID).findFirst({
      filters: { username },
      populate: ['avatar'],
    });

    if (!artist) {
      return ctx.notFound('Artist not found.');
    }

    const followersCount = await strapi.documents(USER_UID).count({
      filters: { following: { documentId: artist.documentId } },
    });

    const followingCount = await strapi.documents(USER_UID).count({
      filters: { followers: { documentId: artist.documentId } },
    });

    return ctx.send({
      data: {
        documentId: artist.documentId,
        username: artist.username,
        nickname: artist.nickname,
        bio: artist.bio,
        avatar: artist.avatar,
        followersCount,
        followingCount,
      },
    });
  },
};
