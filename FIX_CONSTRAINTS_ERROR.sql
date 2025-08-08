-- URGENT FIX: Update check constraints to allow the status values our API uses
-- Run this immediately in your Supabase SQL Editor to fix the constraint error

-- Drop existing constraints that might be causing issues
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;

-- Add updated constraints with the correct allowed values
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('draft', 'pending', 'completed', 'cancelled', 'confirmed', 'processing', 'shipped', 'delivered'));

ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'partial', 'failed', 'refunded', 'cancelled'));

ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('cash', 'card', 'upi', 'online', 'stripe', 'razorpay', 'credit', 'debit'));

ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
  CHECK (order_type IN ('pos', 'online_store', 'manual', 'import', 'billing'));

-- Verify the fix worked
SELECT 'SUCCESS: Check constraints updated!' as result;

-- Show current constraint details
SELECT con.conname, con.consrc
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'orders' AND con.contype = 'c';
