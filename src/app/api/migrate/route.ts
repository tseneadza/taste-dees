import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { promises as fs } from 'fs';
import path from 'path';

// Migration endpoint - run once to migrate products from JSON to Supabase
// DELETE this file after migration is complete

export async function POST(request: Request) {
  try {
    // Check for migration secret to prevent unauthorized access
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.MIGRATION_SECRET) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const results = {
      products: { migrated: 0, errors: [] as string[] },
    };

    // First, check the actual column type
    const { data: schemaCheck, error: schemaError } = await supabase.rpc('check_products_schema', {});

    if (schemaError) {
      // Fallback: try to get schema info differently
      console.log('Schema check error:', schemaError);
    } else {
      console.log('Schema check result:', schemaCheck);
    }

    // Migrate products from products.json
    const productsPath = path.join(process.cwd(), 'products.json');

    try {
      const productsData = await fs.readFile(productsPath, 'utf-8');
      const products = JSON.parse(productsData);

      for (const product of products) {
        // Use raw insert instead of upsert
        const { error } = await supabase.from('products').insert({
          id: String(product.id), // Explicitly cast to string
          name: String(product.name),
          description: String(product.description || ''),
          price: Number(product.price),
          original_price: product.originalPrice ? Number(product.originalPrice) : null,
          category: String(product.category || 'Uncategorized'),
          colors: product.colors || [],
          sizes: product.sizes || [],
          images: product.images || [],
          stock: Number(product.stock || 0),
          is_new: Boolean(product.isNew),
          is_bestseller: Boolean(product.isBestseller),
        });

        if (error) {
          results.products.errors.push(`Product ${product.id}: ${error.message}`);
        } else {
          results.products.migrated++;
        }
      }
    } catch (e) {
      results.products.errors.push(`Failed to read products.json: ${e}`);
    }

    return NextResponse.json({
      success: true,
      results,
      message: 'Migration complete. Delete this endpoint after verifying data.'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Migration failed'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Migration endpoint. POST with ?secret=YOUR_MIGRATION_SECRET to run migration.',
    warning: 'Delete this file after migration is complete.'
  });
}
