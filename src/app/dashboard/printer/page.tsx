'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  PrinterIcon,
  CogIcon,
  DocumentTextIcon,
  WifiIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlayIcon,
  StopIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  ReceiptPercentIcon,
  AdjustmentsHorizontalIcon,
  DevicePhoneMobileIcon
} from '@heroicons/react/24/outline'

interface PrinterDevice {
  id: string
  name: string
  type: 'thermal' | 'inkjet' | 'laser' | 'pos'
  status: 'online' | 'offline' | 'error' | 'busy'
  connection: 'usb' | 'bluetooth' | 'wifi' | 'ethernet'
  ip_address?: string
  location: string
  paper_size: string
  last_used: string
}

interface PrintTemplate {
  id: string
  name: string
  type: 'receipt' | 'invoice' | 'barcode' | 'report'
  size: string
  active: boolean
  description: string
}

// Sample printer data
const samplePrinters: PrinterDevice[] = [
  {
    id: '1',
    name: 'Main Counter Printer',
    type: 'thermal',
    status: 'online',
    connection: 'usb',
    location: 'Main Counter',
    paper_size: '80mm',
    last_used: '2024-01-20T10:30:00'
  },
  {
    id: '2',
    name: 'Invoice Printer',
    type: 'inkjet',
    status: 'online',
    connection: 'wifi',
    ip_address: '192.168.1.105',
    location: 'Back Office',
    paper_size: 'A4',
    last_used: '2024-01-20T09:15:00'
  },
  {
    id: '3',
    name: 'Mobile POS Printer',
    type: 'pos',
    status: 'offline',
    connection: 'bluetooth',
    location: 'Mobile Device',
    paper_size: '58mm',
    last_used: '2024-01-19T16:45:00'
  },
  {
    id: '4',
    name: 'Barcode Label Printer',
    type: 'thermal',
    status: 'error',
    connection: 'ethernet',
    ip_address: '192.168.1.108',
    location: 'Inventory Section',
    paper_size: '4x6 inch',
    last_used: '2024-01-20T08:20:00'
  }
]

const printTemplates: PrintTemplate[] = [
  {
    id: '1',
    name: 'Standard Receipt',
    type: 'receipt',
    size: '80mm',
    active: true,
    description: 'Default receipt format with logo and business details'
  },
  {
    id: '2',
    name: 'Tax Invoice',
    type: 'invoice',
    size: 'A4',
    active: true,
    description: 'GST compliant invoice with detailed tax breakdown'
  },
  {
    id: '3',
    name: 'Product Barcode',
    type: 'barcode',
    size: '4x6 inch',
    active: true,
    description: 'Product barcode labels with name and price'
  },
  {
    id: '4',
    name: 'Daily Sales Report',
    type: 'report',
    size: 'A4',
    active: false,
    description: 'Comprehensive daily sales and inventory report'
  },
  {
    id: '5',
    name: 'Small Receipt',
    type: 'receipt',
    size: '58mm',
    active: false,
    description: 'Compact receipt format for mobile POS'
  }
]

export default function PrinterPage() {
  const [printers] = useState<PrinterDevice[]>(samplePrinters)
  const [templates] = useState<PrintTemplate[]>(printTemplates)
  const [activeTab, setActiveTab] = useState<'devices' | 'templates' | 'settings' | 'test'>('devices')
  const [selectedPrinter, setSelectedPrinter] = useState<string>('')
  const [testPrintStatus, setTestPrintStatus] = useState<'idle' | 'printing' | 'success' | 'error'>('idle')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-100'
      case 'offline':
        return 'text-gray-600 bg-gray-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      case 'busy':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircleIcon className="h-4 w-4" />
      case 'offline':
        return <StopIcon className="h-4 w-4" />
      case 'error':
        return <XCircleIcon className="h-4 w-4" />
      case 'busy':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <StopIcon className="h-4 w-4" />
    }
  }

  const getConnectionIcon = (connection: string) => {
    switch (connection) {
      case 'wifi':
        return <WifiIcon className="h-4 w-4" />
      case 'bluetooth':
        return <DevicePhoneMobileIcon className="h-4 w-4" />
      case 'usb':
        return <CogIcon className="h-4 w-4" />
      case 'ethernet':
        return <WifiIcon className="h-4 w-4" />
      default:
        return <CogIcon className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'receipt':
        return <ReceiptPercentIcon className="h-4 w-4" />
      case 'invoice':
        return <DocumentTextIcon className="h-4 w-4" />
      case 'barcode':
        return <QrCodeIcon className="h-4 w-4" />
      case 'report':
        return <DocumentDuplicateIcon className="h-4 w-4" />
      default:
        return <DocumentTextIcon className="h-4 w-4" />
    }
  }

  const handleTestPrint = async () => {
    if (!selectedPrinter) {
      alert('Please select a printer first')
      return
    }

    setTestPrintStatus('printing')
    
    // Simulate test printing
    setTimeout(() => {
      const printer = printers.find(p => p.id === selectedPrinter)
      if (printer?.status === 'online') {
        setTestPrintStatus('success')
      } else {
        setTestPrintStatus('error')
      }
      
      setTimeout(() => {
        setTestPrintStatus('idle')
      }, 3000)
    }, 2000)
  }

  const onlineCount = printers.filter(p => p.status === 'online').length
  const offlineCount = printers.filter(p => p.status === 'offline').length
  const errorCount = printers.filter(p => p.status === 'error').length
  const activeTemplates = templates.filter(t => t.active).length

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
              <h1 className="text-2xl font-bold text-gray-900">Printer Management</h1>
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <PrinterIcon className="h-4 w-4" />
              <span>Add Printer</span>
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
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Online</p>
                <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
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
              <div className="p-2 bg-gray-100 rounded-lg">
                <StopIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Offline</p>
                <p className="text-2xl font-bold text-gray-600">{offlineCount}</p>
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
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-blue-600">{activeTemplates}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('devices')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'devices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Printer Devices
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Print Templates
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Print Settings
              </button>
              <button
                onClick={() => setActiveTab('test')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'test'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Test & Troubleshoot
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'devices' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {printers.map((printer, index) => (
              <motion.div
                key={printer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <PrinterIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{printer.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{printer.type} Printer</p>
                    </div>
                  </div>
                  
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(printer.status)}`}>
                    {getStatusIcon(printer.status)}
                    <span className="ml-1 capitalize">{printer.status}</span>
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      {getConnectionIcon(printer.connection)}
                      <span className="capitalize">{printer.connection} Connection</span>
                    </div>
                    {printer.ip_address && (
                      <span className="text-sm font-mono text-gray-600">{printer.ip_address}</span>
                    )}
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{printer.location}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Paper Size:</span>
                    <span className="font-medium">{printer.paper_size}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Used:</span>
                    <span className="font-medium">{new Date(printer.last_used).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Configure
                    </button>
                    <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                      Test Print
                    </button>
                  </div>
                  
                  {printer.status === 'error' && (
                    <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Troubleshoot
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-4">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      {getTypeIcon(template.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                          {template.type}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {template.size}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={template.active}
                        readOnly
                        className="mr-2 rounded"
                      />
                      <span className="text-sm text-gray-600">Active</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Edit
                      </button>
                      <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                        Preview
                      </button>
                      <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                        Duplicate
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* General Settings */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2" />
                General Print Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Receipt Printer
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Default Printer</option>
                    {printers.filter(p => p.status === 'online').map(printer => (
                      <option key={printer.id} value={printer.id}>
                        {printer.name} ({printer.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auto Print Receipts
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="always">Always</option>
                    <option value="ask">Ask Each Time</option>
                    <option value="never">Never</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Print Quality
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="draft">Draft (Faster)</option>
                    <option value="normal">Normal</option>
                    <option value="high">High Quality</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Paper Saving Mode
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="disabled">Disabled</option>
                    <option value="enabled">Enabled</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="print-logo"
                    className="mr-3 rounded"
                  />
                  <label htmlFor="print-logo" className="text-sm text-gray-700">
                    Include business logo on receipts
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="print-barcode"
                    className="mr-3 rounded"
                  />
                  <label htmlFor="print-barcode" className="text-sm text-gray-700">
                    Print barcode on receipts
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="auto-cut"
                    className="mr-3 rounded"
                  />
                  <label htmlFor="auto-cut" className="text-sm text-gray-700">
                    Auto-cut paper after printing
                  </label>
                </div>
              </div>
            </div>

            {/* Receipt Customization */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Receipt Customization</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Header Text
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Enter custom header text..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Receipt Footer Text
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Thank you for your business! Visit again..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'test' && (
          <div className="space-y-6">
            {/* Test Print Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PlayIcon className="h-5 w-5 mr-2" />
                Test Print
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Printer
                  </label>
                  <select
                    value={selectedPrinter}
                    onChange={(e) => setSelectedPrinter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Choose a printer...</option>
                    {printers.map(printer => (
                      <option key={printer.id} value={printer.id}>
                        {printer.name} ({printer.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleTestPrint}
                    disabled={!selectedPrinter || testPrintStatus === 'printing'}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testPrintStatus === 'printing' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Printing...</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon className="h-4 w-4" />
                        <span>Print Test Page</span>
                      </>
                    )}
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>Print Sample Receipt</span>
                  </button>
                </div>

                {/* Test Print Status */}
                {testPrintStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg ${
                      testPrintStatus === 'success' 
                        ? 'bg-green-50 border border-green-200' 
                        : testPrintStatus === 'error'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-blue-50 border border-blue-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {testPrintStatus === 'success' && <CheckCircleIcon className="h-5 w-5 text-green-600" />}
                      {testPrintStatus === 'error' && <XCircleIcon className="h-5 w-5 text-red-600" />}
                      {testPrintStatus === 'printing' && <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                      
                      <span className={`font-medium ${
                        testPrintStatus === 'success' ? 'text-green-800' :
                        testPrintStatus === 'error' ? 'text-red-800' : 'text-blue-800'
                      }`}>
                        {testPrintStatus === 'success' && 'Test print completed successfully!'}
                        {testPrintStatus === 'error' && 'Test print failed. Check printer connection.'}
                        {testPrintStatus === 'printing' && 'Sending test print...'}
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting</h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Common Issues & Solutions</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• <strong>Printer offline:</strong> Check power and connection cables</li>
                    <li>• <strong>Poor print quality:</strong> Replace ink/toner or clean print heads</li>
                    <li>• <strong>Paper jam:</strong> Remove jammed paper and check paper alignment</li>
                    <li>• <strong>Connection issues:</strong> Restart printer and check network settings</li>
                    <li>• <strong>Driver problems:</strong> Update or reinstall printer drivers</li>
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700">
                    <CogIcon className="h-4 w-4" />
                    <span>Run Diagnostics</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <DocumentTextIcon className="h-4 w-4" />
                    <span>View Logs</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
