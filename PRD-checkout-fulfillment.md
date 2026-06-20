# PRD: Checkout, Payments & Fulfillment System

**Date:** 2026-01-16
**Status:** Approved

## Overview

Implement a complete e-commerce checkout flow with:
- Supabase database (migrating from JSON files)
- Embedded checkout with Stripe + PayPal + Apple/Google Pay
- Real-time shipping rates from POD providers
- Free shipping over configurable threshold
- Multi-provider fulfillment adapter pattern (mock first, Printful/Printify later)
- Auto-select cheapest provider (future enhancement)

---

## Decisions Made

| Decision | Choice |
|----------|--------|
| CartDrawer | Skip - keep existing `/cart` page |
| Payment providers | Stripe + PayPal + Apple/Google Pay |
| Checkout style | Embedded (Stripe Elements) |
| Shipping rates | Real-time from POD provider |
| Free shipping | Over configurable threshold |
| Threshold config | Stored in settings, adjustable |
| Order storage | Supabase (PostgreSQL) |
| Data migration | Everything to Supabase (products, users, orders) |
| Auth system | Supabase Auth (replacing custom JWT) |
| POD provider | Mock adapter first, multi-provider later |
| Provider selection | Auto-select cheapest (future) |
| Checkout flow | Single page (`/checkout`) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  /cart (existing)  →  /checkout (new)  →  /order/[id] (confirm) │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API ROUTES                               │
├─────────────────────────────────────────────────────────────────┤
│  /api/checkout/shipping-rates   - Get rates from POD adapter    │
│  /api/checkout/create-session   - Create Stripe/PayPal session  │
│  /api/webhooks/stripe           - Handle payment confirmation    │
│  /api/webhooks/paypal           - Handle PayPal IPN             │
│  /api/orders                    - CRUD for order management      │
│  /api/settings                  - App config (free shipping $)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ADAPTERS (src/lib/adapters/)                │
├─────────────────────────────────────────────────────────────────┤
│  PaymentAdapter    │  FulfillmentAdapter                         │
│  ├─ StripeAdapter  │  ├─ MockAdapter (now)                       │
│  └─ PayPalAdapter  │  ├─ PrintfulAdapter (later)                 │
│                    │  └─ PrintifyAdapter (later)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SUPABASE                                  │
├─────────────────────────────────────────────────────────────────┤
│  products      - Product catalog (migrated from JSON)            │
│  orders        - Order records with status                       │
│  order_items   - Line items per order                            │
│  settings      - App config (free_shipping_threshold, etc.)      │
│  auth.users    - Supabase Auth (replaces users.json)             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### products
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Product name |
| description | TEXT | Product description |
| price | DECIMAL(10,2) | Current price |
| original_price | DECIMAL(10,2) NULL | Original price (for sales) |
| category | TEXT | Product category |
| colors | TEXT[] | Array of hex color codes |
| sizes | TEXT[] | Array of sizes (S, M, L, etc.) |
| images | TEXT[] | Array of image URLs |
| stock | INTEGER | Available inventory |
| is_new | BOOLEAN | New product flag |
| is_bestseller | BOOLEAN | Bestseller flag |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### orders
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_email | TEXT | Customer email |
| status | TEXT | pending, paid, fulfilled, shipped, delivered |
| shipping_address | JSONB | {name, street, city, state, zip, country} |
| shipping_method | TEXT | Selected shipping option |
| shipping_cost | DECIMAL(10,2) | Shipping price |
| subtotal | DECIMAL(10,2) | Items total before shipping |
| total | DECIMAL(10,2) | Final total |
| payment_provider | TEXT | stripe, paypal |
| payment_id | TEXT | Provider's payment/session ID |
| fulfillment_provider | TEXT NULL | printful, printify, etc. |
| fulfillment_id | TEXT NULL | Provider's order ID |
| created_at | TIMESTAMPTZ | Order creation time |
| updated_at | TIMESTAMPTZ | Last update time |

### order_items
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Foreign key to orders |
| product_id | UUID | Foreign key to products |
| product_name | TEXT | Snapshot of name at order time |
| price | DECIMAL(10,2) | Snapshot of price at order time |
| quantity | INTEGER | Quantity ordered |
| color | TEXT | Selected color |
| size | TEXT | Selected size |

### settings
| Column | Type | Description |
|--------|------|-------------|
| key | TEXT | Primary key (setting name) |
| value | JSONB | Setting value |
| updated_at | TIMESTAMPTZ | Last update time |

**Default settings:**
- `free_shipping_threshold`: `{"amount": 75}`
- `active_fulfillment_provider`: `{"provider": "mock"}`

---

## Adapter Interfaces

### FulfillmentAdapter

```typescript
interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface ShippingRate {
  id: string;
  name: string;
  price: number;
  estimatedDays: string;
  provider: string;
}

interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  color: string;
  size: string;
}

interface FulfillmentOrder {
  id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'failed';
  trackingNumber?: string;
  trackingUrl?: string;
  provider: string;
}

interface FulfillmentAdapter {
  name: string;
  getShippingRates(address: ShippingAddress, items: OrderItem[]): Promise<ShippingRate[]>;
  createOrder(address: ShippingAddress, items: OrderItem[], shippingRateId: string): Promise<FulfillmentOrder>;
  getOrderStatus(orderId: string): Promise<FulfillmentOrder>;
  cancelOrder(orderId: string): Promise<boolean>;
}
```

### PaymentAdapter

```typescript
interface PaymentSession {
  id: string;
  url?: string;
  clientSecret?: string;
  provider: 'stripe' | 'paypal';
}

interface PaymentResult {
  success: boolean;
  paymentId: string;
  error?: string;
}

interface PaymentAdapter {
  name: string;
  createCheckoutSession(orderId: string, items: CartItem[], shippingCost: number, customerEmail: string): Promise<PaymentSession>;
  verifyPayment(paymentId: string): Promise<PaymentResult>;
}
```

---

## Checkout Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     /checkout page                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SECTION 1: Shipping Address                                     │
│  - Full name, email                                              │
│  - Street address                                                │
│  - City, state, ZIP, country                                     │
│                                                                  │
│  SECTION 2: Shipping Method (loads after valid address)          │
│  - Real-time rates from POD adapter                              │
│  - Free shipping option if subtotal >= threshold                 │
│                                                                  │
│  SECTION 3: Payment                                              │
│  - Stripe Elements (card input)                                  │
│  - PayPal button                                                 │
│  - Apple Pay / Google Pay (via Stripe)                           │
│                                                                  │
│  SECTION 4: Order Summary                                        │
│  - Line items with quantities                                    │
│  - Subtotal, shipping, total                                     │
│  - "Complete Order" button                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Flow:**
1. User fills shipping address
2. On valid address, fetch shipping rates from POD adapter
3. If subtotal >= threshold, show "Free Shipping" option
4. User selects shipping method
5. User enters payment details
6. On submit: create order in Supabase → create payment session → process
7. Webhook confirms payment → trigger fulfillment → redirect to confirmation

---

## Testing Plan

### Migration Testing
- All products transferred with correct data
- Images, colors, sizes arrays preserved
- Admin users can log in via Supabase Auth
- Roles (super_admin, admin) preserved
- Settings configurable

### Unit Tests
- MockFulfillmentAdapter: rates, create order, status, cancel
- StripeAdapter: create session, verify payment
- PayPalAdapter: create order, capture payment
- Free shipping logic with threshold

### Integration Tests
- POST /api/checkout/shipping-rates
- POST /api/checkout/create-session
- POST /api/webhooks/stripe (signature, status update, fulfillment)
- Products API CRUD with Supabase

### E2E Tests (Playwright)
- Complete checkout flow: add to cart → checkout → pay → confirmation
- Free shipping applies correctly
- Payment failure handling
- Admin login and order management

### Manual Checklist
- [ ] Stripe test mode works
- [ ] Stripe live mode works (small real purchase)
- [ ] PayPal sandbox works
- [ ] PayPal live works
- [ ] Apple Pay appears on Safari/iOS
- [ ] Google Pay appears on Chrome
- [ ] Webhook receives confirmation
- [ ] Order appears in Supabase
- [ ] Free shipping applies correctly
- [ ] Admin can view orders
- [ ] Mobile checkout works
- [ ] Cart persists after browser close

---

## Implementation Phases

### Phase 1: Database Setup & Migration
1. Set up Supabase project
2. Create database schema
3. Configure Supabase Auth
4. Set up Row Level Security policies
5. Write migration script (products.json → Supabase)
6. Migrate admin users to Supabase Auth
7. Update existing API routes to use Supabase
8. Update admin page to use Supabase Auth
9. Test all existing functionality
10. Remove old JSON files and custom auth code

### Phase 2: Adapter Infrastructure
1. Create adapter interfaces
2. Implement MockFulfillmentAdapter
3. Implement StripeAdapter
4. Implement PayPalAdapter
5. Create adapter factory
6. Write unit tests

### Phase 3: Checkout Flow
1. Create /checkout page with address form
2. Create /api/checkout/shipping-rates endpoint
3. Add shipping method selection UI
4. Implement free shipping threshold logic
5. Add Stripe Elements payment form
6. Add PayPal button
7. Create /api/checkout/create-session endpoint
8. Create order in Supabase on checkout
9. Create /order/[id] confirmation page

### Phase 4: Webhooks & Fulfillment
1. Create /api/webhooks/stripe endpoint
2. Create /api/webhooks/paypal endpoint
3. Update order status on payment confirmation
4. Trigger fulfillment adapter on success
5. Store fulfillment order ID
6. Write integration tests

### Phase 5: Admin & Testing
1. Add Orders section to admin page
2. Add Settings section
3. Write E2E tests
4. Run manual testing checklist
5. Test with live payment providers

### Phase 6 (Future): Multi-Provider Auto-Select
1. Implement PrintfulAdapter
2. Implement PrintifyAdapter
3. Add product mapping
4. Implement auto-select cheapest logic
5. Add provider comparison in admin

---

## Environment Variables Required

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# PayPal
NEXT_PUBLIC_PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_WEBHOOK_ID=

# Fulfillment (when implementing real providers)
PRINTFUL_API_KEY=
PRINTIFY_API_KEY=
```

---

## Success Criteria

1. Customer can complete checkout and pay via Stripe or PayPal
2. Orders are stored in Supabase with correct status
3. Webhooks update order status on payment confirmation
4. Mock fulfillment adapter creates "orders" for testing
5. Admin can view and manage orders
6. Free shipping applies when threshold met
7. All existing functionality (products, cart, admin) still works after migration
