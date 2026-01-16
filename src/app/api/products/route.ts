import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Product } from '@/types/product';
import { products as hardcodedProducts } from '@/data/products';
import { getCurrentUser } from '@/lib/auth';

const PRODUCTS_FILE = path.resolve(process.cwd(), 'products.json');
const OLD_TSHIRTS_FILE = path.resolve(process.cwd(), 'tshirts.json');

interface OldTshirtItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category?: string;
}

interface OldProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  colors: string[];
  description: string;
  sizes: string[];
  stock: number;
  isNew?: boolean;
  isBestseller?: boolean;
  image?: string;
}

/**
 * Validate if an image path is valid for the web
 */
function isValidImagePath(image: string | undefined): boolean {
  if (!image) return false;
  if (image.startsWith('file://')) return false;
  if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) {
    return true;
  }
  return false;
}

/**
 * Migrate old data format to new format
 */
async function migrateProducts(): Promise<Product[]> {
  const now = new Date().toISOString();
  const products: Product[] = [];

  // Migrate hardcoded products
  for (const oldProduct of hardcodedProducts as OldProduct[]) {
    const images: string[] = [];
    if (isValidImagePath(oldProduct.image)) {
      images.push(oldProduct.image!);
    }

    products.push({
      id: `prod_${oldProduct.id}_${Date.now()}`,
      name: oldProduct.name,
      price: oldProduct.price,
      originalPrice: oldProduct.originalPrice,
      category: oldProduct.category,
      colors: oldProduct.colors,
      description: oldProduct.description,
      sizes: oldProduct.sizes,
      stock: oldProduct.stock,
      isNew: oldProduct.isNew,
      isBestseller: oldProduct.isBestseller,
      images,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Try to migrate tshirts.json if it exists
  try {
    const raw = await fs.readFile(OLD_TSHIRTS_FILE, 'utf8');
    const tshirtsList: OldTshirtItem[] = JSON.parse(raw || '[]');

    for (const item of tshirtsList) {
      const images: string[] = [];
      if (isValidImagePath(item.image)) {
        images.push(item.image);
      }

      products.push({
        id: `prod_${item.id}`,
        name: item.name,
        price: item.price,
        category: item.category || 'New Arrivals',
        colors: ['#1A1614', '#F5F0EB'],
        description: item.description,
        sizes: ['S', 'M', 'L', 'XL'],
        stock: 50,
        isNew: true,
        images,
        createdAt: now,
        updatedAt: now,
      });
    }
  } catch {
    // tshirts.json doesn't exist, that's fine
  }

  return products;
}

/**
 * Get all products, migrating if necessary
 */
async function getProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    // products.json doesn't exist, need to migrate
    console.log('Migrating products to products.json...');
    const products = await migrateProducts();
    await saveProducts(products);
    console.log(`Migrated ${products.length} products`);
    return products;
  }
}

/**
 * Save products to file
 */
async function saveProducts(products: Product[]): Promise<void> {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    const allProducts = await getProducts();

    // If source=admin, return all products (for admin management)
    if (source === 'admin') {
      return NextResponse.json({ success: true, products: allProducts });
    }

    // Default: return only products with at least one valid image (for shop display)
    const visibleProducts = allProducts.filter(
      (p) => p.images && p.images.length > 0 && p.images.some(isValidImagePath)
    );

    return NextResponse.json({ success: true, products: visibleProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, images, colors, sizes, stock, isNew, isBestseller } = body;

    // Validate required fields
    if (!name || !description || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: String(name),
      description: String(description),
      price: Number(price),
      category: String(category || 'New Arrivals'),
      images: Array.isArray(images) ? images.filter(isValidImagePath) : [],
      colors: Array.isArray(colors) ? colors : ['#1A1614', '#F5F0EB'],
      sizes: Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL'],
      stock: Number(stock) || 50,
      isNew: Boolean(isNew),
      isBestseller: Boolean(isBestseller),
      createdAt: now,
      updatedAt: now,
    };

    const products = await getProducts();
    products.push(newProduct);
    await saveProducts(products);

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
