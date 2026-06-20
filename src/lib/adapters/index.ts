// Adapter Factory - Unified access to payment and fulfillment adapters

import { PaymentAdapter } from './payment/types';
import { FulfillmentAdapter } from './fulfillment/types';
import { getStripeAdapter } from './payment/StripeAdapter';
import { getPayPalAdapter } from './payment/PayPalAdapter';
import { mockFulfillmentAdapter } from './fulfillment/MockAdapter';

// Payment provider types
export type PaymentProvider = 'stripe' | 'paypal';

// Fulfillment provider types
export type FulfillmentProvider = 'mock' | 'printful' | 'printify';

// Configuration for which adapters to use
interface AdapterConfig {
  payment: {
    primary: PaymentProvider;
    enabled: PaymentProvider[];
  };
  fulfillment: {
    primary: FulfillmentProvider;
    enabled: FulfillmentProvider[];
  };
}

// Default configuration
const defaultConfig: AdapterConfig = {
  payment: {
    primary: 'stripe',
    enabled: ['stripe', 'paypal'],
  },
  fulfillment: {
    primary: 'mock',
    enabled: ['mock'],
  },
};

// Get config from environment or use defaults
function getConfig(): AdapterConfig {
  const paymentPrimary = (process.env.PAYMENT_PROVIDER as PaymentProvider) || defaultConfig.payment.primary;
  const fulfillmentPrimary = (process.env.FULFILLMENT_PROVIDER as FulfillmentProvider) || defaultConfig.fulfillment.primary;

  return {
    payment: {
      primary: paymentPrimary,
      enabled: defaultConfig.payment.enabled,
    },
    fulfillment: {
      primary: fulfillmentPrimary,
      enabled: defaultConfig.fulfillment.enabled,
    },
  };
}

/**
 * Get a payment adapter by provider name
 */
export function getPaymentAdapter(provider?: PaymentProvider): PaymentAdapter {
  const config = getConfig();
  const providerToUse = provider || config.payment.primary;

  switch (providerToUse) {
    case 'stripe':
      return getStripeAdapter();
    case 'paypal':
      return getPayPalAdapter();
    default:
      throw new Error(`Unknown payment provider: ${providerToUse}`);
  }
}

/**
 * Get all enabled payment adapters
 */
export function getEnabledPaymentAdapters(): PaymentAdapter[] {
  const config = getConfig();
  const adapters: PaymentAdapter[] = [];

  for (const provider of config.payment.enabled) {
    try {
      adapters.push(getPaymentAdapter(provider));
    } catch (error) {
      // Skip adapters that aren't configured
      console.warn(`[AdapterFactory] Payment adapter ${provider} not available:`, error);
    }
  }

  return adapters;
}

/**
 * Get a fulfillment adapter by provider name
 */
export function getFulfillmentAdapter(provider?: FulfillmentProvider): FulfillmentAdapter {
  const config = getConfig();
  const providerToUse = provider || config.fulfillment.primary;

  switch (providerToUse) {
    case 'mock':
      return mockFulfillmentAdapter;
    case 'printful':
      // TODO: Implement PrintfulAdapter
      throw new Error('Printful adapter not yet implemented');
    case 'printify':
      // TODO: Implement PrintifyAdapter
      throw new Error('Printify adapter not yet implemented');
    default:
      throw new Error(`Unknown fulfillment provider: ${providerToUse}`);
  }
}

/**
 * Get all enabled fulfillment adapters
 */
export function getEnabledFulfillmentAdapters(): FulfillmentAdapter[] {
  const config = getConfig();
  const adapters: FulfillmentAdapter[] = [];

  for (const provider of config.fulfillment.enabled) {
    try {
      adapters.push(getFulfillmentAdapter(provider));
    } catch (error) {
      // Skip adapters that aren't configured
      console.warn(`[AdapterFactory] Fulfillment adapter ${provider} not available:`, error);
    }
  }

  return adapters;
}

/**
 * Get client-side configuration for all enabled payment providers
 */
export function getPaymentClientConfig(): Array<{ provider: string; publicKey: string }> {
  const adapters = getEnabledPaymentAdapters();
  return adapters.map(adapter => adapter.getClientConfig());
}

// Re-export types
export * from './payment/types';
export * from './fulfillment/types';
