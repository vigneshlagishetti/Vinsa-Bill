'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { useProducts } from '@/hooks/useSupabase'
import { 
  ArrowLeftIcon,
  PhotoIcon,
  QrCodeIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function AddProductPage() {
  const { addProduct } = useProducts()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false)
  const [productImage, setProductImage] = useState<string>('')

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    cost_price: '',
    stock_quantity: '',
    low_stock_threshold: '',
    barcode: '',
    description: '',
    brand: '',
    unit: 'piece',
    tax_rate: '18',
    supplier: '',
    location: ''
  })

  const categories = [
    'Electronics',
    'Clothing & Fashion',
    'Food & Beverages',
    'Books & Media',
    'Home & Garden',
    'Sports & Outdoors',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Office Supplies',
    'Pet Supplies',
    'Baby & Kids',
    'Jewelry & Accessories',
    'Tools & Hardware',
    'Other'
  ]

  const units = [
    'piece',
    'kg',
    'gram',
    'liter',
    'ml',
    'meter',
    'cm',
    'pack',
    'box',
    'bottle',
    'pair',
    'set'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateBarcode = () => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    const barcode = `${timestamp}${random}`.slice(-12)
    setFormData(prev => ({ ...prev, barcode }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setProductImage(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      setMessage('Product name is required')
      return
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setMessage('Valid price is required')
      return
    }
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      setMessage('Valid stock quantity is required')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const productData = {
        name: formData.name.trim(),
        category: formData.category || 'Other',
        price: parseFloat(formData.price),
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : undefined,
        stock_quantity: parseInt(formData.stock_quantity),
        low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 10,
        barcode: formData.barcode.trim() || undefined,
        description: formData.description.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        unit: formData.unit,
        tax_rate: parseFloat(formData.tax_rate),
        supplier: formData.supplier.trim() || undefined,
        location: formData.location.trim() || undefined,
        image_url: productImage || undefined
      }

      await addProduct(productData)
      
      setMessage('Product added successfully!')
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          category: '',
          price: '',
          cost_price: '',
          stock_quantity: '',
          low_stock_threshold: '',
          barcode: '',
          description: '',
          brand: '',
          unit: 'piece',
          tax_rate: '18',
          supplier: '',
          location: ''
        })
        setProductImage('')
        setMessage('')
      }, 2000)
      
    } catch (error) {
      setMessage(`Error adding product: ${error}`)
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
              <Link href="/dashboard/stock" className="text-blue-600 hover:text-blue-700 flex items-center">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Stock
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={generateBarcode}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              >
                <QrCodeIcon className="h-4 w-4" />
                <span className="text-sm">Generate Barcode</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Success/Error Message */}
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
                {!message.includes('Error') && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                <span className="font-medium">{message}</span>
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {productImage ? (
                        <Image
                          src={productImage}
                          alt="Product"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <PhotoIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="product-image"
                      />
                      <label
                        htmlFor="product-image"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                      >
                        <PhotoIcon className="h-4 w-4 mr-2" />
                        Choose Image
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Upload product image (optional)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter product name..."
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    required
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Brand */}
                <div>
                  <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter brand name..."
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter product description..."
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Inventory</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Selling Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Cost Price */}
                <div>
                  <label htmlFor="cost_price" className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    id="cost_price"
                    name="cost_price"
                    value={formData.cost_price}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Tax Rate */}
                <div>
                  <label htmlFor="tax_rate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    id="tax_rate"
                    name="tax_rate"
                    value={formData.tax_rate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="18"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label htmlFor="stock_quantity" className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    id="stock_quantity"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                {/* Low Stock Threshold */}
                <div>
                  <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 mb-2">
                    Low Stock Alert
                  </label>
                  <input
                    type="number"
                    id="low_stock_threshold"
                    name="low_stock_threshold"
                    value={formData.low_stock_threshold}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="10"
                    min="0"
                  />
                </div>

                {/* Unit */}
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Product Identification */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Product Identification</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Barcode */}
                <div>
                  <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                    Barcode/SKU
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                      placeholder="Enter or scan barcode..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowBarcodeScanner(true)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                    >
                      <QrCodeIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Supplier */}
                <div>
                  <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    id="supplier"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Enter supplier name..."
                  />
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Storage Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="e.g. Aisle 3, Shelf B, Warehouse A..."
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Link
                href="/dashboard/stock"
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Adding Product...</span>
                  </>
                ) : (
                  <>
                    <PlusIcon className="h-4 w-4" />
                    <span>Add Product</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
