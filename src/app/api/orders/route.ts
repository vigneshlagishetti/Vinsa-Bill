import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    console.log('Creating order with data:', orderData)

    // Create the order record
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_name: orderData.customer_name,
        customer_email: orderData.customer_email,
        customer_phone: orderData.customer_phone,
        customer_address: orderData.customer_address,
        subtotal: orderData.subtotal,
        tax_amount: orderData.tax_amount,
        total_amount: orderData.total_amount,
        payment_method: orderData.payment_method,
        payment_status: orderData.payment_status,
        status: orderData.status,
        order_type: orderData.order_type || 'online_store',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      )
    }

    console.log('Order created successfully:', order)

    // Create order items if provided
    if (orderData.items && orderData.items.length > 0) {
      const orderItems = orderData.items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Order items creation error:', itemsError)
        // Don't fail the entire order if items fail to insert
        console.warn('Order created but items failed to save:', itemsError.message)
      }

      // Update product stock quantities
      for (const item of orderData.items) {
        // First get current stock
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.product_id)
          .single()

        if (productError) {
          console.error('Product fetch error for stock update:', productError)
          continue
        }

        // Update with new stock quantity
        const newStockQuantity = Math.max(0, (product.stock_quantity || 0) - item.quantity)
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStockQuantity })
          .eq('id', item.product_id)

        if (stockError) {
          console.error('Stock update error for product', item.product_id, ':', stockError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: 'Order created successfully'
    })

  } catch (error) {
    console.error('Order processing error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const customer_email = searchParams.get('customer_email')
    const order_type = searchParams.get('order_type')

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (customer_email) {
      query = query.eq('customer_email', customer_email)
    }

    if (order_type) {
      query = query.eq('order_type', order_type)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Orders fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      orders
    })

  } catch (error) {
    console.error('Orders fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
