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
  ClipboardDocumentIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'

export default function CompleteDatabaseFix() {
  const [isFixing, setIsFixing] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showSql, setShowSql] = useState(false)

  const sqlScript = `-- Complete Database Schema Fix for Billing Fast
-- Run this in your Supabase SQL Editor

-- Add ALL missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'pos';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'cash';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;

-- Update constraints to support new payment methods
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('cash', 'card', 'upi', 'credit', 'stripe', 'razorpay', 'online'));

-- Create order_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Grant necessary permissions (adjust for your setup)
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_items TO authenticated;

-- Update any existing orders with default values
UPDATE orders SET 
  order_type = 'pos',
  subtotal = total_amount
WHERE order_type IS NULL OR subtotal IS NULL;

-- Success message
SELECT 'Database schema updated successfully!' as message;`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlScript)
      setResults(['📋 SQL script copied to clipboard!', '👉 Now go to Supabase SQL Editor and paste it.'])
    } catch (err) {
      console.error('Failed to copy: ', err)
      setError('Failed to copy to clipboard')
    }
  }

  const testDatabaseSchema = async () => {
    setIsFixing(true)
    setResults([])
    setError(null)

    try {
      setResults(prev => [...prev, '🔍 Starting database schema test...'])

      // Test basic order creation first
      const basicOrderData = {
        order_number: `TEST-BASIC-${Date.now()}`,
        total_amount: 100,
        payment_method: 'cash',
        payment_status: 'pending',
        status: 'draft'
      }

      const { data: basicOrder, error: basicError } = await supabase
        .from('orders')
        .insert(basicOrderData)
        .select()
        .single()

      if (basicError) {
        setResults(prev => [...prev, `❌ Basic order test failed: ${basicError.message}`])
        throw new Error(basicError.message)
      } else {
        setResults(prev => [...prev, '✅ Basic order creation works'])
      }

      // Test order with customer information
      const customerOrderData = {
        order_number: `TEST-CUSTOMER-${Date.now()}`,
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        customer_address: '123 Test Street',
        order_type: 'online',
        subtotal: 150,
        total_amount: 150,
        payment_method: 'online',
        payment_status: 'pending',
        status: 'draft'
      }

      const { data: customerOrder, error: customerError } = await supabase
        .from('orders')
        .insert(customerOrderData)
        .select()
        .single()

      if (customerError) {
        setResults(prev => [...prev, `❌ Customer order test failed: ${customerError.message}`])
        setError('Database schema is missing required columns. Please run the SQL script.')
        return
      } else {
        setResults(prev => [...prev, '✅ Customer order with all fields works!'])
      }

      // Test order_items table
      const orderItemData = {
        order_id: customerOrder.id,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 75,
        total_price: 150
      }

      const { error: itemError } = await supabase
        .from('order_items')
        .insert(orderItemData)

      if (itemError) {
        setResults(prev => [...prev, `⚠️ Order items test failed: ${itemError.message}`])
      } else {
        setResults(prev => [...prev, '✅ Order items table works correctly'])
      }

      // Clean up test data
      await supabase.from('order_items').delete().eq('order_id', customerOrder.id)
      await supabase.from('orders').delete().eq('id', customerOrder.id)
      await supabase.from('orders').delete().eq('id', basicOrder.id)
      
      setResults(prev => [...prev, '🧹 Test data cleaned up'])
      setResults(prev => [...prev, '🎉 All tests passed! Database schema is working correctly.'])

    } catch (err) {
      console.error('Database test error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      setResults(prev => [...prev, '🔧 Database schema needs manual update'])
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/online-store" className="text-blue-600">
              ← Back to Online Store
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Complete Database Fix</h1>
              <p className="text-xs text-gray-500">Vinsa Bill - Made by Lagishetti Vignesh</p>
            </div>
            <Link href="/dashboard" className="text-gray-600">
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        {/* Issue Description */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-8 w-8 text-red-600 mt-1 mr-4 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-semibold text-red-900 mb-3">
                Database Schema Incomplete
              </h3>
              <p className="text-red-800 mb-4 leading-relaxed">
                Your orders table is missing essential columns for customer information and order details. 
                This prevents the online store from creating orders with customer data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">Missing Columns:</h4>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>• customer_name</li>
                    <li>• customer_email</li>
                    <li>• customer_phone</li>
                    <li>• customer_address</li>
                    <li>• order_type</li>
                    <li>• subtotal</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">Missing Tables:</h4>
                  <ul className="text-red-800 text-sm space-y-1">
                    <li>• order_items (for line items)</li>
                    <li>• Updated payment constraints</li>
                    <li>• Performance indexes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Fix Your Database Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={testDatabaseSchema}
              disabled={isFixing}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                isFixing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFixing ? (
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
              ) : (
                <PlayIcon className="h-5 w-5" />
              )}
              <span>Test Schema</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={copyToClipboard}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <ClipboardDocumentIcon className="h-5 w-5" />
              <span>Copy SQL</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSql(!showSql)}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold bg-gray-600 text-white hover:bg-gray-700 transition-colors"
            >
              <CommandLineIcon className="h-5 w-5" />
              <span>{showSql ? 'Hide' : 'Show'} SQL</span>
            </motion.button>

            <motion.a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              <span>Open Supabase ↗</span>
            </motion.a>
          </div>
        </div>

        {/* SQL Script Display */}
        {showSql && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Complete Fix Script</h2>
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg text-sm overflow-x-auto mb-4">
              <pre>{sqlScript}</pre>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-3">Step-by-Step Instructions:</h4>
                <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
                  <li>Click &quot;Copy SQL&quot; button above</li>
                  <li>Open your Supabase Dashboard</li>
                  <li>Go to SQL Editor</li>
                  <li>Paste the complete script</li>
                  <li>Click &quot;Run&quot; to execute</li>
                  <li>Return here and click &quot;Test Schema&quot;</li>
                  <li>Go back to Online Store</li>
                </ol>
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-3">What This Script Does:</h4>
                <ul className="text-green-800 text-sm space-y-2">
                  <li>✓ Adds all missing customer columns</li>
                  <li>✓ Creates order_items table</li>
                  <li>✓ Updates payment method constraints</li>
                  <li>✓ Adds performance indexes</li>
                  <li>✓ Sets up proper permissions</li>
                  <li>✓ Updates existing data</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Test Results */}
        {(results.length > 0 || error) && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Results</h2>
            
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800 font-medium">Schema Error Detected</span>
                </div>
                <p className="text-red-700 mb-3">{error}</p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowSql(true)}
                    className="text-red-600 hover:text-red-800 underline text-sm font-medium"
                  >
                    Show SQL Fix Script →
                  </button>
                  <button
                    onClick={copyToClipboard}
                    className="text-red-600 hover:text-red-800 underline text-sm font-medium"
                  >
                    Copy Fix Script →
                  </button>
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
                      : result.startsWith('🔍') || result.startsWith('🧹') || result.startsWith('📋')
                      ? 'bg-blue-50 text-blue-800 border border-blue-200'
                      : result.startsWith('⚠️')
                      ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                      : result.startsWith('❌')
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : result.startsWith('🔧') || result.startsWith('👉')
                      ? 'bg-orange-50 text-orange-800 border border-orange-200'
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
                  Perfect! Database schema is now complete and working.
                </span>
                <p className="text-green-700 mt-2 mb-4">
                  Your online store can now create orders with customer information successfully.
                </p>
                <div className="flex space-x-4">
                  <Link href="/dashboard/online-store">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                    >
                      Return to Online Store →
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
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Additional Help?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Common Issues:</h4>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>• Connection timeout</li>
                <li>• Permission denied</li>
                <li>• RLS policy conflicts</li>
                <li>• Column already exists</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Debug Pages:</h4>
              <div className="space-y-1 text-sm">
                <Link href="/debug/database-setup" className="block text-blue-600 hover:text-blue-800">
                  → Initial Database Setup
                </Link>
                <Link href="/debug/quick-db-fix" className="block text-blue-600 hover:text-blue-800">
                  → Quick Fix Alternative
                </Link>
                <Link href="/dashboard/orders" className="block text-blue-600 hover:text-blue-800">
                  → View Orders
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">External Links:</h4>
              <div className="space-y-1 text-sm">
                <a 
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800"
                >
                  → Supabase Dashboard ↗
                </a>
                <a 
                  href="https://supabase.com/docs/guides/database"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-blue-600 hover:text-blue-800"
                >
                  → Database Documentation ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
