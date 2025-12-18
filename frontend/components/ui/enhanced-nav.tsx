'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { EnhancedButton } from '@/components/ui/enhanced-button'
import { 
  Home, 
  TrendingUp, 
  Wallet, 
  Send, 
  BarChart3, 
  Settings, 
  User, 
  Bell,
  Menu,
  X,
  LogOut,
  Shield,
  CreditCard,
  Globe,
  HelpCircle,
  ChevronDown
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon?: React.ReactNode
  badge?: string | number
  children?: NavItem[]
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: <Home className="size-4" /> },
  { name: 'Markets', href: '/markets', icon: <TrendingUp className="size-4" /> },
  { name: 'Wallet', href: '/wallet', icon: <Wallet className="size-4" /> },
  { name: 'Send Money', href: '/send', icon: <Send className="size-4" /> },
  { name: 'Convert', href: '/converter', icon: <Globe className="size-4" /> },
  { name: 'Buy ACT', href: '/buy-act', icon: <CreditCard className="size-4" /> },
]

const userNavItems: NavItem[] = [
  { name: 'Profile', href: '/profile', icon: <User className="size-4" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="size-4" /> },
  { name: 'Help', href: '/help', icon: <HelpCircle className="size-4" /> },
]

interface EnhancedNavProps {
  variant?: 'default' | 'admin' | 'landing'
  user?: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
  notifications?: number
  onLogout?: () => void
}

export function EnhancedNav({ 
  variant = 'default', 
  user, 
  notifications = 0,
  onLogout 
}: EnhancedNavProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const [isProfileOpen, setIsProfileOpen] = React.useState(false)

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'admin':
        return 'bg-act-dark-900/95 border-act-gold-500/20'
      case 'landing':
        return 'bg-transparent'
      default:
        return 'enhanced-header'
    }
  }

  return (
    <nav className={cn("sticky top-0 z-50 w-full border-b", getVariantClasses())}>
      <div className="enhanced-container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-act-gold-400 to-act-gold-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-act-gold-400 to-act-gold-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity" />
            </div>
            <span className="font-bold text-xl text-gradient hidden sm:block">
              Pesa-Afrik
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "enhanced-nav-item px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href) 
                    ? "text-act-gold-400 bg-act-gold-500/20" 
                    : "text-act-dark-300 hover:text-act-gold-300 hover:bg-act-gold-500/10"
                )}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  {item.name}
                  {item.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-act-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notifications */}
                <button className="relative p-2 text-act-dark-300 hover:text-act-gold-400 transition-colors">
                  <Bell className="size-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-act-red-500 rounded-full animate-pulse">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-2 rounded-lg text-act-dark-300 hover:text-act-gold-400 hover:bg-act-gold-500/10 transition-all"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-act-gold-400 to-act-gold-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <ChevronDown className="size-4" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 enhanced-card border border-act-gold-500/20 py-2 z-50">
                      <div className="px-4 py-3 border-b border-act-gold-500/20">
                        <p className="text-sm font-semibold text-act-dark-200">{user.name}</p>
                        <p className="text-xs text-act-dark-400">{user.email}</p>
                        {user.role && (
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-act-gold-500/20 text-act-gold-400 rounded">
                            {user.role}
                          </span>
                        )}
                      </div>
                      
                      <div className="py-1">
                        {userNavItems.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-act-dark-300 hover:text-act-gold-400 hover:bg-act-gold-500/10 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        ))}
                        
                        {variant === 'admin' && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 px-4 py-2 text-sm text-act-dark-300 hover:text-act-gold-400 hover:bg-act-gold-500/10 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <Shield className="size-4" />
                            Admin Panel
                          </Link>
                        )}
                        
                        <div className="border-t border-act-gold-500/20 my-1" />
                        
                        <button
                          onClick={() => {
                            setIsProfileOpen(false)
                            onLogout?.()
                          }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-act-red-400 hover:text-act-red-300 hover:bg-act-red-500/10 transition-colors w-full text-left"
                        >
                          <LogOut className="size-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <EnhancedButton variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </EnhancedButton>
                <EnhancedButton variant="premium" size="sm" asChild>
                  <Link href="/auth/sign-up">Get Started</Link>
                </EnhancedButton>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-act-dark-300 hover:text-act-gold-400 transition-colors"
            >
              {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-act-gold-500/20 py-4 space-y-2">
            {mainNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-act-gold-400 bg-act-gold-500/20"
                    : "text-act-dark-300 hover:text-act-gold-400 hover:bg-act-gold-500/10"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.name}
                {item.badge && (
                  <span className="ml-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-act-red-500 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
            
            {!user && (
              <div className="px-4 pt-4 space-y-2">
                <EnhancedButton variant="ghost" size="sm" className="w-full" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </EnhancedButton>
                <EnhancedButton variant="premium" size="sm" className="w-full" asChild>
                  <Link href="/auth/sign-up">Get Started</Link>
                </EnhancedButton>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

// Sub-navigation for sections like admin
interface SubNavProps {
  items: NavItem[]
  currentPath?: string
}

export function SubNav({ items, currentPath }: SubNavProps) {
  const isActive = (href: string) => currentPath?.startsWith(href) || false

  return (
    <div className="bg-act-dark-800/50 border-b border-act-gold-500/20 backdrop-blur-sm">
      <div className="enhanced-container">
        <div className="flex space-x-1 overflow-x-auto py-2">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                isActive(item.href)
                  ? "text-act-gold-400 bg-act-gold-500/20"
                  : "text-act-dark-300 hover:text-act-gold-400 hover:bg-act-gold-500/10"
              )}
            >
              {item.icon}
              {item.name}
              {item.badge && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-act-red-500 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}