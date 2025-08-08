import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { currentUser } from '@clerk/nextjs'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    // Get user ID from headers (set by middleware)
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId, amount, currency = 'inr' } = await req.json()

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      )
    }

    // Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency,
            product_data: {
              name: `Order #${order.id}`,
              description: `Payment for order containing ${order.order_items?.length || 0} items`,
            },
            unit_amount: Math.round(amount * 100), // Convert to paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/dashboard/orders?payment=success&order_id=${orderId}`,
      cancel_url: `${req.nextUrl.origin}/dashboard/orders?payment=cancelled&order_id=${orderId}`,
      metadata: {
        orderId: orderId.toString(),
        userId: userId,
        businessId: order.business_id.toString(),
      },
    })

    // Update order status to pending payment
    await supabase
      .from('orders')
      .update({ 
        status: 'pending_payment',
        stripe_session_id: session.id 
      })
      .eq('id', orderId)

    return NextResponse.json({ sessionId: session.id, url: session.url })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
