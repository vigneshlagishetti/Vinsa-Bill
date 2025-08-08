'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useBusiness, useProducts } from '@/hooks/useSupabase'
import { getBusinessStats } from '@/lib/database'
import { 
  ShoppingCartIcon,
  ArrowPathIcon,
  PlusIcon,
  PlayIcon,
  CubeIcon,
  UsersIcon,
  TruckIcon,
  ShoppingBagIcon,
  MegaphoneIcon,
  CurrencyRupeeIcon,
  PrinterIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

const quickActions = [
  { title: 'Purchase/Returns', icon: ArrowPathIcon, href: '/dashboard/purchase', color: 'bg-blue-500' },
  { title: 'Add Products To Shop', icon: PlusIcon, href: '/dashboard/add-product', color: 'bg-green-500' }
]

const navigationButtons = [
  { title: 'Stock', icon: CubeIcon, href: '/dashboard/stock', color: 'bg-blue-500' },
  { title: 'Suppliers', icon: TruckIcon, href: '/dashboard/suppliers', color: 'bg-purple-500' },
  { title: 'Customers', icon: UsersIcon, href: '/dashboard/customers', color: 'bg-green-500' },
  { title: 'Orders', icon: ShoppingBagIcon, href: '/dashboard/orders', color: 'bg-orange-500' },
  { title: 'Marketing', icon: MegaphoneIcon, href: '/dashboard/marketing', color: 'bg-pink-500' },
  { title: 'Expenses', icon: CurrencyRupeeIcon, href: '/dashboard/expenses', color: 'bg-red-500' },
  { title: 'Printer', icon: PrinterIcon, href: '/dashboard/printer', color: 'bg-gray-500' },
  { title: 'Reports', icon: ChartBarIcon, href: '/dashboard/reports', color: 'bg-indigo-500' }
]

export default function POSDashboard() {
  const { user } = useUser()
  const { business, loading: businessLoading } = useBusiness()
  const { products, loading: productsLoading } = useProducts()
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    todayOrdersCount: 0,
    pendingPayments: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  const loadBusinessStats = useCallback(async () => {
    if (!business) return
    
    try {
      setStatsLoading(true)
      const businessStats = await getBusinessStats(business.id)
      setStats(businessStats)
    } catch (error) {
      console.error('Error loading business stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }, [business])

  useEffect(() => {
    if (business && !businessLoading) {
      loadBusinessStats()
    }
  }, [business, businessLoading, loadBusinessStats])

  if (!user || businessLoading) {
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
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {business?.name || 'Vinsa Bill'}
              </h1>
              <p className="text-sm text-gray-600">
                Welcome back, {user.firstName || 'there'}!
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Powered by Vinsa Bill - Made by Lagishetti Vignesh
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/profile" className="p-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl} 
                      alt={user.fullName || 'User'} 
                      className="w-8 h-8 rounded-full object-cover"
                      width={32}
                      height={32}
                    />
                  ) : (
                    <span className="text-white text-sm font-semibold">
                      {user.firstName?.[0] || user.fullName?.[0] || 'U'}
                    </span>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* New Bill Button */}
      <div className="px-4 py-6">
        <Link href="/dashboard/new-bill">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <h2 className="text-2xl font-bold">New Bill</h2>
                <p className="text-blue-100 mt-1">Create a new invoice</p>
              </div>
              <ShoppingCartIcon className="h-12 w-12" />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Business Stats */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Today Sales</p>
                <p className="text-lg font-bold text-gray-900">
                  {statsLoading ? '...' : `₹${stats.todayRevenue.toFixed(0)}`}
                </p>
                <p className="text-xs text-gray-500">
                  {statsLoading ? '...' : `${stats.todayOrdersCount} orders`}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CurrencyRupeeIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Products</p>
                <p className="text-lg font-bold text-gray-900">
                  {statsLoading ? '...' : stats.totalProducts}
                </p>
                <p className="text-xs text-red-500">
                  {statsLoading ? '...' : `${stats.lowStockCount} low stock`}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <CubeIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Customers</p>
                <p className="text-lg font-bold text-gray-900">
                  {statsLoading ? '...' : stats.totalCustomers}
                </p>
                <p className="text-xs text-orange-500">
                  {statsLoading ? '...' : `₹${stats.pendingPayments.toFixed(0)} pending`}
                </p>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">Total Revenue</p>
                <p className="text-lg font-bold text-gray-900">
                  {statsLoading ? '...' : `₹${stats.totalRevenue.toFixed(0)}`}
                </p>
                <p className="text-xs text-gray-500">
                  {statsLoading ? '...' : `${stats.totalOrders} orders`}
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={action.href}>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{action.title}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tutorial Videos Section */}
      <div className="px-4 mb-6">
        <motion.div 
          className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Watch Tutorial Videos Now</h3>
              <p className="text-sm text-gray-600">Learn how to use all features</p>
            </div>
            <Link href="/dashboard/tutorials">
              <div className="bg-white p-3 rounded-full shadow-sm">
                <PlayIcon className="h-6 w-6 text-purple-600" />
              </div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Online Store Section */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Online Store</h3>
          <Link href="/dashboard/online-store" className="text-blue-600 text-sm font-medium hover:text-blue-700">
            Shop Now →
          </Link>
        </div>
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {productsLoading ? (
            // Loading skeleton for products
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex-none w-32 bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="h-20 bg-gray-100 rounded-lg mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))
          ) : products && products.length > 0 ? (
            products.slice(0, 4).map((product) => (
              <Link key={product.id} href="/dashboard/online-store">
                <motion.div
                  className="flex-none w-32 bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-2 flex items-center justify-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{product.name.charAt(0)}</span>
                    </div>
                  </div>
                  <h4 className="text-xs font-medium text-gray-900 mb-1 truncate">{product.name}</h4>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-blue-600">₹{product.selling_price || product.price}</p>
                    {product.stock_quantity < 10 && (
                      <span className="text-xs bg-red-100 text-red-600 px-1 rounded">Low</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{product.stock_quantity} left</p>
                </motion.div>
              </Link>
            ))
          ) : (
            <div className="flex-none w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CubeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No products available</p>
              <Link href="/dashboard/add-product" className="text-blue-600 text-sm underline">
                Add your first product
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="px-4 pb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
        <div className="grid grid-cols-4 gap-4">
          {navigationButtons.map((button, index) => (
            <motion.div
              key={button.title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link href={button.href}>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 hover:scale-105">
                  <div className="flex flex-col items-center space-y-2">
                    <div className={`p-3 rounded-xl ${button.color}`}>
                      <button.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-gray-900 text-center">{button.title}</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
