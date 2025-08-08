-- Add customer details columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);

-- Update the payment_status column constraint to include new statuses
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'partial', 'failed', 'refunded'));

-- Update the payment_method constraint to include new methods  
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('cash', 'card', 'upi', 'credit', 'stripe', 'razorpay'));

-- Update the status constraint to include pending
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('draft', 'pending', 'completed', 'cancelled'));

-- Comments for documentation
COMMENT ON COLUMN orders.customer_name IS 'Customer name for walk-in customers';
COMMENT ON COLUMN orders.customer_phone IS 'Customer phone number';
COMMENT ON COLUMN orders.customer_email IS 'Customer email address';
