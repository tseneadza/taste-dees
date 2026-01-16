# PRD: Admin Image Upload Feature

## Overview

**Feature Name:** Admin Product Image Upload

**Summary:** Add drag-and-drop image upload and URL input capabilities to the taste-dees admin page, enabling administrators to add product images either from their local machine or via external URLs.

| Attribute | Value |
|-----------|-------|
| Target App | taste-dees e-commerce site |
| Target Page | `/admin` (existing admin form at `/src/app/admin/page.tsx`) |
| Input Methods | Local file drag/drop + external URL paste |
| Output | Product image saved to `/public/images/products/` and referenced in product data |
| Tech Stack | Next.js 16.1.1, TypeScript 5, Tailwind CSS 4, React 19 |
| PRD Audience | Ralph-Loop (automated coding agent) |

**Current State:** Admin page only accepts image URLs via text input. No file upload, no validation, no preview.

**Desired State:** Full image management with drag-and-drop upload, URL input fallback, client-side preview, format validation, and automatic image optimization to meet site requirements.

## Problem Statement

The current admin interface at `/admin` requires users to provide an external URL for product images. This creates friction because:

1. **No local upload** - Administrators cannot use images stored on their local machine
2. **No validation** - Invalid URLs or unsupported formats are accepted without warning
3. **No preview** - Users cannot see how the image will appear before saving
4. **Manual hosting required** - Images must first be uploaded elsewhere to get a URL
5. **No standardization** - Images of varying sizes/formats may break the product grid layout

This feature solves these problems by providing a unified image input component with drag-and-drop upload, URL fallback, validation, and preview.

## Goals & Success Criteria

### Goals
1. Enable local file upload via drag-and-drop on the admin page
2. Maintain URL input as a fallback option
3. Validate image format and provide clear error messages for invalid files
4. Show real-time preview of the uploaded/linked image
5. Automatically save uploaded images to the project's public directory
6. Ensure uploaded images conform to site display requirements

### Success Criteria
- [ ] User can drag and drop an image file onto the upload zone
- [ ] User can click the upload zone to open file browser
- [ ] User can paste/type an external image URL as alternative
- [ ] Invalid formats display clear error message: "Selected format is not valid for this site"
- [ ] Preview displays the image in the correct aspect ratio (3:4 portrait)
- [ ] Uploaded files are saved to `/public/images/products/`
- [ ] Saved image path is correctly passed to the product creation API
- [ ] Feature integrates seamlessly with existing admin form styling

## User Stories

### US-1: Drag and Drop Upload
**As an** admin user
**I want to** drag and drop an image from my computer onto the admin form
**So that** I can quickly add product images without needing to host them elsewhere

**Acceptance Criteria:**
- Drop zone is clearly visible with visual feedback on drag-over
- Supported formats: JPG, JPEG, PNG, WebP
- File is uploaded and preview appears immediately
- Image path is auto-populated for form submission

### US-2: Click to Browse
**As an** admin user
**I want to** click the upload area to open a file browser
**So that** I can select an image if drag-and-drop isn't convenient

**Acceptance Criteria:**
- Clicking the drop zone opens native file picker
- File picker filters to supported image formats
- Selected file behaves same as dropped file

### US-3: URL Input Fallback
**As an** admin user
**I want to** paste an external image URL
**So that** I can use images already hosted elsewhere

**Acceptance Criteria:**
- Text input field for URL is available
- Entering a valid image URL shows preview
- URL is validated before form submission

### US-4: Format Validation
**As an** admin user
**I want to** see a clear error when I upload an unsupported format
**So that** I know to convert my image before trying again

**Acceptance Criteria:**
- Unsupported formats (GIF, BMP, TIFF, SVG, etc.) show error
- Error message: "Selected format is not valid for this site. Please use JPG, PNG, or WebP."
- Error state is visually distinct (red border, error icon)

### US-5: Image Preview
**As an** admin user
**I want to** see a preview of my image before saving
**So that** I can verify it looks correct

**Acceptance Criteria:**
- Preview shows in 3:4 aspect ratio (matching product cards)
- Preview updates immediately on file drop or URL entry
- Preview shows how image will be cropped/fitted

## Functional Requirements

### FR-1: Image Upload Component
| Requirement | Details |
|-------------|---------|
| Component Name | `ImageUploader` |
| Location | `/src/components/ImageUploader.tsx` |
| Drop Zone Size | Full width, min-height 200px |
| Accepted Formats | `.jpg`, `.jpeg`, `.png`, `.webp` |
| Max File Size | 5MB |
| MIME Types | `image/jpeg`, `image/png`, `image/webp` |

### FR-2: Upload API Endpoint
| Requirement | Details |
|-------------|---------|
| Endpoint | `POST /api/upload-image` |
| Location | `/src/app/api/upload-image/route.ts` |
| Input | `FormData` with `file` field |
| Output | `{ success: true, path: "/images/products/filename.ext" }` |
| Storage Path | `/public/images/products/` |
| Filename | `{timestamp}-{sanitized-original-name}` |

### FR-3: Image Validation
| Check | Action on Failure |
|-------|-------------------|
| File type not in allowed list | Show error: "Selected format is not valid for this site. Please use JPG, PNG, or WebP." |
| File size > 5MB | Show error: "Image is too large. Maximum size is 5MB." |
| URL does not return image | Show error: "Could not load image from URL. Please check the link." |
| URL returns non-image content-type | Show error: "URL does not point to a valid image." |

### FR-4: Preview Display
| Requirement | Details |
|-------------|---------|
| Aspect Ratio | 3:4 (portrait, matching ProductCard) |
| Object Fit | `cover` with `object-top` positioning |
| Preview Size | 200px width x 267px height |
| Loading State | Skeleton/shimmer while loading |
| Error State | Placeholder icon with error message |

### FR-5: Form Integration
| Requirement | Details |
|-------------|---------|
| Form Field Name | `image` |
| Value Format | Relative path (e.g., `/images/products/123-tshirt.jpg`) |
| Submission | Include in existing `/api/add-tshirt` form submission |
| Required | No (product can be saved without image) |

## Technical Specification

### New Files to Create

#### 1. `/src/components/ImageUploader.tsx`
```typescript
"use client";

import { useState, useCallback, useRef } from "react";

interface ImageUploaderProps {
  value: string;
  onChange: (path: string) => void;
  error?: string;
}

export default function ImageUploader({ value, onChange, error }: ImageUploaderProps) {
  // State: isDragging, isUploading, previewUrl, errorMessage
  // Handlers: onDragOver, onDragLeave, onDrop, onFileSelect, onUrlChange
  // Validation: checkFileType, checkFileSize
  // Upload: uploadFile() -> POST to /api/upload-image
  // Render: drop zone, hidden file input, URL input, preview area, error display
}
```

**Component Requirements:**
- Use native HTML5 drag-and-drop API (no external libraries needed)
- Hidden `<input type="file" accept="image/jpeg,image/png,image/webp" />` for click-to-browse
- Visual states: default, drag-over (highlighted border), uploading (spinner), error (red border), success (shows preview)
- URL input below drop zone with "OR paste image URL" label
- Preview uses Next.js `<Image>` component with `fill` prop

#### 2. `/src/app/api/upload-image/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  // 1. Parse FormData, extract file
  // 2. Validate file type and size
  // 3. Generate unique filename: `${Date.now()}-${sanitizedName}`
  // 4. Ensure /public/images/products/ directory exists
  // 5. Write file to disk
  // 6. Return { success: true, path: "/images/products/filename.ext" }
}
```

**API Requirements:**
- Accept `multipart/form-data`
- Sanitize filename (remove special chars, spaces → hyphens)
- Create `/public/images/products/` directory if it doesn't exist
- Return JSON response with saved path
- Handle errors with appropriate status codes (400 for validation, 500 for server errors)

### Files to Modify

#### 1. `/src/app/admin/page.tsx`
**Changes:**
- Convert from server component to client component (`"use client"`)
- Import and use `ImageUploader` component
- Add state to track form values including image path
- Update form submission to use `fetch` instead of native form action
- Replace the existing image URL text input with `ImageUploader`

**Current structure to preserve:**
- Overall page layout and styling
- Form fields: name, description, price
- Submit button styling
- Success/error feedback

#### 2. `/src/app/api/add-tshirt/route.ts`
**Changes:**
- Accept `image` field from request body (already exists, no change needed)
- Ensure JSON body parsing works alongside existing FormData handling

### Directory Structure After Implementation
```
src/
├── app/
│   ├── admin/
│   │   └── page.tsx              # MODIFIED: Add ImageUploader
│   └── api/
│       ├── add-tshirt/
│       │   └── route.ts          # EXISTING: No changes needed
│       └── upload-image/
│           └── route.ts          # NEW: Image upload endpoint
├── components/
│   ├── ImageUploader.tsx         # NEW: Upload component
│   └── ... (existing components)
public/
└── images/
    └── products/                 # NEW: Directory for uploaded images
        └── (uploaded images)
```

### Dependencies
No new npm packages required. Implementation uses:
- Native HTML5 Drag and Drop API
- Native File API
- Next.js built-in `fs/promises` for file operations
- Next.js `Image` component for preview

### Type Definitions
Add to `/src/types/product.ts` if not already present:
```typescript
// No changes needed - Product interface already has `image?: string`
```

## UI/UX Design

### Component Layout
```
┌─────────────────────────────────────────────────────────────┐
│                     IMAGE UPLOAD ZONE                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                                                         │ │
│  │     ┌─────────┐                                         │ │
│  │     │  Icon   │   Drag & drop your image here          │ │
│  │     │ (image) │   or click to browse                   │ │
│  │     └─────────┘                                         │ │
│  │                                                         │ │
│  │     Supported formats: JPG, PNG, WebP (max 5MB)        │ │
│  │                                                         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ─────────────────── OR ───────────────────                  │
│                                                              │
│  Image URL: [____________________________________]           │
│                                                              │
│  ┌─────────────────┐                                         │
│  │    PREVIEW      │  ← Shows after upload/URL entry        │
│  │    (3:4)        │                                         │
│  │                 │                                         │
│  └─────────────────┘                                         │
└─────────────────────────────────────────────────────────────┘
```

### Visual States

#### Default State
- Border: `border-2 border-dashed border-card-border`
- Background: `bg-card-bg`
- Icon: Upload cloud icon in `text-muted`
- Text: "Drag & drop your image here" + "or click to browse"

#### Drag Over State
- Border: `border-2 border-dashed border-accent`
- Background: `bg-accent/5`
- Icon: Highlight in `text-accent`
- Animation: Subtle pulse on border

#### Uploading State
- Show spinner/loading indicator
- Text: "Uploading..."
- Disable interaction

#### Success State (with Preview)
- Border: `border-2 border-solid border-accent/50`
- Show image preview in 3:4 aspect ratio
- "Change image" button overlaid on preview
- Checkmark indicator

#### Error State
- Border: `border-2 border-dashed border-red-500`
- Background: `bg-red-50` (light) / `bg-red-900/10` (dark)
- Error icon in red
- Error message below drop zone

### Styling Tokens (from existing design system)
```css
/* Use existing CSS variables */
--accent: #C84B31 (terracotta)
--card-bg: #FFFFFF / #1A1614
--card-border: #E8E2DC / #2A2522
--muted: #8B8178 / #6B6259

/* Tailwind classes to use */
.rounded-2xl        /* Match existing card radius */
.transition-colors  /* Smooth state changes */
.hover:border-accent /* Interactive feedback */
```

### Responsive Behavior
- **Mobile (< 640px)**: Stack preview below drop zone, full width
- **Tablet (640px+)**: Preview beside drop zone if space allows
- **Desktop (1024px+)**: Same as tablet, more generous spacing

## Error Handling

### Client-Side Errors

| Error Condition | Message | UI Treatment |
|-----------------|---------|--------------|
| Invalid file type | "Selected format is not valid for this site. Please use JPG, PNG, or WebP." | Red border, error icon, message below drop zone |
| File too large (>5MB) | "Image is too large. Maximum size is 5MB." | Red border, error icon, message below drop zone |
| URL doesn't load | "Could not load image from URL. Please check the link." | Red border on URL input, message below |
| URL returns non-image | "URL does not point to a valid image." | Red border on URL input, message below |
| Network error during upload | "Upload failed. Please check your connection and try again." | Red border, retry button |

### Server-Side Errors (API)

| Status Code | Condition | Response Body |
|-------------|-----------|---------------|
| 400 | Invalid file type | `{ error: "Invalid file type. Allowed: jpg, jpeg, png, webp" }` |
| 400 | File too large | `{ error: "File too large. Maximum size: 5MB" }` |
| 400 | No file provided | `{ error: "No file provided" }` |
| 500 | File write failed | `{ error: "Failed to save image. Please try again." }` |
| 500 | Directory creation failed | `{ error: "Server configuration error" }` |

### Error Recovery
- All errors are dismissible (user can try again)
- Clearing the input resets error state
- Previous successful upload is preserved if new upload fails
- Form can still be submitted without image (optional field)

## File Structure & Integration

### New Files
```
src/
├── components/
│   └── ImageUploader.tsx         # NEW - Image upload component
└── app/
    └── api/
        └── upload-image/
            └── route.ts          # NEW - Upload API endpoint

public/
└── images/
    └── products/                 # NEW - Directory for uploaded product images
        └── .gitkeep              # Keep directory in git
```

### Modified Files
```
src/
└── app/
    └── admin/
        └── page.tsx              # MODIFY - Integrate ImageUploader
```

### Integration Points

#### 1. Admin Page Integration
Location: `/src/app/admin/page.tsx`

```tsx
// Before: Simple text input for image URL
<input type="text" name="image" placeholder="Image URL" ... />

// After: ImageUploader component
<ImageUploader
  value={imageUrl}
  onChange={setImageUrl}
  error={imageError}
/>
<input type="hidden" name="image" value={imageUrl} />
```

#### 2. Product Display Integration
The uploaded image path format (`/images/products/filename.ext`) is already compatible with:
- `ProductCard.tsx` - Uses `<Image src={product.image} ... />`
- `CartItem.tsx` - Uses similar pattern
- No changes needed to display components

#### 3. Data Storage Integration
- Uploaded images saved to: `/public/images/products/`
- Image path stored in `tshirts.json` as: `/images/products/filename.ext`
- Path format matches existing `products.ts` data structure

### Git Considerations
- Add `/public/images/products/` to `.gitignore` if images shouldn't be committed
- OR keep tracked if product images should be version controlled
- Recommend: Track images for this small-scale app (simpler deployment)

## Testing Criteria

### Manual Testing Checklist

#### Drag and Drop
- [ ] Drag JPG file onto drop zone → uploads successfully, shows preview
- [ ] Drag PNG file onto drop zone → uploads successfully, shows preview
- [ ] Drag WebP file onto drop zone → uploads successfully, shows preview
- [ ] Drag GIF file onto drop zone → shows format error message
- [ ] Drag PDF file onto drop zone → shows format error message
- [ ] Drag file > 5MB → shows size error message
- [ ] Drop zone highlights on drag over
- [ ] Drop zone returns to normal on drag leave

#### Click to Browse
- [ ] Click drop zone → opens file picker
- [ ] File picker filters to image types
- [ ] Select valid file → uploads and shows preview
- [ ] Cancel file picker → no change to current state

#### URL Input
- [ ] Enter valid image URL → loads and shows preview
- [ ] Enter invalid URL → shows error after attempted load
- [ ] Enter URL to non-image → shows error message
- [ ] Clear URL field → clears preview

#### Preview
- [ ] Preview displays in 3:4 aspect ratio
- [ ] Preview uses object-cover fitting
- [ ] "Change image" option visible on preview
- [ ] Clicking change allows new upload

#### Form Submission
- [ ] Submit form with uploaded image → product created with correct image path
- [ ] Submit form with URL image → product created with URL
- [ ] Submit form without image → product created, no image field
- [ ] New product appears in shop with uploaded image

#### Error States
- [ ] Error message displays below drop zone
- [ ] Error clears when new upload attempted
- [ ] Multiple errors don't stack (only show latest)

### Edge Cases
- [ ] Upload while previous upload in progress → queues or replaces
- [ ] Very long filename → truncated appropriately
- [ ] Filename with special characters → sanitized correctly
- [ ] Network disconnection during upload → appropriate error
- [ ] Refresh page during upload → state reset cleanly

## Out of Scope

The following are explicitly **not included** in this feature:

| Item | Reason |
|------|--------|
| Image cropping/editing | Adds complexity; users can crop before upload |
| Multiple image upload | Single product image is sufficient for MVP |
| Image gallery per product | Current data model supports single image |
| Cloud storage (S3, Cloudinary) | Local storage is simpler for this scale |
| Image optimization/compression | Next.js Image component handles display optimization |
| Admin authentication | Separate concern; admin is already public |
| Bulk product import | Different feature entirely |
| Image deletion management | Images can be manually removed from `/public/images/products/` |
| Undo/history for uploads | Unnecessary complexity |
| Drag-and-drop reordering | Single image, not applicable |

### Future Considerations
These could be added in future iterations:
- Multiple product images (carousel)
- Image cropping tool
- Cloud storage integration for scalability
- Admin authentication layer
- Automatic image compression before storage

---

## Appendix: Clarifications

### A1: URL Image Handling
**Question:** Should URL images be downloaded locally or just referenced?

**Answer:** URL images should be **stored as URL references only** (not downloaded). The `image` field in the product data will contain:
- For uploaded files: `/images/products/timestamp-filename.ext`
- For URL input: The full external URL (e.g., `https://example.com/image.jpg`)

No server-side URL download is required.

### A2: Dark Mode Handling
**Question:** How to handle light/dark mode backgrounds?

**Answer:** Use Tailwind's `dark:` prefix modifier. The app already uses `prefers-color-scheme` media query. Example:
```tsx
className="bg-red-50 dark:bg-red-900/10"
```

### A3: Filename Sanitization Rules
**Question:** What sanitization rules for uploaded filenames?

**Answer:** Apply these transformations in order:
1. Convert to lowercase
2. Replace spaces with hyphens (`-`)
3. Remove all characters except: `a-z`, `0-9`, `-`, `.`
4. Collapse multiple hyphens to single hyphen
5. Trim hyphens from start/end

Example: `"My Product IMAGE (1).PNG"` → `my-product-image-1.png`

### A4: Admin Form Submission Endpoint
**Question:** What endpoint does the admin form submit to?

**Answer:** The existing endpoint is `POST /api/add-tshirt` (located at `/src/app/api/add-tshirt/route.ts`). The form currently uses native form action. After modification:
- Convert to client-side `fetch` call
- Send JSON body: `{ name, description, price, image }`
- The endpoint already accepts these fields

### A5: API Error Response Format
**Question:** What format for API error responses?

**Answer:** All API errors return JSON with this structure:
```json
{
  "success": false,
  "error": "Human-readable error message"
}
```
HTTP status codes:
- `200` - Success
- `400` - Client error (invalid file type, size, missing file)
- `500` - Server error (file write failed, directory creation failed)

### A6: Image Optimization
**Question:** Is image optimization required?

**Answer:** **No server-side optimization for MVP.** Images are stored as-is. Next.js `<Image>` component handles client-side display optimization (lazy loading, responsive sizing). Server-side compression can be added in future iterations.

### A7: Preview Loading State Classes
**Question:** What Tailwind classes for skeleton/shimmer loading?

**Answer:** Use this pattern:
```tsx
<div className="animate-pulse bg-gradient-to-r from-card-border via-card-bg to-card-border bg-[length:200%_100%]" />
```
Or simpler:
```tsx
<div className="animate-pulse bg-card-border rounded-2xl" />
```

### A8: Directory Creation Behavior
**Question:** What if `/public/images/products/` creation fails?

**Answer:** If `mkdir` fails (e.g., permissions issue):
1. Return HTTP 500 with error: `{ success: false, error: "Server configuration error" }`
2. Log the actual error to server console for debugging
3. Do not expose filesystem details to client

The directory should be created with `{ recursive: true }` option to handle nested paths.
