'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  UserPlusIcon,
  PhoneIcon,
  MapPinIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { useCustomers } from '@/hooks/useSupabase'

export default function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { customers, loading, error } = useCustomers()

  // Transform customers data
  const customersData = useMemo(() => {
    if (!customers) return []
    
    return customers.map(customer => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone || 'No phone',
      address: customer.address || 'No address',
      totalOrders: 0, // TODO: Calculate from orders
      totalAmount: 0, // TODO: Calculate from orders  
      lastOrderDate: new Date().toISOString().split('T')[0], // TODO: Get from orders
      balance: 0, // TODO: Calculate balance
      status: 'Active'
    }))
  }, [customers])

  const filteredCustomers = customersData.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  )

  // Calculate totals
  const totalToCollect = customersData.reduce((sum, customer) => 
    sum + (customer.balance > 0 ? customer.balance : 0), 0
  )
  
  const totalToGive = customersData.reduce((sum, customer) => 
    sum + (customer.balance < 0 ? Math.abs(customer.balance) : 0), 0
  )

  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600' // They owe us
    if (balance < 0) return 'text-red-600'   // We owe them
    return 'text-gray-600'                   // Balanced
  }

  const getBalanceText = (balance: number) => {
    if (balance > 0) return `₹${balance.toLocaleString()}`
    if (balance < 0) return `₹${Math.abs(balance).toLocaleString()}`
    return '₹0'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    })
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
          <p className="text-red-600 mb-4">Error loading customers: {error}</p>
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
            <h1 className="text-xl font-bold text-gray-900">Customers</h1>
            <Link href="/dashboard/customers/add" className="p-2 text-blue-600">
              <UserPlusIcon className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">You will get</p>
                <p className="text-xl font-bold text-green-600">₹{totalToCollect.toLocaleString()}</p>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <ArrowTrendingDownIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">You will give</p>
                <p className="text-xl font-bold text-red-600">₹{totalToGive.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Customers List */}
        {filteredCustomers.length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
            <p className="text-gray-600 mb-4">Add customers to track their orders and manage relationships.</p>
            <Link href="/dashboard/customers/add">
              <button className="bg-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors">
                Add Customer
              </button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredCustomers.map((customer, index) => (
              <motion.div
                key={customer.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{customer.name}</h3>
                    <div className="flex items-center space-x-1 text-gray-600 mt-1">
                      <PhoneIcon className="h-4 w-4" />
                      <span className="text-sm">{customer.phone}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 mt-1">
                      <MapPinIcon className="h-4 w-4" />
                      <span className="text-sm">{customer.address}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getBalanceColor(customer.balance)}`}>
                      {customer.balance > 0 ? '+' : customer.balance < 0 ? '-' : ''}
                      {getBalanceText(customer.balance)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {customer.balance > 0 ? 'To Collect' : customer.balance < 0 ? 'To Pay' : 'Balanced'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Orders:</span>
                    <div className="text-gray-900 font-semibold">{customer.totalOrders}</div>
                  </div>
                  <div>
                    <span className="font-medium">Total Sales:</span>
                    <div className="text-gray-900 font-semibold">₹{customer.totalAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">Last Order:</span>
                    <div className="text-gray-900 font-semibold">{formatDate(customer.lastOrderDate)}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex space-x-3">
                    <button className="flex items-center space-x-1 text-blue-600 hover:text-blue-700">
                      <EyeIcon className="h-4 w-4" />
                      <span className="text-sm">View Orders</span>
                    </button>
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-gray-700">
                      <PencilIcon className="h-4 w-4" />
                      <span className="text-sm">Edit</span>
                    </button>
                  </div>
                  
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customer.status === 'Active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
