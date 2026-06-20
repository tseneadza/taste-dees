-- Fix: Change products.id from UUID to TEXT to support custom IDs
-- Run this in your Supabase SQL Editor

-- Drop existing foreign key constraint on order_items
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

-- Change products.id from UUID to TEXT
ALTER TABLE products ALTER COLUMN id TYPE TEXT;
ALTER TABLE products ALTER COLUMN id SET DEFAULT NULL;

-- Change order_items.product_id from UUID to TEXT
ALTER TABLE order_items ALTER COLUMN product_id TYPE TEXT;

-- Re-add foreign key (optional - can skip if you want flexibility)
-- ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey
--   FOREIGN KEY (product_id) REFERENCES products(id);

-- Verify the change
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'products' AND column_name = 'id';
