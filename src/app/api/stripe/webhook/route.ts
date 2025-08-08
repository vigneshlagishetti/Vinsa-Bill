import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

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

        console.log('Payment successful for session:', session.id)
        console.log('Session metadata:', session.metadata)

        // Update order status to completed
        if (session.metadata?.orderId) {
          const { error } = await supabase
            .from('orders')
            .update({
              status: 'completed',
              payment_status: 'paid',
              payment_method: 'online'
            })
            .eq('id', session.metadata.orderId)

          if (error) {
            console.error('Error updating order status:', error)
          } else {
            console.log(`Order ${session.metadata.orderId} marked as completed and paid`)
          }
        }
        break

      case 'checkout.session.expired':
        const expiredSession = event.data.object as Stripe.Checkout.Session

        // Update order status to cancelled
        if (expiredSession.metadata?.orderId) {
          await supabase
            .from('orders')
            .update({
              status: 'cancelled',
              payment_status: 'failed'
            })
            .eq('id', expiredSession.metadata.orderId)

          console.log(`Order ${expiredSession.metadata.orderId} marked as cancelled due to expired session`)
        }
        break

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        console.log('Payment failed for payment intent:', paymentIntent.id)

        // Update orders with failed payment status
        const { error: failedUpdateError } = await supabase
          .from('orders')
          .update({
            status: 'cancelled',
            payment_status: 'failed'
          })
          .eq('order_number', `ORD-${paymentIntent.metadata?.orderId || ''}`)

        if (failedUpdateError) {
          console.error('Error updating failed payment status:', failedUpdateError)
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
