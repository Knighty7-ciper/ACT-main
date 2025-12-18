"use client"

import { useState, useEffect } from 'react'
import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import StandardNav from '@/components/standard-nav'
import MobileNavigation from '@/components/mobile-navigation'
import { 
  Users, 
  MessageCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
  Calendar,
  Tag,
  Priority,
  RefreshCw,
  UserCheck,
  UserX,
  FileText,
  Phone,
  Mail,
  Globe,
  Zap,
  Settings,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Plus
} from 'lucide-react'

interface UserRequest {
  id: string
  title: string
  description: string
  category: 'technical' | 'account' | 'billing' | 'compliance' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  userId: string
  userEmail: string
  userName?: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
  resolution?: string
  tags: string[]
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
  estimatedResolution?: string
  actualResolution?: string
  satisfactionRating?: number
  notes?: Array<{
    content: string
    author: string
    timestamp: string
    isInternal: boolean
  }>
}

interface RequestStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
  averageResolutionTime: number
  satisfactionScore: number
  responseTime: number
}

export default function UserRequestsManagement() {
  const { isAutoAdmin, adminUser } = useAutoAdmin()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [requests, setRequests] = useState<UserRequest[]>([])
  const [stats, setStats] = useState<RequestStats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)

  useEffect(() => {
    loadUserRequests()
  }, [])

  const loadUserRequests = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        status: statusFilter === 'all' ? '' : statusFilter,
        priority: priorityFilter === 'all' ? '' : priorityFilter,
        category: categoryFilter === 'all' ? '' : categoryFilter,
        search: searchTerm
      })

      const response = await fetch(`/api/admin/user-requests?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch user requests: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setRequests(result.data.requests || [])
        
        // Calculate real stats from API data
        const requestsData = result.data.requests || []
        const now = new Date()
        const resolvedRequests = requestsData.filter((r: UserRequest) => r.status === 'resolved' && r.resolvedAt)
        
        setStats({
          total: requestsData.length,
          open: requestsData.filter((r: UserRequest) => r.status === 'open').length,
          inProgress: requestsData.filter((r: UserRequest) => r.status === 'in_progress').length,
          resolved: resolvedRequests.length,
          closed: requestsData.filter((r: UserRequest) => r.status === 'closed').length,
          averageResolutionTime: resolvedRequests.length > 0 
            ? Math.round(resolvedRequests.reduce((acc: number, r: UserRequest) => {
                const created = new Date(r.createdAt)
                const resolved = new Date(r.resolvedAt!)
                return acc + (resolved.getTime() - created.getTime())
              }, 0) / resolvedRequests.length / (1000 * 60 * 60)) // hours
            : 0,
          satisfactionScore: result.data.satisfactionScore || 0,
          responseTime: result.data.averageResponseTime || 0
        })
      }
    } catch (error) {
      console.error('Error loading user requests:', error)
      // Set empty state instead of mock data
      setRequests([])
      setStats({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        averageResolutionTime: 0,
        satisfactionScore: 0,
        responseTime: 0
      })
    } finally {
      setLoading(false)
    }
  }



  const handleRefresh = async () => {
    setRefreshing(true)
    await loadUserRequests()
    setRefreshing(false)
  }

  const assignRequest = async (requestId: string, adminId: string) => {
    try {
      const response = await fetch(`/api/admin/user-requests/${requestId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ adminId })
      })

      if (response.ok) {
        await loadUserRequests()
      }
    } catch (error) {
      console.error('Error assigning request:', error)
    }
  }

  const resolveRequest = async (requestId: string, resolution: string, rating?: number) => {
    try {
      const response = await fetch(`/api/admin/user-requests/${requestId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ resolution, satisfactionRating: rating })
      })

      if (response.ok) {
        await loadUserRequests()
      }
    } catch (error) {
      console.error('Error resolving request:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved': case 'closed': return 'text-green-400'
      case 'in_progress': return 'text-blue-400'
      case 'open': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'urgent': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical': return Settings
      case 'account': return UserCheck
      case 'billing': return FileText
      case 'compliance': return AlertCircle
      default: return MessageCircle
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved': case 'closed': return CheckCircle
      case 'in_progress': return Clock
      case 'open': return AlertCircle
      default: return Clock
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return Zap
      case 'high': return TrendingUp
      case 'medium': return Clock
      case 'low': return TrendingDown
      default: return Clock
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-binance-black">
        <StandardNav user={adminUser} isAuthenticated={true} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading user requests...</p>
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
              <MessageCircle className="h-8 w-8 text-yellow-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">User Requests Management</h1>
                <p className="text-sm text-gray-400">User assistance requests & support tickets</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowNewRequestModal(true)}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>New Request</span>
              </button>
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
              { id: 'requests', label: 'All Requests', icon: MessageCircle },
              { id: 'queue', label: 'Support Queue', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
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
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Request Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Open Requests</p>
                    <p className="text-2xl font-bold text-white">{stats.open}</p>
                    <p className="text-sm text-gray-400">of {stats.total} total</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <TrendingDown className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-green-400">↓ 8% from last week</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-white">{stats.inProgress}</p>
                    <p className="text-sm text-gray-400">currently being worked</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400">Avg {stats.responseTime}h response</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Resolved Today</p>
                    <p className="text-2xl font-bold text-white">{stats.resolved}</p>
                    <p className="text-sm text-gray-400">avg {stats.averageResolutionTime}h resolution</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-green-400">+12% efficiency</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Satisfaction Score</p>
                    <p className="text-2xl font-bold text-white">{stats.satisfactionScore}/5</p>
                    <p className="text-sm text-gray-400">user rating</p>
                  </div>
                  <Users className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-400 h-2 rounded-full" 
                      style={{ width: `${(stats.satisfactionScore / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {requests.slice(0, 5).map((request) => {
                  const StatusIcon = getStatusIcon(request.status)
                  const PriorityIcon = getPriorityIcon(request.priority)
                  return (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${getStatusColor(request.status)}`} />
                        <div>
                          <p className="text-white font-medium">{request.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{request.userName} ({request.userEmail})</span>
                            <span>{request.category}</span>
                            <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <PriorityIcon className={`h-4 w-4 ${getPriorityColor(request.priority)}`} />
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Assign Request', icon: UserPlus, action: () => {} },
                  { label: 'View Queue', icon: Users, action: () => setActiveTab('queue') },
                  { label: 'Generate Report', icon: FileText, action: () => {} },
                  { label: 'Settings', icon: Settings, action: () => {} },
                ].map(({ label, icon: IconComponent, action }) => (
                  <button
                    key={label}
                    onClick={action}
                    className="flex flex-col items-center p-4 bg-[#2a2d34] hover:bg-[#363940] rounded-lg transition-colors"
                  >
                    <IconComponent className="h-6 w-6 text-yellow-400 mb-2" />
                    <span className="text-sm text-white">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-64">
                  <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full bg-[#2a2d34] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#2a2d34] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 bg-[#2a2d34] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 bg-[#2a2d34] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="all">All Categories</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                  <option value="billing">Billing</option>
                  <option value="compliance">Compliance</option>
                  <option value="general">General</option>
                </select>

                <button
                  onClick={loadUserRequests}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors"
                >
                  <Filter className="h-4 w-4" />
                  <span>Apply</span>
                </button>
              </div>
            </div>

            {/* Requests List */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="space-y-4">
                {requests.map((request) => {
                  const StatusIcon = getStatusIcon(request.status)
                  const PriorityIcon = getPriorityIcon(request.priority)
                  const CategoryIcon = getCategoryIcon(request.category)
                  
                  return (
                    <div key={request.id} className="p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className={`h-5 w-5 ${getStatusColor(request.status)}`} />
                            <CategoryIcon className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-white font-medium">{request.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                                {request.status}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
                                {request.priority}
                              </span>
                              <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                                {request.category}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{request.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400 mb-3">
                              <div>
                                <span className="font-medium">User:</span> {request.userName} ({request.userEmail})
                              </div>
                              <div>
                                <span className="font-medium">Created:</span> {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                              {request.assignedTo && (
                                <div>
                                  <span className="font-medium">Assigned:</span> {request.assignedTo}
                                </div>
                              )}
                              {request.estimatedResolution && (
                                <div>
                                  <span className="font-medium">ETA:</span> {new Date(request.estimatedResolution).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                            {request.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {request.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            {request.resolution && (
                              <div className="p-2 bg-green-900 bg-opacity-30 border border-green-600 rounded text-sm text-green-300">
                                <span className="font-medium">Resolution:</span> {request.resolution}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <PriorityIcon className={`h-4 w-4 ${getPriorityColor(request.priority)}`} />
                          <button className="p-2 hover:bg-[#363940] rounded">
                            <Eye className="h-4 w-4 text-gray-400" />
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

        {activeTab === 'queue' && (
          <div className="space-y-6">
            {/* Support Queue */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Support Team Queue</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <span className="text-sm text-gray-400">Available</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <span className="text-sm text-gray-400">Busy</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <span className="text-sm text-gray-400">Offline</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {['Open Requests', 'In Progress', 'Awaiting Response'].map((category, index) => (
                  <div key={category} className="bg-[#2a2d34] p-4 rounded-lg">
                    <h4 className="text-white font-medium mb-3 flex items-center justify-between">
                      {category}
                      <span className="px-2 py-1 bg-gray-600 rounded text-xs">
                        {requests.filter(r => {
                          if (index === 0) return r.status === 'open'
                          if (index === 1) return r.status === 'in_progress'
                          return r.status === 'resolved' && !r.resolution
                        }).length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {requests.filter(r => {
                        if (index === 0) return r.status === 'open'
                        if (index === 1) return r.status === 'in_progress'
                        return r.status === 'resolved' && !r.resolution
                      }).slice(0, 5).map((request) => (
                        <div key={request.id} className="p-2 bg-[#363940] rounded text-sm">
                          <div className="flex items-center justify-between">
                            <p className="text-white font-medium truncate">{request.title}</p>
                            <PriorityIcon className={`h-3 w-3 ${getPriorityColor(request.priority)}`} />
                          </div>
                          <p className="text-gray-400 text-xs truncate">{request.userEmail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && stats && (
          <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Response Time Trends</h3>
                <div className="space-y-3">
                  {['Today', 'Yesterday', 'This Week', 'Last Week'].map((period, index) => (
                    <div key={period} className="flex items-center justify-between p-3 bg-[#2a2d34] rounded">
                      <span className="text-gray-300">{period}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{(2.3 - index * 0.2).toFixed(1)}h</span>
                        <TrendingDown className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Resolution Time</h3>
                <div className="space-y-3">
                  {['Technical', 'Account', 'Billing', 'Compliance'].map((category, index) => (
                    <div key={category} className="flex items-center justify-between p-3 bg-[#2a2d34] rounded">
                      <span className="text-gray-300">{category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{(24 + index * 6)}h</span>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-2 rounded-full" 
                            style={{ width: `${60 + index * 10}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Satisfaction Ratings */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">User Satisfaction Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-2">
                      {[...Array(rating)].map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                      {[...Array(5 - rating)].map((_, i) => (
                        <span key={i} className="text-gray-600">★</span>
                      ))}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                    <div className="text-sm text-gray-400">{rating} stars</div>
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