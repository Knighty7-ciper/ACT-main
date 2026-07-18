'use client'

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

const STORAGE_KEY = 'act_user'

export const simpleAuth = {
  // Sign up with email and name
  async signUp(email: string, name: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Sign up failed' }
      }

      // Store user in localStorage
      if (data.user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
      }

      return { success: true, user: data.user }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign up failed',
      }
    }
  },

  // Sign in with email only
  async signIn(email: string): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Sign in failed' }
      }

      // Store user in localStorage
      if (data.user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
      }

      return { success: true, user: data.user }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign in failed',
      }
    }
  },

  // Get current user from localStorage
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  },

  // Sign out
  signOut(): void {
    localStorage.removeItem(STORAGE_KEY)
  },

  // Check if user is logged in
  isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false
    return !!localStorage.getItem(STORAGE_KEY)
  },
}
