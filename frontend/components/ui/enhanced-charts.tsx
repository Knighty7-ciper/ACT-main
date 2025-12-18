"use client"

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface ChartProps {
  data: any[]
  width?: number
  height?: number
  className?: string
}

// Enhanced Line Chart with animations and tooltips
export function EnhancedLineChart({ data, width, height, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height || 300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8B5CF6" 
            strokeWidth={3}
            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#8B5CF6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Area Chart with gradient
export function EnhancedAreaChart({ data, width, height, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height || 300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#8B5CF6" 
            fillOpacity={1} 
            fill="url(#colorValue)" 
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Bar Chart with multiple data series
export function EnhancedBarChart({ data, width, height, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height || 300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="name" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Pie Chart with custom styling
export function EnhancedPieChart({ data, width, height, className }: ChartProps) {
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#3B82F6']

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height || 300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// Revenue Chart with growth indicators
export function RevenueChart({ data, width, height, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height || 300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="period" 
            stroke="#9CA3AF"
            fontSize={12}
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
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
          />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10B981" 
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 5 }}
            activeDot={{ r: 7, fill: '#10B981' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Geographic Heat Map Component
export function GeographicHeatMap({ data, width, height, className }: ChartProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((region, index) => (
          <div 
            key={index}
            className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-lg p-4 text-center"
          >
            <h4 className="text-white font-medium text-sm mb-1">{region.region}</h4>
            <p className="text-2xl font-bold text-purple-400">{region.users}</p>
            <p className="text-xs text-gray-400">{region.percentage}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Fraud Detection Risk Chart
export function FraudRiskChart({ data, width, height, className }: ChartProps) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height || 200}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="riskScore" 
            stroke="#EF4444" 
            fillOpacity={1} 
            fill="url(#colorRisk)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Custom Chart Wrapper for consistent styling
interface CustomChartWrapperProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function ChartWrapper({ title, children, action, className }: CustomChartWrapperProps) {
  return (
    <div className={`bg-white/5 border border-white/10 rounded-xl p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// Loading skeleton for charts
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-700 rounded" style={{ height }} />
    </div>
  )
}

// Empty state for charts
export function ChartEmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <div className="text-gray-400 mb-2">
        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-1">{title}</h3>
      <p className="text-gray-500 text-sm max-w-sm">{description}</p>
    </div>
  )
}