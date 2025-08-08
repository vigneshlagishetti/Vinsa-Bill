import { loadStripe, Stripe } from '@stripe/stripe-js'

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise: Promise<Stripe | null>

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  }
  return stripePromise
}

export default getStripe

// Types for Stripe integration
export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
}

export interface CheckoutSession {
  id: string
  payment_intent?: string
  payment_status: string
  customer_email?: string
  metadata?: {
    orderId?: string
    businessId?: string
  }
}

// Helper function to format amount for Stripe (in cents/paise)
export const formatAmountForStripe = (amount: number, currency: string = 'inr'): number => {
  // Stripe expects amounts in the smallest currency unit
  // For INR, 1 rupee = 100 paise
  return Math.round(amount * 100)
}

// Helper function to format amount from Stripe (from cents/paise to rupees)
export const formatAmountFromStripe = (amount: number, currency: string = 'inr'): number => {
  return amount / 100
}
