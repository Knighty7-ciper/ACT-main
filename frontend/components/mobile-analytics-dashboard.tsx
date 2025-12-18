"use client"

import React, { useState, useEffect } from 'react'
import TouchButton from './touch-button'
import { 
  Smartphone,
  TrendingUp,
  BarChart3,
  Shield,
  Map,
  DollarSign,
  Users,
  Activity,
  AlertTriangle,
  Eye,
  RefreshCw,
  Download,
  Filter,
  Bell,
  Zap,
  Brain,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Globe
} from 'lucide-react'

interface MobileAnalyticsData {
  totalUsers: number
  dailyActive: number
  revenue: number
  transactions: number
  fraudAlerts: number
  geographicData: any[]
}

interface QuickMetric {
  label: string
  value: string | number
  change: number
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function MobileAnalyticsDashboard() {
  const [activeView, setActiveView] = useState<'overview' | 'fraud' | 'geographic' | 'revenue'>('overview')
  const [analyticsData, setAnalyticsData] = useState<MobileAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [realTimeEnabled, setRealTimeEnabled] = useState(true)

  useEffect(() => {
    fetchAnalyticsData()
    
    // Set up real-time updates if enabled
    let interval: NodeJS.Timeout
    if (realTimeEnabled) {
      interval = setInterval(() => {
        fetchAnalyticsData(true) // Silent refresh
      }, 30000) // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [realTimeEnabled])

  const fetchAnalyticsData = async (silent = false) => {
    if (!silent) setLoading(true)
    
    try {
      // Mock data for mobile analytics
      const mockData: MobileAnalyticsData = {
        totalUsers: 1247 + Math.floor(Math.random() * 50),
        dailyActive: 892 + Math.floor(Math.random() * 30),
        revenue: 125000 + Math.floor(Math.random() * 10000),
        transactions: 3400 + Math.floor(Math.random() * 200),
        fraudAlerts: Math.floor(Math.random() * 5),
        geographicData: [
          { country: 'KE', users: 450, flag: '🇰🇪' },
          { country: 'NG', users: 380, flag: '🇳🇬' },
          { country: 'GH', users: 220, flag: '🇬🇭' },
          { country: 'ZA', users: 150, flag: '🇿🇦' },
          { country: 'EG', users: 47, flag: '🇪🇬' }
        ]
      }
      
      setAnalyticsData(mockData)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching mobile analytics:', error)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const quickMetrics: QuickMetric[] = analyticsData ? [
    {
      label: 'Total Users',
      value: analyticsData.totalUsers.toLocaleString(),
      change: 12.5,
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Daily Active',
      value: analyticsData.dailyActive.toLocaleString(),
      change: 8.3,
      icon: Activity,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Revenue',
      value: `$${(analyticsData.revenue / 1000).toFixed(0)}K`,
      change: 15.7,
      icon: DollarSign,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Transactions',
      value: analyticsData.transactions.toLocaleString(),
      change: -2.1,
      icon: BarChart3,
      color: 'from-orange-500 to-orange-600'
    }
  ] : []

  const FraudAlertCard = () => (
    <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center">
          <Shield className="h-5 w-5 mr-2 text-red-400" />
          Fraud Detection
        </h3>
        <div className="flex items-center space-x-2">
          <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs">
            {analyticsData?.fraudAlerts || 0} Active
          </span>
          <button
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
            className={`p-1 rounded ${realTimeEnabled ? 'text-green-400' : 'text-gray-400'}`}
          >
            <Zap className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {analyticsData && analyticsData.fraudAlerts > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-white text-sm">High Risk Transaction</span>
            </div>
            <span className="text-red-400 text-xs">2m ago</span>
          </div>
          <TouchButton size="sm" variant="danger" className="w-full">
            Review Alert
          </TouchButton>
        </div>
      ) : (
        <div className="text-center py-4">
          <Shield className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-green-400 text-sm font-medium">All Clear</p>
          <p className="text-gray-400 text-xs">No suspicious activity detected</p>
        </div>
      )}
    </div>
  )

  const GeographicOverview = () => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center">
          <Globe className="h-5 w-5 mr-2 text-purple-400" />
          Geographic Overview
        </h3>
        <TouchButton size="sm" variant="secondary">
          <Map className="h-4 w-4" />
        </TouchButton>
      </div>
      
      {analyticsData && (
        <div className="space-y-2">
          {analyticsData.geographicData.slice(0, 3).map((country, index) => (
            <div key={country.country} className="flex items-center justify-between p-2 bg-white/5 rounded">
              <div className="flex items-center space-x-3">
                <span className="text-lg">{country.flag}</span>
                <div>
                  <p className="text-white text-sm font-medium">{country.country}</p>
                  <p className="text-gray-400 text-xs">{country.users} users</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-400 text-sm font-medium">
                  {((country.users / analyticsData.totalUsers) * 100).toFixed(1)}%
                </p>
                <div className="w-12 h-1 bg-gray-700 rounded-full mt-1">
                  <div 
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${(country.users / analyticsData.totalUsers) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const RevenueCard = () => (
    <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
          Revenue Analytics
        </h3>
        <TouchButton size="sm" variant="secondary">
          <DollarSign className="h-4 w-4" />
        </TouchButton>
      </div>
      
      {analyticsData && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                ${(analyticsData.revenue / 1000).toFixed(0)}K
              </p>
              <p className="text-green-400 text-sm flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +15.7% this month
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-sm">Avg. per tx</p>
              <p className="text-white font-medium">
                ${Math.floor(analyticsData.revenue / analyticsData.transactions)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-green-400 text-xs">Growth Rate</p>
              <p className="text-white font-bold">+12.3%</p>
            </div>
            <div className="bg-white/5 rounded p-2 text-center">
              <p className="text-green-400 text-xs">Conversion</p>
              <p className="text-white font-bold">3.4%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  if (loading && !analyticsData) {
    return (
      <div className="min-h-screen bg-binance-black p-4">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-black p-4 pb-24">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              <Smartphone className="h-6 w-6 mr-2 text-purple-400" />
              Mobile Analytics
            </h1>
            <p className="text-gray-300 text-sm">Real-time dashboard</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              size="sm"
              variant="secondary"
              onClick={() => fetchAnalyticsData()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </TouchButton>
            
            <TouchButton size="sm" variant="secondary">
              <Bell className="h-4 w-4" />
            </TouchButton>
            
            <TouchButton size="sm" variant="secondary">
              <Download className="h-4 w-4" />
            </TouchButton>
          </div>
        </div>
        
        {/* Last Updated */}
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <Eye className="h-3 w-3" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
          {realTimeEnabled && (
            <>
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              <span className="text-green-400">Live</span>
            </>
          )}
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickMetrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-gradient-to-r ${metric.color} border border-white/10 rounded-xl p-4`}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className="h-6 w-6 text-white/80" />
              <div className={`flex items-center text-xs ${
                metric.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {metric.change >= 0 ? (
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 mr-1" />
                )}
                {Math.abs(metric.change)}%
              </div>
            </div>
            <div>
              <p className="text-white text-lg font-bold">{metric.value}</p>
              <p className="text-white/70 text-sm">{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Based on Active View */}
      <div className="space-y-4 mb-6">
        {activeView === 'overview' && (
          <>
            <FraudAlertCard />
            <GeographicOverview />
            <RevenueCard />
          </>
        )}

        {activeView === 'fraud' && (
          <div className="space-y-4">
            <FraudAlertCard />
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-red-400" />
                AI Detection Models
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div>
                    <p className="text-white text-sm">Velocity Pattern</p>
                    <p className="text-gray-400 text-xs">Real-time monitoring</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">Active</p>
                    <p className="text-gray-400 text-xs">94.7% accuracy</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div>
                    <p className="text-white text-sm">Geographic Anomaly</p>
                    <p className="text-gray-400 text-xs">Location verification</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">Active</p>
                    <p className="text-gray-400 text-xs">91.2% accuracy</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div>
                    <p className="text-white text-sm">Behavioral Analysis</p>
                    <p className="text-gray-400 text-xs">User patterns</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-medium">Active</p>
                    <p className="text-gray-400 text-xs">88.9% accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'geographic' && (
          <div className="space-y-4">
            <GeographicOverview />
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Map className="h-5 w-5 mr-2 text-purple-400" />
                Regional Performance
              </h3>
              {analyticsData && (
                <div className="space-y-2">
                  {analyticsData.geographicData.map((country, index) => (
                    <div key={country.country} className="flex items-center justify-between p-3 bg-white/5 rounded">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{country.flag}</span>
                        <div>
                          <p className="text-white font-medium">{country.country}</p>
                          <p className="text-gray-400 text-sm">{country.users} active users</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-purple-400 font-medium">
                          {((country.users / analyticsData.totalUsers) * 100).toFixed(1)}%
                        </p>
                        <p className="text-gray-400 text-xs">market share</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === 'revenue' && (
          <div className="space-y-4">
            <RevenueCard />
            
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-3 flex items-center">
                <Target className="h-5 w-5 mr-2 text-green-400" />
                Revenue Breakdown
              </h3>
              {analyticsData && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div>
                      <p className="text-white text-sm">Transaction Fees</p>
                      <p className="text-gray-400 text-xs">Core business</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">$75.2K</p>
                      <p className="text-gray-400 text-xs">60.2%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div>
                      <p className="text-white text-sm">Service Charges</p>
                      <p className="text-gray-400 text-xs">Premium features</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">$31.3K</p>
                      <p className="text-gray-400 text-xs">25.0%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                    <div>
                      <p className="text-white text-sm">Other Revenue</p>
                      <p className="text-gray-400 text-xs">Miscellaneous</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-medium">$18.5K</p>
                      <p className="text-gray-400 text-xs">14.8%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-binance-dark/95 backdrop-blur border-t border-gray-700 p-4">
        <div className="flex items-center justify-around">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'fraud', label: 'Fraud', icon: Shield },
            { id: 'geographic', label: 'Map', icon: Globe },
            { id: 'revenue', label: 'Revenue', icon: DollarSign }
          ].map(tab => (
            <TouchButton
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center space-y-1 h-auto p-2 ${
                activeView === tab.id ? 'text-purple-400' : 'text-gray-400'
              }`}
            >
              <tab.icon className="h-5 w-5" />
              <span className="text-xs">{tab.label}</span>
            </TouchButton>
          ))}
        </div>
      </div>
    </div>
  )
}