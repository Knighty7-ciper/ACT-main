'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { simpleAuth, type User } from '@/lib/simple-auth'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = simpleAuth.getCurrentUser()
    if (!currentUser) {
      router.push('/sign-in')
    } else {
      setUser(currentUser)
    }
    setLoading(false)
  }, [router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  const handleSignOut = () => {
    simpleAuth.signOut()
    router.push('/sign-in')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">ACT Coin</h1>
            <p className="text-gray-400 text-sm">Secure Wallet & Transaction Platform</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome, {user.name || user.email}!
          </h2>
          <p className="text-gray-400">
            Manage your ACT Coin wallet and transactions securely
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Account Info</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <div>
                <span className="text-gray-300 block text-xs mb-1">Email</span>
                <span className="text-white font-mono">{user.email}</span>
              </div>
              {user.name && (
                <div>
                  <span className="text-gray-300 block text-xs mb-1">Name</span>
                  <span className="text-white">{user.name}</span>
                </div>
              )}
              <div>
                <span className="text-gray-300 block text-xs mb-1">ID</span>
                <span className="text-white font-mono text-xs">{user.id}</span>
              </div>
              <div className="pt-2">
                <span className="text-xs px-3 py-1 rounded-full bg-green-900/30 text-green-300 border border-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div>
                <div className="text-gray-400 text-xs mb-1">Account Status</div>
                <div className="text-green-400 font-semibold">Active &amp; Ready</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Member Since</div>
                <div className="text-white font-semibold">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs mb-1">Transactions</div>
                <div className="text-white font-semibold">Ready to Start</div>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-xl p-6">
            <h3 className="text-white font-semibold mb-4">Getting Started</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition">
                View Profile
              </button>
              <button className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition">
                Manage Wallets
              </button>
              <button className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition">
                View Transactions
              </button>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/transactions"
            className="bg-gray-900/50 hover:bg-gray-900/70 backdrop-blur border border-gray-800 rounded-lg p-6 transition"
          >
            <h4 className="text-white font-semibold mb-2">Transaction History</h4>
            <p className="text-gray-400 text-sm">
              View and manage all your transactions
            </p>
          </Link>
          <Link
            href="/ppp"
            className="bg-gray-900/50 hover:bg-gray-900/70 backdrop-blur border border-gray-800 rounded-lg p-6 transition"
          >
            <h4 className="text-white font-semibold mb-2">PPP Data</h4>
            <p className="text-gray-400 text-sm">
              Check purchasing power parity information
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
