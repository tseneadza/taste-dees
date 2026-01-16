# PRD: Admin Authentication, Multi-Image Products & Edit Functionality

## Overview

**Feature Name:** Admin Authentication, Multi-Image Products & Product Editing

**Summary:** Add user authentication for admin access, support multiple product images with carousel display, enable editing of all products, and implement derived category management.

| Attribute | Value |
|-----------|-------|
| Target App | taste-dees e-commerce site |
| Target Pages | `/admin`, `/admin/login`, `/admin/setup`, `/product/[id]` |
| PRD Audience | Ralph-Loop (automated coding agent) |
| Dependencies | Builds on existing admin product management |

**Current State:**
- Single image per product
- No authentication - anyone can access `/admin`
- Products split between `products.ts` (hardcoded) and `tshirts.json` (admin-added)
- No ability to edit existing products
- Categories hardcoded in admin form

**Desired State:**
- Multiple images per product with carousel display
- Admin pages protected by authentication
- Role-based access (super_admin, admin)
- All products stored in single `products.json` file
- Full CRUD for all products
- Categories derived from products with ability to add new ones

---

## Feature 1: Data Architecture Migration

### Problem Statement
Products are currently split between hardcoded `products.ts` and runtime `tshirts.json`, making it impossible to edit hardcoded products and complicating data management.

### User Story
**As an** admin user
**I want to** manage all products from a single location
**So that** I can edit, update, and maintain the entire product catalog

### Functional Requirements

#### FR-1.1: Products JSON Structure
| Requirement | Details |
|-------------|---------|
| File | `/products.json` (project root) |
| Format | JSON array of product objects |
| Migration | Auto-seed from `products.ts` + `tshirts.json` on first load |

**Product Schema:**
```json
{
  "id": "prod_1234567890",
  "name": "Classic Crew Tee",
  "description": "Premium cotton t-shirt",
  "price": 29.99,
  "category": "Street Style",
  "images": [
    "/images/products/tee-front.jpg",
    "/images/products/tee-back.jpg"
  ],
  "colors": ["#1A1614", "#F5F0EB"],
  "sizes": ["S", "M", "L", "XL"],
  "stock": 50,
  "isNew": true,
  "isBestseller": false,
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

#### FR-1.2: Users JSON Structure
| Requirement | Details |
|-------------|---------|
| File | `/users.json` (project root) |
| Format | JSON array of user objects |
| Password Storage | bcrypt hashed passwords |

**User Schema:**
```json
{
  "id": "user_1234567890",
  "username": "admin",
  "passwordHash": "$2b$10$...",
  "role": "super_admin",
  "createdAt": "2026-01-15T10:00:00Z"
}
```

**Roles:**
- `super_admin` - Can manage products AND other admin users
- `admin` - Can manage products only

#### FR-1.3: Migration Logic
| Requirement | Details |
|-------------|---------|
| Trigger | First API call to `/api/products` when `products.json` doesn't exist |
| Source Data | Merge `products.ts` + `tshirts.json` |
| ID Generation | Convert existing IDs to string format `prod_[timestamp]` |
| Image Field | Convert single `image` to `images` array |
| Cleanup | After successful migration, `tshirts.json` can be deleted |

---

## Feature 2: Authentication System

### Problem Statement
The admin page is publicly accessible. There's no way to restrict who can add, edit, or delete products.

### User Story
**As a** site owner
**I want to** control who can access admin functionality
**So that** only authorized users can manage products

### Functional Requirements

#### FR-2.1: API Routes
| Route | Method | Purpose | Auth Required |
|-------|--------|---------|---------------|
| `/api/auth/setup` | POST | Create first super admin | No (only works when no users exist) |
| `/api/auth/login` | POST | Authenticate user | No |
| `/api/auth/logout` | POST | Clear session | Yes |
| `/api/auth/me` | GET | Get current user info | Yes |
| `/api/auth/users` | GET | List all admin users | super_admin only |
| `/api/auth/users` | POST | Create new admin | super_admin only |
| `/api/auth/users/[id]` | DELETE | Remove admin user | super_admin only |

#### FR-2.2: Session Management
| Requirement | Details |
|-------------|---------|
| Token Type | JWT |
| Storage | HTTP-only cookie named `auth_token` |
| Expiration | 7 days |
| Token Payload | `{ userId, username, role, exp }` |
| Secret | Stored in `.env` as `JWT_SECRET` |

#### FR-2.3: Setup Page
| Requirement | Details |
|-------------|---------|
| Route | `/admin/setup` |
| Availability | Only accessible when `users.json` is empty or doesn't exist |
| Form Fields | Username, Password, Confirm Password |
| Result | Creates super_admin user, redirects to `/admin` |
| After Setup | Returns 404 if users already exist |

#### FR-2.4: Login Page
| Requirement | Details |
|-------------|---------|
| Route | `/admin/login` |
| Form Fields | Username, Password |
| On Success | Set cookie, redirect to `/admin` |
| On Failure | Show error message |
| Setup Check | If no users exist, redirect to `/admin/setup` |

#### FR-2.5: Protected Routes
| Requirement | Details |
|-------------|---------|
| Protected Pages | `/admin`, `/admin/*` |
| Redirect | Unauthenticated users → `/admin/login` |
| API Protection | All `/api/products/*` write operations require auth |

#### FR-2.6: Navbar Integration
| Requirement | Details |
|-------------|---------|
| Admin Link | Only visible when user is authenticated |
| Location | Existing navbar component |
| Check Method | Call `/api/auth/me` on mount |

### Technical Specification

#### Dependencies to Add
```json
{
  "bcryptjs": "^2.4.3",
  "jsonwebtoken": "^9.0.0"
}
```

#### New Files
| File | Purpose |
|------|---------|
| `/src/app/admin/login/page.tsx` | Login form |
| `/src/app/admin/setup/page.tsx` | First-time setup form |
| `/src/app/api/auth/setup/route.ts` | Create first super admin |
| `/src/app/api/auth/login/route.ts` | Handle login |
| `/src/app/api/auth/logout/route.ts` | Handle logout |
| `/src/app/api/auth/me/route.ts` | Get current user |
| `/src/app/api/auth/users/route.ts` | List/create users |
| `/src/app/api/auth/users/[id]/route.ts` | Delete user |
| `/src/lib/auth.ts` | JWT helpers, password hashing |
| `/src/middleware.ts` | Route protection middleware |

---

## Feature 3: Multi-Image Products

### Problem Statement
Products can only have one image, limiting the ability to show different views, angles, or details of a product.

### User Story
**As a** shopper
**I want to** see multiple images of a product
**So that** I can better evaluate the product before purchasing

### Functional Requirements

#### FR-3.1: Image Storage
| Requirement | Details |
|-------------|---------|
| Field | `images` (array of strings) |
| Minimum | 0 images (product can exist without images) |
| Maximum | 10 images per product |
| First Image | Considered the primary/hero image |
| Valid Paths | `/images/...` or `https://...` URLs |

#### FR-3.2: Admin Multi-Image Uploader
| Requirement | Details |
|-------------|---------|
| Component | Enhanced `ImageUploader` component |
| Display | Grid of thumbnail previews |
| Add | "Add Image" button opens upload modal (drag & drop or URL) |
| Remove | X button on each thumbnail |
| Reorder | Drag and drop thumbnails to reorder |
| Primary | First image in array is the primary/hero image |

#### FR-3.3: Product Card Display
| Requirement | Details |
|-------------|---------|
| Image Shown | First image from `images` array |
| Fallback | Placeholder if no images |
| No Change | Hover behavior unchanged |

#### FR-3.4: Product Detail Carousel
| Requirement | Details |
|-------------|---------|
| Component | New `ImageCarousel` component |
| Navigation | Left/right arrow buttons |
| Indicators | Dot indicators below image |
| Mobile | Swipe gesture support |
| Transition | Smooth slide animation |
| Single Image | No arrows/dots if only one image |

### UI Design

**Carousel Layout:**
```
┌─────────────────────────────────────────┐
│                                         │
│     ◄     [   PRODUCT IMAGE   ]     ►   │
│                                         │
└─────────────────────────────────────────┘
                  ● ○ ○ ○
```

**Admin Multi-Image Manager:**
```
┌─────────────────────────────────────────────────────────────┐
│  Product Images                                             │
│  ───────────────────────────────────────────────────────── │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────────┐           │
│  │  IMG   │ │  IMG   │ │  IMG   │ │            │           │
│  │   ✕    │ │   ✕    │ │   ✕    │ │  + Add     │           │
│  │ (drag) │ │ (drag) │ │ (drag) │ │   Image    │           │
│  └────────┘ └────────┘ └────────┘ └────────────┘           │
│  ↑ Primary                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 4: Product Editing

### Problem Statement
Once a product is created, there's no way to update its details. Admins must delete and recreate products to make changes.

### User Story
**As an** admin user
**I want to** edit existing product details
**So that** I can update prices, descriptions, images, and categories without recreating products

### Functional Requirements

#### FR-4.1: Edit API Endpoint
| Requirement | Details |
|-------------|---------|
| Endpoint | `PUT /api/products/[id]` |
| Auth | Required (admin or super_admin) |
| Input | Partial product object (only changed fields) |
| Output | `{ success: true, product: {...} }` |
| Validation | Same as create (valid images, required fields) |
| Timestamp | Updates `updatedAt` field |

#### FR-4.2: Edit Modal
| Requirement | Details |
|-------------|---------|
| Trigger | "Edit" button on product row in admin list |
| Type | Modal/dialog overlay |
| Form Fields | All product fields (pre-populated) |
| Images | Multi-image manager with current images |
| Category | Dropdown with existing + "Add new" option |
| Actions | Save, Cancel buttons |
| Loading | Show spinner while saving |
| Success | Close modal, refresh product list |
| Error | Show error message in modal |

#### FR-4.3: Category Input
| Requirement | Details |
|-------------|---------|
| Type | Combobox (dropdown + text input) |
| Options | All unique categories from existing products |
| New Category | Type new name to create category |
| Validation | Non-empty string |

### UI Design

**Edit Modal:**
```
┌─────────────────────────────────────────────────────────────┐
│  Edit Product                                          [X]  │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  Name                                                       │
│  [Classic Crew Tee___________________________]              │
│                                                             │
│  Description                                                │
│  [Premium cotton t-shirt...                 ]              │
│  [                                          ]              │
│                                                             │
│  Price                          Category                    │
│  [$29.99________]              [Street Style        ▼]     │
│                                 ├─ New Arrivals             │
│                                 ├─ Street Style             │
│                                 ├─ Essential                │
│                                 └─ + Add new category...    │
│                                                             │
│  Images                                                     │
│  ┌────────┐ ┌────────┐ ┌────────────┐                      │
│  │  IMG ✕ │ │  IMG ✕ │ │  + Add     │                      │
│  └────────┘ └────────┘ └────────────┘                      │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                              [Cancel]  [Save Changes]       │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 5: User Management

### Problem Statement
The site owner needs to manage who has admin access to the site.

### User Story
**As a** super admin
**I want to** add and remove admin users
**So that** I can control who can manage products

### Functional Requirements

#### FR-5.1: User List
| Requirement | Details |
|-------------|---------|
| Location | Bottom of admin page (super_admin only) |
| Display | Username, role, created date |
| Actions | Delete button (except can't delete self) |

#### FR-5.2: Add User Form
| Requirement | Details |
|-------------|---------|
| Fields | Username, Password, Role (admin/super_admin) |
| Validation | Username unique, password min 8 chars |
| Result | User added to list |

#### FR-5.3: Delete User
| Requirement | Details |
|-------------|---------|
| Confirmation | "Are you sure?" prompt |
| Restriction | Cannot delete yourself |
| Restriction | Must have at least one super_admin |

### UI Design

**User Management Section:**
```
┌─────────────────────────────────────────────────────────────┐
│  Admin Users                                                │
│  ───────────────────────────────────────────────────────── │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ johndoe        super_admin    Jan 15, 2026  [-----] │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ janesmith      admin          Jan 15, 2026  [Delete]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ───────────────────────────────────────────────────────── │
│  Add New Admin                                              │
│  Username [____________]  Password [____________]           │
│  Role [admin ▼]                          [Add User]         │
└─────────────────────────────────────────────────────────────┘
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `/products.json` | All products data (migrated) |
| `/users.json` | Admin users data |
| `/src/app/admin/login/page.tsx` | Login page |
| `/src/app/admin/setup/page.tsx` | First-time setup page |
| `/src/app/api/auth/setup/route.ts` | Setup endpoint |
| `/src/app/api/auth/login/route.ts` | Login endpoint |
| `/src/app/api/auth/logout/route.ts` | Logout endpoint |
| `/src/app/api/auth/me/route.ts` | Current user endpoint |
| `/src/app/api/auth/users/route.ts` | User list/create |
| `/src/app/api/auth/users/[id]/route.ts` | Delete user |
| `/src/lib/auth.ts` | Auth utilities |
| `/src/middleware.ts` | Route protection |
| `/src/components/ImageCarousel.tsx` | Product image carousel |
| `/src/components/MultiImageUploader.tsx` | Multi-image manager |
| `/src/components/EditProductModal.tsx` | Product edit modal |
| `/src/components/UserManagement.tsx` | User management section |

### Modified Files
| File | Changes |
|------|---------|
| `/src/app/api/products/route.ts` | Add migration logic, auth checks |
| `/src/app/api/products/[id]/route.ts` | Add PUT handler, auth checks |
| `/src/app/admin/page.tsx` | Add edit modal, user management, multi-image |
| `/src/app/product/[id]/page.tsx` | Use ImageCarousel for multiple images |
| `/src/components/Navbar.tsx` | Conditional admin link |
| `/src/components/ProductCard.tsx` | Use first image from array |
| `/src/types/product.ts` | Change `image` to `images` array |
| `/package.json` | Add bcryptjs, jsonwebtoken |
| `/.env.example` | Add JWT_SECRET |

### Deleted Files (after migration)
| File | Reason |
|------|--------|
| `/tshirts.json` | Merged into products.json |
| `/src/data/products.ts` | Merged into products.json |

---

## Testing Criteria

### Authentication
- [ ] First visit to `/admin` redirects to `/admin/setup` when no users exist
- [ ] Setup form creates super_admin user
- [ ] After setup, `/admin/setup` returns 404
- [ ] Login with valid credentials sets cookie and redirects to `/admin`
- [ ] Login with invalid credentials shows error
- [ ] Logout clears cookie and redirects to login
- [ ] Unauthenticated access to `/admin` redirects to login
- [ ] Admin link in navbar only visible when logged in

### Multi-Image
- [ ] Products can have 0-10 images
- [ ] Admin can add multiple images to a product
- [ ] Admin can remove images from a product
- [ ] Admin can reorder images via drag and drop
- [ ] First image shows as primary in product card
- [ ] Product detail page shows carousel with all images
- [ ] Carousel arrows navigate between images
- [ ] Carousel dots indicate current image
- [ ] Single image shows without navigation controls

### Product Editing
- [ ] Edit button appears for all products in admin list
- [ ] Clicking edit opens modal with current values
- [ ] All fields are editable
- [ ] Save updates the product
- [ ] Cancel closes without saving
- [ ] Product list refreshes after save
- [ ] Category dropdown shows existing categories
- [ ] Can type new category name

### User Management (super_admin only)
- [ ] User list visible only to super_admin
- [ ] Can add new admin users
- [ ] Can add new super_admin users
- [ ] Can delete admin users (with confirmation)
- [ ] Cannot delete yourself
- [ ] Cannot delete last super_admin

### Data Migration
- [ ] First API call creates products.json if missing
- [ ] Hardcoded products migrated with new ID format
- [ ] tshirts.json products merged in
- [ ] Single image converted to images array
- [ ] All existing functionality preserved

---

## Security Considerations

- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens HTTP-only cookies (not accessible via JavaScript)
- JWT secret stored in environment variable
- All write operations require authentication
- User management restricted to super_admin role
- Input validation on all endpoints

---

## Out of Scope

| Item | Reason |
|------|--------|
| Password reset | Can be added later, manual reset via JSON for now |
| Email notifications | No email system configured |
| Two-factor auth | Complexity not needed for current scale |
| Image cropping/editing | Users can prepare images before upload |
| Bulk product operations | Can be added in future iteration |
| Audit logging | Can be added later if needed |

---

## Environment Variables

Add to `.env`:
```
JWT_SECRET=your-secure-random-string-here
```

Add to `.env.example`:
```
JWT_SECRET=generate-a-secure-random-string
```
