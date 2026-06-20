import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dbProductToProduct } from '@/lib/supabase/types';
import { Product } from '@/types/product';

function isValidImagePath(image: string | undefined): boolean {
  if (!image) return false;
  if (image.startsWith('file://')) return false;
  if (image.startsWith('/') || image.startsWith('http://') || image.startsWith('https://')) {
    return true;
  }
  return false;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const allProducts = products.map(dbProductToProduct);

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
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Check user role from metadata
    const role = user.user_metadata?.role;
    if (role !== 'admin' && role !== 'super_admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, price, category, images, colors, sizes, stock, isNew, isBestseller, originalPrice } = body;

    // Validate required fields
    if (!name || !description || price === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    const productData = {
      name: String(name),
      description: String(description),
      price: Number(price),
      original_price: originalPrice ? Number(originalPrice) : null,
      category: String(category || 'New Arrivals'),
      images: Array.isArray(images) ? images.filter(isValidImagePath) : [],
      colors: Array.isArray(colors) ? colors : ['#1A1614', '#F5F0EB'],
      sizes: Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL'],
      stock: Number(stock) || 50,
      is_new: Boolean(isNew),
      is_bestseller: Boolean(isBestseller),
    };

    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, product: dbProductToProduct(data) });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
