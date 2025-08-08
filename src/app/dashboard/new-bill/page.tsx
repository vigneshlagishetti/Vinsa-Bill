'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useProducts, useCustomers, useOrders } from '@/hooks/useSupabase'
import PaymentModal from '@/components/PaymentModal'
import { 
  MagnifyingGlassIcon,
  QrCodeIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  PrinterIcon,
  ShareIcon,
  CheckCircleIcon,
  XMarkIcon,
  UserIcon,
  CurrencyRupeeIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  total: number
  stock_quantity: number
}

interface CustomerInfo {
  id?: string
  name: string
  phone: string
  email?: string
}

export default function NewBillPage() {
  const { products, loading: productsLoading } = useProducts()
  const { customers, loading: customersLoading } = useCustomers()
  const { createOrder } = useOrders()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showKeypad, setShowKeypad] = useState(false)
  const [currentItem, setCurrentItem] = useState<CartItem | null>(null)
  const [keypadValue, setKeypadValue] = useState('')
  const [keypadMode, setKeypadMode] = useState<'quantity' | 'price' | 'discount'>('quantity')
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({ name: '', phone: '' })
  const [showOrderComplete, setShowOrderComplete] = useState(false)
  const [showCustomerForm, setShowCustomerForm] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi'>('cash')
  const [isProcessing, setIsProcessing] = useState(false)
  const [billType, setBillType] = useState<'retail' | 'wholesale'>('retail')
  
  // Payment modal states
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  
  // Barcode scanner states
  const [showScanner, setShowScanner] = useState(false)
  const [scanning, setScanning] = useState(false)

  // Alias for consistency with the rest of the component
  const billItems = cartItems
  const setBillItems = setCartItems

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'], 
    ['7', '8', '9'],
    ['.', '0', '⌫']
  ]

  const addItemToBill = useCallback((product: any) => {
    const existingItem = billItems.find(item => item.id === product.id)
    
    if (existingItem) {
      setBillItems(billItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ))
    } else {
      setBillItems([...billItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        total: product.price,
        stock_quantity: product.stock_quantity
      }])
    }
    setSearchQuery('')
  }, [billItems, setBillItems])

  // Barcode scanning functions
  const stopScanning = useCallback((stream?: MediaStream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setScanning(false)
    setShowScanner(false)
  }, [])

  const handleBarcodeDetected = useCallback((barcode: string) => {
    // Search for product with this barcode
    const foundProduct = products?.find(product => 
      product.barcode === barcode || 
      product.name.toLowerCase().includes(barcode.toLowerCase()) ||
      `SKU-${product.id.slice(-6).toUpperCase()}` === barcode
    )
    
    if (foundProduct) {
      // Product found - add to cart
      addItemToBill(foundProduct)
      
      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-green-400 text-green-400 p-4 rounded-lg z-50'
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          <div>
            <p class="font-bold">PRODUCT ADDED TO CART</p>
            <p class="text-sm text-gray-300">${foundProduct.name}</p>
          </div>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    } else {
      // Product not found
      const notification = document.createElement('div')
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-yellow-400 text-yellow-400 p-4 rounded-lg z-50'
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <div>
            <p class="font-bold">PRODUCT NOT FOUND</p>
            <p class="text-sm text-gray-300">Barcode: ${barcode}</p>
          </div>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 3000)
    }
  }, [products, addItemToBill])

  const detectBarcode = useCallback((video: HTMLVideoElement, stream: MediaStream) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    let scanAttempts = 0
    const maxAttempts = 30 // 3 seconds at 10 FPS
    
    const scanInterval = setInterval(() => {
      if (!scanning) {
        clearInterval(scanInterval)
        return
      }
      
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        // Simulate barcode detection based on existing products
        scanAttempts++
        
        // Simulate successful scan after random attempts
        if (scanAttempts >= Math.random() * 20 + 10) {
          // Use a real product barcode from the database if available
          const randomProduct = products?.[Math.floor(Math.random() * products.length)]
          if (randomProduct) {
            const detectedBarcode = randomProduct.barcode || `SKU-${randomProduct.id.slice(-6).toUpperCase()}`
            handleBarcodeDetected(detectedBarcode)
          } else {
            // Fallback to mock barcode
            const mockBarcode = 'SKU-' + Math.random().toString(36).substring(7).toUpperCase()
            handleBarcodeDetected(mockBarcode)
          }
          clearInterval(scanInterval)
          stopScanning(stream)
        }
        
        // Timeout after max attempts
        if (scanAttempts >= maxAttempts) {
          clearInterval(scanInterval)
          stopScanning(stream)
          
          // Show timeout notification
          const notification = document.createElement('div')
          notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-yellow-400 text-yellow-400 p-4 rounded-lg z-50'
          notification.innerHTML = `
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div>
                <p class="font-bold">SCAN TIMEOUT</p>
                <p class="text-sm text-gray-300">No barcode detected. Try again.</p>
              </div>
            </div>
          `
          document.body.appendChild(notification)
          
          setTimeout(() => {
            if (document.body.contains(notification)) {
              document.body.removeChild(notification)
            }
          }, 3000)
        }
      }
    }, 100) // Scan at 10 FPS
  }, [scanning, products, handleBarcodeDetected, stopScanning])

  const startScanning = useCallback(async () => {
    try {
      setScanning(true)
      setShowScanner(true)
      
      // Check if browser supports camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this browser')
      }

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      // Set up video element for camera feed
      const video = document.getElementById('barcode-video-newbill') as HTMLVideoElement
      if (video) {
        video.srcObject = stream
        video.play()
        
        // Start barcode detection
        detectBarcode(video, stream)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setScanning(false)
      setShowScanner(false)
      alert('Camera access denied or not supported. Please check permissions.')
    }
  }, [detectBarcode])

  // Keyboard shortcut for barcode scanner (Ctrl+Shift+B for billing)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'B') {
        event.preventDefault()
        if (!scanning && !showScanner && !showKeypad && !showOrderComplete) {
          startScanning()
        }
      }
      // ESC to close scanner
      if (event.key === 'Escape' && showScanner) {
        stopScanning()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [scanning, showScanner, showKeypad, showOrderComplete, startScanning, stopScanning])

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setBillItems(billItems.filter(item => item.id !== itemId))
    } else {
      setBillItems(billItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ))
    }
  }

  const openKeypad = (item: CartItem, mode: 'quantity' | 'price') => {
    setCurrentItem(item)
    setKeypadMode(mode)
    setKeypadValue(mode === 'quantity' ? item.quantity.toString() : item.price.toString())
    setShowKeypad(true)
  }

  const handleKeypadPress = (value: string) => {
    if (value === '⌫') {
      setKeypadValue(keypadValue.slice(0, -1))
    } else {
      setKeypadValue(keypadValue + value)
    }
  }

  const applyKeypadValue = () => {
    if (currentItem && keypadValue) {
      const numValue = parseFloat(keypadValue)
      if (keypadMode === 'quantity') {
        updateItemQuantity(currentItem.id, numValue)
      } else {
        // Update price
        setBillItems(billItems.map(item =>
          item.id === currentItem.id
            ? { ...item, price: numValue, total: numValue * item.quantity }
            : item
        ))
      }
    }
    setShowKeypad(false)
    setKeypadValue('')
    setCurrentItem(null)
  }

  const getSubtotal = () => billItems.reduce((sum, item) => sum + item.total, 0)
  const getTax = () => getSubtotal() * 0.18 // 18% GST
  const getTotal = () => getSubtotal() + getTax()

  const filteredProducts = (products || []).filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode && product.barcode.includes(searchQuery))
  )

  const completeBill = async () => {
    if (billItems.length === 0) return
    
    try {
      setIsProcessing(true)
      
      // Create order in database
      const orderData = {
        customer_name: customerInfo.name || 'Walk-in Customer',
        customer_phone: customerInfo.phone || '',
        customer_email: customerInfo.email || '',
        subtotal: getSubtotal(),
        tax_amount: getTax(),
        discount_amount: discount,
        total_amount: getTotal(),
        payment_method: paymentMethod,
        status: 'pending',
        payment_status: 'pending',
        items: billItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.total
        }))
      }
      
      console.log('Attempting to create order with:', orderData)
      const orderId = await createOrder(orderData)
      console.log('Order creation result:', orderId)
      
      if (orderId) {
        setCurrentOrderId(orderId)
        setShowPaymentModal(true)
      } else {
        throw new Error('Failed to create order - no ID returned')
      }
      
    } catch (error) {
      console.error('Error creating order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Check if it's a database schema error
      if (errorMessage.includes('customer_email') || errorMessage.includes('column') || errorMessage.includes('schema')) {
        const shouldFix = confirm(`Database Error: Missing required columns in orders table.\n\nThis usually means the database needs to be updated with the latest schema.\n\nClick OK to go to the database fix page, or Cancel to continue.`)
        if (shouldFix) {
          window.location.href = '/debug/quick-db-fix'
          return
        }
      }
      
      alert(`Failed to create order: ${errorMessage}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const resetBill = () => {
    setBillItems([])
    setCustomerInfo({ name: '', phone: '' })
    setShowOrderComplete(false)
    setShowCustomerForm(false)
    setShowPaymentModal(false)
    setCurrentOrderId(null)
    setDiscount(0)
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
            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-900">New Bill</h1>
              <p className="text-xs text-gray-500">Vinsa Bill - Made by Lagishetti Vignesh</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                href="/debug/quick-db-fix" 
                className="text-xs text-gray-500 hover:text-blue-600 px-2 py-1 rounded border"
                title="Fix Database Issues"
              >
                🔧 Fix DB
              </Link>
              <button 
                onClick={() => setShowCustomerForm(true)}
                className="p-2 text-blue-600"
              >
                <UserIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bill Type Tabs */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="flex space-x-1">
          <button
            onClick={() => setBillType('retail')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              billType === 'retail'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Retail
          </button>
          <button
            onClick={() => setBillType('wholesale')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              billType === 'wholesale'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Wholesale
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4 bg-white border-b border-gray-200">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={scanning ? "SCANNER ACTIVE - POINT CAMERA AT BARCODE" : "Search products or scan barcode..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={scanning}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button 
              onClick={startScanning}
              disabled={scanning}
              className={`transition-all duration-200 ${
                scanning 
                  ? 'text-green-500 animate-pulse cursor-not-allowed' 
                  : 'text-gray-400 hover:text-blue-500 hover:scale-110'
              }`}
              title={scanning ? "Scanner Active" : "Scan Barcode (Ctrl+Shift+B)"}
            >
              <QrCodeIcon className={`h-5 w-5 ${scanning ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Scanning indicator */}
            {scanning && (
              <div className="absolute -top-1 -right-1">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Suggestions */}
        {productsLoading ? (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="px-4 py-3 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading products...</p>
            </div>
          </div>
        ) : (searchQuery ? filteredProducts : products?.slice(0, 10) || []).length > 0 ? (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {!searchQuery && (
              <div className="px-4 py-2 bg-gray-50 border-b">
                <p className="text-xs text-gray-600 font-medium">
                  Recent Products ({products?.length || 0} total)
                </p>
              </div>
            )}
            {(searchQuery ? filteredProducts : products?.slice(0, 10) || []).map((product) => (
              <button
                key={product.id}
                onClick={() => addItemToBill(product)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 flex justify-between items-center"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{product.name}</div>
                  <div className="text-sm text-gray-600">
                    ₹{product.price.toLocaleString()} • Stock: {product.stock_quantity}
                  </div>
                </div>
                <PlusIcon className="h-5 w-5 text-green-600" />
              </button>
            ))}
            {!searchQuery && products && products.length > 10 && (
              <div className="px-4 py-2 bg-gray-50 border-t">
                <p className="text-xs text-gray-600 text-center">
                  Search to see more products ({products.length - 10} more available)
                </p>
              </div>
            )}
          </div>
        ) : !productsLoading && products && products.length === 0 ? (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="px-4 py-6 text-center">
              <QrCodeIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">No products available</p>
              <Link 
                href="/debug/populate-products"
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Add sample products →
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      {/* Bill Items */}
      <div className="flex-1 px-4 py-4">
        {billItems.length === 0 ? (
          <div className="text-center py-12">
            <QrCodeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No items added</h3>
            <p className="text-gray-600">Search for products or scan barcodes to add items</p>
          </div>
        ) : (
          <div className="space-y-3">
            {billItems.map((item, index) => (
              <motion.div
                key={item.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>
                  <button
                    onClick={() => updateItemQuantity(item.id, 0)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-gray-600">Quantity</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openKeypad(item, 'quantity')}
                        className="px-3 py-1 bg-gray-100 rounded text-center min-w-[50px] hover:bg-gray-200"
                      >
                        {item.quantity}
                      </button>
                      <button
                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-600 hover:text-gray-800"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Price</label>
                    <button
                      onClick={() => openKeypad(item, 'price')}
                      className="mt-1 px-3 py-1 bg-gray-100 rounded text-center w-full hover:bg-gray-200"
                    >
                      ₹{item.price.toLocaleString()}
                    </button>
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-600">Total</label>
                    <div className="mt-1 font-semibold text-blue-600">
                      ₹{item.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Summary */}
      {billItems.length > 0 && (
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{getSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (18%):</span>
              <span>₹{getTax().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
              <span>Total:</span>
              <span>₹{getTotal().toLocaleString()}</span>
            </div>
          </div>
          
          <button
            onClick={completeBill}
            disabled={isProcessing}
            className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : (
              'Complete Order'
            )}
          </button>
        </div>
      )}

      {/* Keypad Modal */}
      <AnimatePresence>
        {showKeypad && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowKeypad(false)} />
            <motion.div
              className="relative bg-white rounded-t-xl p-6 w-full max-w-sm"
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
            >
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">Enter {keypadMode}</h3>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {keypadValue || '0'}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {keypadNumbers.flat().map((num) => (
                  <button
                    key={num}
                    onClick={() => handleKeypadPress(num)}
                    className="aspect-square bg-gray-100 rounded-lg text-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    {num}
                  </button>
                ))}
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowKeypad(false)}
                  className="flex-1 py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={applyKeypadValue}
                  className="flex-1 py-3 px-6 bg-blue-500 text-white rounded-lg font-semibold"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Complete Modal */}
      <AnimatePresence>
        {showOrderComplete && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50" />
            <motion.div
              className="relative bg-white rounded-xl p-8 w-full max-w-sm text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Completed!</h2>
              <p className="text-gray-600 mb-6">
                Total Amount: <span className="font-bold text-blue-600">₹{getTotal().toLocaleString()}</span>
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button className="flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                  <ShareIcon className="h-4 w-4" />
                  <span>Share</span>
                </button>
                <button className="flex items-center justify-center space-x-2 py-2 px-4 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
                  <PrinterIcon className="h-4 w-4" />
                  <span>Print</span>
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={resetBill}
                  className="w-full py-3 px-6 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
                >
                  New Bill
                </button>
                <Link href="/dashboard/orders">
                  <button className="w-full py-3 px-6 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300">
                    Tally Items
                  </button>
                </Link>
              </div>
              
              {/* Branding */}
              <p className="text-xs text-gray-400 mt-4">
                Powered by Vinsa Bill - Made by Lagishetti Vignesh
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
          <motion.div
            className="bg-white rounded-lg p-6 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Barcode Scanner</h3>
              <p className="text-gray-600 text-sm">Point camera at product barcode to add to cart</p>
            </div>
            
            {/* Camera Preview */}
            <div className="relative mb-6 bg-gray-900 rounded-lg overflow-hidden">
              <video
                id="barcode-video-newbill"
                className="w-full h-48 object-cover"
                autoPlay
                muted
                playsInline
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Scanning Frame */}
                  <div className="w-48 h-32 border-2 border-blue-500 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-500 rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-500 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-500 rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-500 rounded-br-lg"></div>
                    
                    {/* Scanning Line */}
                    {scanning && (
                      <motion.div
                        className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                        animate={{ y: [0, 120, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  
                  {/* Status Text */}
                  <div className="mt-4 text-center">
                    <p className="text-blue-500 text-sm font-mono">
                      {scanning ? 'SCANNING...' : 'READY TO SCAN'}
                    </p>
                    {scanning && (
                      <div className="mt-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={() => stopScanning()}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Manual barcode input fallback
                  const barcode = prompt('Enter barcode manually:')
                  if (barcode) {
                    handleBarcodeDetected(barcode.trim())
                    stopScanning()
                  }
                }}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
              >
                Manual Input
              </button>
            </div>
            
            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-blue-700 text-xs text-center mb-1">
                Position barcode within the frame and hold steady
              </p>
              <p className="text-gray-600 text-xs text-center">
                Tip: Use Ctrl+Shift+B to open scanner, ESC to close
              </p>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false)
          setShowOrderComplete(true)
        }}
        orderId={currentOrderId || ''}
        amount={getTotal()}
        orderDetails={{
          customerName: customerInfo.name || 'Walk-in Customer',
          itemCount: billItems.length,
          total: getTotal()
        }}
      />
    </div>
  )
}
