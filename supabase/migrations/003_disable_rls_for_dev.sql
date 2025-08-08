-- Temporarily disable RLS for development (ONLY for development!)
-- This allows the application to work while we fix the Clerk-Supabase bridge

ALTER TABLE businesses DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY; 
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;

-- Note: This should only be used temporarily for development
-- In production, you should properly bridge Clerk authentication with Supabase RLS
