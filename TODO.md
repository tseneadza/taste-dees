# TODO

## Shopping Cart

- [ ] Set up Zustand cart store with localStorage persistence (`src/lib/store/cart.ts`)
- [ ] Build CartDrawer component and integrate into Navbar
- [ ] Create CartItem component
- [ ] Create /shop page with product grid and filters
- [ ] Create /product/[id] page with size/color pickers
- [ ] Implement /api/checkout for Stripe Checkout sessions
- [ ] Create checkout success and cancel pages

## Multi-Printer / POD Provider Support

- [ ] Create PODProvider interface and types (`src/lib/pod/types.ts`, `src/lib/pod/provider.ts`)
- [ ] Implement PrintfulAdapter with createOrder, getShippingRates, getOrderStatus
- [ ] Implement PrintifyAdapter with createOrder, getShippingRates, getOrderStatus
- [ ] Create factory function to get provider by name (`src/lib/pod/index.ts`)
- [ ] Route orders to correct POD provider based on `product.podProvider`

## Infrastructure

- [ ] Set up Prisma with PostgreSQL
- [ ] Create Product/Order/OrderItem schemas with podProvider field
- [ ] Handle Stripe webhooks to confirm orders and save to DB
- [ ] Create fulfillment API route (`/api/fulfill`)

## Admin

- [ ] Create admin product management page
- [ ] Add ability to select POD provider per product
- [ ] Sync available products/variants from each provider
