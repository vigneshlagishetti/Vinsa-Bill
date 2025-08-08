# Stripe Payment Setup Guide

## 🔧 Environment Variables Setup

Add these to your `.env.local` file:

```env
# Stripe Keys (Get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Stripe Webhook Secret (Create webhook endpoint first)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🚀 Quick Setup Steps

### 1. Get Stripe Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/register)
2. Create account or sign in
3. Go to **Developers → API Keys**
4. Copy **Publishable Key** and **Secret Key**

### 2. Create Webhook Endpoint
1. Go to **Developers → Webhooks**
2. Click **Add endpoint**
3. URL: `https://yourdomain.com/api/stripe/webhook` 
   - For local testing: `https://your-ngrok-url.ngrok.io/api/stripe/webhook`
4. Select events: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
5. Copy the **Signing secret**

### 3. Test with ngrok (Local Development)
```bash
# Install ngrok
npm install -g ngrok

# Run your Next.js app
npm run dev

# In another terminal, expose your local server
ngrok http 3000

# Use the https URL for webhook endpoint
```

### 4. Update Environment File
```env
# Replace with your actual keys
STRIPE_SECRET_KEY=sk_test_51ABC...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51ABC...
STRIPE_WEBHOOK_SECRET=whsec_1ABC...
```

## 🧪 Test Payment Flow

1. **Start development server**: `npm run dev`
2. **Go to online store**: `http://localhost:3000/dashboard/online-store`
3. **Add items to cart** and proceed to checkout
4. **Fill customer information** 
5. **Select "Card Payment"** and click "Pay with Card"
6. **Use Stripe test cards**:
   - Success: `4242 4242 4242 4242`
   - Declined: `4000 0000 0000 0002`
   - Any future date for expiry, any CVC

## ✅ Features Included

- **Secure Checkout**: Stripe-hosted checkout pages
- **Multiple Payment Methods**: Card + Cash on Delivery
- **Order Management**: Automatic order status updates
- **Customer Data**: Secure customer information handling
- **Webhook Processing**: Real-time payment confirmations
- **Error Handling**: Comprehensive error management

## 📱 How It Works

1. **Customer places order** → Order created in database
2. **Stripe checkout** → Customer redirected to secure Stripe page
3. **Payment success** → Webhook updates order status
4. **Customer redirect** → Back to success page

## 🛠️ Customization Options

- **Currency**: Change from INR to USD/EUR in `checkout/route.ts`
- **Success URL**: Modify redirect URLs in checkout session
- **Payment Methods**: Enable more methods in Stripe dashboard
- **Branding**: Customize Stripe checkout appearance

## 🚨 Production Checklist

- [ ] Replace test keys with live keys
- [ ] Configure production webhook URL
- [ ] Enable additional payment methods
- [ ] Set up proper error monitoring
- [ ] Configure Stripe dashboard settings

Perfect! Your Stripe payment integration is ready to use! 🎉
