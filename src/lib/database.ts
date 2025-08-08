import { supabase } from '@/lib/supabase'

export async function initializeUserBusiness(userId: string, userEmail?: string, firstName?: string) {
  try {
    // Check if user already has a business
    const { data: existingBusiness } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', userId)
      .single()

    if (existingBusiness) {
      return existingBusiness
    }

    // Create new business for the user
    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        name: firstName ? `${firstName}'s Store` : 'My Store',
        owner_id: userId,
        email: userEmail,
        subscription_plan: 'free'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating business:', error)
      throw error
    }

    // Add some sample products for new users
    const sampleProducts = [
      {
        business_id: business.id,
        name: 'Sample Product 1',
        description: 'This is a sample product to get you started',
        price: 100.00,
        stock_quantity: 50,
        category: 'General'
      },
      {
        business_id: business.id,
        name: 'Sample Product 2', 
        description: 'Another sample product',
        price: 250.00,
        wholesale_price: 200.00,
        stock_quantity: 25,
        category: 'Electronics'
      }
    ]

    await supabase
      .from('products')
      .insert(sampleProducts)

    // Add a sample customer
    await supabase
      .from('customers')
      .insert({
        business_id: business.id,
        name: 'Walk-in Customer',
        phone: '',
        email: '',
        balance: 0
      })

    return business
  } catch (error) {
    console.error('Error initializing user business:', error)
    throw error
  }
}

export async function getBusinessStats(businessId: string) {
  try {
    const [
      { data: products },
      { data: customers },
      { data: orders },
      { data: todayOrders }
    ] = await Promise.all([
      supabase
        .from('products')
        .select('id, stock_quantity, low_stock_threshold')
        .eq('business_id', businessId),
      
      supabase
        .from('customers')
        .select('id, balance')
        .eq('business_id', businessId),
      
      supabase
        .from('orders')
        .select('total_amount, payment_status, created_at')
        .eq('business_id', businessId)
        .eq('status', 'completed'),
      
      supabase
        .from('orders')
        .select('total_amount, payment_status')
        .eq('business_id', businessId)
        .eq('status', 'completed')
        .gte('created_at', new Date().toISOString().split('T')[0])
    ])

    const lowStockProducts = products?.filter(p => p.stock_quantity <= p.low_stock_threshold) || []
    const totalProducts = products?.length || 0
    const totalCustomers = customers?.length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
    const todayRevenue = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0
    const totalOrders = orders?.length || 0
    const todayOrdersCount = todayOrders?.length || 0
    const pendingPayments = customers?.reduce((sum, customer) => sum + Number(customer.balance), 0) || 0

    return {
      totalProducts,
      lowStockCount: lowStockProducts.length,
      totalCustomers,
      totalRevenue,
      todayRevenue,
      totalOrders,
      todayOrdersCount,
      pendingPayments
    }
  } catch (error) {
    console.error('Error fetching business stats:', error)
    throw error
  }
}
