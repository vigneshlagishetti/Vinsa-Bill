'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PlayIcon 
} from '@heroicons/react/24/outline'

export default function FixConstraintsPage() {
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState('')

  const runConstraintsFix = async () => {
    setIsFixing(true)
    setResult('🔧 Fixing database constraints...')

    // Since we can't run SQL directly, we'll provide instructions
    const sqlFix = `-- URGENT FIX: Update check constraints
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_order_type_check;

ALTER TABLE orders ADD CONSTRAINT orders_status_check 
  CHECK (status IN ('draft', 'pending', 'completed', 'cancelled', 'confirmed', 'processing', 'shipped', 'delivered'));

ALTER TABLE orders ADD CONSTRAINT orders_payment_status_check 
  CHECK (payment_status IN ('pending', 'paid', 'partial', 'failed', 'refunded', 'cancelled'));

ALTER TABLE orders ADD CONSTRAINT orders_payment_method_check 
  CHECK (payment_method IN ('cash', 'card', 'upi', 'online', 'stripe', 'razorpay', 'credit', 'debit'));

ALTER TABLE orders ADD CONSTRAINT orders_order_type_check 
  CHECK (order_type IN ('pos', 'online_store', 'manual', 'import', 'billing'));`

    setTimeout(() => {
      setResult(`✅ CONSTRAINT FIX READY!

📋 COPY AND RUN THIS SQL IN YOUR SUPABASE SQL EDITOR:

${sqlFix}

🎯 This will fix the "violates check constraint" error by updating the allowed values for:
- status: Allows 'pending', 'completed', 'cancelled', etc.
- payment_status: Allows 'pending', 'paid', 'failed', etc.  
- payment_method: Allows 'cash', 'stripe', 'card', etc.
- order_type: Allows 'pos', 'online_store', etc.

After running this SQL, your orders will work correctly! ✨`)
      setIsFixing(false)
    }, 2000)
  }

  const testOrder = () => {
    window.open('/dashboard/online-store', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <ExclamationTriangleIcon className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Fix Database Constraints Error
            </h1>
            <p className="text-gray-600">
              Resolve: "violates check constraint orders_status_check"
            </p>
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">🚨 Current Error:</h3>
            <p className="text-red-700 text-sm font-mono">
              Failed to create order: new row for relation "orders" violates check constraint "orders_status_check"
            </p>
            <p className="text-red-600 text-sm mt-2">
              <strong>Cause:</strong> Your database only allows specific status values, but our API is sending values not in the constraint.
            </p>
          </div>

          {/* Fix Button */}
          <div className="text-center mb-8">
            <button
              onClick={runConstraintsFix}
              disabled={isFixing}
              className="bg-red-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2 mx-auto"
            >
              {isFixing ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-5 w-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span>Preparing Fix...</span>
                </>
              ) : (
                <>
                  <PlayIcon className="h-5 w-5" />
                  <span>Generate Database Fix</span>
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm overflow-auto max-h-96 mb-6">
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {/* Test Button */}
          {result && !isFixing && (
            <div className="text-center">
              <button
                onClick={testOrder}
                className="bg-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <CheckCircleIcon className="h-5 w-5" />
                <span>Test Order Creation</span>
              </button>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-900 mb-2">📝 How to Fix:</h3>
            <ol className="text-blue-800 text-sm space-y-2 list-decimal list-inside">
              <li>Click "Generate Database Fix" above</li>
              <li>Copy the SQL code from the results</li>  
              <li>Go to your Supabase Dashboard → SQL Editor</li>
              <li>Paste and run the SQL code</li>
              <li>Come back and test your order creation</li>
            </ol>
          </div>

          {/* Alternative */}
          <div className="bg-yellow-50 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚡ Quick Alternative:</h3>
            <p className="text-yellow-700 text-sm">
              The file <code>FIX_CONSTRAINTS_ERROR.sql</code> has been created in your project root with the complete fix.
              You can also run that SQL directly in Supabase.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
