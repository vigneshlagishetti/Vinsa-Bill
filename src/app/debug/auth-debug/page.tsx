'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'

interface AuthDebugInfo {
  clerkUser: any
  supabaseAuth: any
  businessTest: any
  productTest: any
}

export default function AuthDebugPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<AuthDebugInfo | null>(null)

  const runAuthDebug = async () => {
    setLoading(true)
    
    try {
      const info: AuthDebugInfo = {
        clerkUser: null,
        supabaseAuth: null,
        businessTest: null,
        productTest: null
      }

      // 1. Check Clerk user
      info.clerkUser = {
        id: user?.id,
        email: user?.primaryEmailAddress?.emailAddress,
        firstName: user?.firstName,
        authenticated: !!user
      }

      // 2. Check Supabase auth (this won't work with Clerk directly)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      info.supabaseAuth = {
        user: authData?.user,
        error: authError?.message,
        authenticated: !!authData?.user
      }

      // 3. Test business table access
      try {
        const { data: businessData, error: businessError } = await supabase
          .from('businesses')
          .select('*')
          .limit(1)

        info.businessTest = {
          success: !businessError,
          error: businessError?.message,
          data: businessData,
          count: businessData?.length || 0
        }
      } catch (err) {
        info.businessTest = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          data: null,
          count: 0
        }
      }

      // 4. Test products table access
      try {
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .limit(1)

        info.productTest = {
          success: !productsError,
          error: productsError?.message,
          data: productsData,
          count: productsData?.length || 0
        }
      } catch (err) {
        info.productTest = {
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          data: null,
          count: 0
        }
      }

      setDebugInfo(info)
      
    } catch (error) {
      console.error('Debug error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      runAuthDebug()
    }
  }, [user]) // runAuthDebug is not memoized, so we exclude it to avoid infinite loops

  const StatusIcon = ({ success }: { success: boolean | null }) => {
    if (success === null) return <div className="w-5 h-5 bg-gray-300 rounded-full" />
    return success ? 
      <CheckCircleIcon className="w-5 h-5 text-green-500" /> : 
      <XCircleIcon className="w-5 h-5 text-red-500" />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Authentication Debug</h1>
          <p className="text-gray-600 mt-1">Debug authentication and database connection issues</p>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Authentication Status</h2>
              <button
                onClick={runAuthDebug}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Run Debug Tests'}
              </button>
            </div>

            {debugInfo && (
              <div className="space-y-6">
                {/* Clerk Authentication */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <StatusIcon success={debugInfo.clerkUser?.authenticated} />
                    <h3 className="font-medium text-gray-900">Clerk Authentication</h3>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(debugInfo.clerkUser, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Supabase Authentication */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <StatusIcon success={debugInfo.supabaseAuth?.authenticated} />
                    <h3 className="font-medium text-gray-900">Supabase Authentication</h3>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(debugInfo.supabaseAuth, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Business Table Test */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <StatusIcon success={debugInfo.businessTest?.success} />
                    <h3 className="font-medium text-gray-900">Business Table Access</h3>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(debugInfo.businessTest, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Products Table Test */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <StatusIcon success={debugInfo.productTest?.success} />
                    <h3 className="font-medium text-gray-900">Products Table Access</h3>
                  </div>
                  <div className="bg-gray-50 rounded p-3 text-sm">
                    <pre className="whitespace-pre-wrap text-gray-700">
                      {JSON.stringify(debugInfo.productTest, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}

            {!user && (
              <div className="text-center py-8">
                <p className="text-gray-600">Please sign in to run authentication debug tests</p>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-yellow-700 text-sm">
              <p className="font-medium">Troubleshooting Notes:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Clerk should show authenticated: true when signed in</li>
                <li>Supabase auth will likely fail since we&apos;re using Clerk for authentication</li>
                <li>Business/Products table access depends on RLS policies and authentication setup</li>
                <li>If tables show access errors, there may be an authentication bridge issue</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
