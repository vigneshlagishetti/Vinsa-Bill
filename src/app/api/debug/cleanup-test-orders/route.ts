import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    console.log('Starting cleanup of test orders...')

    // Delete orders that don't have proper customer information
    // These are likely test/dummy orders
    const { data: deletedOrders, error: deleteError } = await supabase
      .from('orders')
      .delete()
      .or('customer_name.is.null,customer_name.eq.,customer_email.is.null,customer_email.eq.,customer_phone.is.null,customer_phone.eq.')
      .select()

    if (deleteError) {
      console.error('Error deleting test orders:', deleteError)
      return NextResponse.json(
        { error: 'Failed to cleanup test orders', details: deleteError.message },
        { status: 500 }
      )
    }

    const deletedCount = deletedOrders?.length || 0
    console.log(`Deleted ${deletedCount} test orders`)

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Successfully deleted ${deletedCount} test orders`
    })

  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
