-- Add missing columns to products table for enhanced features
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand text,
ADD COLUMN IF NOT EXISTS supplier text,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS image_url text;

-- Also add cost_price as alias for wholesale_price for better form compatibility
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS cost_price decimal(10,2);
