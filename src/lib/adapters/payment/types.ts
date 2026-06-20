// Payment Adapter Types

export interface PaymentCustomer {
  email: string;
  name?: string;
  phone?: string;
}

export interface PaymentLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in cents
  imageUrl?: string;
}

export interface PaymentShipping {
  name: string;
  price: number; // in cents
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number; // in cents
  currency: string;
  status: PaymentStatus;
  provider: string;
  metadata?: Record<string, string>;
}

export type PaymentStatus =
  | 'requires_payment_method'
  | 'requires_confirmation'
  | 'requires_action'
  | 'processing'
  | 'succeeded'
  | 'failed'
  | 'canceled';

export interface CreatePaymentIntentParams {
  amount: number; // in cents
  currency?: string;
  customer: PaymentCustomer;
  lineItems: PaymentLineItem[];
  shipping?: PaymentShipping;
  metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResult {
  success: boolean;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export interface GetPaymentStatusResult {
  success: boolean;
  status?: PaymentStatus;
  paymentIntent?: PaymentIntent;
  error?: string;
}

export interface CancelPaymentResult {
  success: boolean;
  error?: string;
}

export interface RefundPaymentParams {
  paymentIntentId: string;
  amount?: number; // partial refund in cents, full refund if not provided
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface RefundPaymentResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

// Webhook event types
export interface PaymentWebhookEvent {
  type: string;
  paymentIntentId: string;
  status: PaymentStatus;
  metadata?: Record<string, string>;
  rawEvent: unknown; // Original provider event for verification
}

// The adapter interface - all payment providers implement this
export interface PaymentAdapter {
  readonly name: string;

  /**
   * Create a payment intent for the given amount and customer
   */
  createPaymentIntent(params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResult>;

  /**
   * Get the current status of a payment
   */
  getPaymentStatus(paymentIntentId: string): Promise<GetPaymentStatusResult>;

  /**
   * Cancel a payment intent (before it's completed)
   */
  cancelPayment(paymentIntentId: string): Promise<CancelPaymentResult>;

  /**
   * Refund a completed payment
   */
  refundPayment(params: RefundPaymentParams): Promise<RefundPaymentResult>;

  /**
   * Parse and validate a webhook event from the provider
   */
  parseWebhookEvent(payload: string | Buffer, signature: string): Promise<PaymentWebhookEvent | null>;

  /**
   * Get the client-side configuration needed for the payment UI
   * (e.g., Stripe publishable key, PayPal client ID)
   */
  getClientConfig(): { provider: string; publicKey: string };
}
