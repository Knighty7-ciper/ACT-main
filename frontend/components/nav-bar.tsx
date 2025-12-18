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
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface NavBarProps {
  user: {
    email: string
    isAdmin?: boolean
  }
}

export function NavBar({ user }: NavBarProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold text-white">PESA-AFRIK</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1"
              >
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                href="/exchange" 
                className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1"
              >
                <ArrowLeftRight className="h-4 w-4" />
                <span>Trade</span>
              </Link>
              <Link 
                href="/wallet" 
                className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1"
              >
                <Wallet className="h-4 w-4" />
                <span>Wallet</span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className="text-gray-300 hover:text-yellow-400 transition-colors flex items-center space-x-1">
                  <span>More</span>
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1e2028] border-gray-700">
                  <DropdownMenuItem asChild>
                    <Link href="/transactions" className="text-gray-300 hover:text-yellow-400">
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Transactions
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/converter" className="text-gray-300 hover:text-yellow-400">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Converter
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/kyc" className="text-gray-300 hover:text-yellow-400">
                      <Shield className="mr-2 h-4 w-4" />
                      KYC
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admino77" className="text-yellow-400 hover:text-yellow-300">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-yellow-400">
              <Bell className="h-5 w-5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-[#1e2028] border-gray-700 text-gray-300 hover:bg-[#2B3139] hover:text-yellow-400">
                  <User className="h-4 w-4 mr-2" />
                  <span className="hidden sm:block truncate max-w-32">{user.email}</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1e2028] border-gray-700">
                <DropdownMenuLabel className="text-gray-300">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">My Account</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
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
          </div>
        </div>
      </div>
    </header>
  )
}

export default NavBar