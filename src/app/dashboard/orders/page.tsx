'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ChevronDownIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PrinterIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'
import { useOrders } from '@/hooks/useSupabase'

// Extended Order type to include the additional fields we store
interface ExtendedOrder {
  id: string
  business_id: string
  customer_id?: string
  total_amount: number
  discount?: number
  tax_amount?: number
  payment_method: 'cash' | 'card' | 'upi' | 'credit'
  payment_status: 'pending' | 'paid' | 'partial'
  status: 'draft' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
  // Additional fields we store
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  customer_address?: string
  subtotal?: number
  order_type?: string
  order_number?: string
  order_items?: Array<{
    id: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
  }>
}

const dateFilters = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' }
]

export default function OrdersPage() {
  const [selectedFilter, setSelectedFilter] = useState('today')
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const { orders, loading, error } = useOrders()

  // Transform and calculate summary data
  const summaryData = useMemo(() => {
    if (!orders) return { toCollect: 0, totalSales: 0, pastCollection: 0, totalOrders: 0 }

    const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0)
    const toCollect = orders
      .filter(order => order.payment_status === 'pending')
      .reduce((sum, order) => sum + order.total_amount, 0)
    const pastCollection = orders
      .filter(order => order.payment_status === 'paid')
      .reduce((sum, order) => sum + order.total_amount, 0)

    return {
      toCollect,
      totalSales,
      pastCollection,
      totalOrders: orders.length
    }
  }, [orders])

  // Transform orders data
  const ordersData = useMemo(() => {
    if (!orders || orders.length === 0) return []
    
    return orders.map((order: any) => {
      // Debug log to see what data we're getting
      console.log('Processing order:', {
        id: order.id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_email: order.customer_email,
        total_amount: order.total_amount,
        subtotal: order.subtotal,
        tax_amount: order.tax_amount,
        order_type: order.order_type,
        created_at: order.created_at
      })
      
      return {
        id: order.order_number || order.id.slice(-6).toUpperCase(),
        customerName: order.customer_name || 'No Customer Data',
        customerPhone: order.customer_phone || 'No phone',
        customerEmail: order.customer_email || 'No email',
        items: 1, // Default to 1 if no order_items data
        amount: order.total_amount,
        subtotal: order.subtotal || (order.total_amount / 1.18), // Calculate subtotal if not available
        taxAmount: order.tax_amount || (order.total_amount - (order.total_amount / 1.18)), // Calculate tax if not available
        time: new Date(order.created_at).toLocaleTimeString('en-IN', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        date: new Date(order.created_at).toLocaleDateString('en-IN'),
        status: order.status === 'completed' ? 'Completed' : 
                order.status === 'cancelled' ? 'Cancelled' : 
                order.status === 'draft' ? 'Draft' : 'Completed',
        paymentStatus: order.payment_status === 'paid' ? 'Paid' : 
                      order.payment_status === 'partial' ? 'Partial' : 'Pending',
        paymentMethod: order.payment_method === 'card' ? 'Card' : 
                       order.payment_method === 'upi' ? 'UPI' :
                       order.payment_method === 'credit' ? 'Credit' : 'Cash',
        orderType: order.order_type || 'POS',
        orderItems: []
      }
    })
  }, [orders])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800'
      case 'Processing': return 'bg-blue-100 text-blue-800'
      case 'Pending': return 'bg-yellow-100 text-yellow-800'
      case 'Cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800'
      case 'Pending': return 'bg-orange-100 text-orange-800'
      case 'Failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCurrentFilterLabel = () => {
    return dateFilters.find(filter => filter.value === selectedFilter)?.label || 'Today'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading orders: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/pos" className="text-blue-600">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Today Tally</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Date Filter */}
        <div className="mb-6">
          <div className="relative">
            <button
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center justify-between w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-900">{getCurrentFilterLabel()}</span>
              </div>
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </button>

            {showDateDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {dateFilters.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setSelectedFilter(filter.value)
                      setShowDateDropdown(false)
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 ${
                      selectedFilter === filter.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">To Collect</p>
                <p className="text-xl font-bold text-orange-600">₹{summaryData.toCollect.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-xl font-bold text-blue-600">₹{summaryData.totalSales.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Past Collection</p>
                <p className="text-xl font-bold text-green-600">₹{summaryData.pastCollection.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-xl font-bold text-purple-600">{summaryData.totalOrders}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
            {ordersData.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">{ordersData.length} orders found</p>
            )}
          </div>

          {ordersData.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingBagIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600 mb-4">Start selling to see your orders here</p>
              <Link 
                href="/dashboard/pos"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Selling
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {ordersData.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + (index * 0.1) }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-gray-900">{order.customerName}</h4>
                        <span className="font-bold text-blue-600">₹{order.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        {order.customerPhone !== 'No phone' && (
                          <span>{order.customerPhone}</span>
                        )}
                        {order.customerEmail !== 'No email' && (
                          <span>• {order.customerEmail}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                        <span>Order #{order.id}</span>
                        <span>•</span>
                        <span>{order.date} at {order.time}</span>
                        <span>•</span>
                        <span>{order.items} item{order.items !== 1 ? 's' : ''}</span>
                        <span>•</span>
                        <span>{order.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {order.orderType}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View Order"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Print Receipt"
                      >
                        <PrinterIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Order Details Breakdown */}
                  {order.subtotal && order.taxAmount > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{Math.round(order.subtotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>₹{Math.round(order.taxAmount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-medium text-gray-900">
                          <span>Total:</span>
                          <span>₹{order.amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
