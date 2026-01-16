import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Product } from '@/types/product';
import { getCurrentUser } from '@/lib/auth';

const PRODUCTS_FILE = path.resolve(process.cwd(), 'products.json');

function isValidImagePath(image: string | undefined): boolean {
  if (!image) return false;
  if (image.startsWith('file://')) return false;
  if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) {
    return true;
  }
  return false;
}

async function getProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(PRODUCTS_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

async function saveProducts(products: Product[]): Promise<void> {
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf8');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const products = await getProducts();
    const product = products.find((p) => p.id === id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const products = await getProducts();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const existingProduct = products[productIndex];
    const now = new Date().toISOString();

    // Update only provided fields
    const updatedProduct: Product = {
      ...existingProduct,
      name: body.name !== undefined ? String(body.name) : existingProduct.name,
      description: body.description !== undefined ? String(body.description) : existingProduct.description,
      price: body.price !== undefined ? Number(body.price) : existingProduct.price,
      originalPrice: body.originalPrice !== undefined ? Number(body.originalPrice) : existingProduct.originalPrice,
      category: body.category !== undefined ? String(body.category) : existingProduct.category,
      colors: body.colors !== undefined ? body.colors : existingProduct.colors,
      sizes: body.sizes !== undefined ? body.sizes : existingProduct.sizes,
      stock: body.stock !== undefined ? Number(body.stock) : existingProduct.stock,
      isNew: body.isNew !== undefined ? Boolean(body.isNew) : existingProduct.isNew,
      isBestseller: body.isBestseller !== undefined ? Boolean(body.isBestseller) : existingProduct.isBestseller,
      images: body.images !== undefined ? body.images.filter(isValidImagePath) : existingProduct.images,
      updatedAt: now,
    };

    products[productIndex] = updatedProduct;
    await saveProducts(products);

    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check auth
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const products = await getProducts();
    const productIndex = products.findIndex((p) => p.id === id);

    if (productIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    products.splice(productIndex, 1);
    await saveProducts(products);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
