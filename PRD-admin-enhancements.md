# PRD: Admin Enhancements - Delete, Categories & UX Improvements

## Overview

**Feature Name:** Admin Product Management Enhancements

**Summary:** Extend the taste-dees admin functionality with product deletion, category selection during product creation, and improved category filtering UX in the shop.

| Attribute | Value |
|-----------|-------|
| Target App | taste-dees e-commerce site |
| Target Pages | `/admin`, `/shop` |
| PRD Audience | Ralph-Loop (automated coding agent) |
| Dependencies | Builds on existing admin image upload feature |

**Current State:**
- Products can be added but not deleted
- New products are assigned a default category ("New Arrivals")
- Empty categories still appear in the shop filter sidebar

**Desired State:**
- Admins can delete products from the site
- Admins can select a category when adding products
- Shop only shows categories that have products

---

## Feature 1: Delete Products

### Problem Statement
Once a product is added via the admin page, there is no way to remove it. Admins must manually edit `tshirts.json` to delete products.

### User Story
**As an** admin user
**I want to** delete products I've added
**So that** I can remove items that are no longer available or were added by mistake

### Functional Requirements

#### FR-1.1: Delete API Endpoint
| Requirement | Details |
|-------------|---------|
| Endpoint | `DELETE /api/products/[id]` |
| Location | `/src/app/api/products/[id]/route.ts` |
| Input | Product ID in URL path |
| Output | `{ success: true }` or `{ success: false, error: "..." }` |
| Behavior | Remove product from `tshirts.json` by ID |

**Note:** Only products in `tshirts.json` can be deleted. Hardcoded products in `products.ts` cannot be deleted via admin.

#### FR-1.2: Admin Product List with Delete
| Requirement | Details |
|-------------|---------|
| Location | `/src/app/admin/page.tsx` |
| Display | List of admin-added products below the add form |
| Each Item Shows | Name, price, image thumbnail, delete button |
| Delete Button | Red, with confirmation before deletion |
| After Delete | Remove item from list, show success message |

### Technical Specification

#### New File: `/src/app/api/products/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const TSHIRTS_FILE = path.resolve(process.cwd(), "tshirts.json");

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1. Read tshirts.json
  // 2. Filter out product with matching ID
  // 3. Write updated list back to file
  // 4. Return success/error response
}
```

#### Modify: `/src/app/admin/page.tsx`
- Add state for `adminProducts` list
- Fetch admin products on mount from `/api/products?source=admin`
- Display product list with delete buttons
- Handle delete with confirmation dialog
- Refresh list after successful delete

#### Modify: `/src/app/api/products/route.ts`
- Add query param support: `?source=admin` returns only `tshirts.json` products
- Default behavior unchanged (returns all products)

### UI Design

```
┌─────────────────────────────────────────────────────────────┐
│  Add New T-Shirt                                            │
│  [Existing form...]                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Your Added Products                                        │
│  ─────────────────────────────────────────────────────────  │
│  ┌──────┐                                                   │
│  │ IMG  │  Product Name                      $25   [Delete] │
│  └──────┘  Category: New Arrivals                           │
│  ─────────────────────────────────────────────────────────  │
│  ┌──────┐                                                   │
│  │ IMG  │  Another Product                   $35   [Delete] │
│  └──────┘  Category: Street Style                           │
└─────────────────────────────────────────────────────────────┘
```

**Delete Button States:**
- Default: Red outline, "Delete" text
- Hover: Red filled background
- Confirm: Modal or inline "Are you sure? [Yes] [No]"
- Deleting: Spinner, disabled
- Success: Item removed from list with fade animation

---

## Feature 2: Category Selection

### Problem Statement
When adding a product via admin, the category defaults to "New Arrivals". Admins cannot assign products to existing categories like "Street Style", "Essential", or "Vintage".

### User Story
**As an** admin user
**I want to** select a category when adding a product
**So that** products appear in the correct category filter in the shop

### Functional Requirements

#### FR-2.1: Category Dropdown
| Requirement | Details |
|-------------|---------|
| Location | Admin form, after price field |
| Type | `<select>` dropdown |
| Options | All existing categories + "New Arrivals" as default |
| Required | Yes |

**Categories to include:**
- New Arrivals (default)
- Statement Collection
- Street Style
- Essential
- Vintage
- Limited Edition

#### FR-2.2: Update Add Product API
| Requirement | Details |
|-------------|---------|
| Field | `category` (string) |
| Storage | Save to `tshirts.json` alongside other fields |
| Default | "New Arrivals" if not provided |

### Technical Specification

#### Modify: `/src/app/admin/page.tsx`
```tsx
// Add category state
const [category, setCategory] = useState('New Arrivals');

// Categories list
const categories = [
  'New Arrivals',
  'Statement Collection',
  'Street Style',
  'Essential',
  'Vintage',
  'Limited Edition'
];

// Add to form
<div>
  <label className="block text-sm font-medium text-muted">Category</label>
  <select
    value={category}
    onChange={(e) => setCategory(e.target.value)}
    className="mt-1 block w-full rounded-md border border-card-border p-2 bg-white"
  >
    {categories.map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select>
</div>

// Include in form submission
body: JSON.stringify({ name, description, price, image, category })
```

#### Modify: `/src/app/api/add-tshirt/route.ts`
- Extract `category` from request body
- Save to `tshirts.json` with product data

#### Modify: `/src/app/api/products/route.ts`
- Use `item.category` if present, otherwise default to "New Arrivals"

### UI Design

```
┌─────────────────────────────────────────────────────────────┐
│  Price                                                      │
│  [$_____________________]                                   │
│                                                             │
│  Category                                                   │
│  [New Arrivals          ▼]                                  │
│    ├─ New Arrivals                                          │
│    ├─ Statement Collection                                  │
│    ├─ Street Style                                          │
│    ├─ Essential                                             │
│    ├─ Vintage                                               │
│    └─ Limited Edition                                       │
│                                                             │
│  Product Image                                              │
│  [ImageUploader component...]                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 3: Hide Empty Categories & Filter Invalid Products

### Problem Statement
Products without images are not displayable and should not appear in the shop. Categories that only contain products without images should also be hidden from the sidebar.

**Definition of a Valid/Visible Product:**
- A product WITH a non-empty image path is valid and visible
- A product WITHOUT an image is invalid and should be hidden

### User Story
**As a** shopper
**I want to** only see products that have images and categories that contain displayable products
**So that** I have a good browsing experience without broken/empty product cards

### Functional Requirements

#### FR-3.1: Filter Products Without Images
| Requirement | Details |
|-------------|---------|
| Location | `/src/app/shop/page.tsx` |
| Behavior | Only display products that have a valid `image` property |
| Valid Image | Non-empty string (e.g., `/images/products/...` or `https://...`) |
| Invalid Image | `undefined`, `null`, or empty string `""` |

#### FR-3.2: Derive Categories from Visible Products Only
| Requirement | Details |
|-------------|---------|
| Location | `/src/app/shop/page.tsx` |
| Behavior | Categories list only includes categories from products WITH images |
| Result | Categories with only image-less products are hidden |

### Technical Specification

#### Modify: `/src/app/shop/page.tsx`

```tsx
// Step 1: Filter to only products with valid images
const visibleProducts = useMemo(() => {
  return products.filter((p) => p.image && p.image.trim() !== '');
}, [products]);

// Step 2: Derive categories from visible products only
const categories = useMemo(() => {
  const cats = Array.from(new Set(visibleProducts.map((p) => p.category)));
  return ["all", ...cats];
}, [visibleProducts]);

// Step 3: Filter and sort from visibleProducts (not all products)
const filteredProducts = useMemo(() => {
  let filtered = visibleProducts.filter((product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    return matchesCategory && matchesPrice;
  });
  // ... sorting logic unchanged
  return filtered;
}, [visibleProducts, selectedCategory, sortBy, priceRange]);
```

#### Also Modify: `/src/components/FeaturedProducts.tsx`

Apply same filter to featured products:
```tsx
// Filter to only products with images before selecting featured
const visibleProducts = products.filter((p) => p.image && p.image.trim() !== '');
const featuredProducts = visibleProducts
  .sort((a, b) => { /* existing sort logic */ })
  .slice(0, 4);
```

---

## Error Handling

### Delete Errors
| Error | Message | UI Treatment |
|-------|---------|--------------|
| Product not found | "Product not found" | Show error toast, keep item in list |
| Server error | "Failed to delete. Please try again." | Show error toast, keep item in list |
| Network error | "Connection error. Please try again." | Show error toast, keep item in list |

### Category Errors
| Error | Message | UI Treatment |
|-------|---------|--------------|
| No category selected | N/A - has default value | N/A |

---

## Testing Criteria

### Delete Products
- [ ] Delete button appears for each admin-added product
- [ ] Clicking delete shows confirmation
- [ ] Confirming delete removes product from list
- [ ] Confirming delete removes product from shop page
- [ ] Canceling delete keeps product
- [ ] Deleting shows success message
- [ ] Cannot delete hardcoded products (they don't appear in admin list)

### Category Selection
- [ ] Category dropdown appears in admin form
- [ ] All 6 categories available as options
- [ ] Default selection is "New Arrivals"
- [ ] Selected category saved with product
- [ ] Product appears under correct category in shop
- [ ] Category shows in admin product list

### Hide Empty Categories & Filter Invalid Products
- [ ] Products without images do NOT appear in shop grid
- [ ] Products without images do NOT appear in featured products
- [ ] Categories are derived only from products WITH images
- [ ] Category with only image-less products does NOT appear in sidebar
- [ ] "All Products" always appears
- [ ] Adding a product WITH image to a new category makes category appear
- [ ] Deleting last product with image from category removes it from sidebar
- [ ] Product count shows only visible (with image) products

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `/src/app/api/products/[id]/route.ts` | DELETE endpoint for removing products |

### Modified Files
| File | Changes |
|------|---------|
| `/src/app/admin/page.tsx` | Add category dropdown, add product list with delete |
| `/src/app/api/add-tshirt/route.ts` | Accept and save category field |
| `/src/app/api/products/route.ts` | Add `?source=admin` query param support, use product category |
| `/src/app/shop/page.tsx` | Filter to only show products with images, derive categories from visible products |
| `/src/components/FeaturedProducts.tsx` | Filter to only show products with images |

---

## Out of Scope

| Item | Reason |
|------|--------|
| Edit existing products | Separate feature - add in future iteration |
| Bulk delete | Not needed for current scale |
| Custom categories | Fixed list is sufficient for now |
| Delete uploaded images | Images remain in `/public/images/products/` after product delete |
| Soft delete / archive | Full delete is simpler for MVP |

---

## Appendix: Data Structure

### tshirts.json (Updated)
```json
{
  "id": 1234567890,
  "name": "Product Name",
  "description": "Description text",
  "price": 25,
  "image": "/images/products/timestamp-filename.jpg",
  "category": "Street Style"  // NEW FIELD
}
```
