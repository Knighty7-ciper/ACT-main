"use client"

import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Calendar, Target, Brain, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

interface ForecastData {
  period: string
  actual: number
  forecast: number
  confidence_low: number
  confidence_high: number
  trend: 'up' | 'down' | 'stable'
}

interface RevenueMetrics {
  total_revenue: number
  monthly_growth: number
  yearly_growth: number
  avg_transaction_value: number
  conversion_rate: number
  customer_lifetime_value: number
}

interface ScenarioAnalysis {
  conservative: number
  realistic: number
  optimistic: number
}

export default function RevenueForecasting() {
  const [forecastData, setForecastData] = useState<ForecastData[]>([])
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null)
  const [scenarioAnalysis, setScenarioAnalysis] = useState<ScenarioAnalysis | null>(null)
  const [forecastHorizon, setForecastHorizon] = useState<'3m' | '6m' | '12m'>('6m')
  const [loading, setLoading] = useState(true)
  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'realistic' | 'optimistic'>('realistic')

  useEffect(() => {
    generateForecastData()
  }, [forecastHorizon])

  const generateForecastData = () => {
    setLoading(true)
    
    // Simulate historical data generation
    const historicalData: ForecastData[] = []
    const now = new Date()
    
    // Generate 12 months of historical data
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const actual = 150000 + Math.random() * 100000 + (i * -5000) // Slight downward trend
      historicalData.push({
        period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        actual,
        forecast: actual,
        confidence_low: actual * 0.9,
        confidence_high: actual * 1.1,
        trend: 'up'
      })
    }

    // Generate forecast data
    const forecastData: ForecastData[] = []
    const lastActual = historicalData[historicalData.length - 1].actual
    
    for (let i = 1; i <= (forecastHorizon === '3m' ? 3 : forecastHorizon === '6m' ? 6 : 12); i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1)
      
      // Different growth rates for different scenarios
      let growthRate = 0.08 // 8% base growth
      if (selectedScenario === 'conservative') growthRate = 0.04
      if (selectedScenario === 'optimistic') growthRate = 0.12
      
      const forecast = lastActual * Math.pow(1 + growthRate, i)
      const confidenceMargin = forecast * 0.15 // 15% confidence interval
      
      forecastData.push({
        period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        actual: 0, // No actual data for future periods
        forecast,
        confidence_low: forecast - confidenceMargin,
        confidence_high: forecast + confidenceMargin,
        trend: forecast > lastActual ? 'up' : 'down'
      })
    }

    setForecastData([...historicalData, ...forecastData])
    setMetrics({
      total_revenue: 2100000,
      monthly_growth: 12.3,
      yearly_growth: 45.7,
      avg_transaction_value: 1250,
      conversion_rate: 3.4,
      customer_lifetime_value: 8500
    })
    setScenarioAnalysis({
      conservative: forecastData[forecastData.length - 1]?.forecast * 0.85 || 0,
      realistic: forecastData[forecastData.length - 1]?.forecast || 0,
      optimistic: forecastData[forecastData.length - 1]?.forecast * 1.15 || 0
    })
    
    setLoading(false)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'conservative': return '#ef4444'
      case 'realistic': return '#10b981'
      case 'optimistic': return '#3b82f6'
      default: return '#6b7280'
    }
  }

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? (
      <ArrowUpRight className="h-4 w-4 text-green-400" />
    ) : trend === 'down' ? (
      <ArrowDownRight className="h-4 w-4 text-red-400" />
    ) : (
      <div className="h-4 w-4 bg-gray-400 rounded-full" />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Brain className="h-7 w-7 mr-3 text-purple-400" />
            Revenue Forecasting & Analytics
          </h2>
          <p className="text-gray-300 mt-1">AI-powered revenue predictions and scenario analysis</p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select 
            value={forecastHorizon}
            onChange={(e) => setForecastHorizon(e.target.value as any)}
            className="bg-binance-dark border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="12m">12 Months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.total_revenue)}</p>
                <p className="text-green-400 text-sm flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  +{metrics.yearly_growth}% YoY
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Monthly Growth</p>
                <p className="text-2xl font-bold text-white">+{metrics.monthly_growth}%</p>
                <p className="text-blue-400 text-sm">accelerating</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-400 text-sm font-medium">CLV</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(metrics.customer_lifetime_value)}</p>
                <p className="text-purple-400 text-sm">customer lifetime value</p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Scenario Analysis */}
      {scenarioAnalysis && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-purple-400" />
              Scenario Analysis ({forecastHorizon.toUpperCase()} Forecast)
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedScenario('conservative')}
              className={`border rounded-lg p-4 text-left transition-all ${
                selectedScenario === 'conservative'
                  ? 'border-red-400 bg-red-500/10'
                  : 'border-red-500/30 hover:border-red-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Conservative</h4>
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(scenarioAnalysis.conservative)}
              </p>
              <p className="text-red-400 text-sm">-15% downside risk</p>
            </button>

            <button
              onClick={() => setSelectedScenario('realistic')}
              className={`border rounded-lg p-4 text-left transition-all ${
                selectedScenario === 'realistic'
                  ? 'border-green-400 bg-green-500/10'
                  : 'border-green-500/30 hover:border-green-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Realistic</h4>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(scenarioAnalysis.realistic)}
              </p>
              <p className="text-green-400 text-sm">most likely scenario</p>
            </button>

            <button
              onClick={() => setSelectedScenario('optimistic')}
              className={`border rounded-lg p-4 text-left transition-all ${
                selectedScenario === 'optimistic'
                  ? 'border-blue-400 bg-blue-500/10'
                  : 'border-blue-500/30 hover:border-blue-400/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-white">Optimistic</h4>
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              </div>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(scenarioAnalysis.optimistic)}
              </p>
              <p className="text-blue-400 text-sm">+15% upside potential</p>
            </button>
          </div>
        </div>
      )}

      {/* Revenue Forecast Chart */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Revenue Forecast</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded"></div>
              <span className="text-gray-300">Actual</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400 rounded"></div>
              <span className="text-gray-300">Forecast</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-400/30 rounded"></div>
              <span className="text-gray-300">Confidence Interval</span>
            </div>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="period" 
                stroke="#9CA3AF"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickFormatter={(value) => `$${value / 1000}K`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: number, name: string) => [
                  formatCurrency(value),
                  name === 'actual' ? 'Actual Revenue' : 
                  name === 'forecast' ? 'Forecasted Revenue' : name
                ]}
              />
              
              {/* Confidence interval */}
              <Area
                type="monotone"
                dataKey="confidence_high"
                stackId="1"
                stroke="transparent"
                fill="url(#colorConfidence)"
              />
              <Area
                type="monotone"
                dataKey="confidence_low"
                stackId="1"
                stroke="transparent"
                fill="url(#colorConfidence)"
              />
              
              {/* Actual data */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              
              {/* Forecast data */}
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="#8b5cf6"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Key Drivers */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-400" />
            Revenue Drivers
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowUpRight className="h-5 w-5 text-green-400" />
                <span className="text-white">User Growth</span>
              </div>
              <span className="text-green-400 font-medium">+15.2%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowUpRight className="h-5 w-5 text-blue-400" />
                <span className="text-white">Transaction Volume</span>
              </div>
              <span className="text-blue-400 font-medium">+12.8%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <ArrowUpRight className="h-5 w-5 text-purple-400" />
                <span className="text-white">Average Value</span>
              </div>
              <span className="text-purple-400 font-medium">+8.5%</span>
            </div>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-red-400" />
            Risk Factors
          </h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm">Market Volatility</span>
                <span className="text-red-400 text-sm">High</span>
              </div>
              <p className="text-gray-400 text-xs">External market conditions may impact growth</p>
            </div>
            
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm">Competition</span>
                <span className="text-yellow-400 text-sm">Medium</span>
              </div>
              <p className="text-gray-400 text-xs">Increased competition in fintech sector</p>
            </div>
            
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white text-sm">Regulatory Changes</span>
                <span className="text-blue-400 text-sm">Low</span>
              </div>
              <p className="text-gray-400 text-xs">Stable regulatory environment</p>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Summary */}
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Forecast Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(scenarioAnalysis?.realistic || 0)}
            </div>
            <p className="text-gray-300">Expected Revenue</p>
            <p className="text-purple-400 text-sm">6-month forecast</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              +{metrics?.monthly_growth || 0}%
            </div>
            <p className="text-gray-300">Growth Rate</p>
            <p className="text-green-400 text-sm">month-over-month</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              87%
            </div>
            <p className="text-gray-300">Confidence Level</p>
            <p className="text-blue-400 text-sm">prediction accuracy</p>
          </div>
        </div>
      </div>
    </div>
  )
}