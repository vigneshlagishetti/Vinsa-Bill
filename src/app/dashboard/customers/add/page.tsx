'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { useCustomers } from '@/hooks/useSupabase'

interface CustomerFormData {
  name: string
  phone: string
  email: string
  address: string
  company: string
  gstin: string
  opening_balance: number
  balance_type: 'to_collect' | 'to_pay' | 'balanced'
  notes: string
  date_added: string
}

export default function AddCustomerPage() {
  const router = useRouter()
  const { addCustomer } = useCustomers()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    company: '',
    gstin: '',
    opening_balance: 0,
    balance_type: 'balanced',
    notes: '',
    date_added: new Date().toISOString().split('T')[0]
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Calculate balance based on type
      let balance = 0
      if (formData.balance_type === 'to_collect') {
        balance = formData.opening_balance
      } else if (formData.balance_type === 'to_pay') {
        balance = -formData.opening_balance
      }

      await addCustomer({
        name: formData.name,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        address: formData.address || undefined,
        balance: balance
      })

      router.push('/dashboard/customers')
    } catch (error) {
      console.error('Error adding customer:', error)
      alert('Failed to add customer. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/customers" className="text-blue-600 hover:text-blue-700">
                ← Back
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      <PhoneIcon className="h-4 w-4 inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      <EnvelopeIcon className="h-4 w-4 inline mr-1" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPinIcon className="h-4 w-4 inline mr-1" />
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter complete address"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="gstin" className="block text-sm font-medium text-gray-700 mb-2">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    id="gstin"
                    name="gstin"
                    value={formData.gstin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter GSTIN number"
                    pattern="[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: 22AAAAA0000A1Z5</p>
                </div>
              </div>

              {/* Opening Balance */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                  Opening Balance
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="opening_balance" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      id="opening_balance"
                      name="opening_balance"
                      min="0"
                      step="0.01"
                      value={formData.opening_balance}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="balance_type" className="block text-sm font-medium text-gray-700 mb-2">
                      Balance Type
                    </label>
                    <select
                      id="balance_type"
                      name="balance_type"
                      value={formData.balance_type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="balanced">No Outstanding</option>
                      <option value="to_collect">To Collect (Customer owes)</option>
                      <option value="to_pay">To Pay (We owe customer)</option>
                    </select>
                  </div>
                </div>

                {formData.opening_balance > 0 && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      {formData.balance_type === 'to_collect' && 
                        `Customer owes you ₹${formData.opening_balance.toLocaleString()}`
                      }
                      {formData.balance_type === 'to_pay' && 
                        `You owe customer ₹${formData.opening_balance.toLocaleString()}`
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Additional Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="date_added" className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="h-4 w-4 inline mr-1" />
                      Date Added
                    </label>
                    <input
                      type="date"
                      id="date_added"
                      name="date_added"
                      value={formData.date_added}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional notes about the customer..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Link href="/dashboard/customers">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </Link>
                
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{loading ? 'Adding Customer...' : 'Add Customer'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
