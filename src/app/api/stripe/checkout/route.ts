import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(req: NextRequest) {
  try {
    const { orderId, amount, currency = 'inr', customer, items } = await req.json()

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount are required' },
        { status: 400 }
      )
    }

    // Fetch order details from database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Create line items for Stripe checkout
    const lineItems = items && items.length > 0 
      ? items.map((item: any) => ({
          price_data: {
            currency: currency,
            product_data: {
              name: item.name || item.product_name,
              description: item.description || `Quantity: ${item.quantity}`,
            },
            unit_amount: Math.round(item.price * 100), // Convert to paise
          },
          quantity: item.quantity,
        }))
      : [
          {
            price_data: {
              currency: currency,
              product_data: {
                name: `Order #${order.order_number}`,
                description: `Payment for Vinsa Bill order`,
              },
              unit_amount: Math.round(amount * 100), // Convert to paise
            },
            quantity: 1,
          },
        ]

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.nextUrl.origin}/dashboard/purchase?payment=success&order_id=${orderId}`,
      cancel_url: `${req.nextUrl.origin}/dashboard/purchase?payment=cancelled&order_id=${orderId}`,
      customer_email: customer?.email || order.customer_email,
      metadata: {
        orderId: orderId.toString(),
        customerName: customer?.name || order.customer_name || 'Guest',
        customerEmail: customer?.email || order.customer_email || '',
        customerPhone: customer?.phone || order.customer_phone || '',
      },
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['IN'], // India only for now
      },
    })

    // Update order status to pending payment
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'pending',
        status: 'pending'
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order status:', updateError)
    }

    return NextResponse.json({ 
      sessionId: session.id, 
      url: session.url,
      success: true 
    })

  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
