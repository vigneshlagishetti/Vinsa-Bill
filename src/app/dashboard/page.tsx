'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/dashboard/pos')
  }, [router])
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-dots">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    </div>
  )
}
