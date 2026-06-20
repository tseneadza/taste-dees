// PayPal Payment Adapter

import {
  PaymentAdapter,
  CreatePaymentIntentParams,
  CreatePaymentIntentResult,
  GetPaymentStatusResult,
  CancelPaymentResult,
  RefundPaymentParams,
  RefundPaymentResult,
  PaymentWebhookEvent,
  PaymentStatus,
} from './types';

// PayPal order status mapping
function mapPayPalStatus(paypalStatus: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    CREATED: 'requires_payment_method',
    SAVED: 'requires_payment_method',
    APPROVED: 'requires_confirmation',
    VOIDED: 'canceled',
    COMPLETED: 'succeeded',
    PAYER_ACTION_REQUIRED: 'requires_action',
  };
  return statusMap[paypalStatus] || 'requires_payment_method';
}

interface PayPalAccessToken {
  access_token: string;
  expires_at: number;
}

export class PayPalAdapter implements PaymentAdapter {
  readonly name = 'paypal';
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;
  private cachedToken: PayPalAccessToken | null = null;

  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID || '';
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';

    if (!this.clientId || !this.clientSecret) {
      throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables are required');
    }

    // Use sandbox for development, live for production
    const isSandbox = process.env.PAYPAL_SANDBOX === 'true' || process.env.NODE_ENV !== 'production';
    this.baseUrl = isSandbox
      ? 'https://api-m.sandbox.paypal.com'
      : 'https://api-m.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.cachedToken && this.cachedToken.expires_at > Date.now()) {
      return this.cachedToken.access_token;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    const response = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.cachedToken = {
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in - 60) * 1000, // Subtract 60 seconds for safety
    };

    return this.cachedToken.access_token;
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult> {
    try {
      const { amount, currency = 'USD', customer, lineItems, shipping, metadata } = params;
      const accessToken = await this.getAccessToken();

      // Convert cents to dollars for PayPal
      const totalAmount = (amount + (shipping?.price || 0)) / 100;
      const shippingAmount = (shipping?.price || 0) / 100;
      const itemsTotal = amount / 100;

      const orderPayload = {
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: currency.toUpperCase(),
              value: totalAmount.toFixed(2),
              breakdown: {
                item_total: {
                  currency_code: currency.toUpperCase(),
                  value: itemsTotal.toFixed(2),
                },
                shipping: {
                  currency_code: currency.toUpperCase(),
                  value: shippingAmount.toFixed(2),
                },
              },
            },
            items: lineItems.map(item => ({
              name: item.name.substring(0, 127), // PayPal has a 127 char limit
              description: item.description?.substring(0, 127) || '',
              quantity: String(item.quantity),
              unit_amount: {
                currency_code: currency.toUpperCase(),
                value: (item.unitPrice / 100).toFixed(2),
              },
              category: 'PHYSICAL_GOODS',
            })),
            custom_id: metadata?.orderId || undefined,
          },
        ],
        payer: {
          email_address: customer.email,
          name: customer.name ? {
            given_name: customer.name.split(' ')[0],
            surname: customer.name.split(' ').slice(1).join(' ') || '',
          } : undefined,
        },
        application_context: {
          brand_name: 'Taste Dees',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,
        },
      };

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[PayPalAdapter] Error creating order:', errorData);
        throw new Error(errorData.message || 'Failed to create PayPal order');
      }

      const order = await response.json();

      // The "client secret" for PayPal is the order ID - the client uses this to complete payment
      return {
        success: true,
        paymentIntent: {
          id: order.id,
          clientSecret: order.id, // PayPal order ID is used client-side
          amount: amount + (shipping?.price || 0),
          currency: currency.toLowerCase(),
          status: mapPayPalStatus(order.status),
          provider: this.name,
          metadata: metadata,
        },
      };
    } catch (error) {
      console.error('[PayPalAdapter] Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      };
    }
  }

  async getPaymentStatus(orderId: string): Promise<GetPaymentStatusResult> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get PayPal order: ${response.statusText}`);
      }

      const order = await response.json();

      return {
        success: true,
        status: mapPayPalStatus(order.status),
        paymentIntent: {
          id: order.id,
          clientSecret: order.id,
          amount: Math.round(parseFloat(order.purchase_units[0].amount.value) * 100),
          currency: order.purchase_units[0].amount.currency_code.toLowerCase(),
          status: mapPayPalStatus(order.status),
          provider: this.name,
        },
      };
    } catch (error) {
      console.error('[PayPalAdapter] Error getting payment status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment status',
      };
    }
  }

  async cancelPayment(orderId: string): Promise<CancelPaymentResult> {
    // PayPal orders can't be explicitly cancelled - they expire after 3 hours
    // We just acknowledge the cancellation
    console.log(`[PayPalAdapter] Order ${orderId} cancellation requested (order will expire)`);
    return { success: true };
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult> {
    try {
      const accessToken = await this.getAccessToken();

      // First, get the capture ID from the order
      const orderResponse = await fetch(`${this.baseUrl}/v2/checkout/orders/${params.paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to get order for refund');
      }

      const order = await orderResponse.json();
      const capture = order.purchase_units?.[0]?.payments?.captures?.[0];

      if (!capture) {
        throw new Error('No capture found for this order');
      }

      // Create the refund
      const refundPayload: Record<string, unknown> = {};
      if (params.amount) {
        refundPayload.amount = {
          value: (params.amount / 100).toFixed(2),
          currency_code: order.purchase_units[0].amount.currency_code,
        };
      }
      if (params.reason) {
        refundPayload.note_to_payer = params.reason;
      }

      const refundResponse = await fetch(`${this.baseUrl}/v2/payments/captures/${capture.id}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
        body: JSON.stringify(refundPayload),
      });

      if (!refundResponse.ok) {
        const errorData = await refundResponse.json();
        throw new Error(errorData.message || 'Failed to create refund');
      }

      const refund = await refundResponse.json();

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      console.error('[PayPalAdapter] Error refunding payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refund payment',
      };
    }
  }

  async parseWebhookEvent(payload: string | Buffer, signature: string): Promise<PaymentWebhookEvent | null> {
    try {
      const accessToken = await this.getAccessToken();
      const payloadStr = typeof payload === 'string' ? payload : payload.toString('utf-8');
      const event = JSON.parse(payloadStr);

      // Verify the webhook signature
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      if (!webhookId) {
        console.error('[PayPalAdapter] Webhook ID not configured');
        return null;
      }

      // PayPal webhook verification requires multiple headers
      const headers = JSON.parse(signature); // We expect signature to contain JSON of all headers

      const verifyResponse = await fetch(`${this.baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: event,
        }),
      });

      if (!verifyResponse.ok) {
        console.error('[PayPalAdapter] Webhook verification failed');
        return null;
      }

      const verification = await verifyResponse.json();
      if (verification.verification_status !== 'SUCCESS') {
        console.error('[PayPalAdapter] Invalid webhook signature');
        return null;
      }

      // We only care about checkout order events
      if (!event.event_type.startsWith('CHECKOUT.ORDER')) {
        return null;
      }

      const orderId = event.resource?.id;
      if (!orderId) {
        return null;
      }

      return {
        type: event.event_type,
        paymentIntentId: orderId,
        status: mapPayPalStatus(event.resource?.status || 'CREATED'),
        metadata: {
          custom_id: event.resource?.purchase_units?.[0]?.custom_id,
        },
        rawEvent: event,
      };
    } catch (error) {
      console.error('[PayPalAdapter] Error parsing webhook event:', error);
      return null;
    }
  }

  getClientConfig(): { provider: string; publicKey: string } {
    if (!this.clientId) {
      throw new Error('PAYPAL_CLIENT_ID environment variable is required');
    }

    return {
      provider: this.name,
      publicKey: this.clientId,
    };
  }

  /**
   * Capture an approved PayPal order (called after user approves payment)
   */
  async captureOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to capture PayPal order');
      }

      return { success: true };
    } catch (error) {
      console.error('[PayPalAdapter] Error capturing order:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to capture order',
      };
    }
  }
}

// Singleton instance
let paypalAdapter: PayPalAdapter | null = null;

export function getPayPalAdapter(): PayPalAdapter {
  if (!paypalAdapter) {
    paypalAdapter = new PayPalAdapter();
  }
  return paypalAdapter;
}
