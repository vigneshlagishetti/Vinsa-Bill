import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session

        // Update order status to completed
        if (session.metadata?.orderId) {
          const { error } = await supabase
            .from('orders')
            .update({
              status: 'completed',
              payment_status: 'paid',
              payment_method: 'stripe',
              paid_at: new Date().toISOString(),
              stripe_payment_intent_id: session.payment_intent as string,
            })
            .eq('id', session.metadata.orderId)

          if (error) {
            console.error('Error updating order status:', error)
          } else {
            console.log(`Order ${session.metadata.orderId} marked as completed`)
          }
        }
        break

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Find order by payment intent and update status
        const { data: orders } = await supabase
          .from('orders')
          .select('id')
          .eq('stripe_payment_intent_id', paymentIntent.id)

        if (orders && orders.length > 0) {
          await supabase
            .from('orders')
            .update({
              status: 'payment_failed',
              payment_status: 'failed',
            })
            .eq('id', orders[0].id)
        }
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
