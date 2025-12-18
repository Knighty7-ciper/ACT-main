"use client"

import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import StandardNav from '@/components/standard-nav'
import { 
  Settings, 
  Server, 
  Database, 
  Zap,
  Crown,
  Shield,
  AlertTriangle,
  Activity,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react'

export default function AdminSystem() {
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
            <Settings className="h-8 w-8 mr-3 text-gray-400" />
            System Management
            <Crown className="h-5 w-5 ml-2 text-yellow-400" />
          </h1>
          <p className="text-gray-300 mt-2">Complete system configuration and monitoring with god-mode access</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <Server className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">System Control Center</h3>
            <p className="text-gray-300">Full system management with emergency controls and database access</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <Cpu className="h-8 w-8 text-blue-400 mb-3" />
              <h4 className="text-lg font-bold text-white mb-2">CPU Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Load Average</span>
                  <span className="text-blue-400">2.3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Process Count</span>
                  <span className="text-blue-400">124</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-400 h-2 rounded-full" style={{width: '65%'}}></div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
              <HardDrive className="h-8 w-8 text-green-400 mb-3" />
              <h4 className="text-lg font-bold text-white mb-2">Memory Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Used RAM</span>
                  <span className="text-green-400">6.2GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Available</span>
                  <span className="text-green-400">3.8GB</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-green-400 h-2 rounded-full" style={{width: '62%'}}></div>
                </div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
              <Database className="h-8 w-8 text-purple-400 mb-3" />
              <h4 className="text-lg font-bold text-white mb-2">Database Status</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-300">Connections</span>
                  <span className="text-purple-400">45/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Response Time</span>
                  <span className="text-purple-400">12ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-400">●</span>
                  <span className="text-green-400">Online</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-red-500/10 border border-red-500/20 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-red-400" />
              Emergency System Controls
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Emergency Stop
              </button>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Maintenance Mode
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Database Backup
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                System Restart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
