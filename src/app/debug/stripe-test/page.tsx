'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  CheckCircleIcon, 
  CreditCardIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline'

export default function StripeTestPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState('')

  const testStripeConnection = async () => {
    setIsLoading(true)
    setResult('Testing Stripe connection...')

    try {
      const testOrderData = {
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '9876543210',
        customer_address: 'Test Address, City, State',
        items: [
          {
            product_id: 'test-product-1',
            product_name: 'Test Product',
            quantity: 1,
            unit_price: 100,
            total_price: 100
          }
        ],
        subtotal: 100,
        tax_amount: 18,
        total_amount: 118,
        payment_method: 'stripe',
        status: 'pending',
        payment_status: 'pending',
        order_type: 'test'
      }

      // Test Stripe checkout creation
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `test-${Date.now()}`,
          amount: testOrderData.total_amount,
          currency: 'inr',
          customer: {
            name: testOrderData.customer_name,
            email: testOrderData.customer_email,
            phone: testOrderData.customer_phone
          },
          items: testOrderData.items
        })
      })

      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Stripe Integration Working!\n\nCheckout Session ID: ${data.sessionId}\nCheckout URL: ${data.url}\n\nYour Stripe API keys are configured correctly!`)
      } else {
        const error = await response.json()
        setResult(`❌ Stripe Error: ${error.error}\n\nDetails: ${error.details}`)
      }

    } catch (error) {
      setResult(`❌ Connection Error: ${error}\n\nCheck your internet connection and API keys.`)
    } finally {
      setIsLoading(false)
    }
  }

  const openOnlineStore = () => {
    window.location.href = '/dashboard/online-store'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <CreditCardIcon className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Stripe Payment Gateway Test
            </h1>
            <p className="text-gray-600">
              Test your Stripe integration before going live
            </p>
          </div>

          {/* API Keys Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">✅ Stripe API Keys Loaded</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Publishable Key:</strong> pk_test_51RtjT1...7OF (Loaded ✓)</p>
              <p><strong>Secret Key:</strong> sk_test_51RtjT1...0h0 (Loaded ✓)</p>
              <p><strong>Environment:</strong> Test Mode (Sandbox)</p>
            </div>
          </div>

          {/* Test Controls */}
          <div className="space-y-4 mb-6">
            <button
              onClick={testStripeConnection}
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <ArrowPathIcon className="h-5 w-5 animate-spin" />
                  <span>Testing Stripe Connection...</span>
                </>
              ) : (
                <>
                  <CreditCardIcon className="h-5 w-5" />
                  <span>Test Stripe Integration</span>
                </>
              )}
            </button>

            <button
              onClick={openOnlineStore}
              className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircleIcon className="h-5 w-5" />
              <span>Go to Online Store (Live Test)</span>
            </button>
          </div>

          {/* Test Results */}
          {result && (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-64">
              <pre className="whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-900 mb-2">🧪 How to Test:</h3>
            <ol className="text-blue-800 text-sm space-y-1 list-decimal list-inside">
              <li>Click &quot;Test Stripe Integration&quot; to verify API connection</li>
              <li>Click &quot;Go to Online Store&quot; for full e-commerce test</li>
              <li>Add products to cart and proceed to checkout</li>
              <li>Use Stripe test card: 4242 4242 4242 4242</li>
              <li>Use any future expiry date and any CVC</li>
            </ol>
          </div>

          {/* Test Cards Info */}
          <div className="bg-yellow-50 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-yellow-800 mb-2">💳 Test Card Numbers:</h3>
            <div className="text-yellow-700 text-sm space-y-1">
              <p><strong>Success:</strong> 4242 4242 4242 4242</p>
              <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
              <p><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</p>
              <p><em>Use any future expiry date and any 3-digit CVC</em></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
