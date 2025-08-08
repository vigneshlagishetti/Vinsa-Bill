'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ShoppingCartIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CreditCardIcon,
  CheckCircleIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  stock_quantity: number
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
  address: string
}

interface OrderSummary {
  subtotal: number
  tax: number
  total: number
}

export default function PurchasePage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    address: ''
  })
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({
    subtotal: 0,
    tax: 0,
    total: 0
  })
  const [paymentMethod, setPaymentMethod] = useState('online')
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('onlineStoreCart')
    if (storedCart) {
      const { items, total } = JSON.parse(storedCart)
      setCartItems(items)
      
      // Calculate order summary
      const subtotal = items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0)
      const tax = subtotal * 0.18 // 18% GST
      setOrderSummary({
        subtotal,
        tax,
        total: subtotal + tax
      })
    } else {
      // Redirect back if no cart data
      router.push('/dashboard/online-store')
    }
  }, [router])

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(cartItems.filter(item => item.id !== id))
    } else {
      setCartItems(cartItems.map(item =>
        item.id === id
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
    
    // Recalculate totals
    const updatedItems = cartItems.map(item =>
      item.id === id
        ? { ...item, quantity: newQuantity }
        : item
    ).filter(item => item.quantity > 0)
    
    const subtotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.18
    setOrderSummary({
      subtotal,
      tax,
      total: subtotal + tax
    })
  }

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    return customerInfo.name.trim() !== '' &&
           customerInfo.email.trim() !== '' &&
           customerInfo.phone.trim() !== '' &&
           cartItems.length > 0
  }

  const processOrder = async () => {
    if (!validateForm()) {
      alert('Please fill in all required fields')
      return
    }

    setIsProcessing(true)

    try {
      // Create order
      const orderData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        customer_address: customerInfo.address,
        items: cartItems.map(item => ({
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.price * item.quantity
        })),
        subtotal: orderSummary.subtotal,
        tax_amount: orderSummary.tax,
        total_amount: orderSummary.total,
        payment_method: paymentMethod,
        status: paymentMethod === 'cash' ? 'completed' : 'pending',
        payment_status: paymentMethod === 'cash' ? 'paid' : 'pending',
        order_type: 'online_store'
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        const result = await response.json()
        setOrderId(result.orderId)

        if (paymentMethod === 'online') {
          // Process online payment with Stripe
          const paymentResponse = await fetch('/api/stripe/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: result.orderId,
              amount: orderSummary.total,
              currency: 'inr',
              customer: {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone
              },
              items: cartItems
            }),
          })

          if (paymentResponse.ok) {
            const { url } = await paymentResponse.json()
            // Clear cart before redirecting to payment
            localStorage.removeItem('onlineStoreCart')
            window.location.href = url
          } else {
            throw new Error('Payment processing failed')
          }
        } else {
          // Cash payment - order complete
          setOrderSuccess(true)
          localStorage.removeItem('onlineStoreCart')
        }
      } else {
        throw new Error('Order creation failed')
      }
    } catch (error) {
      console.error('Order processing error:', error)
      alert('Failed to process order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-lg"
        >
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Your order #{orderId} has been placed successfully.
          </p>
          <div className="space-y-3">
            <Link href="/dashboard/online-store">
              <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                Continue Shopping
              </button>
            </Link>
            <Link href="/dashboard/orders">
              <button className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                View My Orders
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/online-store" className="text-blue-600">
              ← Back to Store
            </Link>
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">Checkout</h1>
              <p className="text-xs text-gray-500">Vinsa Bill - Made by Lagishetti Vignesh</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customer Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Customer Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Delivery Address
                  </label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your delivery address"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Payment Method
              </h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Online Payment</p>
                    <p className="text-sm text-gray-600">Pay securely with Stripe</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Cash on Delivery</p>
                    <p className="text-sm text-gray-600">Pay when you receive</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                Order Items ({cartItems.length})
              </h2>
              
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-blue-600">{item.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">₹{item.price} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-blue-600 min-w-[80px] text-right">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>₹{orderSummary.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST):</span>
                  <span>₹{orderSummary.tax.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>₹{orderSummary.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={processOrder}
                disabled={isProcessing || !validateForm()}
                className={`w-full py-4 rounded-xl font-semibold transition-colors ${
                  isProcessing || !validateForm()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isProcessing ? 'Processing...' : `Place Order - ₹${orderSummary.total.toLocaleString()}`}
              </motion.button>
              
              <p className="text-xs text-gray-500 text-center mt-3">
                By placing this order, you agree to our terms and conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
