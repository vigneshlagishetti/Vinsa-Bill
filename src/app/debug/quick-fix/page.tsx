'use client'

import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

export default function QuickFixPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const testAndCreateBusiness = async () => {
    if (!user) {
      setError('Please sign in first')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Try to create a business directly without RLS checks
      const businessData = {
        name: user.firstName ? `${user.firstName}'s Store` : 'My Store',
        owner_id: user.id,
        email: user.primaryEmailAddress?.emailAddress || null
      }

      console.log('Creating business:', businessData)

      const { data: newBusiness, error: createError } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single()

      if (createError) {
        console.error('Business create error:', createError)
        if (createError.code === '23505') {
          // Duplicate key - business already exists
          setMessage('Business already exists. Trying to fetch existing business...')
          
          const { data: existing, error: fetchError } = await supabase
            .from('businesses')
            .select('*')
            .eq('owner_id', user.id)
            .single()
          
          if (existing) {
            setMessage(`Business found: ${existing.name}. You can now add products!`)
          } else {
            throw new Error(`Could not fetch existing business: ${fetchError?.message}`)
          }
        } else {
          throw createError
        }
      } else {
        setMessage(`Business created successfully: ${newBusiness.name}. You can now add products!`)
      }

    } catch (err) {
      console.error('Operation error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Operation failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const testAddProduct = async () => {
    if (!user) {
      setError('Please sign in first')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      // First get or create business
      let business = null
      
      const { data: existingBusiness } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single()
      
      if (existingBusiness) {
        business = existingBusiness
      } else {
        // Create business
        const { data: newBusiness, error: createError } = await supabase
          .from('businesses')
          .insert({
            name: user.firstName ? `${user.firstName}'s Store` : 'My Store',
            owner_id: user.id,
            email: user.primaryEmailAddress?.emailAddress || null
          })
          .select()
          .single()

        if (createError) throw createError
        business = newBusiness
      }

      // Now try to add a test product
      const testProduct = {
        name: 'Test Product',
        price: 10.00,
        stock_quantity: 1,
        low_stock_threshold: 1,
        category: 'Test',
        unit: 'pcs',
        tax_rate: 18.00,
        business_id: business.id
      }

      console.log('Adding test product:', testProduct)

      const { data: product, error: productError } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single()

      if (productError) {
        console.error('Product create error:', productError)
        throw productError
      }

      setMessage(`Success! Test product "${product.name}" added to your inventory.`)

      // Clean up test product after 5 seconds
      setTimeout(async () => {
        await supabase.from('products').delete().eq('id', product.id)
        setMessage(prev => prev + ' (Test product auto-removed)')
      }, 5000)

    } catch (err) {
      console.error('Test product error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Test failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Quick Fix</h1>
          <p className="text-gray-600 mt-1">Test and fix business/product creation issues</p>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Operations Test</h2>

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
                  <XCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Operation Failed</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {user ? (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    Signed in as: <span className="font-medium">{user.firstName || 'User'}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    User ID: <code className="bg-gray-200 px-1 rounded text-xs">{user.id}</code>
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={testAndCreateBusiness}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Testing...' : '1. Test Business Creation'}
                  </button>

                  <button
                    onClick={testAddProduct}
                    disabled={loading}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50"
                  >
                    {loading ? 'Testing...' : '2. Test Product Addition'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">Please sign in to test database operations</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-blue-700 text-sm">
              <p className="font-medium">What this does:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Test 1: Creates your business record in the database</li>
                <li>Test 2: Adds a test product to verify the product creation flow</li>
                <li>Helps identify if the issue is with authentication or database schema</li>
                <li>Test product is automatically removed after 5 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
