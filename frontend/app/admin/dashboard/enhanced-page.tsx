"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import { useAdminWebSocket } from '@/app/hooks/useWebSocket'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from '@/components/ui/enhanced-card'
import { StatsGrid, StatItem } from '@/components/ui/enhanced-stats'
import { LoadingSpinner, DashboardSkeleton, TableSkeleton, LoadingOverlay } from '@/components/ui/enhanced-loading'
import { EnhancedNav, SubNav } from '@/components/ui/enhanced-nav'
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
  Search,
  Filter,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Info,
  CheckCircle2,
  XCircle2
} from 'lucide-react'

// Mock data interfaces (replace with actual types)
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
  status: 'pending' | 'completed' | 'failed'
  timestamp: string
}

export default function EnhancedAdminDashboard() {
  const { isAutoAdmin, isLoading: authLoading } = useAutoAdmin()
  const router = useRouter()
  
  // WebSocket data
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

  // UI State
  const [isMobile, setIsMobile] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Dashboard data
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  // Device detection
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && !isAutoAdmin) {
      router.push('/auth/login')
    }
  }, [authLoading, isAutoAdmin, router])

  // Connect to WebSocket
  useEffect(() => {
    if (isAutoAdmin && !isConnected) {
      connect()
    }
  }, [isAutoAdmin, isConnected, connect])

  // Update local state with WebSocket data
  useEffect(() => {
    if (dashboardData) {
      setStats({
        totalUsers: dashboardData.totalUsers || 1250,
        activeUsers: dashboardData.activeUsers || 842,
        totalTransactions: dashboardData.totalTransactions || 15680,
        pendingKYC: dashboardData.pendingKYC || 23,
        systemHealth: dashboardData.systemHealth || 98.5,
        todayVolume: dashboardData.todayVolume || 2450000,
        connections: dashboardData.connections || 1247,
        uptime: dashboardData.uptime || '127d 14h'
      })
    }
  }, [dashboardData])

  useEffect(() => {
    if (systemAlerts) {
      setAlerts(systemAlerts.slice(0, 5)) // Show only latest 5 alerts
    }
  }, [systemAlerts])

  useEffect(() => {
    if (recentTransactions) {
      setTransactions(recentTransactions.slice(0, isMobile ? 5 : 10))
    }
  }, [recentTransactions, isMobile])

  // Loading state
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getStatsData = (): StatItem[] => {
    if (!stats) return []

    return [
      {
        id: 'total-users',
        title: 'Total Users',
        value: formatNumber(stats.totalUsers),
        change: {
          value: 12.5,
          period: '30d',
          type: 'positive'
        },
        icon: <Users className="size-6" />,
        color: 'blue',
        animated: true
      },
      {
        id: 'active-users',
        title: 'Active Users',
        value: formatNumber(stats.activeUsers),
        change: {
          value: 8.2,
          period: '7d',
          type: 'positive'
        },
        icon: <Activity className="size-6" />,
        color: 'green',
        animated: true
      },
      {
        id: 'total-transactions',
        title: 'Transactions',
        value: formatNumber(stats.totalTransactions),
        change: {
          value: 15.3,
          period: '24h',
          type: 'positive'
        },
        icon: <Transactions className="size-6" />,
        color: 'gold',
        animated: true
      },
      {
        id: 'system-health',
        title: 'System Health',
        value: `${stats.systemHealth}%`,
        change: {
          value: 0.2,
          period: '24h',
          type: 'positive'
        },
        icon: <Gauge className="size-6" />,
        color: 'green',
        animated: false
      },
      {
        id: 'today-volume',
        title: "Today's Volume",
        value: formatCurrency(stats.todayVolume),
        change: {
          value: 22.1,
          period: '24h',
          type: 'positive'
        },
        icon: <TrendingUp className="size-6" />,
        color: 'gold',
        animated: true
      },
      {
        id: 'pending-kyc',
        title: 'Pending KYC',
        value: stats.pendingKYC,
        change: {
          value: -12.3,
          period: '24h',
          type: 'positive'
        },
        icon: <UserCheck className="size-6" />,
        color: 'red',
        animated: true
      },
      {
        id: 'connections',
        title: 'Active Connections',
        value: formatNumber(stats.connections),
        change: {
          value: 5.7,
          period: '24h',
          type: 'positive'
        },
        icon: <Wifi className="size-6" />,
        color: 'blue',
        animated: true
      },
      {
        id: 'uptime',
        title: 'System Uptime',
        value: stats.uptime,
        change: {
          value: 0,
          period: '24h',
          type: 'neutral'
        },
        icon: <Server className="size-6" />,
        color: 'green',
        animated: false
      }
    ]
  }

  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: <BarChart3 className="size-4" /> },
    { name: 'Users', href: '/admin/users', icon: <Users className="size-4" />, badge: stats?.totalUsers ? formatNumber(stats.totalUsers) : undefined },
    { name: 'Transactions', href: '/admin/transactions', icon: <Transactions className="size-4" />, badge: transactions.length || 0 },
    { name: 'Compliance', href: '/admin/compliance', icon: <Shield className="size-4" /> },
    { name: 'Security', href: '/admin/security', icon: <Lock className="size-4" /> },
    { name: 'Analytics', href: '/admin/analytics', icon: <TrendingUp className="size-4" /> },
    { name: 'System', href: '/admin/system', icon: <Server className="size-4" /> },
  ]

  if (authLoading || loading) {
    return <DashboardSkeleton />
  }

  if (!isAutoAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-act-dark-900 to-act-dark-800 flex items-center justify-center">
        <EnhancedCard variant="error" className="text-center p-8">
          <XCircle className="size-12 mx-auto mb-4 text-act-red-400" />
          <h2 className="text-2xl font-bold text-act-dark-200 mb-2">Access Denied</h2>
          <p className="text-act-dark-400">Administrator privileges required.</p>
        </EnhancedCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-act-dark-900 via-act-dark-800 to-act-dark-900">
      <EnhancedNav variant="admin" notifications={alerts.filter(a => a.priority === 'high').length} />
      <SubNav items={adminNavItems} currentPath="/admin/dashboard" />
      
      <div className="enhanced-container py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gradient">Admin Dashboard</h1>
            <p className="text-act-dark-400">
              Platform overview and system monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 lg:mt-0">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-act-green-400 animate-pulse' : 'bg-act-red-400'}`} />
              <span className="text-sm text-act-dark-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {reconnectAttempts > 0 && (
                <span className="text-xs text-act-gold-400">
                  ({reconnectAttempts} retries)
                </span>
              )}
            </div>
            
            <EnhancedButton
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />}
              onClick={() => setRefreshing(true)}
              disabled={refreshing}
            >
              Refresh
            </EnhancedButton>
          </div>
        </div>

        {/* Stats Grid */}
        <section className="mb-12">
          <StatsGrid 
            stats={getStatsData()} 
            columns={isMobile ? 1 : 4}
            loading={loading}
          />
        </section>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Charts and Tables */}
          <div className="lg:col-span-2 space-y-8">
            {/* System Alerts */}
            <EnhancedCard variant="elevated">
              <EnhancedCardHeader>
                <div className="flex items-center justify-between">
                  <EnhancedCardTitle className="flex items-center gap-2">
                    <AlertTriangle className="size-5 text-act-gold-400" />
                    System Alerts
                  </EnhancedCardTitle>
                  <EnhancedButton variant="ghost" size="sm" rightIcon={<ChevronDown className="size-3" />}>
                    View All
                  </EnhancedButton>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg">
                        <div className="w-8 h-8 bg-act-dark-700 rounded-lg animate-pulse" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-act-dark-700 rounded animate-pulse" />
                          <div className="h-3 bg-act-dark-700 rounded w-3/4 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map((alert) => (
                      <div 
                        key={alert.id} 
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border transition-colors",
                          alert.priority === 'critical' ? "bg-act-red-500/10 border-act-red-500/20" :
                          alert.priority === 'high' ? "bg-act-gold-500/10 border-act-gold-500/20" :
                          alert.priority === 'medium' ? "bg-blue-500/10 border-blue-500/20" :
                          "bg-act-dark-700/50 border-act-dark-600"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
                          alert.type === 'error' ? "bg-act-red-500/20 text-act-red-400" :
                          alert.type === 'warning' ? "bg-act-gold-500/20 text-act-gold-400" :
                          alert.type === 'success' ? "bg-act-green-500/20 text-act-green-400" :
                          "bg-blue-500/20 text-blue-400"
                        )}>
                          {alert.type === 'error' ? <XCircle className="size-4" /> :
                           alert.type === 'warning' ? <AlertTriangle className="size-4" /> :
                           alert.type === 'success' ? <CheckCircle className="size-4" /> :
                           <Info className="size-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-act-dark-200">{alert.message}</p>
                          <p className="text-xs text-act-dark-400 mt-1">{alert.timestamp}</p>
                        </div>
                        <span className={cn(
                          "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
                          alert.priority === 'critical' ? "bg-act-red-500/20 text-act-red-400" :
                          alert.priority === 'high' ? "bg-act-gold-500/20 text-act-gold-400" :
                          alert.priority === 'medium' ? "bg-blue-500/20 text-blue-400" :
                          "bg-act-dark-600 text-act-dark-300"
                        )}>
                          {alert.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="size-12 mx-auto text-act-green-400 mb-4" />
                    <p className="text-act-dark-400">All systems operational</p>
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Recent Transactions */}
            <EnhancedCard variant="elevated">
              <EnhancedCardHeader>
                <div className="flex items-center justify-between">
                  <EnhancedCardTitle className="flex items-center gap-2">
                    <Transactions className="size-5 text-act-gold-400" />
                    Recent Transactions
                  </EnhancedCardTitle>
                  <div className="flex items-center gap-2">
                    <EnhancedButton variant="ghost" size="sm" leftIcon={<Search className="size-4" />}>
                      Search
                    </EnhancedButton>
                    <EnhancedButton variant="ghost" size="sm" leftIcon={<Filter className="size-4" />}>
                      Filter
                    </EnhancedButton>
                  </div>
                </div>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                {loading ? (
                  <TableSkeleton rows={5} columns={4} />
                ) : (
                  <div className="enhanced-table">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr>
                            <th className="text-left p-4 text-sm font-semibold text-act-dark-400">User</th>
                            <th className="text-left p-4 text-sm font-semibold text-act-dark-400">Amount</th>
                            <th className="text-left p-4 text-sm font-semibold text-act-dark-400">Status</th>
                            <th className="text-left p-4 text-sm font-semibold text-act-dark-400">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {transactions.map((tx, index) => (
                            <tr key={tx.id} className="border-t border-act-gold-500/10">
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-gradient-to-br from-act-gold-400 to-act-gold-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                      {tx.user.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="text-act-dark-200 font-medium">{tx.user}</span>
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="text-act-dark-200 font-mono">
                                  {formatCurrency(tx.amount)} {tx.currency}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={cn(
                                  "inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold",
                                  tx.status === 'completed' ? "bg-act-green-500/20 text-act-green-400" :
                                  tx.status === 'pending' ? "bg-act-gold-500/20 text-act-gold-400" :
                                  "bg-act-red-500/20 text-act-red-400"
                                )}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="p-4 text-act-dark-400 text-sm">{tx.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </EnhancedCardContent>
            </EnhancedCard>
          </div>

          {/* Right Column - Quick Actions and System Info */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <EnhancedCard variant="premium">
              <EnhancedCardHeader>
                <EnhancedCardTitle>Quick Actions</EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-3">
                <EnhancedButton variant="outline" className="w-full" leftIcon={<Plus className="size-4" />}>
                  Add User
                </EnhancedButton>
                <EnhancedButton variant="outline" className="w-full" leftIcon={<FileText className="size-4" />}>
                  Generate Report
                </EnhancedButton>
                <EnhancedButton variant="outline" className="w-full" leftIcon={<Settings className="size-4" />}>
                  System Settings
                </EnhancedButton>
                <EnhancedButton variant="outline" className="w-full" leftIcon={<Download className="size-4" />}>
                  Export Data
                </EnhancedButton>
              </EnhancedCardContent>
            </EnhancedCard>

            {/* System Status */}
            <EnhancedCard variant="glass">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2">
                  <Server className="size-5 text-act-gold-400" />
                  System Status
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent className="space-y-4">
                {[
                  { label: 'Database', status: 'healthy', value: '99.9%' },
                  { label: 'API Gateway', status: 'healthy', value: '99.8%' },
                  { label: 'WebSocket', status: isConnected ? 'healthy' : 'degraded', value: isConnected ? '99.7%' : 'Offline' },
                  { label: 'Cache', status: 'healthy', value: '100%' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-act-dark-400">{item.label}</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'healthy' ? 'bg-act-green-400' : 
                        item.status === 'degraded' ? 'bg-act-gold-400' : 'bg-act-red-400'
                      }`} />
                      <span className={cn(
                        "text-sm font-medium",
                        item.status === 'healthy' ? 'text-act-green-400' : 
                        item.status === 'degraded' ? 'text-act-gold-400' : 'text-act-red-400'
                      )}>
                        {item.value}
                      </span>
                    </div>
                  </div>
                ))}
              </EnhancedCardContent>
            </EnhancedCard>

            {/* Recent Activity */}
            <EnhancedCard variant="subtle">
              <EnhancedCardHeader>
                <EnhancedCardTitle className="flex items-center gap-2">
                  <Activity className="size-5 text-act-gold-400" />
                  Recent Activity
                </EnhancedCardTitle>
              </EnhancedCardHeader>
              <EnhancedCardContent>
                <div className="space-y-3">
                  {[
                    { action: 'User registered', user: 'john@example.com', time: '2 min ago' },
                    { action: 'Transaction completed', user: 'alice@example.com', time: '5 min ago' },
                    { action: 'KYC approved', user: 'bob@example.com', time: '12 min ago' },
                    { action: 'System backup', user: 'System', time: '1 hour ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-act-gold-400 mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-act-dark-200">{activity.action}</p>
                        <p className="text-act-dark-400 text-xs">{activity.user} • {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </EnhancedCardContent>
            </EnhancedCard>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      <LoadingOverlay isVisible={refreshing} message="Refreshing dashboard data..." />
    </div>
  )
}

// Helper function
import { cn } from '@/lib/utils'