'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })

      setLoading(false)

      if (error) {
        setError(error.message ?? 'Something went wrong')
        return
      }

      router.push('/')
      router.refresh()
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-100">
            Full Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
            autoComplete="name"
            className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/30"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-gray-100">
          Email Address
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/30"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium text-gray-100">
          Password
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={isSignUp ? 'Min 8 characters' : 'Enter your password'}
          required
          minLength={8}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          className="bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-400 focus:ring-blue-400/30"
        />
        {isSignUp && (
          <p className="text-xs text-gray-400">
            Must be at least 8 characters long
          </p>
        )}
      </div>

      {error && (
        <div
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400"
          role="alert"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        {loading
          ? isSignUp
            ? 'Creating account...'
            : 'Signing in...'
          : isSignUp
            ? 'Create Account'
            : 'Sign In'}
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-950 text-gray-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
        </div>
      </div>

      <Link
        href={isSignUp ? '/sign-in' : '/sign-up'}
        className="block w-full h-11 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
      >
        {isSignUp ? 'Sign In Instead' : 'Create Account'}
      </Link>
    </form>
  )
}
