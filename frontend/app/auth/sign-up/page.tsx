"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
  Zap,
  User,
  Phone
} from "lucide-react"
import StandardNav from "@/components/standard-nav"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            phone: phoneNumber,
            country_code: countryCode
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setRegistrationSuccess(true)
        // Redirect to success page after 3 seconds
        setTimeout(() => {
          router.push("/auth/login?message=Account created! Please check your email to verify your account.")
        }, 3000)
      }
    } catch (error: unknown) {
      console.error('Signup error:', error)
      setError(error instanceof Error ? error.message : "An error occurred during account creation")
    } finally {
      setIsLoading(false)
    }
  }

  if (registrationSuccess) {
    return (
      <div className="min-h-screen bg-binance-black">
        <StandardNav isAuthenticated={false} />

        <main className="container mx-auto py-12 px-4 max-w-2xl">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Account Created!</h1>
            <p className="text-xl text-binance-light-gray mb-8">
              Welcome to PESA-AFRIK! Check your email to verify your account.
            </p>
            <Link href="/auth/login">
              <Button className="binance-button text-lg px-8 py-4">
                Continue to Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-binance-black">
      <StandardNav isAuthenticated={false} />

      <main className="container mx-auto py-12 px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Registration Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="binance-card">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-binance-gold to-yellow-600 flex items-center justify-center mx-auto mb-4">
                  <Wallet className="h-8 w-8 text-binance-black" />
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  Create Account
                </CardTitle>
                <CardDescription className="text-binance-light-gray">
                  Join thousands of users trading African currencies with confidence
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white font-medium">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                        <Input
                          id="firstName"
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="pl-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                          placeholder="John"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white font-medium">Last Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                        <Input
                          id="lastName"
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="pl-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-white font-medium">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                          placeholder="+1234567890"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="countryCode" className="text-white font-medium">Country</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                        <Input
                          id="countryCode"
                          type="text"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
                          className="pl-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                          placeholder="NG, KE, ZA..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                        placeholder="At least 8 characters"
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

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-white font-medium">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-binance-light-gray" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10 pr-10 bg-binance-dark-gray border-binance-dark-gray text-white placeholder-binance-light-gray focus:border-binance-gold focus:ring-binance-gold/20"
                        placeholder="Repeat password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-binance-light-gray hover:text-binance-gold transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full binance-button h-12 text-lg font-medium"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-binance-black border-t-transparent rounded-full animate-spin" />
                        Creating Account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        Create Account
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-binance-dark-gray text-center">
                  <p className="text-binance-light-gray">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="text-binance-gold hover:text-binance-gold/80 font-medium transition-colors">
                      Sign in
                    </Link>
                  </p>
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
                    <h3 className="text-white font-semibold">6 Default Wallets Created</h3>
                    <p className="text-binance-light-gray text-sm">ACT, NGN, KES, ZAR, GHS, USD ready to use</p>
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
                    <h3 className="text-white font-semibold">PPP-Based Fair Pricing</h3>
                    <p className="text-binance-light-gray text-sm">ACT token backed by gold, USD, and EUR</p>
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
