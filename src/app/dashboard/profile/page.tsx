'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useUser } from '@clerk/nextjs'
import { useBusiness } from '@/hooks/useSupabase'
import { 
  UserIcon,
  PencilIcon,
  CreditCardIcon,
  HomeIcon,
  ChartBarIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  BanknotesIcon,
  QrCodeIcon,
  HeartIcon,
  UserGroupIcon,
  PlayIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  LanguageIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const accountFeatures = [
  { title: 'Account', icon: UserIcon, href: '/dashboard/account', premium: false },
  { title: 'Dashboard', icon: ChartBarIcon, href: '/dashboard', premium: false },
  { title: 'Multiple Shops', icon: BuildingStorefrontIcon, href: '#', premium: true },
  { title: 'Manage Staff', icon: UsersIcon, href: '/dashboard/staff', premium: false },
  { title: 'Bank Accounts', icon: BanknotesIcon, href: '/dashboard/bank-accounts', premium: false },
  { title: 'Barcode Settings', icon: QrCodeIcon, href: '/dashboard/barcode-settings', premium: false },
  { title: 'Customer Loyalty', icon: HeartIcon, href: '#', premium: true },
  { title: 'Become a Partner', icon: UserGroupIcon, href: '/dashboard/partner', premium: false },
  { title: 'Tutorials & Demos', icon: PlayIcon, href: '/dashboard/tutorials', premium: false },
  { title: 'Create Quotations', icon: DocumentTextIcon, href: '/dashboard/quotations', premium: false }
]

const quickLinks = [
  { title: 'Shop Details', href: '/dashboard/shop-details' },
  { title: 'My Subscription', href: '/dashboard/subscription' },
  { title: 'Change Language', href: '/dashboard/language' },
  { title: 'Help & Support', href: '/dashboard/support' },
  { title: 'Privacy Policy', href: '/privacy' },
  { title: 'Terms of Service', href: '/terms' },
  { title: 'Logout', href: '/auth/logout' }
]

export default function ProfilePage() {
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState('')
  const { user } = useUser()
  const { business, loading: businessLoading } = useBusiness()

  const handleFeatureClick = (feature: any) => {
    if (feature.premium) {
      setSelectedFeature(feature.title)
      setShowPremiumModal(true)
    } else {
      // Navigate to the feature
      window.location.href = feature.href
    }
  }

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
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/pos" className="text-blue-600">
              ← Back
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Account</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Profile Section */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center overflow-hidden">
                {user.imageUrl ? (
                  <Image
                    src={user.imageUrl} 
                    alt={user.fullName || 'User'} 
                    className="w-16 h-16 rounded-full object-cover"
                    width={64}
                    height={64}
                  />
                ) : (
                  <UserIcon className="h-8 w-8 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user.fullName || 'User'}
                </h2>
                <p className="text-gray-600">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                {business && (
                  <p className="text-sm text-gray-500">
                    {business.name}
                  </p>
                )}
              </div>
            </div>
            <button className="p-2 text-blue-600">
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
          
          <motion.button
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CreditCardIcon className="h-5 w-5" />
            <span>Buy Subscription Now</span>
          </motion.button>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
          <div className="grid grid-cols-2 gap-4">
            {accountFeatures.map((feature, index) => (
              <motion.button
                key={feature.title}
                className="relative bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors"
                onClick={() => handleFeatureClick(feature)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {feature.premium && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                    <StarIcon className="h-4 w-4 text-yellow-800" />
                  </div>
                )}
                <div className="flex flex-col items-center space-y-2">
                  <feature.icon className="h-8 w-8 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900 text-center">{feature.title}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
          <div className="space-y-2">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + (index * 0.05) }}
              >
                <Link href={link.href}>
                  <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <span className="text-gray-900 font-medium">{link.title}</span>
                    <div className="text-gray-400">→</div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Premium Feature Modal */}
      <AnimatePresence>
        {showPremiumModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPremiumModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-xl p-6 shadow-xl max-w-sm w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">This is a Premium Feature</h3>
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <StarIcon className="h-8 w-8 text-yellow-600" />
                </div>
                <p className="text-gray-600 mb-4">
                  <strong>{selectedFeature}</strong> is a premium feature. Upgrade your subscription to access this and many more advanced features.
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  Premium benefits include:
                </div>
                <ul className="text-sm text-gray-600 text-left space-y-1 mb-6">
                  <li>• Multiple shop management</li>
                  <li>• Advanced customer loyalty programs</li>
                  <li>• Priority customer support</li>
                  <li>• Advanced reporting & analytics</li>
                  <li>• Custom integrations</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <motion.button
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 rounded-lg font-semibold"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowPremiumModal(false)
                    window.location.href = '/dashboard/subscription'
                  }}
                >
                  Upgrade Now
                </motion.button>
                <button
                  className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50"
                  onClick={() => setShowPremiumModal(false)}
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
