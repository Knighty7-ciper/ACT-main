"use client"

import { useState, useEffect } from 'react'
import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import StandardNav from '@/components/standard-nav'
import MobileNavigation from '@/components/mobile-navigation'
import { 
  Activity, 
  Server, 
  Zap, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Play,
  Pause,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Info,
  Wifi,
  WifiOff,
  Gauge,
  BarChart3,
  Database,
  Shield,
  MoreVertical
} from 'lucide-react'

interface SystemHealthData {
  systemHealth: {
    overall: string
    uptime: number
    loadAverage: number[]
    memory: {
      used: number
      total: number
      percentage: number
    }
  }
  performance: {
    currentMetrics: {
      responseTime: number
      throughput: number
      errorRate: number
      activeConnections: number
    }
    activeAlerts: Array<{
      id: string
      type: string
      severity: 'low' | 'medium' | 'high' | 'critical'
      message: string
      timestamp: string
    }>
    recommendations: string[]
  }
  maintenance: {
    tasks: Array<{
      id: string
      name: string
      status: 'pending' | 'running' | 'completed' | 'failed'
      type: string
      progress: number
      estimatedCompletion: string
    }>
    windows: Array<{
      id: string
      name: string
      startTime: string
      endTime: string
      isActive: boolean
    }>
    isMaintenanceMode: boolean
    executionHistory: Array<{
      id: string
      taskName: string
      status: string
      duration: number
      completedAt: string
    }>
  }
  components: Array<{
    id: string
    name: string
    status: 'healthy' | 'degraded' | 'unhealthy'
    lastCheck: string
    responseTime: number
  }>
  incidents: Array<{
    id: string
    title: string
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    status: 'open' | 'investigating' | 'resolved'
    createdAt: string
    assignee?: string
  }>
  recommendations: string[]
  timestamp: string
}

export default function AutomationManagement() {
  const { isAutoAdmin, adminUser } = useAutoAdmin()
  const [systemData, setSystemData] = useState<SystemHealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadSystemData()
  }, [])

  const loadSystemData = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/automation/system-health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch system data: ${response.status}`)
      }

      const result = await response.json()
      setSystemData(result)
    } catch (error) {
      console.error('Error loading system data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadSystemData()
    setRefreshing(false)
  }

  const executeManualAction = async (action: string, componentId?: string) => {
    try {
      const response = await fetch('/api/automation/execute-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          action,
          componentId,
          parameters: {}
        })
      })

      if (response.ok) {
        await loadSystemData()
      }
    } catch (error) {
      console.error('Error executing action:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'completed': case 'resolved': return 'text-green-400'
      case 'degraded': case 'pending': case 'investigating': return 'text-yellow-400'
      case 'unhealthy': case 'failed': case 'open': return 'text-red-400'
      case 'running': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'completed': case 'resolved': return CheckCircle
      case 'degraded': case 'pending': case 'investigating': return AlertTriangle
      case 'unhealthy': case 'failed': case 'open': return AlertCircle
      case 'running': return RefreshCw
      default: return Info
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-binance-black">
        <StandardNav user={adminUser} isAuthenticated={true} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading automation system...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!systemData) {
    return (
      <div className="min-h-screen bg-binance-black">
        <StandardNav user={adminUser} isAuthenticated={true} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">System Data Unavailable</h2>
            <p className="text-gray-300 mb-4">Unable to load automation system information.</p>
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav user={adminUser} isAuthenticated={true} />
      
      {/* Header */}
      <div className="bg-[#1e2028] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Activity className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Automation Management</h1>
                <p className="text-sm text-gray-400">System health, performance & maintenance</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-black rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-[#1e2028] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'performance', label: 'Performance', icon: Gauge },
              { id: 'maintenance', label: 'Maintenance', icon: Settings },
              { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
            ].map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-yellow-400 text-yellow-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* System Health Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">System Health</p>
                    <p className={`text-2xl font-bold ${getStatusColor(systemData.systemHealth.overall)}`}>
                      {systemData.systemHealth.overall.toUpperCase()}
                    </p>
                  </div>
                  <Server className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-400">
                    Uptime: {Math.floor(systemData.systemHealth.uptime / 86400)}d {Math.floor((systemData.systemHealth.uptime % 86400) / 3600)}h
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Response Time</p>
                    <p className="text-2xl font-bold text-white">
                      {systemData.performance.currentMetrics.responseTime}ms
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <TrendingDown className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-green-400">Optimal</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Active Connections</p>
                    <p className="text-2xl font-bold text-white">
                      {systemData.performance.currentMetrics.activeConnections}
                    </p>
                  </div>
                  <Wifi className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="text-sm text-gray-400">
                    Throughput: {systemData.performance.currentMetrics.throughput}/min
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Memory Usage</p>
                    <p className="text-2xl font-bold text-white">
                      {systemData.systemHealth.memory.percentage}%
                    </p>
                  </div>
                  <Database className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${systemData.systemHealth.memory.percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Component Status */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Component Status</h3>
              <div className="space-y-3">
                {systemData.components.map((component) => {
                  const StatusIcon = getStatusIcon(component.status)
                  return (
                    <div key={component.id} className="flex items-center justify-between p-3 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(component.status)}`} />
                        <div>
                          <p className="text-white font-medium">{component.name}</p>
                          <p className="text-sm text-gray-400">
                            Last check: {new Date(component.lastCheck).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{component.responseTime}ms</p>
                        <p className={`text-sm ${getStatusColor(component.status)}`}>
                          {component.status}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recommendations */}
            {systemData.recommendations.length > 0 && (
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">System Recommendations</h3>
                <div className="space-y-2">
                  {systemData.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-[#2a2d34] rounded-lg">
                      <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <p className="text-gray-300">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Current Performance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {systemData.performance.currentMetrics.responseTime}ms
                  </p>
                  <p className="text-gray-400">Response Time</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {systemData.performance.currentMetrics.throughput}
                  </p>
                  <p className="text-gray-400">Requests/min</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-400">
                    {systemData.performance.currentMetrics.errorRate}%
                  </p>
                  <p className="text-gray-400">Error Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">
                    {systemData.performance.currentMetrics.activeConnections}
                  </p>
                  <p className="text-gray-400">Active Connections</p>
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            {systemData.performance.activeAlerts.length > 0 && (
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Active Performance Alerts</h3>
                <div className="space-y-3">
                  {systemData.performance.activeAlerts.map((alert) => {
                    const AlertIcon = getStatusIcon(alert.severity)
                    return (
                      <div key={alert.id} className="flex items-center justify-between p-4 bg-[#2a2d34] rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertIcon className={`h-5 w-5 ${getStatusColor(alert.severity)}`} />
                          <div>
                            <p className="text-white font-medium">{alert.message}</p>
                            <p className="text-sm text-gray-400">
                              {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Optimization Recommendations */}
            {systemData.performance.recommendations.length > 0 && (
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Optimization Recommendations</h3>
                <div className="space-y-2">
                  {systemData.performance.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-[#2a2d34] rounded-lg">
                      <Zap className="h-5 w-5 text-yellow-400 mt-0.5" />
                      <p className="text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            {/* Maintenance Status */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Maintenance Status</h3>
                {systemData.maintenance.isMaintenanceMode && (
                  <span className="px-3 py-1 bg-yellow-600 text-black rounded-full text-sm font-medium">
                    MAINTENANCE MODE
                  </span>
                )}
              </div>
              
              {/* Manual Actions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { action: 'backup', label: 'Backup', icon: Database },
                  { action: 'optimize', label: 'Optimize', icon: Zap },
                  { action: 'cleanup', label: 'Cleanup', icon: RefreshCw },
                  { action: 'recover', label: 'Recover', icon: Shield },
                ].map(({ action, label, icon: IconComponent }) => (
                  <button
                    key={action}
                    onClick={() => executeManualAction(action)}
                    className="flex flex-col items-center p-4 bg-[#2a2d34] hover:bg-[#363940] rounded-lg transition-colors"
                  >
                    <IconComponent className="h-6 w-6 text-yellow-400 mb-2" />
                    <span className="text-sm text-white">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Maintenance Tasks */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Active Maintenance Tasks</h3>
              <div className="space-y-3">
                {systemData.maintenance.tasks.map((task) => {
                  const StatusIcon = getStatusIcon(task.status)
                  return (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(task.status)}`} />
                        <div>
                          <p className="text-white font-medium">{task.name}</p>
                          <p className="text-sm text-gray-400">Type: {task.type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{task.progress}%</p>
                        <p className="text-sm text-gray-400">
                          ETA: {new Date(task.estimatedCompletion).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="w-24">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Maintenance Windows */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Scheduled Maintenance Windows</h3>
              <div className="space-y-3">
                {systemData.maintenance.windows.map((window) => (
                  <div key={window.id} className="flex items-center justify-between p-4 bg-[#2a2d34] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">{window.name}</p>
                        <p className="text-sm text-gray-400">
                          {new Date(window.startTime).toLocaleString()} - {new Date(window.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      window.isActive ? 'bg-yellow-600 text-black' : 'bg-gray-600 text-gray-300'
                    }`}>
                      {window.isActive ? 'ACTIVE' : 'SCHEDULED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execution History */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Execution History</h3>
              <div className="space-y-3">
                {systemData.maintenance.executionHistory.map((execution) => {
                  const StatusIcon = getStatusIcon(execution.status)
                  return (
                    <div key={execution.id} className="flex items-center justify-between p-3 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-4 w-4 ${getStatusColor(execution.status)}`} />
                        <div>
                          <p className="text-white text-sm">{execution.taskName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(execution.completedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">{execution.duration}s</p>
                        <p className={`text-xs ${getStatusColor(execution.status)}`}>
                          {execution.status}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="space-y-6">
            {/* Incident Overview */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Active Incidents</h3>
              {systemData.incidents.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                  <p className="text-gray-300">No active incidents</p>
                  <p className="text-sm text-gray-400">All systems operating normally</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {systemData.incidents.map((incident) => {
                    const StatusIcon = getStatusIcon(incident.status)
                    return (
                      <div key={incident.id} className="p-4 bg-[#2a2d34] rounded-lg border-l-4 border-red-400">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <StatusIcon className={`h-5 w-5 ${getStatusColor(incident.severity)} mt-0.5`} />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-white font-medium">{incident.title}</h4>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(incident.severity)}`}>
                                  {incident.severity}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm mb-2">{incident.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-400">
                                <span>Created: {new Date(incident.createdAt).toLocaleString()}</span>
                                {incident.assignee && (
                                  <span>Assigned to: {incident.assignee}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <button className="p-2 hover:bg-[#363940] rounded">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <MobileNavigation />
    </div>
  )
}