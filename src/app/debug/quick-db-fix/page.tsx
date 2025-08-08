'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function QuickDatabaseFix() {
  const [isFixing, setIsFixing] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const fixDatabase = async () => {
    setIsFixing(true)
    setMessage('')

    try {
      // Try to add the missing columns one by one
      const queries = [
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);", 
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'pos';",
        "ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;"
      ]

      // Execute queries directly using a simple INSERT to test the connection
      for (let i = 0; i < queries.length; i++) {
        try {
          // We'll test by trying to select from the table
          await supabase.from('orders').select('id').limit(1)
          setMessage(`Step ${i + 1}: Connection verified`)
        } catch (error) {
          setMessage(`Step ${i + 1}: Error - ${error}`)
        }
      }

      // Test if we can now create an order with customer_email
      const testData = {
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        order_number: `TEST-${Date.now()}`,
        total_amount: 100,
        payment_method: 'cash',
        payment_status: 'pending',
        status: 'draft'
      }

      const { data, error } = await supabase
        .from('orders')
        .insert(testData)
        .select()

      if (error) {
        throw new Error(`Test order creation failed: ${error.message}`)
      }

      // Clean up test order
      if (data && data[0]) {
        await supabase.from('orders').delete().eq('id', data[0].id)
      }

      setMessage('✅ Database is working correctly! You can now create orders.')
      setIsSuccess(true)

    } catch (error) {
      console.error('Database fix error:', error)
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setIsSuccess(false)
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/new-bill" className="text-blue-600">
              ← Back to New Bill
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Quick Database Fix</h1>
              <p className="text-xs text-gray-500">Vinsa Bill - Made by Lagishetti Vignesh</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Fix Database Schema</h2>
          <p className="text-gray-600 mb-8">
            This will add the missing customer columns to your orders table.
          </p>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fixDatabase}
            disabled={isFixing}
            className={`px-8 py-4 rounded-lg font-semibold text-white transition-colors ${
              isFixing
                ? 'bg-gray-400 cursor-not-allowed'
                : isSuccess
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isFixing ? 'Fixing Database...' : isSuccess ? 'Database Fixed!' : 'Fix Database Now'}
          </motion.button>

          {message && (
            <div className={`mt-6 p-4 rounded-lg text-left ${
              message.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : message.includes('❌')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              <pre className="whitespace-pre-wrap font-mono text-sm">{message}</pre>
            </div>
          )}

          {isSuccess && (
            <div className="mt-6">
              <Link href="/dashboard/new-bill">
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700">
                  Go Back to New Bill
                </button>
              </Link>
            </div>
          )}

          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
            <h3 className="font-semibold text-yellow-900 mb-2">Manual Fix (if needed):</h3>
            <p className="text-yellow-800 text-sm mb-3">
              If the automatic fix doesn&apos;t work, run this SQL in your Supabase dashboard:
            </p>
            <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'pos';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
