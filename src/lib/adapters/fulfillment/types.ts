// Fulfillment Adapter Types

export interface ShippingAddress {
  name: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string; // ISO 2-letter code (e.g., 'US', 'CA')
}

export interface ShippingRate {
  id: string;
  name: string;           // "Standard", "Express", etc.
  price: number;          // in dollars
  estimatedDays: string;  // "5-7 business days"
  provider: string;       // which fulfillment provider
}

export interface FulfillmentOrderItem {
  productId: string;
  variantId?: string;     // provider-specific variant ID
  quantity: number;
  color: string;
  size: string;
  name: string;           // product name for reference
  price: number;          // unit price
}

export interface FulfillmentOrder {
  id: string;
  externalId?: string;    // provider's order ID
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed' | 'cancelled';
  trackingNumber?: string;
  trackingUrl?: string;
  provider: string;
  createdAt: string;
  updatedAt?: string;
  error?: string;
}

export interface CreateOrderResult {
  success: boolean;
  order?: FulfillmentOrder;
  error?: string;
}

export interface GetRatesResult {
  success: boolean;
  rates?: ShippingRate[];
  error?: string;
}

export interface GetStatusResult {
  success: boolean;
  order?: FulfillmentOrder;
  error?: string;
}

export interface CancelOrderResult {
  success: boolean;
  error?: string;
}

// The adapter interface - all fulfillment providers implement this
export interface FulfillmentAdapter {
  readonly name: string;

  /**
   * Get available shipping rates for the given address and items
   */
  getShippingRates(
    address: ShippingAddress,
    items: FulfillmentOrderItem[]
  ): Promise<GetRatesResult>;

  /**
   * Create a fulfillment order
   */
  createOrder(
    address: ShippingAddress,
    items: FulfillmentOrderItem[],
    shippingRateId: string
  ): Promise<CreateOrderResult>;

  /**
   * Get the current status of an order
   */
  getOrderStatus(orderId: string): Promise<GetStatusResult>;

  /**
   * Cancel an order (if possible)
   */
  cancelOrder(orderId: string): Promise<CancelOrderResult>;
}
