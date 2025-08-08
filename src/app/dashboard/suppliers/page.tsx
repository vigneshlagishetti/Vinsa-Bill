'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  ShoppingCartIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline'

interface Supplier {
  id: string
  name: string
  contact_person: string
  phone: string
  email: string
  address: string
  gstin: string
  balance: number
  total_orders: number
  total_amount: number
  last_order_date: string
  rating: number
  status: 'active' | 'inactive'
  payment_terms: string
  notes: string
}

// Sample data - replace with actual data from Supabase
const sampleSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'ABC Wholesale Co.',
    contact_person: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh@abcwholesale.com',
    address: '123 Business District, Mumbai, Maharashtra 400001',
    gstin: '27ABCDE1234F1Z5',
    balance: -25000,
    total_orders: 45,
    total_amount: 850000,
    last_order_date: '2024-01-15',
    rating: 4.5,
    status: 'active',
    payment_terms: '30 days',
    notes: 'Reliable supplier for electronics'
  },
  {
    id: '2',
    name: 'XYZ Distributors',
    contact_person: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya@xyzdist.com',
    address: '456 Industrial Area, Delhi, Delhi 110001',
    gstin: '07FGHIJ5678K1L9',
    balance: 15000,
    total_orders: 28,
    total_amount: 450000,
    last_order_date: '2024-01-12',
    rating: 4.2,
    status: 'active',
    payment_terms: '15 days',
    notes: 'Good quality clothing items'
  },
  {
    id: '3',
    name: 'Premium Suppliers Ltd.',
    contact_person: 'Amit Patel',
    phone: '+91 76543 21098',
    email: 'amit@premiumsup.com',
    address: '789 Commercial Complex, Bangalore, Karnataka 560001',
    gstin: '29MNOPQ9012R3S7',
    balance: -8500,
    total_orders: 12,
    total_amount: 180000,
    last_order_date: '2024-01-08',
    rating: 4.8,
    status: 'active',
    payment_terms: '45 days',
    notes: 'High-end luxury items supplier'
  },
  {
    id: '4',
    name: 'Quick Supply Chain',
    contact_person: 'Neha Singh',
    phone: '+91 65432 10987',
    email: 'neha@quicksupply.com',
    address: '321 Trade Center, Chennai, Tamil Nadu 600001',
    gstin: '33TUVWX3456Y7Z1',
    balance: 0,
    total_orders: 8,
    total_amount: 95000,
    last_order_date: '2023-12-28',
    rating: 3.9,
    status: 'inactive',
    payment_terms: '21 days',
    notes: 'Sometimes delayed deliveries'
  }
]

export default function SuppliersPage() {
  const [suppliers] = useState<Supplier[]>(sampleSuppliers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'balance' | 'total_amount' | 'last_order_date'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredSuppliers = useMemo(() => {
    return suppliers
      .filter(supplier => {
        const matchesSearch = 
          supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.contact_person.toLowerCase().includes(searchQuery.toLowerCase()) ||
          supplier.phone.includes(searchQuery) ||
          supplier.email.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
        
        return matchesSearch && matchesStatus
      })
      .sort((a, b) => {
        const aVal = a[sortBy]
        const bVal = b[sortBy]
        
        if (sortOrder === 'asc') {
          return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        } else {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
        }
      })
  }, [suppliers, searchQuery, statusFilter, sortBy, sortOrder])

  const totalSuppliers = filteredSuppliers.length
  const activeSuppliers = filteredSuppliers.filter(s => s.status === 'active').length
  const totalPayable = filteredSuppliers.reduce((sum, supplier) => sum + (supplier.balance < 0 ? Math.abs(supplier.balance) : 0), 0)
  const totalReceivable = filteredSuppliers.reduce((sum, supplier) => sum + (supplier.balance > 0 ? supplier.balance : 0), 0)

  const getRatingStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>)
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>)
    }
    
    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">☆</span>)
    }
    
    return stars
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            </div>
            <Link href="/dashboard/suppliers/add">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" />
                <span>Add Supplier</span>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <BuildingStorefrontIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-green-600">{activeSuppliers}</p>
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
                <p className="text-sm text-gray-600">Total Payable</p>
                <p className="text-2xl font-bold text-red-600">₹{totalPayable.toLocaleString()}</p>
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Receivable</p>
                <p className="text-2xl font-bold text-yellow-600">₹{totalReceivable.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search suppliers..."
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="balance">Sort by Balance</option>
                <option value="total_amount">Sort by Total Amount</option>
                <option value="last_order_date">Sort by Last Order</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        {filteredSuppliers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BuildingStorefrontIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || statusFilter !== 'all' ? 'No suppliers match your search criteria.' : 'Start by adding your first supplier.'}
            </p>
            <Link href="/dashboard/suppliers/add">
              <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" />
                <span>Add First Supplier</span>
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredSuppliers.map((supplier, index) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {getRatingStars(supplier.rating)}
                        <span className="text-sm text-gray-500 ml-1">({supplier.rating})</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      supplier.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {supplier.status}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button className="text-gray-400 hover:text-blue-600">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-600">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <PhoneIcon className="h-4 w-4" />
                    <span>{supplier.phone}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <EnvelopeIcon className="h-4 w-4" />
                    <span>{supplier.email}</span>
                  </div>
                  
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{supplier.address}</span>
                  </div>

                  {supplier.gstin && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">GSTIN:</span> {supplier.gstin}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="flex items-center justify-center text-blue-600">
                      <ShoppingCartIcon className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">{supplier.total_orders}</span>
                    </div>
                    <div className="text-xs text-gray-500">Orders</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{supplier.total_amount.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Total Value</div>
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${
                      supplier.balance > 0 ? 'text-green-600' : 
                      supplier.balance < 0 ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {supplier.balance > 0 && '+'}₹{Math.abs(supplier.balance).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {supplier.balance > 0 ? 'Advance' : supplier.balance < 0 ? 'Due' : 'Balanced'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Last order: {new Date(supplier.last_order_date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-gray-500">
                      Payment: {supplier.payment_terms}
                    </div>
                  </div>
                  
                  {supplier.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      {supplier.notes}
                    </div>
                  )}

                  <div className="flex justify-between mt-3">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      New Order
                    </button>
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      View Orders
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
