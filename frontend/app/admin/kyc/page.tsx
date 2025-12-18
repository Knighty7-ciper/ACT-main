"use client"

import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import StandardNav from '@/components/standard-nav'
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Crown,
  AlertTriangle,
  Eye,
  Download
} from 'lucide-react'

export default function AdminKYC() {
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
            <Shield className="h-8 w-8 mr-3 text-orange-400" />
            KYC Management
            <Crown className="h-5 w-5 ml-2 text-yellow-400" />
          </h1>
          <p className="text-gray-300 mt-2">Review and manage KYC documents with override capabilities</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Shield className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">KYC Review Center</h3>
          <p className="text-gray-300">Complete KYC management system with emergency override capabilities.</p>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-400 font-medium">Pending Reviews</p>
              <p className="text-white text-lg font-bold">23</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-medium">Approved Today</p>
              <p className="text-white text-lg font-bold">47</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <XCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 font-medium">Rejected Today</p>
              <p className="text-white text-lg font-bold">5</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
