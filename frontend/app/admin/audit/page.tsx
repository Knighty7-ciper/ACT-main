"use client"

import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import { useState, useEffect } from 'react'
import StandardNav from '@/components/standard-nav'
import { 
  FileText, 
  Shield, 
  Eye, 
  AlertTriangle,
  Crown,
  Activity,
  Clock,
  User,
  Database,
  Settings,
  Download
} from 'lucide-react'

export default function AdminAudit() {
  const { isAutoAdmin, adminUser } = useAutoAdmin()
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAuditLogs()
  }, [])

  const loadAuditLogs = async () => {
    try {
      setLoading(true)
      // TODO: Implement real audit data loading
      // const response = await fetch('/api/admin/audit/trail')
      // if (response.ok) {
      //   const data = await response.json()
      //   setAuditLogs(data.data?.auditTrail || [])
      // }
      setAuditLogs([])
    } catch (error) {
      console.error('Error loading audit logs:', error)
      setAuditLogs([])
    } finally {
      setLoading(false)
    }
  }

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
            <FileText className="h-8 w-8 mr-3 text-indigo-400" />
            Audit & Security
            <Crown className="h-5 w-5 ml-2 text-yellow-400" />
          </h1>
          <p className="text-gray-300 mt-2">Complete audit trail and security monitoring with god-mode access</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8">
          <div className="text-center mb-8">
            <FileText className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Audit Log Center</h3>
            <p className="text-gray-300">Complete audit trail of all admin actions and system events</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-center">
              <Activity className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-400 font-medium">Total Events</p>
              <p className="text-white text-lg font-bold">2,847</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
              <User className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-medium">Admin Actions</p>
              <p className="text-white text-lg font-bold">234</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
              <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-yellow-400 font-medium">Today</p>
              <p className="text-white text-lg font-bold">67</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-400 font-medium">Security Alerts</p>
              <p className="text-white text-lg font-bold">3</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/50 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-white">Recent Admin Activity</h4>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </button>
            </div>
            
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400 mx-auto mb-4"></div>
                  <p>Loading audit logs...</p>
                </div>
              ) : auditLogs.length > 0 ? (
                auditLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        log.type === 'user_management' ? 'bg-blue-400' :
                        log.type === 'system_config' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></div>
                      <div>
                        <p className="text-white font-medium">{log.action}</p>
                        <p className="text-gray-400 text-sm">
                          {log.user} → {log.target}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">{log.type}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No audit logs available</p>
                </div>
              )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-300 text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <button className="text-indigo-400 hover:text-indigo-300 mt-1">
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Actions */}
          <div className="mt-8 bg-purple-500/10 border border-purple-500/20 rounded-lg p-6">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-purple-400" />
              Security Controls
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                Security Scan
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Access Report
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Compliance Check
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Force Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
