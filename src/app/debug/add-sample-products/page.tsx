'use client'

import '../../../styles/cyberpunk.css'
import { useState } from 'react'
import Link from 'next/link'
import { useProducts } from '@/hooks/useSupabase'

// Sample product data
const sampleProducts = [
  { name: 'iPhone 15 Pro Max 256GB Natural Titanium', category: 'Electronics', brand: 'Apple', price: 134900, cost_price: 120000, stock: 25, threshold: 5, description: 'Latest iPhone with A17 Pro chip, titanium design, and advanced camera system' },
  { name: 'Samsung Galaxy S24 Ultra 512GB Titanium Black', category: 'Electronics', brand: 'Samsung', price: 129999, cost_price: 115000, stock: 18, threshold: 3, description: 'Premium Android phone with S Pen, 200MP camera, and AI features' },
  { name: 'MacBook Air M2 13-inch 256GB Midnight', category: 'Electronics', brand: 'Apple', price: 114900, cost_price: 100000, stock: 12, threshold: 2, description: 'Lightweight laptop powered by M2 chip with all-day battery life' },
  { name: 'Dell XPS 13 Plus Intel i7 16GB 512GB', category: 'Electronics', brand: 'Dell', price: 159999, cost_price: 140000, stock: 8, threshold: 2, description: 'Premium ultrabook with InfinityEdge display and haptic touchpad' },
  { name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones', category: 'Electronics', brand: 'Sony', price: 29990, cost_price: 22000, stock: 45, threshold: 10, description: 'Industry-leading noise cancellation with premium sound quality' },
  { name: 'AirPods Pro 2nd Generation with MagSafe Case', category: 'Electronics', brand: 'Apple', price: 24900, cost_price: 18000, stock: 67, threshold: 15, description: 'Active noise cancellation with spatial audio and adaptive transparency' }
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
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      setMessage(`Successfully added ${sampleProducts.length} sample products to your inventory!`)
    } catch (error) {
      console.error('Error adding sample products:', error)
      setMessage(`Error: ${error instanceof Error ? error.message : 'Failed to add products'}`)
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
          This will add {sampleProducts.length} sample products to your inventory database so you can test the Stock page functionality.
        </p>

        {loading && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-cyber-primary">Adding products...</span>
              <span className="text-sm text-cyber-text-secondary">{addedCount} / {sampleProducts.length}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className="bg-cyber-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <button
          onClick={addSampleProducts}
          disabled={loading}
          className={`cyber-btn-green w-full mb-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'ADDING PRODUCTS...' : 'ADD SAMPLE PRODUCTS'}
        </button>
        
        {message && (
          <div className="cyber-alert p-4 text-sm mb-4">
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
    </div>
  )
}
