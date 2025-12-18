"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/contexts/auth-context"
import StandardNav from "@/components/standard-nav"
import { 
  Wallet, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Shield, 
  Star,
  Globe,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Zap
} from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const successMessage = searchParams.get('message')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await signIn(email, password)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />

      <main className="container mx-auto py-12 px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Login Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="binance-card">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-binance-gold to-yellow-600 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-binance-black" />
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Sign in to your PESA-AFRIK account to access your wallet and trading dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {successMessage && (
                  <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                    {successMessage}
                  </div>
                )}
                
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-binance-light-gray hover:text-binance-gold transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-binance-gold bg-binance-dark-gray border-binance-dark-gray rounded focus:ring-binance-gold/20"
                      />
                      <span className="text-sm text-binance-light-gray">Remember me</span>
                    </label>
                    <Link href="/auth/forgot-password" className="text-sm text-binance-gold hover:text-binance-gold/80 transition-colors">
                      Forgot password?
                    </Link>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full binance-button h-12 text-lg font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-binance-black border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-binance-dark-gray text-center">
                  <p className="text-binance-light-gray">
                    Don't have an account?{" "}
                    <Link href="/auth/sign-up" className="text-binance-gold hover:text-binance-gold/80 font-medium transition-colors">
                      Sign up for free
                    </Link>
                  </p>
                </div>

                {/* Social Login Options */}
                <div className="mt-6 space-y-3">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-binance-dark-gray" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-binance-black text-binance-light-gray">Or continue with</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-binance-dark-gray text-binance-light-gray hover:bg-binance-dark-gray hover:text-white">
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" className="border-binance-dark-gray text-binance-light-gray hover:bg-binance-dark-gray hover:text-white">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.097.118.112.222.083.343-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.748-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                      </svg>
                      GitHub
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-binance-light-gray">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secured with bank-level encryption</span>
              </div>
            </div>
          </div>

          {/* Feature Showcase */}
          <div className="hidden lg:block">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Join Africa's Leading
                  <span className="text-binance-gold block">Currency Exchange</span>
                </h2>
                <p className="text-xl text-binance-light-gray">
                  Trade, send, and manage African currencies with confidence
                </p>
              </div>

              {/* Feature List */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Instant Currency Exchange</h3>
                    <p className="text-binance-light-gray text-sm">Real-time rates for 13+ African currencies</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-binance-gold/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-binance-gold" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Lightning Fast Transfers</h3>
                    <p className="text-binance-light-gray text-sm">Send money across borders in seconds</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Bank-Level Security</h3>
                    <p className="text-binance-light-gray text-sm">Advanced encryption protects your funds</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Global Accessibility</h3>
                    <p className="text-binance-light-gray text-sm">Access from anywhere in the world</p>
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-binance-dark-gray">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">500K+</div>
                  <div className="text-sm text-binance-light-gray">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">$2.5B+</div>
                  <div className="text-sm text-binance-light-gray">Volume Traded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">13+</div>
                  <div className="text-sm text-binance-light-gray">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}