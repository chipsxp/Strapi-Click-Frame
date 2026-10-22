import { factories } from '@strapi/strapi';
import type { Context } from 'koa';

interface RecordDonationBody {
  amount?: number;
  isAnonymous?: boolean;
  nickname?: string;
}

interface AuthenticatedUser {
  documentId: string;
}

const MAX_DONATION_AMOUNT = 10000;

/**
 * Builds the `YYYY-MM` bucket in local time. Must stay identical to the format
 * used by community-stat.getStats, otherwise donations land in the wrong month.
 */
const currentMonthKey = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default factories.createCoreController('api::donation.donation', ({ strapi }) => ({
  async record(ctx: Context) {
    const body = (ctx.request.body as RecordDonationBody | undefined) ?? {};

    if (typeof body.amount !== 'number' || !Number.isFinite(body.amount)) {
      return ctx.badRequest('amount must be a number.');
    }

    if (body.amount <= 0 || body.amount > MAX_DONATION_AMOUNT) {
      return ctx.badRequest(`amount must be between 0 and ${MAX_DONATION_AMOUNT}.`);
    }

    const caller = ctx.state.user as AuthenticatedUser | undefined;
    const isAnonymous = body.isAnonymous === true;

    // month is always server-assigned; the client can never choose the bucket.
    // user is only linked to the authenticated caller, never to a client-supplied id.
    const donation = await strapi.documents('api::donation.donation').create({
      data: {
        amount: body.amount,
        month: currentMonthKey(),
        isAnonymous,
        nickname: typeof body.nickname === 'string' ? body.nickname : undefined,
        user: caller && !isAnonymous ? caller.documentId : undefined,
      },
    });

    return ctx.send({ data: { documentId: donation.documentId } });
  },
}));
