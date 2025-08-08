import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Business, Product, Customer, Order } from '@/lib/supabase'

export function useBusiness() {
  const { user } = useUser()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrCreateBusiness = useCallback(async () => {
    if (!user) {
      console.log('No user found, skipping business fetch')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Fetching/creating business for user:', user.id)
      
      // Try to fetch existing business
      const { data: existingBusiness, error: fetchError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle()

      console.log('Business fetch result:', { existingBusiness, fetchError })

      if (fetchError) {
        console.error('Business fetch error:', fetchError)
        // Check if it's an RLS/permission error
        if (fetchError.code === '42501' || fetchError.message.includes('permission denied')) {
          throw new Error('Database access denied. Please check your authentication setup.')
        }
        throw new Error(`Failed to fetch business: ${fetchError.message}`)
      }

      if (existingBusiness) {
        console.log('Existing business found:', existingBusiness.name)
        setBusiness(existingBusiness)
      } else {
        console.log('Creating new business...')
        // Create new business
        const { data: newBusiness, error: createError } = await supabase
          .from('businesses')
          .insert({
            name: user.firstName ? `${user.firstName}'s Store` : 'My Store',
            owner_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || null
          })
          .select()
          .single()

        if (createError) {
          console.error('Business create error:', createError)
          throw new Error(`Failed to create business: ${createError.message}`)
        }
        
        console.log('New business created:', newBusiness.name)
        setBusiness(newBusiness)
      }
    } catch (err) {
      console.error('Business operation error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      console.error('Detailed error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    console.log('useBusiness - User state:', user?.id, user?.firstName)
    if (user) {
      fetchOrCreateBusiness()
    }
  }, [user, fetchOrCreateBusiness])

  const updateBusiness = async (updates: Partial<Business>) => {
    if (!business || !user) return

    try {
      const { data, error } = await supabase
        .from('businesses')
        .update(updates)
        .eq('id', business.id)
        .select()
        .single()

      if (error) throw error
      setBusiness(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update business')
      throw err
    }
  }

  return {
    business,
    loading,
    error,
    updateBusiness,
    refreshBusiness: fetchOrCreateBusiness
  }
}

export function useProducts() {
  const { business } = useBusiness()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    if (!business) return

    try {
      setLoading(true)
      console.log('Fetching products from Supabase...')
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      console.log('Products fetched:', data?.length || 0)
      setProducts(data || [])
    } catch (err) {
      console.error('Products fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
    } finally {
      setLoading(false)
    }
  }, [business])

  useEffect(() => {
    console.log('useProducts - Business state:', business)
    if (business) {
      console.log('useProducts - Fetching products for business:', business.id)
      fetchProducts()
    } else if (business === null) {
      // Business is null (not undefined), meaning it's been checked and doesn't exist
      setLoading(false)
    }
  }, [business, fetchProducts])

  const addProduct = async (product: Omit<Product, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    if (!business) {
      throw new Error('No business found. Please create a business first.')
    }

    try {
      console.log('Adding product:', product.name, 'for business:', business.id)
      
      // Map form data to database schema
      const productData = {
        name: product.name,
        description: product.description || null,
        price: product.price,
        wholesale_price: product.cost_price || null,
        stock_quantity: product.stock_quantity,
        low_stock_threshold: product.low_stock_threshold,
        barcode: product.barcode || null,
        category: product.category || null,
        unit: product.unit || 'pcs',
        tax_rate: product.tax_rate || 18.00,
        business_id: business.id
      }
      
      console.log('Product data being inserted:', productData)
      
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (error) {
        console.error('Product insert error:', error)
        throw new Error(`Failed to add product: ${error.message}`)
      }
      
      console.log('Product added successfully:', data.name)
      setProducts([data, ...products])
      return data
    } catch (err) {
      console.error('Add product error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product'
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!business) return

    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .eq('business_id', business.id)
        .select()
        .single()

      if (error) throw error
      setProducts(products.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product')
      throw err
    }
  }

  const deleteProduct = async (id: string) => {
    if (!business) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('business_id', business.id)

      if (error) throw error
      setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
      throw err
    }
  }

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: fetchProducts
  }
}

export function useCustomers() {
  const { business } = useBusiness()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCustomers = useCallback(async () => {
    if (!business) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }, [business])

  useEffect(() => {
    if (business) {
      fetchCustomers()
    }
  }, [business, fetchCustomers])

  const addCustomer = async (customer: Omit<Customer, 'id' | 'business_id' | 'created_at' | 'updated_at'>) => {
    if (!business) return

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert({
          ...customer,
          business_id: business.id
        })
        .select()
        .single()

      if (error) throw error
      setCustomers([data, ...customers])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer')
      throw err
    }
  }

  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    if (!business) return

    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .eq('business_id', business.id)
        .select()
        .single()

      if (error) throw error
      setCustomers(customers.map(c => c.id === id ? data : c))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer')
      throw err
    }
  }

  return {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    refreshCustomers: fetchCustomers
  }
}

export function useOrders() {
  const { business } = useBusiness()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!business) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(name),
          order_items(
            *,
            product:products(name)
          )
        `)
        .eq('business_id', business.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }, [business])

  useEffect(() => {
    if (business) {
      fetchOrders()
    }
  }, [business, fetchOrders])

  const createOrder = async (orderData: {
    customer_name?: string
    customer_phone?: string
    customer_email?: string
    customer_id?: string
    items: Array<{
      product_id: string
      quantity: number
      unit_price: number
      total_price?: number
    }>
    subtotal?: number
    tax_amount?: number
    discount_amount?: number
    total_amount?: number
    payment_method?: string
    payment_status?: string
    status?: string
    discount?: number
    notes?: string
  }) => {
    if (!business) return null

    try {
      // Use provided totals or calculate them
      const subtotal = orderData.subtotal || orderData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
      const discount = orderData.discount_amount || orderData.discount || 0
      const taxAmount = orderData.tax_amount || ((subtotal - discount) * 0.18) // 18% GST
      const totalAmount = orderData.total_amount || (subtotal - discount + taxAmount)

      // Generate order number
      const orderNumber = `ORD-${Date.now()}`

      console.log('Creating order with data:', {
        business_id: business.id,
        customer_id: orderData.customer_id,
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        order_number: orderNumber,
        total_amount: totalAmount,
        discount,
        tax_amount: taxAmount,
        payment_method: orderData.payment_method || 'cash',
        payment_status: orderData.payment_status || 'pending',
        status: orderData.status || 'pending',
        notes: orderData.notes
      })

      // Prepare order data - only include fields that exist in database
      const orderInsertData: any = {
        business_id: business.id,
        customer_id: orderData.customer_id,
        order_number: orderNumber,
        total_amount: totalAmount,
        discount,
        tax_amount: taxAmount,
        payment_method: orderData.payment_method || 'cash',
        payment_status: orderData.payment_status || 'pending',
        status: orderData.status || 'pending',
        notes: orderData.notes
      }

      // Add customer fields only if they exist (to handle database schema differences)
      if (orderData.customer_name) {
        orderInsertData.customer_name = orderData.customer_name
      }
      if (orderData.customer_phone) {
        orderInsertData.customer_phone = orderData.customer_phone
      }
      if (orderData.customer_email) {
        orderInsertData.customer_email = orderData.customer_email
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderInsertData)
        .select()
        .single()

      if (orderError) {
        console.error('Order creation error:', orderError)
        console.error('Error details:', {
          message: orderError.message,
          details: orderError.details,
          hint: orderError.hint,
          code: orderError.code
        })
        throw new Error(`Failed to create order: ${orderError.message}`)
      }

      // Create order items
      const orderItems = orderData.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.quantity * item.unit_price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Update product stock
      for (const item of orderData.items) {
        await supabase.rpc('update_product_stock', {
          product_id: item.product_id,
          quantity_sold: item.quantity
        })
      }

      await fetchOrders()
      return order.id
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order')
      throw err
    }
  }

  return {
    orders,
    loading,
    error,
    createOrder,
    refreshOrders: fetchOrders
  }
}
