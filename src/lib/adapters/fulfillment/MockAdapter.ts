// Mock Fulfillment Adapter for development and testing

import {
  FulfillmentAdapter,
  ShippingAddress,
  ShippingRate,
  FulfillmentOrderItem,
  FulfillmentOrder,
  GetRatesResult,
  CreateOrderResult,
  GetStatusResult,
  CancelOrderResult,
} from './types';

// In-memory storage for mock orders
const mockOrders: Map<string, FulfillmentOrder> = new Map();

export class MockFulfillmentAdapter implements FulfillmentAdapter {
  readonly name = 'mock';

  async getShippingRates(
    address: ShippingAddress,
    items: FulfillmentOrderItem[]
  ): Promise<GetRatesResult> {
    // Simulate API delay
    await this.delay(300);

    // Calculate base shipping cost based on items
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const baseShipping = 4.99;
    const perItemCost = 0.50;

    // Check if international
    const isInternational = address.country !== 'US';
    const internationalMultiplier = isInternational ? 2.5 : 1;

    const standardPrice = (baseShipping + (itemCount * perItemCost)) * internationalMultiplier;
    const expressPrice = standardPrice * 1.8;
    const overnightPrice = standardPrice * 3;

    const rates: ShippingRate[] = [
      {
        id: 'mock_standard',
        name: 'Standard Shipping',
        price: Math.round(standardPrice * 100) / 100,
        estimatedDays: isInternational ? '10-15 business days' : '5-7 business days',
        provider: this.name,
      },
      {
        id: 'mock_express',
        name: 'Express Shipping',
        price: Math.round(expressPrice * 100) / 100,
        estimatedDays: isInternational ? '5-7 business days' : '2-3 business days',
        provider: this.name,
      },
    ];

    // Add overnight option for domestic only
    if (!isInternational) {
      rates.push({
        id: 'mock_overnight',
        name: 'Overnight Shipping',
        price: Math.round(overnightPrice * 100) / 100,
        estimatedDays: '1 business day',
        provider: this.name,
      });
    }

    return { success: true, rates };
  }

  async createOrder(
    address: ShippingAddress,
    items: FulfillmentOrderItem[],
    shippingRateId: string
  ): Promise<CreateOrderResult> {
    // Simulate API delay
    await this.delay(500);

    // Generate a mock order ID
    const orderId = `mock_order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const order: FulfillmentOrder = {
      id: orderId,
      externalId: orderId,
      status: 'pending',
      provider: this.name,
      createdAt: new Date().toISOString(),
    };

    // Store the order
    mockOrders.set(orderId, order);

    // Simulate order processing after a delay (in real scenario, this would be a webhook)
    setTimeout(() => {
      const storedOrder = mockOrders.get(orderId);
      if (storedOrder && storedOrder.status === 'pending') {
        storedOrder.status = 'processing';
        storedOrder.updatedAt = new Date().toISOString();
      }
    }, 5000);

    // Simulate shipping after more delay
    setTimeout(() => {
      const storedOrder = mockOrders.get(orderId);
      if (storedOrder && storedOrder.status === 'processing') {
        storedOrder.status = 'shipped';
        storedOrder.trackingNumber = `MOCK${Date.now()}`;
        storedOrder.trackingUrl = `https://example.com/track/${storedOrder.trackingNumber}`;
        storedOrder.updatedAt = new Date().toISOString();
      }
    }, 15000);

    console.log(`[MockAdapter] Created order ${orderId} for ${items.length} items to ${address.city}, ${address.country}`);

    return { success: true, order };
  }

  async getOrderStatus(orderId: string): Promise<GetStatusResult> {
    // Simulate API delay
    await this.delay(200);

    const order = mockOrders.get(orderId);

    if (!order) {
      return {
        success: false,
        error: `Order ${orderId} not found`,
      };
    }

    return { success: true, order };
  }

  async cancelOrder(orderId: string): Promise<CancelOrderResult> {
    // Simulate API delay
    await this.delay(300);

    const order = mockOrders.get(orderId);

    if (!order) {
      return {
        success: false,
        error: `Order ${orderId} not found`,
      };
    }

    // Can only cancel pending or processing orders
    if (order.status === 'shipped' || order.status === 'delivered') {
      return {
        success: false,
        error: `Cannot cancel order that has already been ${order.status}`,
      };
    }

    order.status = 'cancelled';
    order.updatedAt = new Date().toISOString();

    console.log(`[MockAdapter] Cancelled order ${orderId}`);

    return { success: true };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const mockFulfillmentAdapter = new MockFulfillmentAdapter();
