'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  CurrencyRupeeIcon,
  ReceiptPercentIcon,
  CalendarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  TruckIcon,
  CogIcon,
  UserIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Expense {
  id: string
  title: string
  category: string
  amount: number
  payment_method: 'cash' | 'card' | 'bank_transfer' | 'upi'
  vendor: string
  date: string
  description: string
  receipt_number?: string
  tax_amount: number
  status: 'paid' | 'pending' | 'approved' | 'rejected'
  recurring: boolean
  tags: string[]
}

interface ExpenseCategory {
  id: string
  name: string
  color: string
  total_spent: number
  monthly_budget: number
  icon: React.ElementType
}

// Sample expense data
const sampleExpenses: Expense[] = [
  {
    id: '1',
    title: 'Office Rent - January',
    category: 'Rent & Utilities',
    amount: 25000,
    payment_method: 'bank_transfer',
    vendor: 'Property Solutions Ltd.',
    date: '2024-01-01',
    description: 'Monthly office rent payment for shop space',
    receipt_number: 'RENT-2024-001',
    tax_amount: 0,
    status: 'paid',
    recurring: true,
    tags: ['monthly', 'fixed-cost']
  },
  {
    id: '2',
    title: 'Inventory Purchase',
    category: 'Inventory',
    amount: 45000,
    payment_method: 'card',
    vendor: 'ABC Wholesale Co.',
    date: '2024-01-15',
    description: 'Stock purchase for electronics department',
    receipt_number: 'INV-2024-048',
    tax_amount: 8100,
    status: 'paid',
    recurring: false,
    tags: ['inventory', 'electronics', 'wholesale']
  },
  {
    id: '3',
    title: 'Marketing Campaign - Social Media',
    category: 'Marketing',
    amount: 8500,
    payment_method: 'upi',
    vendor: 'Digital Marketing Pro',
    date: '2024-01-12',
    description: 'Facebook and Instagram ad campaigns',
    receipt_number: 'MKT-2024-012',
    tax_amount: 1530,
    status: 'paid',
    recurring: false,
    tags: ['digital-marketing', 'social-media']
  },
  {
    id: '4',
    title: 'Delivery Van Fuel',
    category: 'Transportation',
    amount: 3200,
    payment_method: 'cash',
    vendor: 'Local Petrol Pump',
    date: '2024-01-18',
    description: 'Fuel for delivery vehicle',
    tax_amount: 0,
    status: 'paid',
    recurring: false,
    tags: ['fuel', 'delivery', 'transportation']
  },
  {
    id: '5',
    title: 'Staff Salary - January',
    category: 'Salaries',
    amount: 75000,
    payment_method: 'bank_transfer',
    vendor: 'Employee Payroll',
    date: '2024-01-31',
    description: 'Monthly salary payment for all staff members',
    tax_amount: 0,
    status: 'pending',
    recurring: true,
    tags: ['salary', 'staff', 'monthly']
  },
  {
    id: '6',
    title: 'Software Subscription',
    category: 'Technology',
    amount: 2500,
    payment_method: 'card',
    vendor: 'Tech Solutions Inc.',
    date: '2024-01-10',
    description: 'Monthly subscription for POS software',
    receipt_number: 'TECH-2024-001',
    tax_amount: 450,
    status: 'paid',
    recurring: true,
    tags: ['subscription', 'software', 'pos']
  }
]

const expenseCategories: ExpenseCategory[] = [
  { id: '1', name: 'Rent & Utilities', color: 'blue', total_spent: 25000, monthly_budget: 30000, icon: BuildingOfficeIcon },
  { id: '2', name: 'Inventory', color: 'green', total_spent: 45000, monthly_budget: 50000, icon: FolderIcon },
  { id: '3', name: 'Marketing', color: 'purple', total_spent: 8500, monthly_budget: 15000, icon: ChartBarIcon },
  { id: '4', name: 'Transportation', color: 'yellow', total_spent: 3200, monthly_budget: 5000, icon: TruckIcon },
  { id: '5', name: 'Salaries', color: 'red', total_spent: 75000, monthly_budget: 80000, icon: UserIcon },
  { id: '6', name: 'Technology', color: 'indigo', total_spent: 2500, monthly_budget: 5000, icon: CogIcon }
]

export default function ExpensesPage() {
  const [expenses] = useState<Expense[]>(sampleExpenses)
  const [categories] = useState<ExpenseCategory[]>(expenseCategories)
  const [activeTab, setActiveTab] = useState<'expenses' | 'categories' | 'reports'>('expenses')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'approved' | 'rejected'>('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all')

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = 
        expense.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expense.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
      const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
      
      const matchesDate = () => {
        if (dateFilter === 'all') return true
        const expenseDate = new Date(expense.date)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        
        switch (dateFilter) {
          case 'today':
            return expenseDate >= today
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return expenseDate >= weekAgo
          case 'month':
            const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
            return expenseDate >= monthAgo
          case 'year':
            const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
            return expenseDate >= yearAgo
          default:
            return true
        }
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesDate()
    })
  }, [expenses, searchQuery, categoryFilter, statusFilter, dateFilter])

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalTax = filteredExpenses.reduce((sum, expense) => sum + expense.tax_amount, 0)
  const pendingExpenses = filteredExpenses.filter(e => e.status === 'pending').length
  const paidExpenses = filteredExpenses.filter(e => e.status === 'paid').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800'
      case 'card':
        return 'bg-blue-100 text-blue-800'
      case 'bank_transfer':
        return 'bg-purple-100 text-purple-800'
      case 'upi':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      indigo: 'bg-indigo-100 text-indigo-800'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-100 text-gray-800'
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
              <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <PlusIcon className="h-4 w-4" />
              <span>Add Expense</span>
            </button>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <CurrencyRupeeIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</p>
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
                <ReceiptPercentIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Paid Expenses</p>
                <p className="text-2xl font-bold text-green-600">{paidExpenses}</p>
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
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingExpenses}</p>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <ReceiptPercentIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tax Amount</p>
                <p className="text-2xl font-bold text-purple-600">₹{totalTax.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Expenses
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'categories'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reports
              </button>
            </nav>
          </div>

          {/* Search and Filters */}
          {activeTab === 'expenses' && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Search expenses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
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
                    <option value="year">This Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'expenses' && (
          <div className="space-y-4">
            {filteredExpenses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <CurrencyRupeeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all' 
                    ? 'No expenses match your search criteria.' 
                    : 'Start tracking your business expenses.'}
                </p>
                <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <PlusIcon className="h-4 w-4" />
                  <span>Add First Expense</span>
                </button>
              </div>
            ) : (
              filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{expense.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                          {expense.status}
                        </span>
                        {expense.recurring && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Recurring
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{expense.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          <span>{new Date(expense.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          <span>{expense.vendor}</span>
                        </div>
                        {expense.receipt_number && (
                          <div className="flex items-center">
                            <DocumentTextIcon className="h-4 w-4 mr-1" />
                            <span>{expense.receipt_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        ₹{expense.amount.toLocaleString()}
                      </div>
                      {expense.tax_amount > 0 && (
                        <div className="text-sm text-gray-600">
                          Tax: ₹{expense.tax_amount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                        categories.find(c => c.name === expense.category)?.color || 'gray'
                      )}`}>
                        {expense.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(expense.payment_method)}`}>
                        {expense.payment_method.replace('_', ' ').toUpperCase()}
                      </span>
                      <div className="flex flex-wrap space-x-2">
                        {expense.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-700">
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-700">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-700">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon
              const budgetUsed = (category.total_spent / category.monthly_budget) * 100
              
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${getCategoryColor(category.color).replace('text-', 'text-').replace('bg-', 'bg-')}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-600">Monthly Budget: ₹{category.monthly_budget.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Spent:</span>
                      <span className="text-sm font-medium text-red-600">₹{category.total_spent.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Remaining:</span>
                      <span className="text-sm font-medium text-green-600">
                        ₹{(category.monthly_budget - category.total_spent).toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Budget Usage</span>
                        <span className="text-sm font-medium">{budgetUsed.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            budgetUsed > 90 ? 'bg-red-500' : 
                            budgetUsed > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Monthly Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Expense Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">₹{totalExpenses.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">₹{totalTax.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Tax Paid</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{paidExpenses}</div>
                  <div className="text-sm text-gray-600">Paid Expenses</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">{pendingExpenses}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense by Category</h3>
              <div className="space-y-4">
                {categories.map((category) => {
                  const categoryExpenses = expenses.filter(e => e.category === category.name)
                  const categoryTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0)
                  const percentage = totalExpenses > 0 ? (categoryTotal / totalExpenses) * 100 : 0
                  
                  return (
                    <div key={category.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <category.icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">₹{categoryTotal.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
