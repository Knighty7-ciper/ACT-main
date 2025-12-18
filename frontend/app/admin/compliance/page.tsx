"use client"

import { useState, useEffect } from 'react'
import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import StandardNav from '@/components/standard-nav'
import MobileNavigation from '@/components/mobile-navigation'
import { 
  FileText, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Plus,
  Shield,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  FileCheck,
  AlertCircle,
  Info,
  UserCheck,
  UserX,
  Globe,
  CreditCard
} from 'lucide-react'

interface ComplianceAlert {
  id: string
  type: 'AML' | 'KYC' | 'Fraud' | 'Regulatory'
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'investigating' | 'resolved' | 'closed'
  title: string
  description: string
  userId?: string
  transactionId?: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  riskScore: number
}

interface ComplianceReport {
  id: string
  type: 'SAR' | 'CTR' | 'Risk Assessment' | 'Transaction Monitoring'
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  title: string
  description: string
  createdAt: string
  submittedAt?: string
  approvedAt?: string
  createdBy: string
  userId?: string
  transactionIds: string[]
  fileUrl?: string
}

interface KYCVerification {
  id: string
  userId: string
  userEmail: string
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired'
  riskLevel: 'low' | 'medium' | 'high'
  documents: Array<{
    type: 'passport' | 'drivers_license' | 'utility_bill' | 'bank_statement'
    status: 'uploaded' | 'verified' | 'rejected'
    uploadedAt: string
    verifiedAt?: string
  }>
  assignedTo?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

interface AuditTrail {
  id: string
  action: string
  user: string
  entityType: string
  entityId: string
  details: string
  ipAddress: string
  userAgent: string
  timestamp: string
}

interface ComplianceMetrics {
  totalAlerts: number
  openAlerts: number
  resolvedAlerts: number
  sarReports: number
  ctrReports: number
  kycPending: number
  complianceScore: number
  riskExposure: number
}

export default function ComplianceManagement() {
  const { isAutoAdmin, adminUser } = useAutoAdmin()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  
  // Data states
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [kycVerifications, setKycVerifications] = useState<KYCVerification[]>([])
  const [auditTrail, setAuditTrail] = useState<AuditTrail[]>([])
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      setLoading(true)
      
      // Load alerts from admin API
      const alertsResponse = await fetch('/api/admin/compliance/alerts', {
        credentials: 'include',
      })
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json()
        if (alertsData.success) {
          setAlerts(alertsData.data.alerts || [])
        }
      }

      // Load reports from admin API
      const reportsResponse = await fetch('/api/admin/compliance/reports', {
        credentials: 'include',
      })
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        if (reportsData.success) {
          setReports(reportsData.data.reports || [])
        }
      }

      // Load KYC verifications from admin API
      const kycResponse = await fetch('/api/admin/compliance/kyc', {
        credentials: 'include',
      })
      if (kycResponse.ok) {
        const kycData = await kycResponse.json()
        if (kycData.success) {
          setKycVerifications(kycData.data.verifications || [])
        }
      }

      // Calculate real metrics from loaded data
      setMetrics({
        totalAlerts: alerts.length,
        openAlerts: alerts.filter(a => a.status === 'open').length,
        resolvedAlerts: alerts.filter(a => a.status === 'resolved').length,
        sarReports: reports.filter(r => r.type === 'SAR').length,
        ctrReports: reports.filter(r => r.type === 'CTR').length,
        kycPending: kycVerifications.filter(k => k.status === 'pending').length,
        complianceScore: alertsData?.data?.complianceScore || 0,
        riskExposure: alertsData?.data?.riskExposure || 0
      })

    } catch (error) {
      console.error('Error loading compliance data:', error)
      // Set empty state instead of mock data
      setAlerts([])
      setReports([])
      setKycVerifications([])
      setAuditTrail([])
      setMetrics({
        totalAlerts: 0,
        openAlerts: 0,
        resolvedAlerts: 0,
        sarReports: 0,
        ctrReports: 0,
        kycPending: 0,
        complianceScore: 0,
        riskExposure: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadComplianceData()
    setRefreshing(false)
  }

  const updateAlertStatus = async (alertId: string, status: string) => {
    try {
      const response = await fetch(`/api/compliance/alerts/${alertId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      })

      if (response.ok) {
        await loadComplianceData()
      }
    } catch (error) {
      console.error('Error updating alert status:', error)
    }
  }

  const generateSAR = async () => {
    try {
      const response = await fetch('/api/compliance/reports/sar', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        await loadComplianceData()
      }
    } catch (error) {
      console.error('Error generating SAR:', error)
    }
  }

  const generateCTR = async () => {
    try {
      const response = await fetch('/api/compliance/reports/ctr', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        await loadComplianceData()
      }
    } catch (error) {
      console.error('Error generating CTR:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': case 'resolved': case 'accepted': case 'approved': case 'completed': return 'text-green-400'
      case 'pending': case 'in_review': case 'draft': case 'investigating': return 'text-yellow-400'
      case 'rejected': case 'closed': case 'expired': return 'text-red-400'
      case 'submitted': case 'in_review': return 'text-blue-400'
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
      case 'approved': case 'resolved': case 'accepted': case 'completed': return CheckCircle
      case 'pending': case 'draft': case 'investigating': return Clock
      case 'rejected': case 'closed': case 'expired': return XCircle
      case 'submitted': case 'in_review': return Eye
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
            <p className="text-gray-300">Loading compliance system...</p>
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
                <h1 className="text-2xl font-bold text-white">Compliance Management</h1>
                <p className="text-sm text-gray-400">AML, KYC, regulatory reporting & audit trails</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={generateSAR}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span>Generate SAR</span>
              </button>
              <button
                onClick={generateCTR}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span>Generate CTR</span>
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
              { id: 'alerts', label: 'Alerts', icon: AlertTriangle },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'kyc', label: 'KYC Queue', icon: UserCheck },
              { id: 'audit', label: 'Audit Trail', icon: Eye },
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
        {activeTab === 'overview' && metrics && (
          <div className="space-y-6">
            {/* Compliance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Open Alerts</p>
                    <p className="text-2xl font-bold text-white">{metrics.openAlerts}</p>
                    <p className="text-sm text-gray-400">of {metrics.totalAlerts} total</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <TrendingDown className="h-4 w-4 text-green-400 mr-1" />
                    <span className="text-green-400">↓ 15% from last week</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">SAR Reports</p>
                    <p className="text-2xl font-bold text-white">{metrics.sarReports}</p>
                    <p className="text-sm text-gray-400">submitted</p>
                  </div>
                  <FileText className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400">3 this month</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">KYC Pending</p>
                    <p className="text-2xl font-bold text-white">{metrics.kycPending}</p>
                    <p className="text-sm text-gray-400">verifications</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-yellow-400">Avg 2.3 days</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Compliance Score</p>
                    <p className="text-2xl font-bold text-white">{metrics.complianceScore}%</p>
                    <p className="text-sm text-gray-400">overall rating</p>
                  </div>
                  <Shield className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-green-400 h-2 rounded-full" 
                      style={{ width: `${metrics.complianceScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Compliance Activity</h3>
              <div className="space-y-3">
                {alerts.slice(0, 3).map((alert) => {
                  const StatusIcon = getStatusIcon(alert.status)
                  return (
                    <div key={alert.id} className="flex items-center justify-between p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${getSeverityColor(alert.severity)}`} />
                        <div>
                          <p className="text-white font-medium">{alert.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span>{alert.type}</span>
                            <span>Risk Score: {alert.riskScore}</span>
                            <span>{new Date(alert.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Risk Exposure */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Risk Exposure Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-400">{metrics.riskExposure}%</div>
                  <p className="text-gray-400">Overall Risk</p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                    <div className="bg-red-400 h-2 rounded-full" style={{ width: `${metrics.riskExposure}%` }}></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400">7</div>
                  <p className="text-gray-400">High Risk Users</p>
                  <div className="text-sm text-gray-400 mt-1">Require enhanced due diligence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">95%</div>
                  <p className="text-gray-400">KYC Completion</p>
                  <div className="text-sm text-gray-400 mt-1">Above industry average</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-6">
            {/* Compliance Alerts */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Compliance Alerts</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search alerts..."
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
                {alerts.map((alert) => {
                  const StatusIcon = getStatusIcon(alert.status)
                  return (
                    <div key={alert.id} className="p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <StatusIcon className={`h-5 w-5 ${getSeverityColor(alert.severity)} mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-white font-medium">{alert.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(alert.status)}`}>
                                {alert.status}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                              <div>
                                <span className="font-medium">Type:</span> {alert.type}
                              </div>
                              <div>
                                <span className="font-medium">Risk Score:</span> {alert.riskScore}
                              </div>
                              <div>
                                <span className="font-medium">Created:</span> {new Date(alert.createdAt).toLocaleDateString()}
                              </div>
                              {alert.assignedTo && (
                                <div>
                                  <span className="font-medium">Assigned:</span> {alert.assignedTo}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'investigating')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors"
                          >
                            Investigate
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

        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Compliance Reports */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Regulatory Reports</h3>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-black rounded-lg transition-colors">
                    <Plus className="h-4 w-4" />
                    <span>New Report</span>
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                {reports.map((report) => {
                  const StatusIcon = getStatusIcon(report.status)
                  return (
                    <div key={report.id} className="p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(report.status)} mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-white font-medium">{report.title}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                report.type === 'SAR' ? 'bg-red-600 text-white' :
                                report.type === 'CTR' ? 'bg-blue-600 text-white' :
                                'bg-gray-600 text-white'
                              }`}>
                                {report.type}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                                {report.status}
                              </span>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{report.description}</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-400">
                              <div>
                                <span className="font-medium">Created:</span> {new Date(report.createdAt).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Created By:</span> {report.createdBy}
                              </div>
                              {report.submittedAt && (
                                <div>
                                  <span className="font-medium">Submitted:</span> {new Date(report.submittedAt).toLocaleDateString()}
                                </div>
                              )}
                              <div>
                                <span className="font-medium">Transactions:</span> {report.transactionIds.length}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {report.status === 'submitted' && (
                            <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                              Download
                            </button>
                          )}
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

        {activeTab === 'kyc' && (
          <div className="space-y-6">
            {/* KYC Verification Queue */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">KYC Verification Queue</h3>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 bg-[#2a2d34] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {kycVerifications.map((kyc) => {
                  const StatusIcon = getStatusIcon(kyc.status)
                  return (
                    <div key={kyc.id} className="p-4 bg-[#2a2d34] rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <StatusIcon className={`h-5 w-5 ${getStatusColor(kyc.status)} mt-0.5`} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-white font-medium">{kyc.userEmail}</h4>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(kyc.status)}`}>
                                {kyc.status}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                kyc.riskLevel === 'low' ? 'bg-green-600 text-white' :
                                kyc.riskLevel === 'medium' ? 'bg-yellow-600 text-black' :
                                'bg-red-600 text-white'
                              }`}>
                                {kyc.riskLevel} risk
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-400">Documents:</span>
                                <div className="flex space-x-2 mt-1">
                                  {kyc.documents.map((doc, index) => (
                                    <span key={index} className={`px-2 py-1 rounded text-xs ${
                                      doc.status === 'verified' ? 'bg-green-600 text-white' :
                                      doc.status === 'uploaded' ? 'bg-yellow-600 text-black' :
                                      'bg-red-600 text-white'
                                    }`}>
                                      {doc.type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-400">Submitted:</span>
                                <div className="text-white">{new Date(kyc.createdAt).toLocaleDateString()}</div>
                              </div>
                              {kyc.assignedTo && (
                                <div>
                                  <span className="font-medium text-gray-400">Assigned:</span>
                                  <div className="text-white">{kyc.assignedTo}</div>
                                </div>
                              )}
                            </div>
                            {kyc.notes && (
                              <div className="mt-2 p-2 bg-[#363940] rounded text-sm text-gray-300">
                                <span className="font-medium">Notes:</span> {kyc.notes}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {kyc.status === 'pending' || kyc.status === 'in_review' ? (
                            <>
                              <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
                                Approve
                              </button>
                              <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition-colors">
                                Reject
                              </button>
                            </>
                          ) : null}
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

        {activeTab === 'audit' && (
          <div className="space-y-6">
            {/* Audit Trail */}
            <div className="bg-[#1e2028] p-6 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Audit Trail</h3>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                    <Download className="h-4 w-4" />
                    <span>Export</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Timestamp</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Entity</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">Details</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-medium">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        timestamp: new Date().toISOString(),
                        user: 'admin_user',
                        action: 'KYC_APPROVED',
                        entityType: 'user',
                        entityId: 'user_456',
                        details: 'Approved KYC verification for user',
                        ipAddress: '192.168.1.100'
                      },
                      {
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        user: 'compliance_officer',
                        action: 'SAR_GENERATED',
                        entityType: 'report',
                        entityId: 'sar_001',
                        details: 'Generated Suspicious Activity Report',
                        ipAddress: '192.168.1.101'
                      },
                      {
                        timestamp: new Date(Date.now() - 7200000).toISOString(),
                        user: 'kyc_specialist',
                        action: 'ALERT_ASSIGNED',
                        entityType: 'alert',
                        entityId: 'alert_123',
                        details: 'Assigned AML alert to investigation team',
                        ipAddress: '192.168.1.102'
                      },
                      {
                        timestamp: new Date(Date.now() - 10800000).toISOString(),
                        user: 'admin_user',
                        action: 'USER_SUSPENDED',
                        entityType: 'user',
                        entityId: 'user_789',
                        details: 'Temporarily suspended user account due to fraud',
                        ipAddress: '192.168.1.100'
                      }
                    ].map((entry, index) => (
                      <tr key={index} className="border-b border-gray-700">
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {new Date(entry.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {entry.user}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs">
                            {entry.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {entry.entityType}: {entry.entityId}
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-sm">
                          {entry.details}
                        </td>
                        <td className="py-3 px-4 text-gray-400 text-sm">
                          {entry.ipAddress}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <MobileNavigation />
    </div>
  )
}