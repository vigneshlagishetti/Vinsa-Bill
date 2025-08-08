'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  XMarkIcon, 
  CreditCardIcon, 
  BanknotesIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

interface OrderData {
  business_id?: string
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_address: string
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
  subtotal: number
  tax_amount: number
  total_amount: number
  payment_method: string
  status: string
  payment_status: string
  order_type: string
}

interface StripePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  orderData: OrderData
  onSuccess: (orderId: string) => void
  onError: (error: string) => void
}

export default function StripePaymentModal({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  onError
}: StripePaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'cash'>('stripe')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleStripePayment = async () => {
    setIsProcessing(true)
    
    try {
      // First, create the order in the database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          payment_method: 'stripe',
          payment_status: 'pending'
        })
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.details || errorData.error || 'Failed to create order')
      }

      const orderResult = await orderResponse.json()
      const orderId = orderResult.orderId

      // Create Stripe checkout session
      const checkoutResponse = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId,
          amount: orderData.total_amount,
          currency: 'inr',
          customer: {
            name: orderData.customer_name,
            email: orderData.customer_email,
            phone: orderData.customer_phone
          },
          items: orderData.items
        })
      })

      if (!checkoutResponse.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await checkoutResponse.json()
      
      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else {
        throw new Error('No checkout URL received')
      }

    } catch (error) {
      console.error('Stripe payment error:', error)
      onError(error instanceof Error ? error.message : 'Payment failed')
      setIsProcessing(false)
    }
  }

  const handleCashPayment = async () => {
    setIsProcessing(true)
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderData,
          payment_method: 'cash',
          payment_status: 'pending',
          status: 'completed'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || errorData.error || 'Failed to create order')
      }

      const result = await response.json()
      onSuccess(result.orderId)
      
    } catch (error) {
      console.error('Cash payment error:', error)
      onError(error instanceof Error ? error.message : 'Order failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = async () => {
    if (paymentMethod === 'stripe') {
      await handleStripePayment()
    } else {
      await handleCashPayment()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Choose Payment Method</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Items ({orderData.items.length})</span>
                    <span>₹{orderData.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (GST)</span>
                    <span>₹{orderData.tax_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{orderData.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-3 mb-6">
                <label className="flex items-center p-4 border-2 border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors">
                  <input
                    type="radio"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                    className="mr-3"
                  />
                  <CreditCardIcon className="h-6 w-6 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Pay with Card</p>
                    <p className="text-sm text-gray-600">Secure payment via Stripe</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cash')}
                    className="mr-3"
                  />
                  <BanknotesIcon className="h-6 w-6 text-green-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                </label>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Delivery Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Name:</strong> {orderData.customer_name}</p>
                  <p><strong>Email:</strong> {orderData.customer_email}</p>
                  <p><strong>Phone:</strong> {orderData.customer_phone}</p>
                  <p><strong>Address:</strong> {orderData.customer_address}</p>
                </div>
              </div>

              {/* Action Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePayment}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  isProcessing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : paymentMethod === 'stripe'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isProcessing ? (
                  <>
                    <ArrowPathIcon className="h-5 w-5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : paymentMethod === 'stripe' ? (
                  <>
                    <CreditCardIcon className="h-5 w-5" />
                    <span>Pay with Card - ₹{orderData.total_amount.toLocaleString()}</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Place Order - ₹{orderData.total_amount.toLocaleString()}</span>
                  </>
                )}
              </motion.button>

              {paymentMethod === 'stripe' && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  You&apos;ll be redirected to Stripe&apos;s secure checkout page
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  )
}
