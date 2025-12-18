"use client"

import { useState, useEffect } from 'react'
import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import StandardNav from '@/components/standard-nav'
import MobileNavigation from '@/components/mobile-navigation'
import { 
  Shield, 
  ShieldAlert,
  Globe,
  Bot,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Settings,
  Activity,
  TrendingUp,
  TrendingDown,
  Eye,
  MoreVertical,
  Clock,
  GlobeIcon,
  Zap,
  Users,
  Server,
  AlertCircle,
  Wifi,
  WifiOff,
  RefreshCw,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'

interface SecurityData {
  overview: {
    securityStatus: string
    wafStatus: string
    monitoringStatus: string
    threatLevel: string
    complianceScore: number
  }
  metrics: {
    totalEvents: number
    criticalEvents: number
    intrusionAttempts: number
    blockedIPs: number
  }
  recentAlerts: Array<{
    id: string
    type: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    message: string
    timestamp: string
    ip?: string
    source?: string
    action?: string
  }>
  complianceMetrics: Array<{
    category: string
    score: number
    status: 'compliant' | 'partial' | 'non-compliant'
    lastCheck: string
  }>
}

interface SecurityConfig {
  rateLimitEnabled: boolean
  ddosProtectionEnabled: boolean
  xssProtectionEnabled: boolean
  sqlInjectionProtectionEnabled: boolean
  geoBlockingEnabled: boolean
  botDetectionEnabled: boolean
  threatIntelligenceEnabled: boolean
}

interface WAFRule {
  id: string
  name: string
  action: 'allow' | 'block' | 'log'
  status: 'active' | 'inactive'
  pattern: string
  description: string
  createdAt: string
  hitCount: number
}

interface SecurityEvent {
  id: string
  timestamp: string
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  target: string
  description: string
  action: string
  status: 'pending' | 'reviewed' | 'resolved'
}

export default function SecurityManagement() {
  const { isAutoAdmin, adminUser } = useAutoAdmin()
  const [securityData, setSecurityData] = useState<SecurityData | null>(null)
  const [securityConfig, setSecurityConfig] = useState<SecurityConfig | null>(null)
  const [wafRules, setWafRules] = useState<WAFRule[]>([])
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadSecurityData()
    loadSecurityConfig()
    loadWAFRules()
    loadSecurityEvents()
  }, [])

  const loadSecurityData = async () => {
    try {
      const response = await fetch('/api/admin/security/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch security data: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setSecurityData(result.data)
      }
    } catch (error) {
      console.error('Error loading security data:', error)
      // Set empty state instead of mock data
      setSecurityData({
        overview: {
          securityStatus: 'unknown',
          wafStatus: 'unknown',
          monitoringStatus: 'unknown',
          threatLevel: 'unknown',
          complianceScore: 0
        },
        metrics: {
          totalEvents: 0,
          criticalEvents: 0,
          intrusionAttempts: 0,
          blockedIPs: 0
        },
        recentAlerts: [],
        complianceMetrics: []
      })
    }
  }

  const loadSecurityConfig = async () => {
    try {
      const response = await fetch('/api/admin/security/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        setSecurityConfig(result)
      }
    } catch (error) {
      console.error('Error loading security config:', error)
    }
  }

  const loadWAFRules = async () => {
    try {
      const response = await fetch('/api/admin/security/waf/rules', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch WAF rules: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setWafRules(result.data.rules || [])
      }
    } catch (error) {
      console.error('Error loading WAF rules:', error)
      // Set empty state instead of mock data
      setWafRules([])
    }
  }

  const loadSecurityEvents = async () => {
    try {
      const response = await fetch('/api/admin/security/events', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch security events: ${response.status}`)
      }

      const result = await response.json()
      if (result.success) {
        setSecurityEvents(result.data.events || [])
      }
    } catch (error) {
      console.error('Error loading security events:', error)
      // Set empty state instead of mock data
      setSecurityEvents([])
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([
      loadSecurityData(),
      loadSecurityConfig(),
      loadWAFRules(),
      loadSecurityEvents()
    ])
    setRefreshing(false)
  }

  const updateSecurityConfig = async (config: Partial<SecurityConfig>) => {
    try {
      const response = await fetch('/api/security/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(config)
      })

      if (response.ok) {
        await loadSecurityConfig()
      }
    } catch (error) {
      console.error('Error updating security config:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'resolved': case 'compliant': return 'text-green-400'
      case 'inactive': case 'pending': case 'partial': return 'text-yellow-400'
      case 'non-compliant': case 'critical': return 'text-red-400'
      case 'reviewed': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': case 'resolved': case 'compliant': return CheckCircle
      case 'inactive': case 'pending': case 'partial': return Clock
      case 'non-compliant': case 'critical': return XCircle
      case 'reviewed': return Eye
      default: return AlertTriangle
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-binance-black">
        <StandardNav user={adminUser} isAuthenticated={true} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading security system...</p>
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
              <Shield className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Security Management</h1>
                <p className="text-sm text-gray-400">WAF, threat detection & security monitoring</p>
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
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'config', label: 'Configuration', icon: Settings },
              { id: 'waf', label: 'WAF Rules', icon: Shield },
              { id: 'events', label: 'Security Events', icon: AlertTriangle },
              { id: 'threats', label: 'Threat Intelligence', icon: Bot },
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
        {activeTab === 'overview' && securityData && (
          <div className="space-y-6">
            {/* Security Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Security Status</p>
                    <p className={`text-xl font-bold ${getStatusColor(securityData.overview.securityStatus)}`}>
                      {securityData.overview.securityStatus.toUpperCase()}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Threat Level</p>
                    <p className={`text-xl font-bold ${getSeverityColor(securityData.overview.threatLevel)}`}>
                      {securityData.overview.threatLevel.toUpperCase()}
                    </p>
                  </div>
                  <ShieldAlert className="h-8 w-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Events</p>
                    <p className="text-xl font-bold text-white">
                      {securityData.metrics.totalEvents.toLocaleString()}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-green-400">+5.2% from last hour</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Blocked IPs</p>
                    <p className="text-xl font-bold text-white">
                      {securityData.metrics.blockedIPs.toLocaleString()}
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-red-400 mr-1" />
                    <span className="text-red-400">+12.3% today</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Compliance Score</p>
                    <p className="text-xl font-bold text-white">
                      {securityData.overview.complianceScore}%
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${securityData.overview.complianceScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Security Alerts */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Security Alerts</h3>
              <div className="space-y-3">
                {securityData.recentAlerts.slice(0, 5).map((alert) => {
                  const StatusIcon = getStatusIcon(alert.severity)
                  return (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${getSeverityColor(alert.severity)}`} />
                        <div>
                          <p className="text-white font-medium">{alert.message}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{alert.type}</span>
                            {alert.ip && <span>IP: {alert.ip}</span>}
                            <span>{new Date(alert.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Compliance Metrics */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Compliance Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {securityData.complianceMetrics.map((metric) => {
                  const StatusIcon = getStatusIcon(metric.status)
                  return (
                    <div key={metric.category} className="p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{metric.category}</h4>
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(metric.status)}`} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-white">{metric.score}%</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                          {metric.status}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full ${
                            metric.status === 'compliant' ? 'bg-green-400' : 
                            metric.status === 'partial' ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${metric.score}%` }}
                        ></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && securityConfig && (
          <div className="space-y-6">
            {/* Security Configuration */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Security Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { 
                    key: 'rateLimitEnabled', 
                    label: 'Rate Limiting', 
                    description: 'Limit requests per IP address',
                    icon: RefreshCw
                  },
                  { 
                    key: 'ddosProtectionEnabled', 
                    label: 'DDoS Protection', 
                    description: 'Protect against distributed attacks',
                    icon: ShieldAlert
                  },
                  { 
                    key: 'xssProtectionEnabled', 
                    label: 'XSS Protection', 
                    description: 'Block cross-site scripting attacks',
                    icon: Eye
                  },
                  { 
                    key: 'sqlInjectionProtectionEnabled', 
                    label: 'SQL Injection Protection', 
                    description: 'Prevent SQL injection attacks',
                    icon: Database
                  },
                  { 
                    key: 'geoBlockingEnabled', 
                    label: 'Geo Blocking', 
                    description: 'Block requests by geographic location',
                    icon: Globe
                  },
                  { 
                    key: 'botDetectionEnabled', 
                    label: 'Bot Detection', 
                    description: 'Identify and block automated bots',
                    icon: Bot
                  },
                  { 
                    key: 'threatIntelligenceEnabled', 
                    label: 'Threat Intelligence', 
                    description: 'Use external threat feeds',
                    icon: AlertTriangle
                  }
                ].map(({ key, label, description, icon: IconComponent }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-[#2a2d34] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <IconComponent className="h-5 w-5 text-yellow-400" />
                      <div>
                        <p className="text-white font-medium">{label}</p>
                        <p className="text-sm text-gray-400">{description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => updateSecurityConfig({ 
                        [key]: !securityConfig[key] 
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        securityConfig[key] ? 'bg-yellow-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          securityConfig[key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'waf' && (
          <div className="space-y-6">
            {/* WAF Rules Management */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">WAF Rules</h3>
                <button className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors">
                  <Plus className="h-4 w-4" />
                  <span>Add Rule</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {wafRules.map((rule) => {
                  const StatusIcon = getStatusIcon(rule.status)
                  return (
                    <div key={rule.id} className="p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(rule.status)} mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-white font-medium">{rule.name}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                rule.action === 'block' ? 'bg-red-600 text-white' :
                                rule.action === 'allow' ? 'bg-green-600 text-white' :
                                'bg-blue-600 text-white'
                              }`}>
                                {rule.action.toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(rule.status)}`}>
                                {rule.status}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{rule.description}</p>
                            <p className="text-gray-400 text-xs font-mono bg-gray-700 p-2 rounded">
                              {rule.pattern}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                              <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                              <span>Hits: {rule.hitCount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 hover:bg-[#363940] rounded">
                            <Edit className="h-4 w-4 text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-[#363940] rounded">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                          <button className="p-2 hover:bg-[#363940] rounded">
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            {/* Security Events */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Security Events</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="pl-10 pr-4 py-2 bg-[#2a2d34] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <button className="flex items-center space-x-2 px-3 py-2 bg-[#2a2d34] hover:bg-[#363940] border border-gray-600 rounded-lg text-white transition-colors">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {securityEvents.map((event) => {
                  const StatusIcon = getStatusIcon(event.status)
                  return (
                    <div key={event.id} className="p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <StatusIcon className={`h-5 w-5 ${getSeverityColor(event.severity)} mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-white font-medium">{event.type}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                                {event.severity}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                                {event.status}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{event.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                              <div>
                                <span className="font-medium">Source:</span> {event.source}
                              </div>
                              <div>
                                <span className="font-medium">Target:</span> {event.target}
                              </div>
                              <div>
                                <span className="font-medium">Action:</span> {event.action}
                              </div>
                              <div>
                                <span className="font-medium">Time:</span> {new Date(event.timestamp).toLocaleString()}
                              </div>
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
            </div>
          </div>
        )}

        {activeTab === 'threats' && (
          <div className="space-y-6">
            {/* Threat Intelligence Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Known Threats</p>
                    <p className="text-2xl font-bold text-white">1,247</p>
                  </div>
                  <Bot className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="text-sm text-green-400">↓ 8.3% from last week</div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Malicious IPs</p>
                    <p className="text-2xl font-bold text-white">3,892</p>
                  </div>
                  <Globe className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="text-sm text-red-400">↑ 12.7% from last week</div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Attack Patterns</p>
                    <p className="text-2xl font-bold text-white">156</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="text-sm text-yellow-400">New patterns detected</div>
                </div>
              </div>
            </div>

            {/* Threat Feed Integration */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Threat Intelligence Feeds</h3>
              <div className="space-y-4">
                {[
                  { name: 'Malware Domain List', status: 'active', lastUpdate: '2 minutes ago', confidence: 98 },
                  { name: 'Blocklist.de', status: 'active', lastUpdate: '5 minutes ago', confidence: 95 },
                  { name: 'AbuseIPDB', status: 'active', lastUpdate: '10 minutes ago', confidence: 92 },
                  { name: 'Project Honeypot', status: 'inactive', lastUpdate: '1 hour ago', confidence: 88 },
                ].map((feed) => (
                  <div key={feed.name} className="flex items-center justify-between p-4 bg-[#2a2d34] rounded-lg">
                    <div className="flex items-center space-x-3">
                      {feed.status === 'active' ? (
                        <Wifi className="h-5 w-5 text-green-400" />
                      ) : (
                        <WifiOff className="h-5 w-5 text-red-400" />
                      )}
                      <div>
                        <p className="text-white font-medium">{feed.name}</p>
                        <p className="text-sm text-gray-400">Last update: {feed.lastUpdate}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-white font-medium">{feed.confidence}%</p>
                        <p className="text-sm text-gray-400">Confidence</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        feed.status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {feed.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileNavigation />
    </div>
  )
}