"use client"

import { useAdminAccess } from '@/lib/hooks/useAdminAccess'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { hasAdminAccess } = useAdminAccess()
  const router = useRouter()

  useEffect(() => {
    if (!hasAdminAccess) {
      router.push('/')
    }
  }, [hasAdminAccess, router])

  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-binance-black">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300">Administrator privileges required.</p>
            <p className="text-sm text-gray-400 mt-2">
              Use the secret coffee icon in the footer to gain access.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-black">
      {children}
    </div>
  )
}
