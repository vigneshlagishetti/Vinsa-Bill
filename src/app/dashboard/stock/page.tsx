'use client'

import '../../../styles/cyberpunk.css'
import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useProducts } from '@/hooks/useSupabase'
import { 
  MagnifyingGlassIcon,
  QrCodeIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'

export default function StockPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [scanning, setScanning] = useState(false)
  const { products, loading, error } = useProducts()

  // Barcode scanning functions (defined first to avoid initialization errors)
  const stopScanning = useCallback((stream?: MediaStream) => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setScanning(false)
    setShowScanner(false)
  }, [])

  const handleBarcodeDetected = useCallback((barcode: string) => {
    console.log('Barcode detected:', barcode)
    console.log('Available products:', products?.length || 0)
    
    // Search for product with this barcode
    const foundProduct = products?.find(product => {
      const matches = product.barcode === barcode || 
        product.name.toLowerCase().includes(barcode.toLowerCase()) ||
        `SKU-${product.id.slice(-6).toUpperCase()}` === barcode
      
      if (matches) {
        console.log('Found matching product:', product.name)
      }
      return matches
    })
    
    console.log('Product search result:', foundProduct ? foundProduct.name : 'No match found')
    
    if (foundProduct) {
      // Product found - highlight it in search
      setSearchQuery(barcode)
      setActiveTab('all')
      
      // Show success notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 cyber-card p-4 z-50 border border-cyber-green'
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 bg-cyber-green rounded-full animate-pulse"></div>
          <div>
            <p class="text-cyber-green font-bold">PRODUCT DETECTED</p>
            <p class="text-cyber-text text-sm">${foundProduct.name}</p>
          </div>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    } else {
      // Product not found
      const notification = document.createElement('div')
      notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 cyber-card p-4 z-50 border border-cyber-accent'
      notification.innerHTML = `
        <div class="flex items-center space-x-3">
          <div class="w-3 h-3 bg-cyber-accent rounded-full animate-pulse"></div>
          <div>
            <p class="text-cyber-accent font-bold">PRODUCT NOT FOUND</p>
            <p class="text-cyber-text text-sm">Barcode: ${barcode}</p>
          </div>
        </div>
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    }
  }, [products])

  const detectBarcode = useCallback((video: HTMLVideoElement, stream: MediaStream) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return

    let scanAttempts = 0
    const maxAttempts = 15 // Reduced for faster detection
    
    console.log('Starting barcode detection...')
    console.log('Products available for matching:', products?.length || 0)
    
    const scanInterval = setInterval(() => {
      if (!scanning) {
        console.log('Scanning stopped by user')
        clearInterval(scanInterval)
        return
      }
      
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(video, 0, 0)
        
        // TODO: Integrate with a real barcode scanning library like:
        // - QuaggaJS: https://github.com/serratus/quaggaJS
        // - ZXing-js: https://github.com/zxing-js/library
        // - @zxing/browser: npm install @zxing/browser
        
        // For now, simulate barcode detection based on existing products
        scanAttempts++
        console.log(`Scan attempt ${scanAttempts}/${maxAttempts}`)
        
        // Simulate successful scan after some attempts
        if (scanAttempts >= 5 && Math.random() > 0.7) { // 30% chance after 5 attempts
          let detectedBarcode = ''
          
          // If we have products, use a real product barcode
          if (products && products.length > 0) {
            const randomProduct = products[Math.floor(Math.random() * products.length)]
            detectedBarcode = randomProduct.barcode || `SKU-${randomProduct.id.slice(-6).toUpperCase()}`
            console.log('Using existing product barcode:', detectedBarcode, 'for product:', randomProduct.name)
          } else {
            // Fallback to mock barcode
            detectedBarcode = 'SKU-' + Math.random().toString(36).substring(7).toUpperCase()
            console.log('Using mock barcode:', detectedBarcode)
          }
          
          handleBarcodeDetected(detectedBarcode)
          clearInterval(scanInterval)
          stopScanning(stream)
          return
        }
        
        // Timeout after max attempts
        if (scanAttempts >= maxAttempts) {
          clearInterval(scanInterval)
          stopScanning(stream)
          
          // Show timeout notification
          const notification = document.createElement('div')
          notification.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 cyber-card p-4 z-50 border border-cyber-accent'
          notification.innerHTML = `
            <div class="flex items-center space-x-3">
              <div class="w-3 h-3 bg-cyber-accent rounded-full"></div>
              <div>
                <p class="text-cyber-accent font-bold">SCAN TIMEOUT</p>
                <p class="text-cyber-text text-sm">No barcode detected. Try again.</p>
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
      const video = document.getElementById('barcode-video') as HTMLVideoElement
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

  // Keyboard shortcut for barcode scanner (Ctrl+Shift+S)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'S') {
        event.preventDefault()
        if (!scanning && !showScanner) {
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
  }, [scanning, showScanner, startScanning, stopScanning])

  // Calculate stock categories
  const stockData = useMemo(() => {
    if (!products) return { all: [], lowStock: [], archived: [] }

    const all = products.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.barcode || `SKU-${product.id.slice(-6).toUpperCase()}`,
      stock: product.stock_quantity,
      price: `₹${product.price.toFixed(0)}`,
      category: product.category || 'General',
      status: product.stock_quantity <= product.low_stock_threshold ? 'Low Stock' : 'In Stock'
    }))

    const lowStock = all.filter(item => item.status === 'Low Stock')
    const archived: typeof all = [] // TODO: Add archived status to database

    return { all, lowStock, archived }
  }, [products])

  const tabs = [
    { id: 'all', label: 'All Stocks', icon: CubeIcon, count: stockData.all.length },
    { id: 'lowStock', label: 'Low Stock', icon: ExclamationTriangleIcon, count: stockData.lowStock.length },
    { id: 'archived', label: 'Archived Stock', icon: ArchiveBoxIcon, count: stockData.archived.length }
  ]

  const getCurrentData = () => {
    const data = stockData[activeTab as keyof typeof stockData] || stockData.all
    return data.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center">
          <div className="cyber-loading mx-auto mb-6"></div>
          <h3 className="text-lg font-cyber font-bold neon-text mb-2">INITIALIZING INVENTORY SYSTEM</h3>
          <p className="text-cyber-text-secondary mb-4">Connecting to database and loading products...</p>
          
          {/* Add debug info */}
          <div className="cyber-card p-4 max-w-md mx-auto">
            <p className="text-xs text-cyber-text-secondary mb-2">Status: Loading business and inventory data</p>
            <div className="flex justify-center">
              <button 
                onClick={() => window.location.reload()}
                className="cyber-btn-pink text-xs"
              >
                RETRY CONNECTION
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen cyber-bg flex items-center justify-center">
        <div className="text-center cyber-card p-8 max-w-lg mx-auto">
          <div className="cyber-alert-error mb-6">
            <h3 className="text-lg font-cyber font-bold text-red-400 mb-2">DATABASE CONNECTION ERROR</h3>
            <p className="text-cyber-text-secondary mb-4">Failed to connect to inventory database</p>
            <div className="bg-cyber-dark/50 p-3 rounded border border-red-400/30 mb-4">
              <p className="text-xs text-red-300 font-mono">{error}</p>
            </div>
          </div>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="cyber-btn-green w-full"
            >
              RECONNECT TO DATABASE
            </button>
            <Link href="/dashboard" className="cyber-btn w-full block text-center">
              RETURN TO DASHBOARD
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // If no products exist, show welcome screen instead of empty list
  if (products && products.length === 0) {
    return (
      <div className="min-h-screen cyber-bg">
        {/* Header */}
        <div className="bg-cyber-dark-secondary/90 backdrop-blur-md border-b border-cyber-primary/30 sticky top-0 z-40">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/dashboard/pos" className="cyber-btn text-sm">
                ← BACK
              </Link>
              <h1 className="text-xl font-cyber font-bold neon-text tracking-wider">
                STOCK MATRIX
              </h1>
              <Link href="/dashboard/stock/add" className="cyber-btn-pink text-sm">
                + ADD
              </Link>
            </div>
          </div>
        </div>

        {/* Welcome Screen */}
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center cyber-card p-12 max-w-2xl mx-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <CubeIcon className="h-20 w-20 text-cyber-primary/70 mx-auto mb-6" />
              <h2 className="text-2xl font-cyber font-bold neon-text mb-4">INVENTORY MATRIX EMPTY</h2>
              <p className="text-cyber-text-secondary mb-8 max-w-md mx-auto">
                Your inventory database is ready. Start by adding your first product to begin tracking stock levels, sales, and analytics.
              </p>
              
              <div className="space-y-4">
                <Link href="/dashboard/stock/add">
                  <motion.button 
                    className="cyber-btn-green text-lg px-8 py-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <PlusIcon className="h-5 w-5 mr-2 inline" />
                    ADD FIRST PRODUCT
                  </motion.button>
                </Link>
                
                <Link href="/debug/populate-products">
                  <motion.button 
                    className="cyber-btn text-lg px-8 py-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CubeIcon className="h-5 w-5 mr-2 inline" />
                    ADD SAMPLE PRODUCTS
                  </motion.button>
                </Link>
                
                <div className="mt-6 p-4 bg-cyber-primary/10 rounded border border-cyber-primary/30">
                  <p className="text-cyber-primary text-sm font-semibold mb-2">Quick Tip:</p>
                  <p className="text-cyber-text-secondary text-xs">
                    Use the barcode scanner (Ctrl+Shift+S) to quickly add products by scanning their barcodes once you have some inventory.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen cyber-bg">
      {/* Cyberpunk Header */}
      <div className="bg-cyber-dark-secondary/90 backdrop-blur-md border-b border-cyber-primary/30 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard/pos" className="cyber-btn text-sm">
              ← BACK
            </Link>
            <h1 className="text-xl font-cyber font-bold neon-text tracking-wider">
              STOCK MATRIX
            </h1>
            <Link href="/dashboard/stock/add" className="cyber-btn-pink text-sm">
              + ADD
            </Link>
          </div>
        </div>
      </div>

      {/* Cyberpunk Search Bar */}
      <div className="px-4 py-4 bg-cyber-dark-secondary/50 border-b border-cyber-border">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-cyber-primary" />
          </div>
          <input
            type="text"
            className="cyber-input block w-full pl-10 pr-12 py-3"
            placeholder={scanning ? "SCANNER ACTIVE - POINT CAMERA AT BARCODE" : "SEARCH PRODUCTS OR SCAN CODE..."}
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
                  ? 'text-cyber-green animate-pulse cursor-not-allowed' 
                  : 'text-cyber-accent hover:text-cyber-primary hover:scale-110'
              }`}
              title={scanning ? "Scanner Active" : "Scan Barcode"}
            >
              <QrCodeIcon className={`h-5 w-5 ${scanning ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Scanning indicator */}
          {scanning && (
            <div className="absolute -top-1 -right-1">
              <div className="w-3 h-3 bg-cyber-green rounded-full animate-ping"></div>
              <div className="absolute top-0 left-0 w-3 h-3 bg-cyber-green rounded-full"></div>
            </div>
          )}
        </div>
      </div>

      {/* Cyberpunk Tabs */}
      <div className="px-4 py-4 bg-cyber-dark-secondary/30">
        <div className="cyber-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cyber-tab ${activeTab === tab.id ? 'active' : ''}`}
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="h-4 w-4" />
                <span className="text-xs">{tab.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                  activeTab === tab.id 
                    ? 'bg-cyber-dark text-cyber-primary' 
                    : 'bg-cyber-primary/20 text-cyber-primary'
                }`}>
                  {tab.count}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cyberpunk Stock List */}
      <div className="px-4 py-4 cyber-grid">
        {getCurrentData().length === 0 ? (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MagnifyingGlassIcon className="h-16 w-16 text-cyber-primary/50 mx-auto mb-4" />
            <h3 className="text-lg font-cyber font-bold neon-text mb-2">NO SEARCH RESULTS</h3>
            <p className="text-cyber-text-secondary mb-6">
              No products match your search criteria: &quot;{searchQuery}&quot;
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="cyber-btn-green"
            >
              CLEAR SEARCH FILTER
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {getCurrentData().map((item, index) => (
              <motion.div
                key={item.id}
                className="cyber-card p-4 relative overflow-hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                {/* Glitch effect overlay */}
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-cyber-primary via-cyber-pink to-cyber-green opacity-60"></div>
                
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-cyber font-bold text-cyber-text text-lg tracking-wider">
                        {item.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        item.status === 'In Stock' 
                          ? 'bg-cyber-green/20 text-cyber-green border border-cyber-green/50' 
                          : item.status === 'Low Stock'
                          ? 'bg-cyber-accent/20 text-cyber-accent border border-cyber-accent/50'
                          : 'bg-cyber-border/20 text-cyber-text-secondary border border-cyber-border'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="cyber-alert">
                        <span className="text-cyber-primary font-semibold">SKU:</span>
                        <span className="text-cyber-text ml-2 font-mono">{item.sku}</span>
                      </div>
                      <div className="cyber-alert">
                        <span className="text-cyber-pink font-semibold">STOCK:</span>
                        <span className="text-cyber-text ml-2 font-mono">{item.stock} UNITS</span>
                      </div>
                      <div className="cyber-alert">
                        <span className="text-cyber-green font-semibold">PRICE:</span>
                        <span className="text-cyber-text ml-2 font-mono">{item.price}</span>
                      </div>
                      <div className="cyber-alert">
                        <span className="text-cyber-accent font-semibold">CAT:</span>
                        <span className="text-cyber-text ml-2 font-mono">{item.category}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-cyber-border">
                  <div className="flex space-x-3">
                    <button className="cyber-btn text-xs">
                      <EyeIcon className="h-3 w-3 mr-1" />
                      VIEW
                    </button>
                    <button className="cyber-btn-pink text-xs">
                      <PencilIcon className="h-3 w-3 mr-1" />
                      EDIT
                    </button>
                  </div>
                  
                  {item.stock <= 10 && item.status !== 'Archived' && (
                    <div className="flex items-center space-x-2 cyber-alert-warning px-3 py-1 rounded">
                      <ExclamationTriangleIcon className="h-4 w-4" />
                      <span className="text-xs font-bold uppercase tracking-wider">LOW STOCK ALERT</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div
            className="fixed inset-0 z-50 bg-cyber-dark/95 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
          <motion.div
            className="cyber-card p-6 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="text-center mb-6">
              <h3 className="text-lg font-cyber font-bold neon-text mb-2">BARCODE SCANNER</h3>
              <p className="text-cyber-text-secondary text-sm">Point camera at product barcode</p>
            </div>
            
            {/* Camera Preview */}
            <div className="relative mb-6 bg-cyber-dark rounded-lg overflow-hidden">
              <video
                id="barcode-video"
                className="w-full h-48 object-cover"
                autoPlay
                muted
                playsInline
              />
              
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Scanning Frame */}
                  <div className="w-48 h-32 border-2 border-cyber-primary rounded-lg relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyber-green rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyber-green rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyber-green rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyber-green rounded-br-lg"></div>
                    
                    {/* Scanning Line */}
                    {scanning && (
                      <motion.div
                        className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-primary to-transparent"
                        animate={{ y: [0, 120, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                  
                  {/* Status Text */}
                  <div className="mt-4 text-center">
                    <p className="text-cyber-primary text-sm font-mono">
                      {scanning ? 'SCANNING...' : 'READY TO SCAN'}
                    </p>
                    {scanning && (
                      <div className="mt-2">
                        <div className="cyber-loading-sm mx-auto"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="space-y-3">
              {/* Manual Barcode Input for Testing */}
              <div className="cyber-input-group">
                <input
                  type="text"
                  placeholder="Enter barcode manually for testing..."
                  className="cyber-input w-full text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement
                      if (input.value.trim()) {
                        console.log('Manual barcode input:', input.value.trim())
                        handleBarcodeDetected(input.value.trim())
                        input.value = ''
                        stopScanning()
                      }
                    }
                  }}
                />
                <p className="text-cyber-text-secondary text-xs mt-1">
                  Type barcode and press Enter to test detection
                </p>
                
                {/* Test with existing product */}
                {products && products.length > 0 && (
                  <button
                    onClick={() => {
                      const testProduct = products[0]
                      const testBarcode = testProduct.barcode || `SKU-${testProduct.id.slice(-6).toUpperCase()}`
                      console.log('Testing with existing product barcode:', testBarcode)
                      handleBarcodeDetected(testBarcode)
                      stopScanning()
                    }}
                    className="cyber-btn-green w-full mt-2 text-xs"
                  >
                    TEST WITH EXISTING PRODUCT ({products[0]?.name})
                  </button>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => stopScanning()}
                  className="cyber-btn flex-1"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    stopScanning()
                    // Redirect to add product page for manual product entry
                    window.location.href = '/dashboard/stock/add?from=scanner'
                  }}
                  className="cyber-btn-pink flex-1"
                >
                  ADD PRODUCT
                </button>
              </div>
            </div>
            
            {/* Instructions */}
            <div className="mt-4 p-3 bg-cyber-primary/10 rounded border border-cyber-primary/30">
              <p className="text-cyber-primary text-xs font-mono text-center mb-1">
                Position barcode within the frame and hold steady
              </p>
              <p className="text-cyber-text-secondary text-xs text-center">
                Tip: Use Ctrl+Shift+S to open scanner, ESC to close
              </p>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Add Button */}
      <Link href="/dashboard/stock/add">
        <motion.button
          className="fixed bottom-6 right-6 cyber-btn-green rounded-full p-4 shadow-lg shadow-cyber-green/50 z-50"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: [
              "0 0 20px rgba(0, 255, 255, 0.5)",
              "0 0 30px rgba(0, 255, 255, 0.8)",
              "0 0 20px rgba(0, 255, 255, 0.5)"
            ]
          }}
          transition={{ 
            boxShadow: { duration: 2, repeat: Infinity },
            scale: { duration: 0.1 }
          }}
        >
          <PlusIcon className="h-6 w-6" />
        </motion.button>
      </Link>
    </div>
  )
}
