# Quick Start Guide - Shopping Cart Features

## Running the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

Visit:
- Homepage: http://localhost:3002
- Shop: http://localhost:3002/shop
- Cart: http://localhost:3002/cart

## Using the Cart

### Adding Products
1. Navigate to `/shop` or browse featured products on homepage
2. Click color swatches to select a color
3. Click "Quick Add" button (defaults to first available size)
4. See success animation confirming the item was added

### Viewing Cart
1. Click cart icon in navbar (shows item count badge)
2. Or navigate to `/cart`
3. View all items with selected colors and sizes

### Managing Cart Items
- **Change quantity**: Use +/- buttons on each item
- **Remove item**: Click X button on item
- **Clear cart**: Click "Clear Cart" button in order summary
- **Continue shopping**: Click "Continue Shopping" link

### Filtering Products (Shop Page)
- **By Category**: Click category buttons in sidebar
- **By Price**: Adjust price range slider
- **Sort**: Use dropdown (Featured, Newest, Price Low/High)
- **Reset**: Click "Reset Filters" to clear all

## Code Examples

### Using Cart in Your Components

```typescript
import { useCart } from '@/context/CartContext';

function MyComponent() {
  const { 
    items,           // Array of cart items
    itemCount,       // Total number of items
    totalPrice,      // Total price
    addToCart,       // Add item function
    removeFromCart,  // Remove item function
    updateQuantity,  // Update quantity function
    clearCart        // Clear all items
  } = useCart();

  // Add to cart
  const handleAdd = () => {
    addToCart(product, selectedColor, selectedSize);
  };

  // Update quantity
  const handleUpdate = () => {
    updateQuantity(productId, color, size, newQuantity);
  };

  // Remove item
  const handleRemove = () => {
    removeFromCart(productId, color, size);
  };
}
```

### Accessing Products

```typescript
import { products } from '@/data/products';

// Get all products
const allProducts = products;

// Filter products
const streetStyle = products.filter(p => p.category === 'Street Style');
const newItems = products.filter(p => p.isNew);
const onSale = products.filter(p => p.originalPrice);
```

## File Structure Overview

```
src/
├── types/product.ts           # TypeScript interfaces
├── data/products.ts           # Product catalog
├── context/CartContext.tsx    # Cart state management
├── components/
│   ├── ProductCard.tsx       # Product display + cart button
│   └── CartItem.tsx          # Cart item display
└── app/
    ├── shop/page.tsx         # Shop with filters
    └── cart/page.tsx         # Cart page
```

## Key Features

✅ **Cart Persistence** - Cart saved to localStorage automatically  
✅ **Responsive Design** - Works on mobile, tablet, desktop  
✅ **Product Filtering** - Category, price, and sorting  
✅ **Real-time Updates** - Cart count and totals update instantly  
✅ **Stock Management** - Tracks available stock per product  
✅ **Variant Support** - Different colors and sizes  
✅ **Order Summary** - Subtotal, shipping, tax, total  
✅ **Free Shipping** - Over $100 threshold  

## localStorage Key

Cart data is stored at: `taste-dees-cart`

To view in browser console:
```javascript
localStorage.getItem('taste-dees-cart')
```

To clear manually:
```javascript
localStorage.removeItem('taste-dees-cart')
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage with featured products |
| `/shop` | All products with filters |
| `/cart` | Shopping cart and checkout |
| `/product/[id]` | Product details (not implemented) |
| `/checkout` | Checkout flow (not implemented) |

## Product Properties

```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;      // For sale items
  category: string;
  colors: string[];            // Hex color codes
  description: string;
  sizes: string[];             // e.g., ["S", "M", "L", "XL"]
  stock: number;
  isNew?: boolean;             // Shows "NEW" badge
  isBestseller?: boolean;      // Shows "BESTSELLER" badge
}
```

## Cart Item Structure

```typescript
interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;       // Hex color code
  selectedSize: string;        // e.g., "M"
}
```

## Tips

1. **Cart persists** across page refreshes via localStorage
2. **Same product** with different colors/sizes = separate cart items
3. **Quick add** uses first available size automatically
4. **Out of stock** items show disabled add button
5. **Free shipping** at $100+ shown in cart summary
6. **Tax** calculated at 8% (hardcoded)

## Troubleshooting

### Cart not persisting
- Check if localStorage is enabled in browser
- Check browser console for errors

### Build errors
```bash
rm -rf .next
npm run build
```

### Type errors
```bash
npx tsc --noEmit
```

## Documentation

- Full implementation details: `SHOPPING_CART_IMPLEMENTATION.md`
- List of changes: `CHANGES.md`
- This guide: `QUICK_START.md`
