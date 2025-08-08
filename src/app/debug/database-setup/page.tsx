'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function DatabaseSetupPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [setupSteps, setSetupSteps] = useState<string[]>([])

  const addStep = (step: string) => {
    setSetupSteps(prev => [...prev, step])
  }

  const checkOrdersTable = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    setSetupSteps([])

    try {
      addStep('🔍 Checking orders table structure...')
      
      // Try to get table columns
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_name', 'orders')
        .eq('table_schema', 'public')
        .order('ordinal_position')

      if (columnsError) {
        addStep(`❌ Error checking table structure: ${columnsError.message}`)
        setError(columnsError.message)
        return
      }

      addStep('📋 Orders table columns:')
      const requiredColumns = ['customer_name', 'customer_phone', 'customer_email', 'paid_at', 'stripe_session_id']
      const existingColumns = columns?.map(col => col.column_name) || []
      
      columns?.forEach(col => {
        addStep(`  ✓ ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })

      addStep('\n🔍 Checking for required columns:')
      requiredColumns.forEach(col => {
        if (existingColumns.includes(col)) {
          addStep(`  ✅ ${col} - EXISTS`)
        } else {
          addStep(`  ❌ ${col} - MISSING`)
        }
      })

      // Check existing orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .limit(1)

      if (ordersError) {
        addStep(`❌ Error querying orders: ${ordersError.message}`)
      } else {
        addStep(`📊 Found ${orders?.length || 0} orders in table`)
        if (orders && orders.length > 0) {
          addStep('Sample order structure:')
          addStep(JSON.stringify(orders[0], null, 2))
        }
      }

      setMessage('Table structure check completed!')

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      addStep(`❌ Error: ${errorMsg}`)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const testOrderCreation = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    setSetupSteps([])

    try {
      addStep('🧪 Testing order creation...')
      
      // Get first business
      const { data: businesses } = await supabase
        .from('businesses')
        .select('*')
        .limit(1)

      if (!businesses || businesses.length === 0) {
        addStep('❌ No businesses found')
        setError('No businesses found. Please create a business first.')
        return
      }

      const business = businesses[0]
      addStep(`✅ Found business: ${business.name}`)

      // Test order data
      const testOrder = {
        business_id: business.id,
        customer_name: 'Test Customer',
        customer_phone: '1234567890',
        customer_email: 'test@example.com',
        order_number: `TEST-${Date.now()}`,
        total_amount: 100,
        discount: 0,
        tax_amount: 18,
        payment_method: 'cash',
        payment_status: 'pending',
        status: 'pending',
        notes: 'Test order'
      }

      addStep('📝 Creating test order...')

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(testOrder)
        .select()
        .single()

      if (orderError) {
        addStep('❌ Order creation failed:')
        addStep(`Error: ${orderError.message}`)
        addStep(`Details: ${orderError.details || 'No details'}`)
        addStep(`Hint: ${orderError.hint || 'No hint'}`)
        addStep(`Code: ${orderError.code || 'No code'}`)
        setError(orderError.message)
      } else {
        addStep('✅ Test order created successfully!')
        addStep(`Order ID: ${order.id}`)
        addStep(`Order Number: ${order.order_number}`)
        
        // Clean up test order
        await supabase
          .from('orders')
          .delete()
          .eq('id', order.id)
        addStep('🧹 Test order cleaned up')
        setMessage('Order creation test completed successfully!')
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      addStep(`❌ Error: ${errorMsg}`)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const createTablesManually = async () => {
    setLoading(true)
    setMessage('')
    setError('')
    setSetupSteps([])

    try {
      addStep('Starting manual database setup...')

      // Since we cannot execute DDL directly, let's try a different approach
      // Create a test business to verify table structure
      addStep('Testing businesses table...')
      
      const testBusiness = {
        name: 'Test Business',
        owner_id: 'test-user-id',
        email: 'test@example.com',
        subscription_plan: 'free'
      }

      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert(testBusiness)
        .select()
        .single()

      if (businessError) {
        if (businessError.message.includes('does not exist')) {
          addStep('❌ Tables do not exist. Manual creation required.')
          throw new Error('Database tables do not exist. Please create them in your Supabase dashboard.')
        }
        throw businessError
      }

      addStep('✓ Businesses table exists and working')

      // Clean up test business
      if (businessData) {
        await supabase.from('businesses').delete().eq('id', businessData.id)
        addStep('✓ Cleaned up test data')
      }

      // Test products table
      const { error: productsError } = await supabase
        .from('products')
        .select('count')
        .limit(1)
      
      if (productsError) {
        addStep(`❌ Products table issue: ${productsError.message}`)
      } else {
        addStep('✓ Products table accessible')
      }

      setMessage('Database tables are accessible and working!')
      
    } catch (err) {
      console.error('Database setup error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Database setup failed'
      setError(errorMessage)
      addStep(`❌ Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Test basic connection
      const { data, error } = await supabase
        .from('businesses')
        .select('count')
        .limit(1)

      if (error) {
        throw new Error(`Connection test failed: ${error.message}`)
      }

      setMessage('Database connection successful!')
      
    } catch (err) {
      console.error('Connection test error:', err)
      setError(err instanceof Error ? err.message : 'Connection test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Database Setup</h1>
          <p className="text-gray-600 mt-1">Setup and test your Supabase database connection</p>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Schema Setup</h2>
            <p className="text-gray-600 mb-6">
              This will add missing columns to your products table to support the latest features including brand, supplier, location, and cost price fields.
            </p>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center space-x-2 text-green-700">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="font-medium">{message}</span>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start space-x-2 text-red-700">
                  <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Database Error</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-3">
              <button
                onClick={testConnection}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Database Connection'}
              </button>

              <button
                onClick={checkOrdersTable}
                disabled={loading}
                className="w-full sm:w-auto ml-0 sm:ml-3 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Orders Table'}
              </button>

              <button
                onClick={createTablesManually}
                disabled={loading}
                className="w-full sm:w-auto ml-0 sm:ml-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Tables'}
              </button>

              <button
                onClick={testOrderCreation}
                disabled={loading}
                className="w-full sm:w-auto ml-0 sm:ml-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Order Creation'}
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-yellow-700 text-sm">
                <p className="font-medium">Important Note</p>
                <p className="mt-1">
                  This setup page adds missing database columns needed for the enhanced product management features. 
                  Run this once if you&apos;re experiencing product saving issues.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
