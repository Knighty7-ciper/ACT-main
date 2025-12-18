"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAutoAdmin } from '@/lib/hooks/useAutoAdmin'
import {
  Menu,
  X,
  Crown,
  BarChart3,
  Users,
  Transactions,
  Shield,
  Settings,
  TrendingUp,
  FileText,
  Bell,
  Search,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  RefreshCw,
  Power,
  LogOut,
  User,
  Key,
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Zap
} from 'lucide-react'

interface MobileNavProps {
  isOpen: boolean
  onToggle: () => void
  onClose: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  isConnected: boolean
  hasAlerts: boolean
  reconnectAttempts?: number
}

interface NavigationItem {
  id: string
  label: string
  mobileLabel: string
  icon: React.ComponentType<any>
  href: string
  color: string
  badge?: number
  priority: 'high' | 'medium' | 'low'
  requiresNetwork?: boolean
}

export default function MobileNavigation({
  isOpen,
  onToggle,
  onClose,
  activeTab,
  onTabChange,
  isConnected,
  hasAlerts,
  reconnectAttempts = 0
}: MobileNavProps) {
  const router = useRouter()
  const { adminUser } = useAutoAdmin()
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [slideOffset, setSlideOffset] = useState(0)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const [expandedSections, setExpandedSections] = useState<string[]>(['main'])

  // Touch/mouse drag handlers
  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStart({ x: clientX, y: clientY })
    setSlideOffset(0)
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return
    
    const deltaX = clientX - dragStart.x
    const deltaY = clientY - dragStart.y
    
    // Only allow horizontal dragging
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) {
      const newOffset = Math.min(0, deltaX) // Only negative values (dragging left)
      setSlideOffset(newOffset)
    }
  }

  const handleDragEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // Close sidebar if dragged far enough
    if (slideOffset < -100) {
      onClose()
    } else {
      setSlideOffset(0)
    }
  }

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault()
    handleDragEnd()
  }

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    handleDragStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  // Navigation items with priorities
  const navigationItems: NavigationItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      mobileLabel: 'Overview',
      icon: BarChart3,
      href: '/admin/dashboard',
      color: 'from-blue-500 to-cyan-500',
      priority: 'high',
      badge: 0
    },
    {
      id: 'users',
      label: 'Users',
      mobileLabel: 'Users',
      icon: Users,
      href: '/admin/users',
      color: 'from-green-500 to-emerald-500',
      priority: 'high'
    },
    {
      id: 'transactions',
      label: 'Transactions',
      mobileLabel: 'TXs',
      icon: Transactions,
      href: '/admin/transactions',
      color: 'from-purple-500 to-violet-500',
      priority: 'high'
    },
    {
      id: 'kyc',
      label: 'KYC',
      mobileLabel: 'KYC',
      icon: Shield,
      href: '/admin/kyc',
      color: 'from-orange-500 to-red-500',
      priority: 'high',
      badge: 3 // Example pending KYC count
    },
    {
      id: 'system',
      label: 'System',
      mobileLabel: 'System',
      icon: Settings,
      href: '/admin/system',
      color: 'from-gray-500 to-slate-500',
      priority: 'medium'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      mobileLabel: 'Analytics',
      icon: TrendingUp,
      href: '/admin/analytics',
      color: 'from-pink-500 to-rose-500',
      priority: 'medium'
    },
    {
      id: 'audit',
      label: 'Audit',
      mobileLabel: 'Audit',
      icon: FileText,
      href: '/admin/audit',
      color: 'from-indigo-500 to-blue-500',
      priority: 'medium'
    },
    // Emergency actions (always visible)
    {
      id: 'emergency',
      label: 'Emergency',
      mobileLabel: 'Emergency',
      icon: AlertTriangle,
      href: '/admin/emergency',
      color: 'from-red-500 to-red-600',
      priority: 'high',
      requiresNetwork: true
    }
  ]

  // Sort items by priority
  const sortedItems = navigationItems.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  // Handle navigation
  const handleNavigation = (item: NavigationItem) => {
    onTabChange(item.id)
    onClose()
    
    if (item.href) {
      router.push(item.href)
    }
  }

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  // Handle emergency actions
  const handleEmergencyAction = (action: string) => {
    console.log('Emergency action:', action)
    // Implement emergency actions here
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className="lg:hidden fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="lg:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-black/95 backdrop-blur-xl border-r border-white/10 z-50 transform transition-transform duration-300 ease-out"
        style={{
          transform: `translateX(${slideOffset}px)`
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <Crown className="h-6 w-6 text-black" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">ACT Admin</h2>
              <p className="text-gray-400 text-xs">Mobile Control</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {isConnected ? (
                  <Wifi className="h-4 w-4 text-green-400" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {isConnected ? 'Connected' : 'Offline'}
                </p>
                <p className="text-gray-400 text-xs">
                  {isConnected ? 'Real-time updates active' : 'Cached data only'}
                </p>
              </div>
            </div>
            
            {reconnectAttempts > 0 && (
              <div className="text-xs text-yellow-400">
                Retry {reconnectAttempts}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center border-2 border-white/20">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                Super Admin
              </p>
              <p className="text-gray-400 text-xs truncate">
                {adminUser?.email || 'admin@act-platform.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto">
          {/* Main Navigation */}
          <div className="px-4 py-3">
            <button
              onClick={() => toggleSection('main')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-gray-400 text-sm font-medium">Main Navigation</span>
              {expandedSections.includes('main') ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {expandedSections.includes('main') && (
            <div className="px-2 space-y-1">
              {sortedItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                const isDisabled = item.requiresNetwork && !isConnected

                return (
                  <button
                    key={item.id}
                    onClick={() => !isDisabled && handleNavigation(item)}
                    disabled={isDisabled}
                    className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl font-medium transition-all duration-200 relative ${
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                        : isDisabled
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1 text-left text-sm">
                      {item.mobileLabel}
                    </span>
                    
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                    
                    {isDisabled && (
                      <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                        <WifiOff className="h-4 w-4 text-red-400" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-4 py-3 mt-4 border-t border-white/10">
            <button
              onClick={() => toggleSection('quick')}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-gray-400 text-sm font-medium">Quick Actions</span>
              {expandedSections.includes('quick') ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>

          {expandedSections.includes('quick') && (
            <div className="px-2 space-y-1">
              <button
                onClick={() => handleEmergencyAction('shutdown')}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Power className="h-5 w-5" />
                <span className="text-left text-sm">Emergency Shutdown</span>
              </button>
              
              <button
                onClick={() => handleEmergencyAction('lockdown')}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl font-medium text-yellow-400 hover:bg-yellow-500/10 transition-colors"
              >
                <Lock className="h-5 w-5" />
                <span className="text-left text-sm">System Lockdown</span>
              </button>
              
              <button
                onClick={() => handleEmergencyAction('backup')}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
              >
                <Database className="h-5 w-5" />
                <span className="text-left text-sm">Force Backup</span>
              </button>
            </div>
          )}

          {/* System Info */}
          <div className="px-4 py-3 mt-4 border-t border-white/10">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">System Load</span>
                <span className="text-green-400">Normal</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Active Users</span>
                <span className="text-blue-400">1,247</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Uptime</span>
                <span className="text-purple-400">99.9%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-400 text-sm">Theme</span>
            <div className="flex items-center space-x-2">
              <button className="p-1 rounded bg-white/20">
                <Monitor className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleEmergencyAction('logout')}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
            
            <button
              onClick={() => handleEmergencyAction('settings')}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Drag Handle Indicator */}
        <div 
          className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-16 bg-white/20 rounded-l-full cursor-ew-resize"
          onMouseDown={(e) => e.stopPropagation()}
        />
      </div>
    </>
  )
}