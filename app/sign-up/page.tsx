import { AuthForm } from '@/components/auth-form'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4">
      {/* Ambient glow effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-gray-400">Create your ACT Coin account in seconds</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-2xl">
          <AuthForm mode="sign-up" />

          {/* Benefits */}
          <div className="mt-8 pt-6 border-t border-gray-800 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-sm text-gray-400">Instant wallet setup</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-sm text-gray-400">PPP-based rewards</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-1">✓</span>
              <span className="text-sm text-gray-400">Enterprise security</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-600 mt-6">
          By signing up, you agree to our{' '}
          <a href="#" className="text-gray-400 hover:text-gray-300 underline">
            Terms of Service
          </a>
          {' '}and{' '}
          <a href="#" className="text-gray-400 hover:text-gray-300 underline">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  )
}
