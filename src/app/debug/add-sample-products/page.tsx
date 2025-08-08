'use client'

import '../../../styles/cyberpunk.css'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useProducts } from '@/hooks/useSupabase'
import { 
  PlayIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

// Sample product data similar to Amazon's inventory
const sampleProducts = [
  // Electronics
  { name: 'iPhone 15 Pro Max 256GB Natural Titanium', category: 'Electronics', brand: 'Apple', price: 134900, cost_price: 120000, stock: 25, threshold: 5, description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system' },
  { name: 'Samsung Galaxy S24 Ultra 512GB Titanium Black', category: 'Electronics', brand: 'Samsung', price: 129999, cost_price: 115000, stock: 18, threshold: 3, description: 'Premium Android phone with S Pen, 200MP camera, and AI features' },
  { name: 'MacBook Air M2 13-inch 256GB Midnight', category: 'Electronics', brand: 'Apple', price: 114900, cost_price: 100000, stock: 12, threshold: 2, description: 'Lightweight laptop powered by M2 chip with all-day battery life' },
  { name: 'Dell XPS 13 Plus Intel i7 16GB 512GB', category: 'Electronics', brand: 'Dell', price: 159999, cost_price: 140000, stock: 8, threshold: 2, description: 'Premium ultrabook with InfinityEdge display and haptic touchpad' },
  { name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', category: 'Electronics', brand: 'Sony', price: 29990, cost_price: 22000, stock: 45, threshold: 10, description: 'Industry-leading noise cancellation with premium sound quality' },
  { name: 'AirPods Pro 2nd Generation with MagSafe Case', category: 'Electronics', brand: 'Apple', price: 24900, cost_price: 18000, stock: 67, threshold: 15, description: 'Active noise cancellation with spatial audio and adaptive transparency' },
  { name: 'iPad Air 5th Gen 256GB Wi-Fi Space Gray', category: 'Electronics', brand: 'Apple', price: 67900, cost_price: 58000, stock: 22, threshold: 5, description: 'Powerful tablet with M1 chip and 10.9-inch Liquid Retina display' },
  { name: 'Samsung 55" QLED 4K Smart TV Q60C', category: 'Electronics', brand: 'Samsung', price: 72990, cost_price: 60000, stock: 15, threshold: 3, description: 'Quantum Dot technology with smart TV features and 4K resolution' },
  { name: 'Nintendo Switch OLED Model with Red and Blue Joy-Con', category: 'Electronics', brand: 'Nintendo', price: 37980, cost_price: 30000, stock: 35, threshold: 8, description: 'Enhanced Switch console with vibrant OLED screen and improved audio' },
  { name: 'PlayStation 5 Digital Edition', category: 'Electronics', brand: 'Sony', price: 44990, cost_price: 38000, stock: 6, threshold: 2, description: 'Next-gen gaming console with ultra-high-speed SSD and 4K gaming' },

  // Clothing & Fashion
  { name: 'Levi\'s 511 Slim Fit Jeans Dark Blue Wash', category: 'Clothing & Fashion', brand: 'Levi\'s', price: 4999, cost_price: 3200, stock: 120, threshold: 20, description: 'Classic slim-fit jeans with authentic Levi\'s styling' },
  { name: 'Nike Air Max 270 Running Shoes Black/White', category: 'Clothing & Fashion', brand: 'Nike', price: 12995, cost_price: 8500, stock: 85, threshold: 15, description: 'Comfortable running shoes with Max Air unit for superior cushioning' },
  { name: 'Adidas Ultraboost 22 Running Shoes Core Black', category: 'Clothing & Fashion', brand: 'Adidas', price: 17999, cost_price: 12000, stock: 65, threshold: 12, description: 'Premium running shoes with Boost midsole technology' },
  { name: 'H&M Cotton T-Shirt Regular Fit White', category: 'Clothing & Fashion', brand: 'H&M', price: 799, cost_price: 400, stock: 200, threshold: 50, description: 'Basic cotton t-shirt perfect for everyday wear' },
  { name: 'Zara Slim Fit Chino Trousers Beige', category: 'Clothing & Fashion', brand: 'Zara', price: 2990, cost_price: 1800, stock: 95, threshold: 20, description: 'Modern chino trousers with slim fit and contemporary styling' },

  // Home & Garden
  { name: 'IKEA MALM Bed Frame with 4 Storage Boxes Oak', category: 'Home & Garden', brand: 'IKEA', price: 24999, cost_price: 18000, stock: 12, threshold: 2, description: 'Modern bed frame with built-in storage compartments' },
  { name: 'Philips Hue White and Color Ambiance Bulb E27', category: 'Home & Garden', brand: 'Philips', price: 4999, cost_price: 3200, stock: 156, threshold: 30, description: 'Smart LED bulb with 16 million colors and app control' },
  { name: 'Dyson V15 Detect Cordless Vacuum Cleaner', category: 'Home & Garden', brand: 'Dyson', price: 52900, cost_price: 42000, stock: 18, threshold: 3, description: 'Powerful cordless vacuum with laser dust detection' },

  // Books & Media
  { name: 'Atomic Habits by James Clear Paperback', category: 'Books & Media', brand: 'Random House', price: 599, cost_price: 300, stock: 245, threshold: 50, description: 'Bestselling book on building good habits and breaking bad ones' },
  { name: 'The Psychology of Money by Morgan Housel', category: 'Books & Media', brand: 'Jaico', price: 399, cost_price: 200, stock: 189, threshold: 40, description: 'Timeless lessons on wealth, greed, and happiness' },

  // Food & Beverages
  { name: 'Britannia Good Day Cashew Cookies 600g', category: 'Food & Beverages', brand: 'Britannia', price: 180, cost_price: 120, stock: 345, threshold: 80, description: 'Delicious cashew cookies perfect for tea time' },
  { name: 'Amul Butter Pasteurized 500g', category: 'Food & Beverages', brand: 'Amul', price: 260, cost_price: 180, stock: 289, threshold: 60, description: 'Fresh pasteurized butter from Amul dairy' },
  { name: 'Tata Tea Premium 1kg Pack', category: 'Food & Beverages', brand: 'Tata Tea', price: 495, cost_price: 350, stock: 234, threshold: 50, description: 'Premium quality tea blend with rich flavor and aroma' },
  { name: 'Maggi 2-Minute Noodles Masala 12 Pack', category: 'Food & Beverages', brand: 'Maggi', price: 144, cost_price: 100, stock: 567, threshold: 120, description: 'Quick and tasty instant noodles with masala flavor' }
]

export default function AddSampleProductsPage() {
  const { addProduct } = useProducts()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState('')
  const [addedCount, setAddedCount] = useState(0)

  const addSampleProducts = async () => {
    setLoading(true)
    setMessage('')
    setProgress(0)
    setAddedCount(0)

    try {
      for (let i = 0; i < sampleProducts.length; i++) {
        const product = sampleProducts[i]
        
        const productData = {
          name: product.name,
          category: product.category,
          brand: product.brand,
          price: product.price,
          cost_price: product.cost_price,
          stock_quantity: product.stock,
          low_stock_threshold: product.threshold,
          description: product.description,
          barcode: `SP${Date.now()}${i}`.slice(-12),
          unit: 'piece',
          tax_rate: product.category === 'Food & Beverages' ? 5 : 18
        }

        await addProduct(productData)
        setAddedCount(i + 1)
        setProgress(((i + 1) / sampleProducts.length) * 100)
        
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setMessage(`Successfully added ${sampleProducts.length} sample products to your inventory!`)
      
    } catch (error) {
      setMessage(`Error adding products: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-700">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Add Sample Products</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CubeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Populate Your Inventory</h2>
                <p className="text-gray-600 mb-4">
                  This will add {sampleProducts.length} sample products to your inventory, similar to what you&apos;d find on Amazon. 
                  These include electronics, clothing, home goods, books, and more with realistic pricing and stock levels.
                </p>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Categories to be added:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div>📱 Electronics ({sampleProducts.filter(p => p.category === 'Electronics').length})</div>
                    <div>👕 Clothing & Fashion ({sampleProducts.filter(p => p.category === 'Clothing & Fashion').length})</div>
                    <div>🏠 Home & Garden ({sampleProducts.filter(p => p.category === 'Home & Garden').length})</div>
                    <div>📚 Books & Media ({sampleProducts.filter(p => p.category === 'Books & Media').length})</div>
                    <div>🍕 Food & Beverages ({sampleProducts.filter(p => p.category === 'Food & Beverages').length})</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            {loading && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Adding products...</span>
                  <span className="text-sm text-gray-500">{addedCount} / {sampleProducts.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Please wait while we populate your inventory...
                </p>
              </div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 p-4 rounded-lg border ${
                  message.includes('Error') 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span className="font-medium">{message}</span>
                </div>
              </motion.div>
            )}

            <div className="flex items-center space-x-4">
              <button
                onClick={addSampleProducts}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Products...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-4 w-4" />
                    <span>Add {sampleProducts.length} Sample Products</span>
                  </>
                )}
              </button>

              <Link
                href="/dashboard/stock"
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                View Stock
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

  const addSampleProducts = async () => {
    if (!user) {
      setMessage('Please log in first')
      return
    }

    setLoading(true)
    setMessage('Creating sample products...')

    try {
      // First, ensure business exists
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      let businessId = business?.id

      if (businessError && businessError.code === 'PGRST116') {
        // Create business if it doesn't exist
        const { data: newBusiness, error: createError } = await supabase
          .from('businesses')
          .insert({
            name: user.firstName ? `${user.firstName}'s Store` : 'My Store',
            owner_id: user.id,
            email: user.primaryEmailAddress?.emailAddress
          })
          .select()
          .single()

        if (createError) throw createError
        businessId = newBusiness.id
        setMessage('Business created! Adding products...')
      } else if (businessError) {
        throw businessError
      }

      if (!businessId) {
        throw new Error('Could not create or find business')
      }

      // Sample products to add
      const sampleProducts = [
        {
          name: 'iPhone 15 Pro',
          category: 'Electronics',
          price: 89999,
          stock_quantity: 10,
          low_stock_threshold: 5,
          barcode: '1234567890123',
          description: 'Latest iPhone with titanium design'
        },
        {
          name: 'Samsung Galaxy S24',
          category: 'Electronics', 
          price: 79999,
          stock_quantity: 8,
          low_stock_threshold: 3,
          barcode: '2345678901234',
          description: 'Premium Android smartphone'
        },
        {
          name: 'MacBook Pro 14"',
          category: 'Computers',
          price: 199999,
          stock_quantity: 3,
          low_stock_threshold: 2,
          barcode: '3456789012345',
          description: 'Professional laptop with M3 Pro chip'
        },
        {
          name: 'AirPods Pro',
          category: 'Audio',
          price: 24999,
          stock_quantity: 15,
          low_stock_threshold: 5,
          barcode: '4567890123456',
          description: 'Wireless earbuds with noise cancellation'
        },
        {
          name: 'iPad Air',
          category: 'Tablets',
          price: 59999,
          stock_quantity: 2,
          low_stock_threshold: 3,
          barcode: '5678901234567',
          description: 'Lightweight tablet for work and creativity'
        },
        {
          name: 'Apple Watch Series 9',
          category: 'Wearables',
          price: 41999,
          stock_quantity: 12,
          low_stock_threshold: 4,
          barcode: '6789012345678',
          description: 'Advanced health and fitness tracking'
        }
      ]

      // Add business_id to each product
      const productsToInsert = sampleProducts.map(product => ({
        ...product,
        business_id: businessId
      }))

      const { error: insertError } = await supabase
        .from('products')
        .insert(productsToInsert)

      if (insertError) throw insertError

      setMessage(`✅ Successfully added ${sampleProducts.length} sample products! You can now view them in the Stock page.`)
    } catch (error) {
      console.error('Error adding sample products:', error)
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Failed to add products'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
      <div className="cyber-card p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-cyber font-bold neon-text mb-6">
          ADD SAMPLE PRODUCTS
        </h1>
        
        <p className="text-cyber-text-secondary mb-8">
          This will add 6 sample products to your inventory database so you can test the Stock page functionality.
        </p>

        {user ? (
          <div className="space-y-4">
            <p className="text-sm text-cyber-primary">
              Logged in as: {user.firstName} {user.lastName}
            </p>
            
            <button
              onClick={addSampleProducts}
              disabled={loading}
              className={`cyber-btn-green w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'ADDING PRODUCTS...' : 'ADD SAMPLE PRODUCTS'}
            </button>
            
            {message && (
              <div className="cyber-alert p-4 text-sm">
                {message}
              </div>
            )}
            
            <div className="flex space-x-4">
              <Link href="/dashboard/stock" className="cyber-btn flex-1 text-center">
                VIEW STOCK
              </Link>
              <Link href="/dashboard" className="cyber-btn-pink flex-1 text-center">
                DASHBOARD
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-cyber-accent">Please log in to continue</p>
            <Link href="/auth/sign-in" className="cyber-btn-green w-full block text-center">
              SIGN IN
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
