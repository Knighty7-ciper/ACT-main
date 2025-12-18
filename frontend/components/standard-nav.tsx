"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  User,
  Settings,
  LogOut,
  BarChart3,
  ArrowLeftRight,
  Wallet,
  Shield,
  Bell,
  ChevronDown,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

interface StandardNavProps {
  user?: {
    email: string
    isAdmin?: boolean
  }
  isAuthenticated?: boolean
}

export function StandardNav({ user, isAuthenticated = false }: StandardNavProps) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  const publicNavItems = [
    { href: "/trade", label: "Trade" },
    { href: "/markets", label: "Markets" },
    { href: "/wallet", label: "Wallet" },
    { href: "/converter", label: "Converter" },
    { href: "/about", label: "About" },
  ]

  const authenticatedNavItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/exchange", label: "Trade", icon: ArrowLeftRight },
    { href: "/wallet", label: "Wallet", icon: Wallet },
  ]

  const dropdownItems = isAuthenticated
    ? [
        { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
        { href: "/converter", label: "Converter", icon: BarChart3 },
        { href: "/kyc", label: "KYC", icon: Shield },
        ...(user?.isAdmin ? [
          { href: "/admin/dashboard", label: "Admin Dashboard", icon: Shield },
          { href: "/admin/users", label: "User Management", icon: User },
          { href: "/admin/system", label: "System Control", icon: Settings },
          { href: "/admin/audit", label: "Audit Logs", icon: Bell }
        ] : []),
      ]
    : publicNavItems

  return (
    <header className="glassmorphism-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">PESA-AFRIK</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  {authenticatedNavItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Link 
                        key={item.href}
                        href={item.href} 
                        className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1"
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                      <span>More</span>
                      <ChevronDown className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1e2028] border-gray-700">
                      {dropdownItems.slice(3).map((item) => {
                        const IconComponent = item.icon
                        return (
                          <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="text-gray-300 hover:text-yellow-400">
                              <IconComponent className="mr-2 h-4 w-4" />
                              {item.label}
                            </Link>
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {publicNavItems.map((item) => (
                    <Link 
                      key={item.href}
                      href={item.href} 
                      className="text-gray-300 hover:text-yellow-400 transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </>
              )}
            </nav>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yellow-400">
                  <Bell className="h-5 w-5" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="bg-[#1e2028] border-gray-700 text-gray-300 hover:bg-[#2B3139] hover:text-yellow-400">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden sm:block truncate max-w-32">{user?.email}</span>
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#1e2028] border-gray-700">
                    <DropdownMenuLabel className="text-gray-300">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">My Account</p>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-yellow-400 hover:bg-[#2B3139]">
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-yellow-400 hover:bg-[#2B3139]">
                      <Link href="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700" />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/20 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-gray-300 hover:text-yellow-400">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black hover:from-yellow-500 hover:to-yellow-700">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-yellow-400"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-[#1e2028] rounded-lg mt-2 border border-gray-700">
              {isAuthenticated ? (
                <>
                  {authenticatedNavItems.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-2 px-3 py-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                  {dropdownItems.slice(3).map((item) => {
                    const IconComponent = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-2 px-3 py-2 rounded-md"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </>
              ) : (
                <>
                  {publicNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center px-3 py-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="border-t border-gray-700 pt-2 mt-2">
                    <Link
                      href="/auth/login"
                      className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center px-3 py-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/sign-up"
                      className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center px-3 py-2 rounded-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default StandardNav