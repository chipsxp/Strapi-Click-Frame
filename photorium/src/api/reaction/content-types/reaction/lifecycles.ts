import { errors } from "@strapi/utils";

const { ApplicationError, ForbiddenError } = errors;

export default {
  async beforeCreate(event) {
    const { data } = event.params;
    const { photo: rawPhoto, user: rawUser, type } = data;

    const extractId = (val) => {
      if (!val) return null;
      if (typeof val === "string" || typeof val === "number") return val;
      if (val.connect && val.connect.length > 0) {
        return val.connect[0].documentId || val.connect[0].id || val.connect[0];
      }
      if (val.set && val.set.length > 0) {
        return val.set[0].documentId || val.set[0].id || val.set[0];
      }
      return null;
    };

    const photoId = extractId(rawPhoto);
    const userId = extractId(rawUser);

    console.log("Extracted photoId:", photoId);
    console.log("Extracted userId:", userId);

    if (!photoId || !userId) {
      throw new ApplicationError("Photo and User are required for a reaction");
    }

    // Helper to find a document safely whether we have an internal id or documentId
    const findDoc = async (uid, extractedId, populate?: string[]) => {
      const isNumeric = typeof extractedId === 'number' || !isNaN(Number(extractedId));
      const queryParams: any = {};
      if (populate && populate.length > 0) {
        // Convert array to object syntax for Strapi 5.46+ compatibility
        queryParams.populate = populate.reduce((acc, curr) => ({ ...acc, [curr]: true }), {});
      }

      if (isNumeric) {
        return strapi.db.query(uid).findOne({
          where: { id: Number(extractedId) },
          ...queryParams
        });
      } else {
        return strapi.documents(uid).findOne({
          documentId: extractedId,
          ...queryParams
        });
      }
    };

    // 1. Fetch Photo to check author and current counts
    const photo = await findDoc('api::photo.photo', photoId, ['author']);

    if (!photo) throw new ApplicationError("Photo not found");

    // 2. Prevent self-voting
    const photoAuthorId = photo.author?.id;
    const photoAuthorDocId = photo.author?.documentId;

    if (photoAuthorId === userId || photoAuthorDocId === userId) {
      throw new ForbiddenError(
        "You cannot munch your own art! It must be from fellow artists.",
      );
    }

    // 3. Fetch User to check munch status
    const user = await findDoc('plugin::users-permissions.user', userId);

    if (!user) throw new ApplicationError("User not found");

    if (type === "classic") {
      // 4. Check daily classic munch reset
      if (user.last_classic_munch_at) {
        const lastMunch = new Date(user.last_classic_munch_at);
        const today = new Date();

        // Simple day check in UTC
        const isSameDay =
          lastMunch.getUTCFullYear() === today.getUTCFullYear() &&
          lastMunch.getUTCMonth() === today.getUTCMonth() &&
          lastMunch.getUTCDate() === today.getUTCDate();

        if (isSameDay) {
          throw new ForbiddenError(
            "Everyone gets one classic chip per day. Use yours quickly, as chips don't accumulate!",
          );
        }
      }
    } else if (type === "cheddar") {
      // 5. Check cheddar balance
      if (!user.cheddar_munch_balance || user.cheddar_munch_balance <= 0) {
        throw new ForbiddenError(
          "You do not have any Cheddar chips to place your fave. Give 5 Classics to others to earn one!",
        );
      }
    }

    // Store current state for afterCreate
    event.state.user = user;
    event.state.photo = photo;
  },

  async afterCreate(event) {
    const { result, state } = event;
    const { user, photo } = state;
    const { type } = result;

    if (!user || !photo) return;

    const countField = `${type}_munch_count`;

    // 1. Update Photo count using DB query to ensure both draft and published versions get updated
    await strapi.db.query('api::photo.photo').updateMany({
      where: { documentId: photo.documentId },
      data: {
        [countField]: (photo[countField] || 0) + 1,
      },
    });

    // 2. Update User stats based on munch type
    if (type === 'classic') {
      const newTotal = (user.classic_munch_given_total || 0) + 1;
      let newCheddarBalance = user.cheddar_munch_balance || 0;
      
      // Award 1 Cheddar chip per 5 Classic chips given to others
      if (newTotal > 0 && newTotal % 5 === 0) {
        newCheddarBalance += 1;
      }

      await strapi.documents('plugin::users-permissions.user').update({
        documentId: user.documentId,
        data: {
          last_classic_munch_at: new Date(),
          classic_munch_given_total: newTotal,
          cheddar_munch_balance: newCheddarBalance,
        },
      });
    } else if (type === "cheddar") {
      // Consume one Cheddar chip from balance
      await strapi.documents("plugin::users-permissions.user").update({
        documentId: user.documentId,
        data: {
          cheddar_munch_balance: Math.max(
            0,
            (user.cheddar_munch_balance || 1) - 1,
          ),
        },
      });
    }
  },

  async afterDelete(event) {
    const { result } = event;
    if (!result) return;

    // Result might be incomplete depending on how delete was called
    // We try to extract what we can
    const { photo, user, type } = result;
    const countField = `${type}_munch_count`;

    if (photo?.documentId) {
      const photoDoc = await strapi.documents("api::photo.photo").findOne({
        documentId: photo.documentId,
      });

      if (photoDoc) {
        await strapi.db.query("api::photo.photo").updateMany({
          where: { documentId: photo.documentId },
          data: {
            [countField]: Math.max(0, (photoDoc[countField] || 1) - 1),
          },
        });
      }
    }

    // If they delete a Cheddar fave, they get the chip back
    if (type === "cheddar" && user?.documentId) {
      const userDoc = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: user.documentId,
        });
      if (userDoc) {
        await strapi.documents("plugin::users-permissions.user").update({
          documentId: user.documentId,
          data: {
            cheddar_munch_balance: (userDoc.cheddar_munch_balance || 0) + 1,
          },
        });
      }
    }
    // We don't undo Classic progress to avoid messy "un-awarding" of Cheddar chips.
  },
};
