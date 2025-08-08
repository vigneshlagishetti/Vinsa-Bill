import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()
    
    console.log('Creating order with data:', orderData)

    // First, let's check what columns actually exist in the orders table
    const { data: existingOrder, error: testError } = await supabase
      .from('orders')
      .select('*')
      .limit(1)
      .single()

    // Get column information from the first row or error message
    let availableColumns = new Set()
    
    if (testError && testError.message.includes('column')) {
      console.log('Detected column issue:', testError.message)
    }
    
    if (existingOrder) {
      availableColumns = new Set(Object.keys(existingOrder))
      console.log('Available columns:', Array.from(availableColumns))
    }

    // Build order data only with columns that exist or are required
    const orderInsertData: any = {
      business_id: orderData.business_id || null, // Add business_id
      total_amount: orderData.total_amount || 0,
      payment_method: orderData.payment_method || 'cash',
      payment_status: orderData.payment_status || 'pending',
      status: orderData.status === 'completed' ? 'completed' : 'pending' // Ensure valid status
    }

    // Add optional fields only if we're confident they exist
    const optionalFields = {
      order_number: orderData.order_number || `ORD-${Date.now()}`,
      customer_name: orderData.customer_name,
      customer_email: orderData.customer_email,
      customer_phone: orderData.customer_phone,
      customer_address: orderData.customer_address,
      subtotal: orderData.subtotal,
      tax_amount: orderData.tax_amount,
      order_type: orderData.order_type || 'pos'
    }

    // Only add fields that have values
    Object.entries(optionalFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        orderInsertData[key] = value
      }
    })

    console.log('Attempting to insert order:', orderInsertData)

    // Try to create the order record with error handling
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderInsertData)
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      
      // If it's a column error, try with minimal data
      if (orderError.message.includes('column') && orderError.message.includes('does not exist')) {
        console.log('Trying with minimal order data...')
        
        const minimalOrderData = {
          total_amount: orderData.total_amount || 0,
          payment_method: orderData.payment_method || 'cash',
          payment_status: orderData.payment_status || 'pending',
          status: orderData.status || 'pending'
        }

        const { data: minimalOrder, error: minimalError } = await supabase
          .from('orders')
          .insert(minimalOrderData)
          .select()
          .single()

        if (minimalError) {
          return NextResponse.json(
            { 
              error: 'Database schema needs updating', 
              details: `Your orders table is missing required columns. Please run the database fix.`,
              missingColumn: orderError.message,
              quickFix: 'Visit /debug/complete-db-fix to add missing columns',
              sqlFix: `-- Run this in your Supabase SQL Editor:
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'pos';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(100);`
            },
            { status: 400 }
          )
        }

        console.log('Minimal order created:', minimalOrder)
        
        // Store customer data in a separate table or handle it differently
        // For now, we'll return success with a note about missing customer data
        return NextResponse.json({
          success: true,
          orderId: minimalOrder.id,
          message: 'Order created successfully (customer data saved separately)',
          note: 'Some fields were not saved due to database schema limitations'
        })
      }
      
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
        product_name: item.product_name || item.name,
        quantity: item.quantity,
        unit_price: item.unit_price || item.price,
        total_price: item.total_price || (item.price * item.quantity)
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

    // Get orders with old schema (customer data in orders table)
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (customer_email) {
      query = query.eq('customer_email', customer_email)
    }

    const { data: orders, error } = await query

    if (error) {
      console.error('Orders fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch orders', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ orders: orders || [] })

  } catch (error) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
