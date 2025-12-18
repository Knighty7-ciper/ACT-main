"use client"

import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import StandardNav from '@/components/standard-nav'
import { 
  Transactions, 
  TrendingUp, 
  DollarSign, 
  Clock,
  Crown,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function AdminTransactions() {
  const { isAutoAdmin, adminUser } = useAutoAdmin()

  if (!isAutoAdmin) {
    return (
      <div className="min-h-screen bg-binance-black">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-300">Administrator privileges required.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={true} user={{ email: adminUser?.email || '', isAdmin: true }} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Transactions className="h-8 w-8 mr-3 text-purple-400" />
            Transaction Management
            <Crown className="h-5 w-5 ml-2 text-yellow-400" />
          </h1>
          <p className="text-gray-300 mt-2">Monitor and manage all platform transactions with god-mode access</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Transactions className="h-16 w-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Transaction Management Center</h3>
          <p className="text-gray-300">Full transaction monitoring, modification, and analysis tools coming soon.</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-medium">Total Volume</p>
              <p className="text-white text-lg font-bold">$1,250,000</p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-400 font-medium">Pending Transactions</p>
              <p className="text-white text-lg font-bold">23</p>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
              <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-purple-400 font-medium">Success Rate</p>
              <p className="text-white text-lg font-bold">98.5%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
