'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  ChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  PrinterIcon,
  ShareIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ClockIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'

// Sample data for charts
const salesData = [
  { name: 'Jan', sales: 45000, profit: 12000 },
  { name: 'Feb', sales: 52000, profit: 15000 },
  { name: 'Mar', sales: 48000, profit: 13500 },
  { name: 'Apr', sales: 61000, profit: 18000 },
  { name: 'May', sales: 55000, profit: 16500 },
  { name: 'Jun', sales: 67000, profit: 20000 },
]

const dailySalesData = [
  { date: '2024-01-15', sales: 2800, orders: 45 },
  { date: '2024-01-16', sales: 3200, orders: 52 },
  { date: '2024-01-17', sales: 2950, orders: 48 },
  { date: '2024-01-18', sales: 3800, orders: 61 },
  { date: '2024-01-19', sales: 3400, orders: 55 },
  { date: '2024-01-20', sales: 4200, orders: 67 },
]

const categoryData = [
  { name: 'Electronics', value: 35, color: '#3B82F6' },
  { name: 'Clothing', value: 25, color: '#10B981' },
  { name: 'Home & Garden', value: 20, color: '#F59E0B' },
  { name: 'Sports', value: 15, color: '#EF4444' },
  { name: 'Others', value: 5, color: '#8B5CF6' },
]

const topProducts = [
  { name: 'iPhone 15 Pro', sales: 145, revenue: 145000 },
  { name: 'Samsung Galaxy S24', sales: 132, revenue: 118800 },
  { name: 'MacBook Air M2', sales: 89, revenue: 106800 },
  { name: 'AirPods Pro', sales: 203, revenue: 50750 },
  { name: 'iPad Air', sales: 76, revenue: 45600 },
]

const recentTransactions = [
  { id: 'TXN-001', customer: 'John Doe', amount: 1299, date: '2024-01-20T14:30:00', status: 'completed' },
  { id: 'TXN-002', customer: 'Jane Smith', amount: 899, date: '2024-01-20T13:15:00', status: 'completed' },
  { id: 'TXN-003', customer: 'Mike Johnson', amount: 249, date: '2024-01-20T12:45:00', status: 'pending' },
  { id: 'TXN-004', customer: 'Sarah Wilson', amount: 1599, date: '2024-01-20T11:20:00', status: 'completed' },
  { id: 'TXN-005', customer: 'David Brown', amount: 399, date: '2024-01-20T10:10:00', status: 'refunded' },
]

interface ReportCard {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  category: 'sales' | 'financial' | 'inventory' | 'customer' | 'tax'
  format: 'pdf' | 'excel' | 'csv'
}

const availableReports: ReportCard[] = [
  {
    id: '1',
    title: 'Daily Sales Report',
    description: 'Complete breakdown of daily sales, transactions, and performance metrics',
    icon: ChartBarIcon,
    category: 'sales',
    format: 'pdf'
  },
  {
    id: '2',
    title: 'Monthly Financial Summary',
    description: 'Comprehensive financial overview including P&L, cash flow, and expenses',
    icon: CurrencyDollarIcon,
    category: 'financial',
    format: 'excel'
  },
  {
    id: '3',
    title: 'Inventory Status Report',
    description: 'Current stock levels, low stock alerts, and inventory valuation',
    icon: CubeIcon,
    category: 'inventory',
    format: 'pdf'
  },
  {
    id: '4',
    title: 'Customer Analysis',
    description: 'Customer behavior, purchase patterns, and loyalty metrics',
    icon: UsersIcon,
    category: 'customer',
    format: 'excel'
  },
  {
    id: '5',
    title: 'GST Tax Report',
    description: 'GST calculations, tax liabilities, and compliance reporting',
    icon: ReceiptPercentIcon,
    category: 'tax',
    format: 'pdf'
  },
  {
    id: '6',
    title: 'Product Performance',
    description: 'Best and worst performing products with detailed analytics',
    icon: ShoppingCartIcon,
    category: 'sales',
    format: 'excel'
  }
]

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'analytics'>('dashboard')
  const [selectedDateRange, setSelectedDateRange] = useState('7d')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sales': return 'bg-blue-100 text-blue-800'
      case 'financial': return 'bg-green-100 text-green-800'
      case 'inventory': return 'bg-yellow-100 text-yellow-800'
      case 'customer': return 'bg-purple-100 text-purple-800'
      case 'tax': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'refunded': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredReports = selectedCategory === 'all' 
    ? availableReports 
    : availableReports.filter(report => report.category === selectedCategory)

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
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
            </div>
            <div className="flex items-center space-x-2">
              <select 
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="1d">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
                <option value="1y">Last Year</option>
              </select>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Generate Reports
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Advanced Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">₹3,28,000</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+12.5%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <BanknotesIcon className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600">1,247</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+8.2%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShoppingCartIcon className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Customers</p>
                    <p className="text-2xl font-bold text-purple-600">892</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-green-600 ml-1">+15.3%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <UsersIcon className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold text-orange-600">₹2,630</p>
                    <div className="flex items-center mt-1">
                      <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-600 ml-1">-2.1%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <CurrencyDollarIcon className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailySalesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="sales" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({name, value}) => `${name}: ${value}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Products */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.sales} units sold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">₹{product.revenue.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Recent Transactions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-3">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.customer}</p>
                          <p className="text-sm text-gray-600">{transaction.id}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{transaction.amount.toLocaleString()}</p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generate Reports</h3>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="sales">Sales Reports</option>
                    <option value="financial">Financial Reports</option>
                    <option value="inventory">Inventory Reports</option>
                    <option value="customer">Customer Reports</option>
                    <option value="tax">Tax Reports</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Report Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report, index) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <report.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                      {report.category}
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h4>
                  <p className="text-sm text-gray-600 mb-4">{report.description}</p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase">
                      {report.format}
                    </span>
                    
                    <div className="flex space-x-2">
                      <button className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-sm font-medium">
                        <EyeIcon className="h-4 w-4" />
                        <span>Preview</span>
                      </button>
                      <button className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-medium">
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        <span>Generate</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <PrinterIcon className="h-6 w-6 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Print Today&apos;s Summary</p>
                    <p className="text-sm text-gray-600">Quick daily report</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <ShareIcon className="h-6 w-6 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Email Reports</p>
                    <p className="text-sm text-gray-600">Schedule automated emails</p>
                  </div>
                </button>

                <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <ClockIcon className="h-6 w-6 text-gray-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Schedule Reports</p>
                    <p className="text-sm text-gray-600">Set up recurring reports</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Monthly Performance Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Advanced Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profit Margins</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Electronics</span>
                    <span className="font-semibold text-green-600">22.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Clothing</span>
                    <span className="font-semibold text-green-600">35.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Home & Garden</span>
                    <span className="font-semibold text-green-600">18.7%</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Customer Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">New Customers</span>
                    <span className="font-semibold text-blue-600">147</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Retention Rate</span>
                    <span className="font-semibold text-blue-600">78.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lifetime Value</span>
                    <span className="font-semibold text-blue-600">₹15,240</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Inventory Metrics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Turnover Rate</span>
                    <span className="font-semibold text-purple-600">4.2x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dead Stock</span>
                    <span className="font-semibold text-red-600">₹45,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock Value</span>
                    <span className="font-semibold text-purple-600">₹8,75,000</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Forecasting */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Forecast</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Next Month Forecast</p>
                  <p className="text-2xl font-bold text-blue-600">₹4,85,000</p>
                  <p className="text-sm text-green-600">+18% growth expected</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Quarter Projection</p>
                  <p className="text-2xl font-bold text-green-600">₹14,50,000</p>
                  <p className="text-sm text-green-600">On track for targets</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Yearly Estimate</p>
                  <p className="text-2xl font-bold text-purple-600">₹58,20,000</p>
                  <p className="text-sm text-green-600">+22% YoY growth</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
