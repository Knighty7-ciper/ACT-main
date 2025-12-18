"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import { useAdminWebSocket } from '@/app/hooks/useWebSocket'
import StandardNav from '@/components/standard-nav'
import { 
  Shield, 
  Users, 
  Transactions, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  Activity,
  Database,
  TrendingUp,
  Bell,
  RefreshCw,
  Crown,
  Eye,
  Key,
  FileText,
  Zap,
  Gauge,
  Globe,
  Server,
  Menu,
  X,
  ChevronDown,
  Wifi,
  WifiOff,
  Smartphone,
  Tablet,
  Monitor,
  Power,
  PowerOff,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  pendingKYC: number
  systemHealth: number
  todayVolume: number
  connections: number
  uptime: string
}

interface SystemAlert {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: string
  priority: 'low' | 'medium' | 'high' | 'critical'
}

interface Transaction {
  id: string
  user: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  timestamp: string
  type: 'deposit' | 'withdrawal' | 'transfer' | 'kyc_payment'
}

export default function MobileResponsiveAdminDashboard() {
  const router = useRouter()
  const { isAutoAdmin, isLoading, adminUser } = useAutoAdmin()
  
  // WebSocket integration for real-time updates
  const {
    isConnected,
    dashboardData,
    systemAlerts,
    recentTransactions,
    connectionError,
    reconnectAttempts,
    connect,
    disconnect
  } = useAdminWebSocket()

  // Mobile state management
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [fullscreenMode, setFullscreenMode] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(30000) // 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // Dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      const isMobileDevice = width < 768
      setIsMobile(isMobileDevice)
      
      // Auto-close sidebar on mobile
      if (isMobileDevice) {
        setSidebarOpen(false)
      }
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Connect to WebSocket when admin is authenticated
  useEffect(() => {
    if (isAutoAdmin && !isConnected) {
      connect()
    }
  }, [isAutoAdmin, isConnected, connect])

  // Update local state with WebSocket data
  useEffect(() => {
    if (dashboardData) {
      setStats(prevStats => ({
        totalUsers: dashboardData.totalUsers || prevStats?.totalUsers || 0,
        activeUsers: dashboardData.activeUsers || prevStats?.activeUsers || 0,
        totalTransactions: dashboardData.totalTransactions || prevStats?.totalTransactions || 0,
        pendingKYC: dashboardData.pendingKYC || prevStats?.pendingKYC || 0,
        systemHealth: dashboardData.systemHealth || prevStats?.systemHealth || 0,
        todayVolume: dashboardData.todayVolume || prevStats?.todayVolume || 0,
        connections: dashboardData.connections || prevStats?.connections || 0,
        uptime: dashboardData.uptime || prevStats?.uptime || '0h 0m'
      }))
      setLastUpdate(new Date())
    }
  }, [dashboardData])

  useEffect(() => {
    if (systemAlerts && systemAlerts.length > 0) {
      setAlerts(systemAlerts)
      // Play sound for high priority alerts
      if (soundEnabled) {
        systemAlerts.forEach(alert => {
          if (alert.priority === 'high' || alert.priority === 'critical') {
            playNotificationSound()
          }
        })
      }
    }
  }, [systemAlerts, soundEnabled])

  useEffect(() => {
    if (recentTransactions && recentTransactions.length > 0) {
      setTransactions(recentTransactions.slice(0, 10)) // Keep last 10 transactions
    }
  }, [recentTransactions])

  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      if (!isConnected) {
        // Manual refresh when WebSocket is disconnected
        refreshData()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, isConnected])

  const playNotificationSound = () => {
    // Create audio context for notification sound
    if (typeof window !== 'undefined' && window.AudioContext) {
      try {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
        
        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
      } catch (error) {
        console.log('Audio notification not supported')
      }
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    try {
      // This would call your actual API endpoint
      const response = await fetch('/api/admin/dashboard-stats', {
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          setStats(result.data.stats)
          setAlerts(result.data.alerts || [])
          setLastUpdate(new Date())
        }
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleFullscreen = () => {
    if (!fullscreenMode) {
      document.documentElement.requestFullscreen?.()
    } else {
      document.exitFullscreen?.()
    }
    setFullscreenMode(!fullscreenMode)
  }

  // Redirect if not admin
  if (isLoading) {
    return (
      <div className="min-h-screen bg-binance-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Initializing admin control center...</p>
        </div>
      </div>
    )
  }

  if (!isAutoAdmin) {
    return (
      <div className="min-h-screen bg-binance-black flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300">Administrator privileges required.</p>
        </div>
      </div>
    )
  }

  const adminNavigationItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart3, 
      href: '/admin/dashboard',
      color: 'from-blue-500 to-cyan-500',
      mobileLabel: 'Overview'
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users, 
      href: '/admin/users',
      color: 'from-green-500 to-emerald-500',
      mobileLabel: 'Users'
    },
    { 
      id: 'transactions', 
      label: 'Transactions', 
      icon: Transactions, 
      href: '/admin/transactions',
      color: 'from-purple-500 to-violet-500',
      mobileLabel: 'TXs'
    },
    { 
      id: 'kyc', 
      label: 'KYC', 
      icon: Shield, 
      href: '/admin/kyc',
      color: 'from-orange-500 to-red-500',
      mobileLabel: 'KYC'
    },
    { 
      id: 'system', 
      label: 'System', 
      icon: Settings, 
      href: '/admin/system',
      color: 'from-gray-500 to-slate-500',
      mobileLabel: 'System'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: TrendingUp, 
      href: '/admin/analytics',
      color: 'from-pink-500 to-rose-500',
      mobileLabel: 'Analytics'
    },
    { 
      id: 'audit', 
      label: 'Audit', 
      icon: FileText, 
      href: '/admin/audit',
      color: 'from-indigo-500 to-blue-500',
      mobileLabel: 'Audit'
    }
  ]

  return (
    <div className={`min-h-screen bg-binance-black ${fullscreenMode ? 'fixed inset-0 z-50' : ''}`}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-white/10 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Crown className="h-6 w-6 text-yellow-400" />
            <span className="text-white font-bold text-lg">Admin</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Connection Status */}
            <div className={`p-1 rounded-full ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-400" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-400" />
              )}
            </div>
            
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            
            {/* More Options */}
            <button
              onClick={() => {
                // Toggle fullscreen on mobile
                if (isMobile) {
                  toggleFullscreen()
                }
              }}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              {fullscreenMode ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <StandardNav isAuthenticated={true} user={{ email: adminUser?.email || '', isAdmin: true }} />
      
      {/* Desktop Header */}
      <div className="hidden lg:block bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Crown className="h-7 w-7 text-black" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Admin Control Center</h1>
                  <p className="text-gray-300 text-sm">Super Administrator Dashboard • Mobile-Ready</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-full border ${
                isConnected ? 'bg-green-500/20 border-green-500/30' : 'bg-red-500/20 border-red-500/30'
              }`}>
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm font-medium ${
                  isConnected ? 'text-green-200' : 'text-red-200'
                }`}>
                  {isConnected ? 'Live' : 'Offline'}
                </span>
              </div>
              
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                title={soundEnabled ? 'Disable sounds' : 'Enable sounds'}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
              
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-blue-500/20 text-blue-300' 
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
                title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
              >
                <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
              </button>
              
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                title={fullscreenMode ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {fullscreenMode ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
              
              {/* Notifications */}
              <button className="relative p-2 rounded-lg bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 transition-colors">
                <Bell className="h-5 w-5" />
                {alerts.filter(a => a.priority === 'high' || a.priority === 'critical').length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {alerts.filter(a => a.priority === 'high' || a.priority === 'critical').length}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-white">Super Admin</p>
                  <p className="text-xs text-gray-300">{adminUser?.email}</p>
                </div>
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
                  <Crown className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={toggleSidebar}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`lg:hidden fixed left-0 top-0 h-full w-80 bg-black/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
            <h2 className="text-white font-bold">Navigation</h2>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="p-4 space-y-2">
            {adminNavigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                    if (item.href) {
                      router.push(item.href)
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{isMobile ? item.mobileLabel : item.label}</span>
                </button>
              )
            })}
          </nav>
          
          {/* Mobile Connection Info */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-300 text-sm">Connection</span>
                <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                  {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                  <span className="text-xs">{isConnected ? 'Live' : 'Offline'}</span>
                </div>
              </div>
              {lastUpdate && (
                <p className="text-gray-500 text-xs">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:block bg-black/20 backdrop-blur-xl border-r border-white/10 w-64 flex-shrink-0">
          <nav className="p-4 space-y-2 sticky top-24">
            {adminNavigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    if (item.href) {
                      router.push(item.href)
                    }
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg transform scale-105`
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
            {activeTab === 'overview' && (
              <div className="space-y-4 lg:space-y-8">
                {/* Quick Stats - Mobile Optimized Grid */}
                <div className={`grid gap-4 ${
                  isMobile 
                    ? 'grid-cols-2' 
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
                }`}>
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-300 text-xs lg:text-sm font-medium">Total Users</p>
                        <p className="text-2xl lg:text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
                      </div>
                      <Users className="h-8 w-8 lg:h-12 lg:w-12 text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-300 text-xs lg:text-sm font-medium">Active Users</p>
                        <p className="text-2xl lg:text-3xl font-bold text-white">{stats?.activeUsers || 0}</p>
                      </div>
                      <Activity className="h-8 w-8 lg:h-12 lg:w-12 text-green-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 rounded-xl p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-300 text-xs lg:text-sm font-medium">Total TXs</p>
                        <p className="text-2xl lg:text-3xl font-bold text-white">{stats?.totalTransactions || 0}</p>
                      </div>
                      <Transactions className="h-8 w-8 lg:h-12 lg:w-12 text-purple-400" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-300 text-xs lg:text-sm font-medium">Pending KYC</p>
                        <p className="text-2xl lg:text-3xl font-bold text-white">{stats?.pendingKYC || 0}</p>
                      </div>
                      <Shield className="h-8 w-8 lg:h-12 lg:w-12 text-orange-400" />
                    </div>
                  </div>
                </div>

                {/* System Health - Mobile Optimized */}
                <div className={`grid gap-4 lg:gap-8 ${
                  isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
                }`}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6">
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6 flex items-center">
                      <Gauge className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-blue-400" />
                      System Health
                    </h3>
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Connections</span>
                        <span className="text-green-400 font-medium">{stats?.connections || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">System Health</span>
                        <span className={`font-medium ${
                          (stats?.systemHealth || 0) > 80 ? 'text-green-400' :
                          (stats?.systemHealth || 0) > 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {stats?.systemHealth || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Uptime</span>
                        <span className="text-blue-400 font-medium">{stats?.uptime || '0h 0m'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6">
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6 flex items-center">
                      <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-yellow-400" />
                      Active Alerts
                    </h3>
                    <div className="space-y-3">
                      {alerts.filter(a => a.priority === 'high' || a.priority === 'critical').length === 0 ? (
                        <p className="text-gray-500 text-sm">No high priority alerts</p>
                      ) : (
                        alerts
                          .filter(a => a.priority === 'high' || a.priority === 'critical')
                          .slice(0, isMobile ? 3 : 5)
                          .map((alert) => (
                            <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                              <div className={`w-2 h-2 rounded-full mt-2 ${
                                alert.type === 'error' ? 'bg-red-500' :
                                alert.type === 'warning' ? 'bg-yellow-500' :
                                alert.type === 'success' ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}></div>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-300 text-sm truncate">{alert.message}</p>
                                <p className="text-gray-500 text-xs">
                                  {new Date(alert.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Real-time Transactions - Mobile Optimized */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 lg:p-6">
                  <h3 className="text-lg lg:text-xl font-bold text-white mb-4 lg:mb-6 flex items-center">
                    <Transactions className="h-5 w-5 lg:h-6 lg:w-6 mr-2 text-purple-400" />
                    Live Transactions
                  </h3>
                  
                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-500">No recent transactions</p>
                      <p className="text-gray-600 text-sm">Transaction data will appear here in real-time</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              transaction.status === 'completed' ? 'bg-green-500' :
                              transaction.status === 'pending' ? 'bg-yellow-500' :
                              transaction.status === 'failed' ? 'bg-red-500' : 'bg-gray-500'
                            }`}></div>
                            <div>
                              <p className="text-white text-sm font-medium">{transaction.user}</p>
                              <p className="text-gray-400 text-xs">{transaction.type} • {new Date(transaction.timestamp).toLocaleTimeString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">
                              {transaction.currency} {transaction.amount.toFixed(2)}
                            </p>
                            <p className={`text-xs ${
                              transaction.status === 'completed' ? 'text-green-400' :
                              transaction.status === 'pending' ? 'text-yellow-400' :
                              transaction.status === 'failed' ? 'text-red-400' : 'text-gray-400'
                            }`}>
                              {transaction.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile Quick Actions */}
                <div className="lg:hidden">
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => router.push('/admin/users')}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                      <Eye className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">Users</p>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/system')}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                      <Database className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">System</p>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/audit')}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                      <Key className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">Audit</p>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/analytics')}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                      <TrendingUp className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">Analytics</p>
                    </button>
                  </div>
                </div>

                {/* Desktop Quick Actions */}
                <div className="hidden lg:block bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <Zap className="h-6 w-6 mr-2 text-purple-400" />
                    God-Mode Quick Actions
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    <button 
                      onClick={() => router.push('/admin/users')}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                      <Eye className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">View All Users</p>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/system')}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                      <Database className="h-8 w-8 text-green-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">System Control</p>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/audit')}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                      <Key className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">Audit Logs</p>
                    </button>
                    <button 
                      onClick={() => router.push('/admin/analytics')}
                      className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-center"
                    >
                      <TrendingUp className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">Analytics</p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-30">
          <div className="flex justify-around py-2">
            {adminNavigationItems.slice(0, 5).map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    if (item.href) {
                      router.push(item.href)
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-2 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5 mb-1" />
                  <span className="text-xs">{item.mobileLabel}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={refreshData}
          disabled={refreshing}
          className="lg:hidden fixed bottom-20 right-4 w-12 h-12 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg z-30 disabled:opacity-50"
        >
          <RefreshCw className={`h-6 w-6 text-white ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      )}

      {/* Connection Status Toast for Mobile */}
      {isMobile && connectionError && (
        <div className="lg:hidden fixed top-20 left-4 right-4 bg-red-500/90 backdrop-blur-xl rounded-lg p-3 text-white text-sm z-40">
          <div className="flex items-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span>Connection lost. Reconnecting... ({reconnectAttempts})</span>
          </div>
        </div>
      )}
    </div>
  )
}