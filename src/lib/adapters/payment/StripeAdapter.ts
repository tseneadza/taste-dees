// Stripe Payment Adapter

import Stripe from 'stripe';
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

// Map Stripe status to our PaymentStatus
function mapStripeStatus(stripeStatus: Stripe.PaymentIntent.Status): PaymentStatus {
  const statusMap: Record<Stripe.PaymentIntent.Status, PaymentStatus> = {
    requires_payment_method: 'requires_payment_method',
    requires_confirmation: 'requires_confirmation',
    requires_action: 'requires_action',
    processing: 'processing',
    succeeded: 'succeeded',
    canceled: 'canceled',
    requires_capture: 'processing', // We'll auto-capture
  };
  return statusMap[stripeStatus] || 'requires_payment_method';
}

export class StripeAdapter implements PaymentAdapter {
  readonly name = 'stripe';
  private stripe: Stripe;
  private webhookSecret: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is required');
    }

    this.stripe = new Stripe(secretKey);

    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  }

  async createPaymentIntent(params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult> {
    try {
      const { amount, currency = 'usd', customer, lineItems, shipping, metadata } = params;

      // Create or retrieve Stripe customer
      let stripeCustomer: Stripe.Customer | null = null;

      // Search for existing customer by email
      const existingCustomers = await this.stripe.customers.list({
        email: customer.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        stripeCustomer = existingCustomers.data[0];
      } else {
        stripeCustomer = await this.stripe.customers.create({
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
        });
      }

      // Calculate total amount including shipping
      const totalAmount = amount + (shipping?.price || 0);

      // Create the payment intent
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: totalAmount,
        currency,
        customer: stripeCustomer.id,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          ...metadata,
          line_items: JSON.stringify(lineItems.map(item => ({
            name: item.name,
            qty: item.quantity,
            price: item.unitPrice,
          }))),
          shipping_name: shipping?.name || '',
          shipping_price: String(shipping?.price || 0),
        },
      });

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret!,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: mapStripeStatus(paymentIntent.status),
          provider: this.name,
          metadata: paymentIntent.metadata as Record<string, string>,
        },
      };
    } catch (error) {
      console.error('[StripeAdapter] Error creating payment intent:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create payment intent',
      };
    }
  }

  async getPaymentStatus(paymentIntentId: string): Promise<GetPaymentStatusResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        status: mapStripeStatus(paymentIntent.status),
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret!,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: mapStripeStatus(paymentIntent.status),
          provider: this.name,
          metadata: paymentIntent.metadata as Record<string, string>,
        },
      };
    } catch (error) {
      console.error('[StripeAdapter] Error getting payment status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get payment status',
      };
    }
  }

  async cancelPayment(paymentIntentId: string): Promise<CancelPaymentResult> {
    try {
      await this.stripe.paymentIntents.cancel(paymentIntentId);
      return { success: true };
    } catch (error) {
      console.error('[StripeAdapter] Error canceling payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to cancel payment',
      };
    }
  }

  async refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: params.paymentIntentId,
      };

      if (params.amount) {
        refundParams.amount = params.amount;
      }

      if (params.reason) {
        refundParams.reason = params.reason;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: true,
        refundId: refund.id,
      };
    } catch (error) {
      console.error('[StripeAdapter] Error refunding payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to refund payment',
      };
    }
  }

  async parseWebhookEvent(payload: string | Buffer, signature: string): Promise<PaymentWebhookEvent | null> {
    if (!this.webhookSecret) {
      console.error('[StripeAdapter] Webhook secret not configured');
      return null;
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
      );

      // We only care about payment intent events
      if (!event.type.startsWith('payment_intent.')) {
        return null;
      }

      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      return {
        type: event.type,
        paymentIntentId: paymentIntent.id,
        status: mapStripeStatus(paymentIntent.status),
        metadata: paymentIntent.metadata as Record<string, string>,
        rawEvent: event,
      };
    } catch (error) {
      console.error('[StripeAdapter] Error parsing webhook event:', error);
      return null;
    }
  }

  getClientConfig(): { provider: string; publicKey: string } {
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publicKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable is required');
    }

    return {
      provider: this.name,
      publicKey,
    };
  }
}

// Singleton instance - will throw if env vars not set
let stripeAdapter: StripeAdapter | null = null;

export function getStripeAdapter(): StripeAdapter {
  if (!stripeAdapter) {
    stripeAdapter = new StripeAdapter();
  }
  return stripeAdapter;
}
