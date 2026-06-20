// Database types for Supabase

export interface DbProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  category: string;
  colors: string[];
  sizes: string[];
  images: string[];
  stock: number;
  is_new: boolean;
  is_bestseller: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: string;
  user_email: string;
  status: 'pending' | 'paid' | 'fulfilled' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  total: number;
  payment_provider: 'stripe' | 'paypal';
  payment_id: string | null;
  fulfillment_provider: string | null;
  fulfillment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  price: number;
  quantity: number;
  color: string;
  size: string;
}

export interface DbSetting {
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

// Conversion helpers
import { Product } from '@/types/product';

export function dbProductToProduct(dbProduct: DbProduct): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description,
    price: dbProduct.price,
    originalPrice: dbProduct.original_price ?? undefined,
    category: dbProduct.category,
    colors: dbProduct.colors,
    sizes: dbProduct.sizes,
    images: dbProduct.images,
    stock: dbProduct.stock,
    isNew: dbProduct.is_new,
    isBestseller: dbProduct.is_bestseller,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  };
}

export function productToDbProduct(product: Product): Omit<DbProduct, 'created_at' | 'updated_at'> {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    original_price: product.originalPrice ?? null,
    category: product.category,
    colors: product.colors,
    sizes: product.sizes,
    images: product.images,
    stock: product.stock,
    is_new: product.isNew ?? false,
    is_bestseller: product.isBestseller ?? false,
  };
}
