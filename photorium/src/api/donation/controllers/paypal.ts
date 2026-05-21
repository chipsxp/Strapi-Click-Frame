import { Context } from 'koa';

interface PayPalTokenResponse {
  access_token: string;
  error_description?: string;
  error?: string;
}

interface PayPalOrderResponse {
  id?: string;
  status?: string;
  message?: string;
  purchase_units?: Array<{
    payments?: {
      captures?: Array<{
        amount: {
          value: string;
        }
      }>
    }
  }>;
}

interface UserState {
  id: number;
  documentId: string;
  nickname?: string;
  username?: string;
  cheddar_munch_balance?: number;
}

const getPayPalBaseUrl = (): string => {
  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
};

const getPayPalAccessToken = async (): Promise<string> => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_SECRET;
  
  if (!clientId || !secret) {
    throw new Error('PayPal credentials missing from environment.');
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    body: 'grant_type=client_credentials',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = (await response.json()) as PayPalTokenResponse;
  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${data.error_description || data.error}`);
  }

  return data.access_token;
};

export default {
  async createOrder(ctx: Context) {
    try {
      const body = ctx.request.body as { amount?: string; type?: string };
      const { amount, type } = body;
      let finalAmount = amount;

      if (type === 'cheddar') {
        finalAmount = '1.99';
      }

      if (!finalAmount || isNaN(parseFloat(finalAmount)) || parseFloat(finalAmount) <= 0) {
        return ctx.badRequest('Invalid amount');
      }

      const accessToken = await getPayPalAccessToken();
      const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: parseFloat(finalAmount).toFixed(2),
              },
              description: type === 'cheddar' ? 'Premium Cheddar Chip' : 'Support the Hub Donation',
            },
          ],
        }),
      });

      const data = (await response.json()) as PayPalOrderResponse;
      if (!response.ok) {
        return ctx.badRequest(data.message || 'Failed to create PayPal order');
      }

      return { id: data.id };
    } catch (err) {
      console.error('createOrder error:', err);
      return ctx.internalServerError('Failed to create order');
    }
  },

  async captureOrder(ctx: Context) {
    try {
      const body = ctx.request.body as { orderID?: string; isAnonymous?: boolean; nickname?: string; type?: string };
      const { orderID, isAnonymous, nickname, type } = body;
      const user = ctx.state.user as UserState | undefined;

      if (!orderID) {
        return ctx.badRequest('Order ID is required');
      }

      const accessToken = await getPayPalAccessToken();
      const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${orderID}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = (await response.json()) as PayPalOrderResponse;
      if (!response.ok) {
        return ctx.badRequest(data.message || 'Failed to capture PayPal order');
      }

      if (data.status === 'COMPLETED') {
        const capturedAmount = data.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;

        if (!capturedAmount) {
             return ctx.badRequest('Failed to verify captured amount');
        }

        // 1. Record Donation in Strapi
        const monthString = new Date().toISOString().substring(0, 7); // 'YYYY-MM'
        
        await strapi.documents('api::donation.donation').create({
          data: {
            amount: parseFloat(capturedAmount),
            isAnonymous: !!isAnonymous,
            nickname: isAnonymous ? 'Anonymous' : (nickname || user?.nickname || user?.username || 'Anonymous'),
            user: user?.documentId || null,
            month: monthString,
          },
          status: 'published' // Ensure it's active immediately
        });

        // 2. Grant Cheddar if applicable
        if (type === 'cheddar' && user && user.documentId) {
          const updatedUser = await strapi.documents('plugin::users-permissions.user').update({
            documentId: user.documentId,
            data: {
              cheddar_munch_balance: (user.cheddar_munch_balance || 0) + 1,
            },
          });
          
          return { success: true, message: 'Cheddar purchased!', user: updatedUser };
        }

        return { success: true, message: 'Donation recorded!' };
      }

      return ctx.badRequest('Order not completed');
    } catch (err) {
      console.error('captureOrder error:', err);
      return ctx.internalServerError('Failed to capture order');
    }
  },
};
