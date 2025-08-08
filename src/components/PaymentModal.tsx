'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCardIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: string
  amount: number
  orderDetails?: {
    customerName?: string
    itemCount?: number
    total?: number
  }
}

export default function PaymentModal({ isOpen, onClose, orderId, amount, orderDetails }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    try {
      setIsProcessing(true)
      setError(null)

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          amount,
          currency: 'inr',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (err: any) {
      setError(err.message)
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-medium">#{orderId}</span>
            </div>
            {orderDetails?.customerName && (
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{orderDetails.customerName}</span>
              </div>
            )}
            {orderDetails?.itemCount && (
              <div className="flex justify-between">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{orderDetails.itemCount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Payment Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5" />
              <span>Pay ₹{amount.toFixed(2)}</span>
            </>
          )}
        </motion.button>

        {/* Security Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          Payments are securely processed by Stripe. Your card details are never stored.
        </p>
        
        {/* Branding */}
        <p className="text-xs text-gray-400 text-center mt-2">
          Powered by Vinsa Bill - Made by Lagishetti Vignesh
        </p>
      </motion.div>
    </motion.div>
  )
}
