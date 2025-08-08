# Payment Gateway Setup Guide

## Stripe Integration Setup

### 1. Create a Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Sign up for a free Stripe account
3. Complete your account verification (for live payments)

### 2. Get API Keys
1. In the Stripe Dashboard, go to "Developers" → "API keys"
2. Copy your **Publishable key** and **Secret key**
3. For testing, use the test keys (they start with `pk_test_` and `sk_test_`)

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. Update the Stripe keys:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key_here
```

### 4. Set up Webhooks (Optional for testing)
1. In Stripe Dashboard, go to "Developers" → "Webhooks"
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook secret and add to `.env.local`:
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 5. Update Database Schema
Run the migration to add payment columns:
```sql
-- Run this in your Supabase SQL editor
-- The migration file: supabase/migrations/004_add_payment_columns.sql
```

### 6. Test Payment Flow
1. Create a new bill with some products
2. Complete the order - this will show the payment modal
3. Click "Pay" - this will redirect to Stripe Checkout
4. Use test card: `4242 4242 4242 4242` (any future date, any CVC)
5. Payment should complete and redirect back to your app

### 7. Alternative Payment Gateways

#### For Indian Market - Razorpay
- Better for Indian payment methods (UPI, NEFT, wallets)
- Similar integration process
- Replace Stripe calls with Razorpay API

#### For Global - PayPal
- Good for international payments
- Slightly more complex integration
- Better for cross-border transactions

### 8. Production Deployment
1. Replace test keys with live keys
2. Set up proper webhook endpoint
3. Configure your domain in Stripe settings
4. Test with real (small amount) transactions

## Payment Flow in the App

1. **New Bill Page**: Customer adds products to cart
2. **Complete Order**: Creates order in database with "pending" status
3. **Payment Modal**: Shows order summary and payment button
4. **Stripe Checkout**: Redirects to secure Stripe payment page
5. **Payment Success**: Webhook updates order status to "completed"
6. **Order Confirmation**: Customer returns to app with confirmation

## Security Notes

- API keys are server-side only (except publishable key)
- Never store card details in your database
- Use HTTPS in production
- Webhooks verify authenticity with signatures
- All payments processed by Stripe (PCI compliant)

## Testing

Test cards for different scenarios:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires authentication**: 4000 0025 0000 3155

All test cards use:
- Any future expiry date
- Any 3-digit CVC
- Any postal code
