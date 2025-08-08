'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  SpeakerWaveIcon,
  GiftIcon,
  TagIcon,
  UserGroupIcon,
  CurrencyRupeeIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline'

interface Campaign {
  id: string
  name: string
  type: 'discount' | 'loyalty' | 'promotion' | 'advertisement'
  status: 'active' | 'paused' | 'completed' | 'draft'
  start_date: string
  end_date: string
  budget: number
  spent: number
  reach: number
  conversions: number
  revenue_generated: number
  target_audience: string
  description: string
  channels: string[]
}

interface Promotion {
  id: string
  title: string
  discount_type: 'percentage' | 'fixed_amount' | 'bogo' | 'free_shipping'
  discount_value: number
  minimum_purchase: number
  max_uses: number
  used_count: number
  start_date: string
  end_date: string
  status: 'active' | 'expired' | 'draft'
  applicable_products: string[]
}

// Sample marketing data
const sampleCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Sale 2024',
    type: 'promotion',
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    budget: 50000,
    spent: 32000,
    reach: 15000,
    conversions: 850,
    revenue_generated: 125000,
    target_audience: 'All Customers',
    description: 'Summer collection with up to 50% off',
    channels: ['Social Media', 'Email', 'SMS']
  },
  {
    id: '2',
    name: 'Loyalty Rewards Program',
    type: 'loyalty',
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    budget: 100000,
    spent: 15000,
    reach: 5000,
    conversions: 1200,
    revenue_generated: 85000,
    target_audience: 'Repeat Customers',
    description: 'Earn points on every purchase and redeem rewards',
    channels: ['App', 'Email']
  },
  {
    id: '3',
    name: 'New Customer Acquisition',
    type: 'advertisement',
    status: 'paused',
    start_date: '2023-12-15',
    end_date: '2024-01-15',
    budget: 75000,
    spent: 68000,
    reach: 25000,
    conversions: 450,
    revenue_generated: 95000,
    target_audience: 'New Customers',
    description: 'Digital ads targeting first-time buyers',
    channels: ['Google Ads', 'Facebook', 'Instagram']
  }
]

const samplePromotions: Promotion[] = [
  {
    id: '1',
    title: 'WELCOME10 - New Customer Discount',
    discount_type: 'percentage',
    discount_value: 10,
    minimum_purchase: 500,
    max_uses: 1000,
    used_count: 245,
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    status: 'active',
    applicable_products: ['All Products']
  },
  {
    id: '2',
    title: 'FLAT500 - Flat ₹500 Off',
    discount_type: 'fixed_amount',
    discount_value: 500,
    minimum_purchase: 2000,
    max_uses: 500,
    used_count: 125,
    start_date: '2024-01-01',
    end_date: '2024-01-31',
    status: 'active',
    applicable_products: ['Electronics', 'Clothing']
  },
  {
    id: '3',
    title: 'Buy 1 Get 1 Free - Accessories',
    discount_type: 'bogo',
    discount_value: 100,
    minimum_purchase: 0,
    max_uses: 200,
    used_count: 180,
    start_date: '2023-12-01',
    end_date: '2024-01-01',
    status: 'expired',
    applicable_products: ['Accessories']
  }
]

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<'campaigns' | 'promotions' | 'analytics'>('campaigns')
  const [campaigns] = useState<Campaign[]>(sampleCampaigns)
  const [promotions] = useState<Promotion[]>(samplePromotions)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused' | 'completed' | 'draft' | 'expired'>('all')

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           campaign.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [campaigns, searchQuery, statusFilter])

  const filteredPromotions = useMemo(() => {
    return promotions.filter(promotion => {
      const matchesSearch = promotion.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [promotions, searchQuery, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'promotion':
        return <TagIcon className="h-4 w-4" />
      case 'loyalty':
        return <GiftIcon className="h-4 w-4" />
      case 'advertisement':
        return <SpeakerWaveIcon className="h-4 w-4" />
      case 'discount':
        return <CurrencyRupeeIcon className="h-4 w-4" />
      default:
        return <ChartBarIcon className="h-4 w-4" />
    }
  }

  const totalBudget = campaigns.reduce((sum, campaign) => sum + campaign.budget, 0)
  const totalSpent = campaigns.reduce((sum, campaign) => sum + campaign.spent, 0)
  const totalRevenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue_generated, 0)
  const totalReach = campaigns.reduce((sum, campaign) => sum + campaign.reach, 0)

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length
  const activePromotions = promotions.filter(p => p.status === 'active').length

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
              <h1 className="text-2xl font-bold text-gray-900">Marketing & Promotions</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <PlusIcon className="h-4 w-4" />
                <span>New Promotion</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <PlusIcon className="h-4 w-4" />
                <span>New Campaign</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <SpeakerWaveIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{activeCampaigns}</p>
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
                <TagIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Promotions</p>
                <p className="text-2xl font-bold text-green-600">{activePromotions}</p>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserGroupIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold text-purple-600">{totalReach.toLocaleString()}</p>
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
                <p className="text-sm text-gray-600">Revenue Generated</p>
                <p className="text-2xl font-bold text-yellow-600">₹{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'campaigns'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Marketing Campaigns
              </button>
              <button
                onClick={() => setActiveTab('promotions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'promotions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Promotions & Coupons
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Analytics & Reports
              </button>
            </nav>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder={`Search ${activeTab}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {filteredCampaigns.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <SpeakerWaveIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600 mb-6">Create your first marketing campaign to reach more customers.</p>
                <button className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Campaign</span>
                </button>
              </div>
            ) : (
              filteredCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-lg shadow-sm p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(campaign.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <p className="text-sm text-gray-600">{campaign.description}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500 flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Channels: {campaign.channels.join(', ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                      <div className="flex items-center space-x-1">
                        {campaign.status === 'active' && (
                          <button className="text-yellow-600 hover:text-yellow-700">
                            <PauseIcon className="h-4 w-4" />
                          </button>
                        )}
                        {campaign.status === 'paused' && (
                          <button className="text-green-600 hover:text-green-700">
                            <PlayIcon className="h-4 w-4" />
                          </button>
                        )}
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
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Budget</p>
                      <p className="text-lg font-semibold text-gray-900">₹{campaign.budget.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Spent</p>
                      <p className="text-lg font-semibold text-red-600">₹{campaign.spent.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Reach</p>
                      <p className="text-lg font-semibold text-blue-600">{campaign.reach.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Conversions</p>
                      <p className="text-lg font-semibold text-green-600">{campaign.conversions.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Revenue</p>
                      <p className="text-lg font-semibold text-yellow-600">₹{campaign.revenue_generated.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Budget Utilization</span>
                      <span className="text-sm font-medium text-gray-900">
                        {((campaign.spent / campaign.budget) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((campaign.spent / campaign.budget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="space-y-4">
            {filteredPromotions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <TagIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
                <p className="text-gray-600 mb-6">Create discount codes and promotional offers to boost sales.</p>
                <button className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Promotion</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPromotions.map((promotion, index) => (
                  <motion.div
                    key={promotion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">{promotion.title}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(promotion.status)}`}>
                          {promotion.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
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

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium text-green-600">
                          {promotion.discount_type === 'percentage' && `${promotion.discount_value}%`}
                          {promotion.discount_type === 'fixed_amount' && `₹${promotion.discount_value}`}
                          {promotion.discount_type === 'bogo' && 'Buy 1 Get 1'}
                          {promotion.discount_type === 'free_shipping' && 'Free Shipping'}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Min. Purchase:</span>
                        <span className="text-sm font-medium">₹{promotion.minimum_purchase}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Usage:</span>
                        <span className="text-sm font-medium">
                          {promotion.used_count} / {promotion.max_uses}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Valid Until:</span>
                        <span className="text-sm font-medium">
                          {new Date(promotion.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-gray-500">Usage Progress</span>
                        <span className="text-xs text-gray-500">
                          {((promotion.used_count / promotion.max_uses) * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(promotion.used_count / promotion.max_uses) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Marketing Performance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">₹{totalBudget.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">₹{totalSpent.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Revenue Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{((totalRevenue / totalSpent) * 100 - 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">ROI</div>
                </div>
              </div>
            </div>

            {/* Campaign Comparison */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Comparison</h3>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{campaign.name}</h4>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Spend: </span>
                        <span className="font-medium">₹{campaign.spent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Reach: </span>
                        <span className="font-medium">{campaign.reach.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Conversions: </span>
                        <span className="font-medium">{campaign.conversions}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Revenue: </span>
                        <span className="font-medium text-green-600">₹{campaign.revenue_generated.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
