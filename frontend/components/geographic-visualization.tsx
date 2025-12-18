"use client"

import React, { useState, useEffect } from 'react'
import { MapPin, Users, TrendingUp, Globe, Activity } from 'lucide-react'

interface GeographicData {
  region: string
  country_code: string
  users: number
  volume: number
  transactions: number
  growth_rate: number
  coordinates: { lat: number; lng: number }
  flag_url?: string
}

interface Country {
  code: string
  name: string
  flag: string
  coordinates: { lat: number; lng: number }
}

const AFRICAN_COUNTRIES: Country[] = [
  { code: 'KE', name: 'Kenya', flag: '🇰🇪', coordinates: { lat: -0.0236, lng: 37.9062 } },
  { code: 'NG', name: 'Nigeria', flag: '🇳🇬', coordinates: { lat: 9.0820, lng: 8.6753 } },
  { code: 'GH', name: 'Ghana', flag: '🇬🇭', coordinates: { lat: 7.9465, lng: -1.0232 } },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', coordinates: { lat: -30.5595, lng: 22.9375 } },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', coordinates: { lat: 26.8206, lng: 30.8025 } },
  { code: 'TZ', name: 'Tanzania', flag: '🇹🇿', coordinates: { lat: -6.3690, lng: 34.8888 } },
  { code: 'UG', name: 'Uganda', flag: '🇺🇬', coordinates: { lat: 1.3733, lng: 32.2903 } },
  { code: 'MA', name: 'Morocco', flag: '🇲🇦', coordinates: { lat: 31.7917, lng: -7.0926 } },
  { code: 'ET', name: 'Ethiopia', flag: '🇪🇹', coordinates: { lat: 9.1450, lng: 40.4897 } },
  { code: 'RW', name: 'Rwanda', flag: '🇷🇼', coordinates: { lat: -1.9403, lng: 29.8739 } }
]

interface GeographicVisualizationProps {
  data?: GeographicData[]
  showHeatMap?: boolean
  showTrends?: boolean
  onRegionSelect?: (region: string) => void
  className?: string
}

export default function GeographicVisualization({
  data = [],
  showHeatMap = true,
  showTrends = true,
  onRegionSelect,
  className = ''
}: GeographicVisualizationProps) {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'heatmap'>('map')
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)

  // Generate mock data if none provided
  const mockGeographicData: GeographicData[] = AFRICAN_COUNTRIES.map(country => ({
    region: country.name,
    country_code: country.code,
    users: Math.floor(Math.random() * 5000) + 500,
    volume: Math.floor(Math.random() * 1000000) + 50000,
    transactions: Math.floor(Math.random() * 10000) + 1000,
    growth_rate: (Math.random() - 0.5) * 30, // -15% to +15%
    coordinates: country.coordinates,
    flag_url: `/flags/${country.code.toLowerCase()}.jpg`
  }))

  const geographicData = data.length > 0 ? data : mockGeographicData

  const totalUsers = geographicData.reduce((sum, item) => sum + item.users, 0)
  const totalVolume = geographicData.reduce((sum, item) => sum + item.volume, 0)
  const averageGrowth = geographicData.reduce((sum, item) => sum + item.growth_rate, 0) / geographicData.length

  const getUserIntensity = (users: number) => {
    const maxUsers = Math.max(...geographicData.map(d => d.users))
    return Math.min((users / maxUsers) * 100, 100)
  }

  const getVolumeIntensity = (volume: number) => {
    const maxVolume = Math.max(...geographicData.map(d => d.volume))
    return Math.min((volume / maxVolume) * 100, 100)
  }

  const handleCountryClick = (countryCode: string) => {
    setSelectedCountry(countryCode)
    if (onRegionSelect) {
      onRegionSelect(countryCode)
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* View Mode Selector */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'map'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <MapPin className="h-4 w-4 mr-2 inline" />
            Map View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Globe className="h-4 w-4 mr-2 inline" />
            List View
          </button>
          {showHeatMap && (
            <button
              onClick={() => setViewMode('heatmap')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'heatmap'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Activity className="h-4 w-4 mr-2 inline" />
              Heat Map
            </button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Total Users</p>
              <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Total Volume</p>
              <p className="text-2xl font-bold text-white">${(totalVolume / 1000000).toFixed(1)}M</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Avg Growth</p>
              <p className="text-2xl font-bold text-white">{averageGrowth > 0 ? '+' : ''}{averageGrowth.toFixed(1)}%</p>
            </div>
            <Globe className="h-8 w-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        {viewMode === 'map' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-400" />
              African Regional Distribution
            </h3>
            
            {/* Simplified Map Visualization */}
            <div className="relative bg-binance-dark/50 rounded-lg p-8 min-h-96">
              <div className="text-center mb-8">
                <Globe className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-white mb-2">Interactive Map</h4>
                <p className="text-gray-300">Click on regions to explore detailed analytics</p>
              </div>

              {/* Country Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {geographicData.map((region) => (
                  <button
                    key={region.country_code}
                    onClick={() => handleCountryClick(region.country_code)}
                    onMouseEnter={() => setHoveredRegion(region.country_code)}
                    onMouseLeave={() => setHoveredRegion(null)}
                    className={`relative bg-gradient-to-br from-purple-500/20 to-blue-500/20 border rounded-lg p-4 text-center transition-all duration-200 hover:scale-105 hover:shadow-lg ${
                      selectedCountry === region.country_code
                        ? 'border-purple-400 shadow-purple-400/25'
                        : hoveredRegion === region.country_code
                        ? 'border-blue-400'
                        : 'border-purple-500/30'
                    }`}
                  >
                    <div className="text-2xl mb-2">
                      {AFRICAN_COUNTRIES.find(c => c.code === region.country_code)?.flag || '🌍'}
                    </div>
                    <h4 className="text-white font-medium text-sm mb-1">{region.country_code}</h4>
                    <p className="text-purple-400 text-xs font-bold">{region.users.toLocaleString()}</p>
                    <p className="text-gray-400 text-xs">users</p>
                    
                    {/* User intensity indicator */}
                    <div 
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: `rgba(139, 92, 246, ${getUserIntensity(region.users) / 100})`
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Regional Breakdown</h3>
            
            <div className="space-y-3">
              {geographicData
                .sort((a, b) => b.users - a.users)
                .map((region) => (
                  <div
                    key={region.country_code}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
                    onClick={() => handleCountryClick(region.country_code)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {AFRICAN_COUNTRIES.find(c => c.code === region.country_code)?.flag || '🌍'}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{region.country_code}</h4>
                          <p className="text-gray-400 text-sm">{region.region}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-white font-bold">{region.users.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm">users</p>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Volume</p>
                        <p className="text-white font-medium">${region.volume.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Transactions</p>
                        <p className="text-white font-medium">{region.transactions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Growth</p>
                        <p className={`font-medium ${region.growth_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {region.growth_rate >= 0 ? '+' : ''}{region.growth_rate.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {viewMode === 'heatmap' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">User Activity Heat Map</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {geographicData
                .sort((a, b) => b.users - a.users)
                .map((region) => {
                  const intensity = getUserIntensity(region.users)
                  return (
                    <div
                      key={region.country_code}
                      className="relative aspect-square rounded-lg flex items-end justify-center text-center p-2"
                      style={{
                        background: `linear-gradient(to top, rgba(139, 92, 246, ${intensity / 100}) 0%, rgba(59, 130, 246, ${intensity / 200}) 100%)`,
                        border: '1px solid rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      <div className="text-xs">
                        <div className="text-white font-bold">{region.country_code}</div>
                        <div className="text-white/80">{region.users}</div>
                      </div>
                      
                      <div 
                        className="absolute top-1 left-1 w-1 h-1 rounded-full bg-white"
                        style={{ opacity: intensity / 100 }}
                      />
                    </div>
                  )
                })}
            </div>

            <div className="flex items-center justify-center space-x-4 mt-6">
              <span className="text-gray-400 text-sm">Low Activity</span>
              <div className="flex space-x-1">
                {[20, 40, 60, 80, 100].map(intensity => (
                  <div
                    key={intensity}
                    className="w-4 h-4 rounded"
                    style={{
                      backgroundColor: `rgba(139, 92, 246, ${intensity / 100})`
                    }}
                  />
                ))}
              </div>
              <span className="text-gray-400 text-sm">High Activity</span>
            </div>
          </div>
        )}
      </div>

      {/* Selected Region Details */}
      {selectedCountry && (
        <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-purple-400" />
              {selectedCountry} Details
            </h3>
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          {(() => {
            const region = geographicData.find(r => r.country_code === selectedCountry)
            if (!region) return null
            
            return (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Users</p>
                  <p className="text-2xl font-bold text-white">{region.users.toLocaleString()}</p>
                  <p className="text-purple-400 text-sm">{((region.users / totalUsers) * 100).toFixed(1)}% of total</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Volume</p>
                  <p className="text-2xl font-bold text-white">${(region.volume / 1000).toFixed(0)}K</p>
                  <p className="text-green-400 text-sm">{((region.volume / totalVolume) * 100).toFixed(1)}% of total</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Transactions</p>
                  <p className="text-2xl font-bold text-white">{region.transactions.toLocaleString()}</p>
                  <p className="text-blue-400 text-sm">avg ${(region.volume / region.transactions).toFixed(0)} per tx</p>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Growth Rate</p>
                  <p className={`text-2xl font-bold ${region.growth_rate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {region.growth_rate >= 0 ? '+' : ''}{region.growth_rate.toFixed(1)}%
                  </p>
                  <p className="text-gray-400 text-sm">monthly</p>
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}