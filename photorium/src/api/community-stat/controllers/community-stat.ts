import { Context } from 'koa';

export default {
  async getStats(ctx: Context) {
    try {
      // 1. Most Following Follower Counts (Top 5 Users by follower count)
      const topFollowed = await strapi.documents('plugin::users-permissions.user').findMany({
        fields: ['username', 'nickname'],
        populate: {
          followers: {
            count: true
          }
        },
        limit: 20,
        // Strapi 5 sort might need adjustment if count is not sortable directly
      });

      // 2. Global Totals (Monthly/Yearly)
      // This would ideally use raw SQL or complex filters. 
      // For now, we'll aggregate via Document Service or DB Query.
      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const currentYear = `${now.getFullYear()}`;

      // 3. Donation Stats
      const monthlyDonations = await strapi.documents('api::donation.donation').findMany({
        filters: { month: currentMonth }
      });

      const totalMonthlyDonationAmount = monthlyDonations.reduce((sum, d: any) => sum + Number(d.amount), 0);

      const topDonors = await strapi.db.query('api::donation.donation').findMany({
        where: { month: currentMonth, isAnonymous: false },
        orderBy: { amount: 'desc' },
        limit: 5,
        populate: ['user']
      });

      // 4. Photo Stats
      const topPhotosByChips = await strapi.documents('api::photo.photo').findMany({
        sort: 'classic_munch_count:desc',
        limit: 5,
        populate: ['author']
      });

      const topPhotosByCheddar = await strapi.documents('api::photo.photo').findMany({
        sort: 'cheddar_munch_count:desc',
        limit: 5,
        populate: ['author']
      });

      const topPhotosByClicks = await strapi.documents('api::photo.photo').findMany({
        sort: 'views:desc',
        limit: 5,
        populate: ['author']
      });

      // 4.5. Monthly Chip/Cheddar Totals
      const monthlyReactions = await strapi.documents('api::reaction.reaction').findMany({
        filters: {
            createdAt: {
                $gte: new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
            }
        }
      });

      const monthlyChips = monthlyReactions.filter((r: any) => r.type === 'classic').length;
      const monthlyCheddar = monthlyReactions.filter((r: any) => r.type === 'cheddar').length;

      // 4.6 Global Totals for Header
      const totalUsersCount = await strapi.db.query('plugin::users-permissions.user').count();
      const totalPhotosCount = await strapi.db.query('api::photo.photo').count({
        where: { publishedAt: { $notNull: true } }
      });
      const totalReactionsCount = await strapi.db.query('api::reaction.reaction').count();

      // 5. User Specific Stats (if logged in)
      let userStats = null;
      if (ctx.state.user) {
        const userId = ctx.state.user.id;
        
        // Find user documentId if not in state
        let docId = ctx.state.user.documentId;
        if (!docId) {
            const u = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: userId } });
            docId = u?.documentId;
        }

        if (docId) {
            // Strapi 5 Document Service is preferred for relation counting
            const user = await strapi.documents('plugin::users-permissions.user').findOne({
                documentId: docId,
                populate: {
                    donations: true,
                    photos: { count: true },
                    followers: { count: true },
                    following: { count: true }
                }
            }) as any;

            if (user) {
              userStats = {
                  classic_munch_given_total: user.classic_munch_given_total || 0,
                  cheddar_munch_balance: user.cheddar_munch_balance || 0,
                  total_photos_fried: user.photos?.count ?? 0,
                  total_followers: user.followers?.count ?? 0,
                  total_following: user.following?.count ?? 0,
                  total_donations_given: user.donations?.reduce((sum: number, d: any) => sum + Number(d.amount), 0) || 0
              };
            }
        }
      }

      return ctx.send({
        community: {
            total_users: totalUsersCount,
            total_photos: totalPhotosCount,
            total_munching: totalReactionsCount,
            monthly_total_donation: totalMonthlyDonationAmount,
            monthly_chips: monthlyChips,
            monthly_cheddar: monthlyCheddar,
            top_donors: topDonors.map((d: any) => ({
                nickname: d.nickname || d.user?.username || 'Anonymous',
                amount: d.amount
            })),
            top_followed: topFollowed.map((u: any) => ({
                nickname: u.nickname || u.username,
                followers: u.followers?.count || 0
            })).sort((a, b) => b.followers - a.followers),
            top_photos_chips: topPhotosByChips,
            top_photos_cheddar: topPhotosByCheddar,
            top_photos_clicks: topPhotosByClicks
        },
        user: userStats
      });
    } catch (err: unknown) {
      console.error('Error fetching community stats:', err);
      return ctx.internalServerError('Error fetching community stats.');
    }
  }
};
