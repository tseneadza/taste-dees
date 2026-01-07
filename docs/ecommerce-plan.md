# E-commerce Shopping Cart with Stripe + Multi-POD Support

## Overview

Add a complete shopping cart system with Stripe payments, PostgreSQL product/order storage, and a flexible POD provider abstraction supporting both Printful and Printify for print-on-demand fulfillment.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │  Product UI  │───▶│  Cart State  │───▶│   Checkout   │                   │
│  │   (React)    │    │  (Zustand)   │    │    Button    │                   │
│  └──────────────┘    └──────────────┘    └──────┬───────┘                   │
└─────────────────────────────────────────────────┼───────────────────────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ROUTES                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐                   │
│  │ /api/products│    │/api/checkout │    │/api/webhooks │                   │
│  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘                   │
└─────────┼───────────────────┼───────────────────┼───────────────────────────┘
          │                   │                   │
          ▼                   ▼                   ▼
┌──────────────┐      ┌──────────────┐    ┌──────────────┐
│  PostgreSQL  │      │    Stripe    │    │  /api/fulfill│
│   Database   │      │   Checkout   │    └──────┬───────┘
└──────────────┘      └──────────────┘           │
                                                  ▼
                                    ┌─────────────────────────┐
                                    │   POD Provider Layer    │
                                    │  ┌───────────────────┐  │
                                    │  │  PODProvider      │  │
                                    │  │  Interface        │  │
                                    │  └─────────┬─────────┘  │
                                    │      ┌─────┴─────┐      │
                                    │      ▼           ▼      │
                                    │ ┌─────────┐ ┌─────────┐ │
                                    │ │Printful │ │Printify │ │
                                    │ │ Adapter │ │ Adapter │ │
                                    │ └────┬────┘ └────┬────┘ │
                                    └──────┼───────────┼──────┘
                                           ▼           ▼
                                    ┌──────────┐ ┌──────────┐
                                    │ Printful │ │ Printify │
                                    │   API    │ │   API    │
                                    └──────────┘ └──────────┘
```

---

## Order Flow

```
Customer Journey:
─────────────────

1. BROWSE        2. ADD TO CART     3. CHECKOUT        4. PAYMENT
   ┌─────┐          ┌─────┐           ┌─────┐           ┌─────┐
   │ 👕  │   ──▶    │ 🛒  │    ──▶    │ 💳  │    ──▶    │ ✅  │
   │Shop │          │Cart │           │Stripe│          │Done │
   └─────┘          └─────┘           └─────┘           └─────┘
                                                           │
                                                           ▼
5. WEBHOOK         6. SAVE ORDER      7. FULFILL        8. SHIP
   ┌─────┐           ┌─────┐           ┌─────┐           ┌─────┐
   │Stripe│   ──▶    │ 💾  │    ──▶    │ 🖨️  │    ──▶    │ 📦  │
   │Event │          │ DB  │           │ POD │           │Ship │
   └─────┘           └─────┘           └─────┘           └─────┘
```

---

## POD Provider Abstraction

The key to flexibility is a common interface that both providers implement:

```typescript
interface PODProvider {
  name: string;
  createOrder(order: PODOrder): Promise<PODOrderResult>;
  getShippingRates(address: Address, items: Item[]): Promise<ShippingRate[]>;
  getOrderStatus(orderId: string): Promise<OrderStatus>;
  syncProducts(): Promise<Product[]>;
}
```

Each product in the database stores which provider fulfills it, allowing you to:
- Use Printful for some designs, Printify for others
- Switch providers per-product without code changes
- Compare pricing and choose the best option per product

---

## Phase 1: Database Setup

Install Prisma and configure PostgreSQL connection.

**New files:**
- `prisma/schema.prisma` - Define Product, Order, OrderItem models
- `.env` - Database URL and API keys

**Schema design:**
```prisma
enum PODProvider {
  PRINTFUL
  PRINTIFY
}

enum OrderStatus {
  PENDING
  PAID
  FULFILLED
  SHIPPED
  DELIVERED
  CANCELLED
}

model Product {
  id              String      @id @default(cuid())
  name            String
  description     String
  price           Int         // in cents
  podProvider     PODProvider
  podProductId    String
  podVariantId    String
  images          String[]
  sizes           String[]
  colors          String[]
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  orderItems      OrderItem[]
}

model Order {
  id              String      @id @default(cuid())
  status          OrderStatus @default(PENDING)
  stripeSessionId String      @unique
  customerEmail   String
  shippingAddress Json
  total           Int         // in cents
  podOrderId      String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  items           OrderItem[]
}

model OrderItem {
  id        String   @id @default(cuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  size      String
  color     String
  quantity  Int
  price     Int      // in cents at time of purchase
}
```

---

## Phase 2: POD Provider Abstraction Layer

Create a unified interface for print-on-demand providers.

**New files:**
- `src/lib/pod/types.ts` - Shared types (PODOrder, ShippingRate, etc.)
- `src/lib/pod/provider.ts` - PODProvider interface
- `src/lib/pod/printful.ts` - Printful adapter implementation
- `src/lib/pod/printify.ts` - Printify adapter implementation
- `src/lib/pod/index.ts` - Factory function to get provider by name

**Usage example:**
```typescript
import { getPODProvider } from '@/lib/pod';

const provider = getPODProvider(product.podProvider); // 'PRINTFUL' or 'PRINTIFY'
await provider.createOrder(orderData);
```

---

## Phase 3: Cart State Management

Use Zustand for lightweight, persistent cart state.

**New files:**
- `src/lib/store/cart.ts` - Cart store with add/remove/update/clear actions
- `src/components/cart/CartDrawer.tsx` - Slide-out cart UI
- `src/components/cart/CartItem.tsx` - Individual cart item component

**Cart state shape:**
```typescript
interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
  image: string;
  podProvider: 'PRINTFUL' | 'PRINTIFY';
}
```

---

## Phase 4: Product Pages

Create shop page and individual product pages with size/color selection.

**New files:**
- `src/app/shop/page.tsx` - Product grid with filters
- `src/app/product/[id]/page.tsx` - Product detail with add-to-cart
- `src/components/product/ProductCard.tsx` - Reusable product card
- `src/components/product/SizeColorPicker.tsx` - Variant selector

**API routes:**
- `GET /api/products` - List all products
- `GET /api/products/[id]` - Single product details

---

## Phase 5: Stripe Checkout

Integrate Stripe for secure payment processing.

**New files:**
- `src/app/api/checkout/route.ts` - Create Stripe Checkout Session
- `src/app/api/webhooks/stripe/route.ts` - Handle payment confirmation
- `src/app/checkout/success/page.tsx` - Order confirmation page
- `src/app/checkout/cancel/page.tsx` - Payment cancelled page

**Checkout flow:**
1. Frontend POSTs cart items to `/api/checkout`
2. API creates Stripe Checkout Session with line items
3. User redirected to Stripe hosted checkout
4. On success, Stripe calls webhook, order saved to DB

---

## Phase 6: Order Fulfillment

Forward confirmed orders to the appropriate POD provider.

**New files:**
- `src/app/api/fulfill/route.ts` - Create POD order

**Fulfillment logic:**
```typescript
// Group items by provider
const byProvider = groupBy(order.items, item => item.product.podProvider);

// Create order with each provider
for (const [providerName, items] of Object.entries(byProvider)) {
  const provider = getPODProvider(providerName);
  await provider.createOrder({ 
    recipient: order.shippingAddress, 
    items 
  });
}
```

---

## Phase 7: Admin Product Management

Simple admin page to add/edit products with provider selection.

**New files:**
- `src/app/admin/products/page.tsx` - Product list/CRUD
- `src/app/api/admin/products/route.ts` - Admin API

**Admin features:**
- Select POD provider per product (Printful or Printify)
- Sync available products/variants from each provider
- Set custom pricing (your margin on top of POD cost)

---

## Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/tastedees

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Printful
PRINTFUL_API_KEY=...

# Printify
PRINTIFY_API_KEY=...
PRINTIFY_SHOP_ID=...
```

---

## New Dependencies

```bash
npm install prisma @prisma/client stripe @stripe/stripe-js zustand
```

---

## Benefits of Multi-Provider Architecture

| Benefit | Description |
|---------|-------------|
| Price optimization | Choose cheaper provider per product |
| Redundancy | If one provider has issues, use the other |
| Product variety | Different providers have different catalog items |
| Easy expansion | Add new providers by implementing the interface |
| Per-product control | Mix providers in a single order |

---

## Implementation Checklist

### High Priority Tasks

- [ ] **[HIGH]** Set up Prisma with PostgreSQL and create Product/Order schemas with podProvider field
- [ ] **[HIGH]** Create PODProvider interface and types in src/lib/pod/
- [ ] **[HIGH]** Implement PrintfulAdapter with createOrder, getShippingRates, getOrderStatus
- [ ] **[HIGH]** Implement PrintifyAdapter with createOrder, getShippingRates, getOrderStatus
- [ ] **[HIGH]** Create Zustand cart store with localStorage persistence
- [ ] **[HIGH]** Build CartDrawer component and integrate into Navbar
- [ ] **[HIGH]** Create /shop and /product/[id] pages with size/color pickers
- [ ] **[HIGH]** Implement /api/checkout to create Stripe sessions
- [ ] **[HIGH]** Handle Stripe webhooks to confirm orders and save to DB
- [ ] **[HIGH]** Route orders to correct POD provider based on product.podProvider
