'use client'

import { useState } from 'react'

export default function FixOrdersColumnsPage() {
  const [result, setResult] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const runFix = async () => {
    setIsLoading(true)
    setResult('Running database fix...')

    try {
      const response = await fetch('/api/debug/fix-orders-columns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      setResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setResult(`Error: ${error}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Fix Orders Table Columns</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <p className="text-gray-700 mb-4">
            This will add the missing columns to your orders table:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 mb-4">
            <li>customer_address (TEXT)</li>
            <li>subtotal (DECIMAL)</li>
            <li>tax_amount (DECIMAL)</li>
            <li>order_type (VARCHAR)</li>
          </ul>
          
          <button
            onClick={runFix}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Running Fix...' : 'Fix Orders Table'}
          </button>
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-auto">
            <pre>{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
