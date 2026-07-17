import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { getProfile, getUserWallets } from './actions/profile'
import { signOutAction } from './actions/auth'
import Link from 'next/link'

// Always render on demand — never at build time, because we need a live DB session.
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/sign-in')

  const profile = await getProfile()
  const wallets = await getUserWallets()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">🪙 ACT Coin</h1>
            <p className="text-slate-400 text-sm">PPP-based Cryptocurrency Platform</p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              Sign Out
            </button>
          </form>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome, {profile?.firstName || session.user.email}!
          </h2>
          <p className="text-slate-400">
            Manage your ACT Coin wallet and PPP-based transactions
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">Profile Information</h3>
            <div className="space-y-3 text-slate-400 text-sm">
              <div>
                <span className="text-slate-300">Email:</span> {session.user.email}
              </div>
              {profile?.country && (
                <div>
                  <span className="text-slate-300">Country:</span> {profile.country}
                </div>
              )}
              {profile?.phoneNumber && (
                <div>
                  <span className="text-slate-300">Phone:</span> {profile.phoneNumber}
                </div>
              )}
              <div className="pt-2">
                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    profile?.kycStatus === 'verified'
                      ? 'bg-green-900 text-green-200'
                      : 'bg-yellow-900 text-yellow-200'
                  }`}
                >
                  KYC: {profile?.kycStatus || 'pending'}
                </span>
              </div>
            </div>
            <Link
              href="/profile"
              className="mt-4 block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            >
              Edit Profile
            </Link>
          </div>

          {/* Wallets Card */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">Wallets</h3>
            <div className="text-slate-400 text-sm mb-4">
              Total Wallets: <span className="text-white font-semibold">{wallets.length}</span>
            </div>
            {wallets.length > 0 ? (
              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    className="bg-slate-700 p-2 rounded text-xs text-slate-300"
                  >
                    <div className="truncate font-mono">{wallet.walletAddress}</div>
                    <div className="text-slate-400">
                      Balance: {wallet.balance} {wallet.currency}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 mb-4">No wallets yet</p>
            )}
            <Link
              href="/wallets"
              className="block w-full text-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition"
            >
              Manage Wallets
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
            <h3 className="text-white font-semibold mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="text-slate-400 text-sm">Account Status</div>
                <div className="text-green-400 font-semibold">Active</div>
              </div>
              <div>
                <div className="text-slate-400 text-sm">Member Since</div>
                <div className="text-white font-semibold">
                  {new Date(session.user.createdAt || Date.now()).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/transactions"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-6 transition"
          >
            <h4 className="text-white font-semibold mb-2">📊 View Transactions</h4>
            <p className="text-slate-400 text-sm">
              Check your transaction history and details
            </p>
          </Link>
          <Link
            href="/ppp"
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg p-6 transition"
          >
            <h4 className="text-white font-semibold mb-2">📈 PPP Data</h4>
            <p className="text-slate-400 text-sm">
              View purchasing power parity information
            </p>
          </Link>
        </div>
      </main>
    </div>
  )
}
