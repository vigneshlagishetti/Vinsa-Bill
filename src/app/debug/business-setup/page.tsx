'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
  ArrowPathIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline'

export default function BusinessSetup() {
  const [isCreating, setIsCreating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const createDefaultBusiness = async () => {
    setIsCreating(true)
    setResults([])
    setError(null)

    try {
      setResults(prev => [...prev, '🏢 Creating default business...'])

      // Check if business already exists
      const { data: existingBusiness, error: checkError } = await supabase
        .from('businesses')
        .select('id, name')
        .limit(1)

      if (checkError) {
        throw new Error(`Failed to check businesses: ${checkError.message}`)
      }

      if (existingBusiness && existingBusiness.length > 0) {
        setResults(prev => [...prev, `✅ Business already exists: ${existingBusiness[0].name}`])
        setResults(prev => [...prev, `📋 Business ID: ${existingBusiness[0].id}`])
        return
      }

      // Create default business
      const businessData = {
        name: 'Vinsa Bill Store',
        owner_id: 'default_owner',
        email: 'owner@vinsabill.com',
        phone: '+91-9876543210',
        address: '123 Business Street, City, State 123456',
        gst_number: '29ABCDE1234F1Z5',
        subscription_plan: 'free'
      }

      const { data: newBusiness, error: businessError } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single()

      if (businessError) {
        throw new Error(`Failed to create business: ${businessError.message}`)
      }

      setResults(prev => [...prev, `✅ Business created successfully!`])
      setResults(prev => [...prev, `🏢 Business Name: ${newBusiness.name}`])
      setResults(prev => [...prev, `📋 Business ID: ${newBusiness.id}`])
      setResults(prev => [...prev, `🎉 Your business is ready for orders!`])

      // Test creating a sample product
      setResults(prev => [...prev, '🛍️ Creating sample product...'])

      const productData = {
        business_id: newBusiness.id,
        name: 'Sample Product',
        description: 'A sample product for testing',
        price: 99.99,
        wholesale_price: 75.00,
        stock_quantity: 100,
        category: 'Electronics',
        unit: 'pcs',
        tax_rate: 18.00,
        brand: 'Vinsa',
        supplier: 'Default Supplier'
      }

      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (productError) {
        setResults(prev => [...prev, `⚠️ Product creation failed: ${productError.message}`])
      } else {
        setResults(prev => [...prev, `✅ Sample product created: ${newProduct.name}`])
        setResults(prev => [...prev, `💰 Price: ₹${newProduct.price}`])
      }

    } catch (err) {
      console.error('Business setup error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="text-blue-600">
              ← Back to Dashboard
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Business Setup</h1>
              <p className="text-xs text-gray-500">Vinsa Bill - Made by Lagishetti Vignesh</p>
            </div>
            <Link href="/debug/complete-db-fix" className="text-gray-600">
              DB Fix
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Setup Description */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <BuildingOffice2Icon className="h-8 w-8 text-blue-600 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                Initialize Your Business
              </h3>
              <p className="text-blue-800 mb-4 leading-relaxed">
                Your new database schema requires a business record to function properly. This will create 
                your default business profile and sample data to get you started.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">What this creates:</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Default business profile</li>
                    <li>• Business ID for all orders</li>
                    <li>• Sample product for testing</li>
                    <li>• Ready-to-use setup</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">Business Details:</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Name: Vinsa Bill Store</li>
                    <li>• Plan: Free tier</li>
                    <li>• GST ready</li>
                    <li>• Multi-location support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Create Business Profile</h2>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={createDefaultBusiness}
            disabled={isCreating}
            className={`flex items-center space-x-3 px-8 py-4 rounded-lg font-semibold text-lg transition-colors ${
              isCreating
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
            }`}
          >
            {isCreating ? (
              <ArrowPathIcon className="h-6 w-6 animate-spin" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
            <span>{isCreating ? 'Setting up business...' : 'Initialize Business'}</span>
          </motion.button>
        </div>

        {/* Results */}
        {(results.length > 0 || error) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Results</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">Setup Error</span>
                </div>
                <p className="text-red-700">{error}</p>
                <div className="mt-3">
                  <Link href="/debug/complete-db-fix">
                    <button className="text-red-600 hover:text-red-800 underline text-sm font-medium">
                      Check Database Fix Page →
                    </button>
                  </Link>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg font-mono text-sm ${
                    result.startsWith('✅') || result.startsWith('🎉')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : result.startsWith('🏢') || result.startsWith('🛍️') || result.startsWith('📋')
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : result.startsWith('⚠️')
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : result.startsWith('💰')
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-gray-50 text-gray-800 border border-gray-200'
                  }`}
                >
                  {result}
                </motion.div>
              ))}
            </div>

            {!error && results.some(r => r.includes('🎉')) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg"
              >
                <CheckCircleIcon className="h-8 w-8 text-green-600 inline mr-3" />
                <span className="text-green-800 font-semibold text-lg">
                  Perfect! Your business is ready to go.
                </span>
                <p className="text-green-700 mt-2 mb-4">
                  You can now create orders, manage customers, and process payments successfully.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/dashboard/online-store">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Try Online Store →
                    </motion.button>
                  </Link>
                  <Link href="/dashboard/purchase">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Test Purchase Flow →
                    </motion.button>
                  </Link>
                  <Link href="/dashboard/new-bill">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                    >
                      Create Bill →
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">What&apos;s Next?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customize Business:</h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Update business name</li>
                <li>• Add GST number</li>
                <li>• Configure address</li>
                <li>• Set up locations</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Add Products:</h4>
              <div className="space-y-1 text-sm">
                <Link href="/dashboard/add-product" className="block text-blue-600 hover:text-blue-800">
                  → Add New Product
                </Link>
                <Link href="/dashboard/stock" className="block text-blue-600 hover:text-blue-800">
                  → Manage Inventory
                </Link>
                <Link href="/debug/populate-products" className="block text-blue-600 hover:text-blue-800">
                  → Add Sample Products
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Start Selling:</h4>
              <div className="space-y-1 text-sm">
                <Link href="/dashboard/online-store" className="block text-blue-600 hover:text-blue-800">
                  → Online Store
                </Link>
                <Link href="/dashboard/pos" className="block text-blue-600 hover:text-blue-800">
                  → Point of Sale
                </Link>
                <Link href="/dashboard/customers" className="block text-blue-600 hover:text-blue-800">
                  → Manage Customers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
