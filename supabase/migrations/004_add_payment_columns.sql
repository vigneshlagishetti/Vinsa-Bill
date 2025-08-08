-- Add payment tracking columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_session_id VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(255);

-- Update existing orders to have default payment status
UPDATE orders SET payment_status = 'completed', payment_method = 'cash' WHERE payment_status IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);

-- Comments for documentation
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed, refunded';
COMMENT ON COLUMN orders.payment_method IS 'Payment method: cash, card, upi, stripe, razorpay';
COMMENT ON COLUMN orders.paid_at IS 'Timestamp when payment was completed';
COMMENT ON COLUMN orders.stripe_session_id IS 'Stripe checkout session ID';
COMMENT ON COLUMN orders.stripe_payment_intent_id IS 'Stripe payment intent ID';
