'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowUturnLeftIcon,
  UserIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Return {
  id: string
  return_number: string
  customer_name: string
  original_invoice: string
  date: string
  items: number
  total_amount: number
  refund_amount: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  return_type: 'exchange' | 'refund' | 'credit_note'
  reason: string
  notes: string
}

// Sample data - replace with actual data from Supabase
const sampleReturns: Return[] = [
  {
    id: '1',
    return_number: 'RET-001',
    customer_name: 'John Doe',
    original_invoice: 'INV-1001',
    date: '2024-01-15',
    items: 2,
    total_amount: 2500,
    refund_amount: 2500,
    status: 'completed',
    return_type: 'refund',
    reason: 'Product defective',
    notes: 'Customer reported charging issues'
  },
  {
    id: '2',
    return_number: 'RET-002',
    customer_name: 'Jane Smith',
    original_invoice: 'INV-1002',
    date: '2024-01-12',
    items: 1,
    total_amount: 1500,
    refund_amount: 0,
    status: 'approved',
    return_type: 'exchange',
    reason: 'Wrong size',
    notes: 'Exchange for larger size approved'
  },
  {
    id: '3',
    return_number: 'RET-003',
    customer_name: 'Bob Johnson',
    original_invoice: 'INV-1003',
    date: '2024-01-10',
    items: 3,
    total_amount: 4500,
    refund_amount: 4500,
    status: 'pending',
    return_type: 'credit_note',
    reason: 'Changed mind',
    notes: 'Customer prefers store credit'
  },
  {
    id: '4',
    return_number: 'RET-004',
    customer_name: 'Alice Brown',
    original_invoice: 'INV-1004',
    date: '2024-01-08',
    items: 1,
    total_amount: 800,
    refund_amount: 0,
    status: 'rejected',
    return_type: 'refund',
    reason: 'Damaged package',
    notes: 'Return period exceeded - 45 days'
  }
]

export default function ReturnsPage() {
  const [returns] = useState<Return[]>(sampleReturns)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | 'exchange' | 'refund' | 'credit_note'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')

  const filteredReturns = useMemo(() => {
    return returns.filter(returnItem => {
      const matchesSearch = 
        returnItem.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        returnItem.return_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        returnItem.original_invoice.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || returnItem.status === statusFilter
      const matchesType = typeFilter === 'all' || returnItem.return_type === typeFilter
      
      const matchesDate = () => {
        if (dateFilter === 'all') return true
        const returnDate = new Date(returnItem.date)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        switch (dateFilter) {
          case 'today':
            return returnDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return returnDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            return returnDate >= monthAgo
          default:
            return true
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDate()
    })
  }, [returns, searchQuery, statusFilter, typeFilter, dateFilter])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />
      case 'approved':
        return <CheckCircleIcon className="h-4 w-4 text-blue-600" />
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />
      case 'rejected':
        return <XCircleIcon className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'exchange':
        return 'bg-purple-100 text-purple-800'
      case 'refund':
        return 'bg-green-100 text-green-800'
      case 'credit_note':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const totalReturnAmount = filteredReturns.reduce((sum, returnItem) => sum + returnItem.total_amount, 0)
  const totalRefundAmount = filteredReturns.reduce((sum, returnItem) => sum + returnItem.refund_amount, 0)
  const pendingReturns = filteredReturns.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Returns & Exchanges</h1>
            </div>
            <Link href="/dashboard/returns/add">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" />
                <span>Process Return</span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ArrowUturnLeftIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{filteredReturns.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingReturns}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Return Value</p>
                <p className="text-2xl font-bold text-red-600">₹{totalReturnAmount.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Refund Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{totalRefundAmount.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search returns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="exchange">Exchange</option>
                <option value="refund">Refund</option>
                <option value="credit_note">Credit Note</option>
              </select>
              
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </div>

        {/* Returns List */}
        {filteredReturns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ArrowUturnLeftIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No returns found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all' 
                ? 'No returns match your search criteria.' 
                : 'No return requests have been created yet.'}
            </p>
            <Link href="/dashboard/returns/add">
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" />
                <span>Process Return</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReturns.map((returnItem, index) => (
              <motion.div
                key={returnItem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <ArrowUturnLeftIcon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{returnItem.return_number}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          <span>{returnItem.customer_name}</span>
                        </div>
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          <span>{returnItem.original_invoice}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{new Date(returnItem.date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(returnItem.status)}`}>
                      {getStatusIcon(returnItem.status)}
                      <span className="ml-1 capitalize">{returnItem.status}</span>
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(returnItem.return_type)}`}>
                      <span className="capitalize">{returnItem.return_type.replace('_', ' ')}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Items</p>
                    <p className="text-lg font-semibold text-gray-900">{returnItem.items}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Return Amount</p>
                    <p className="text-lg font-semibold text-gray-900">₹{returnItem.total_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Refund Amount</p>
                    <p className="text-lg font-semibold text-green-600">₹{returnItem.refund_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reason</p>
                    <p className="text-sm text-gray-600">{returnItem.reason}</p>
                  </div>
                </div>

                {returnItem.notes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
                    <p className="text-sm text-gray-600">{returnItem.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex space-x-3">
                    {returnItem.status === 'pending' && (
                      <>
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Approve
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                          Reject
                        </button>
                      </>
                    )}
                    {returnItem.status === 'approved' && (
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Mark Complete
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
