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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isSignUp = mode === 'sign-up'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = isSignUp
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })

      setLoading(false)

      if (result.error) {
        setError(
          result.error.status === 500
            ? 'Authentication is temporarily unavailable because the database is not connected. Please try again after the database is configured.'
            : result.error.message || 'Unable to complete authentication.'
        )
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
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-slate-200">Full name</Label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm text-slate-500">●</span>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required autoComplete="name" className="h-11 border-slate-700 bg-slate-950/70 pl-10 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20" />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium text-slate-200">Email address</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm text-slate-500">@</span>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" className="h-11 border-slate-700 bg-slate-950/70 pl-10 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-sm font-medium text-slate-200">Password</Label>
          {!isSignUp && <span className="text-xs text-slate-500">Keep your account secure</span>}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-sm text-slate-500">•</span>
          <Input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignUp ? 'At least 8 characters' : 'Enter your password'} required minLength={8} autoComplete={isSignUp ? 'new-password' : 'current-password'} className="h-11 border-slate-700 bg-slate-950/70 pl-10 pr-10 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:ring-cyan-400/20" />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
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
        className="h-11 w-full bg-cyan-400 text-slate-950 font-semibold shadow-lg shadow-cyan-400/20 hover:bg-cyan-300"
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
          <span className="bg-slate-900 px-3 text-slate-500">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </span>
        </div>
      </div>

      <Link
        href={isSignUp ? '/sign-in' : '/sign-up'}
        className="flex h-11 w-full items-center justify-center rounded-lg border border-slate-700 bg-slate-800/70 font-medium text-white transition-colors hover:border-slate-600 hover:bg-slate-800"
      >
        {isSignUp ? 'Sign In Instead' : 'Create Account'}
      </Link>
    </form>
  )
}
