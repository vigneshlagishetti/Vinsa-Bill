'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function CleanupTestOrdersPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [deletedCount, setDeletedCount] = useState(0)

  const cleanupTestOrders = async () => {
    if (!confirm('This will delete orders without proper customer data. Are you sure?')) {
      return
    }

    setLoading(true)
    setMessage('Cleaning up test orders...')

    try {
      const response = await fetch('/api/debug/cleanup-test-orders', {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        setDeletedCount(result.deletedCount || 0)
        setMessage(`Successfully cleaned up ${result.deletedCount || 0} test orders!`)
      } else {
        throw new Error('Failed to cleanup test orders')
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cleanup Test Orders</h1>
          <p className="text-gray-600">Remove orders without proper customer information</p>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <div className="flex items-center mb-2">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Warning</h3>
          </div>
          <p className="text-yellow-700 text-sm">
            This will permanently delete orders that don&apos;t have proper customer information (name, email, or phone). 
            This is useful for removing test data or dummy orders.
          </p>
        </div>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={cleanupTestOrders}
          disabled={loading}
          className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
            loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          <TrashIcon className="h-5 w-5" />
          <span>{loading ? 'Cleaning up...' : 'Cleanup Test Orders'}</span>
        </motion.button>

        {/* Results */}
        {message && (
          <div className={`mt-6 p-4 rounded-lg ${
            message.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
          }`}>
            <p>{message}</p>
            {deletedCount > 0 && (
              <p className="mt-2 text-sm">
                <Link href="/dashboard/orders" className="underline hover:no-underline">
                  View updated orders →
                </Link>
              </p>
            )}
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">What this does:</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• Finds orders without customer_name, customer_email, or customer_phone</li>
            <li>• Deletes orders that appear to be test data or dummy entries</li>
            <li>• Keeps orders with real customer information</li>
            <li>• Cannot be undone - use with caution</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
