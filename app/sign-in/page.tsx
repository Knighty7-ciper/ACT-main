import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { AuthForm } from '@/components/auth-form'

export const dynamic = 'force-dynamic'

export default async function SignInPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect('/')

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-[#0A0D12] px-4 overflow-hidden">
      {/* faint chart-grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #8992A3 1px, transparent 1px), linear-gradient(to bottom, #8992A3 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* ambient gold glow, top-left */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#E3A63E]/10 blur-3xl" />

      <div className="w-full max-w-md relative">
        <div className="rounded-md border border-[#1B212B] bg-[#12161D] shadow-[0_0_0_1px_rgba(227,166,62,0.06)] overflow-hidden">

          {/* signature: scrolling ticker strip */}
          <div className="relative h-8 border-b border-[#1B212B] bg-[#0A0D12] overflow-hidden">
            <div className="absolute inset-y-0 left-0 flex items-center gap-8 whitespace-nowrap animate-[ticker_22s_linear_infinite] font-mono text-[11px] tracking-wide">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex items-center gap-8 pl-8">
                  <span className="text-[#8992A3]">ACT/USD <span className="text-[#46D8C4]">$1.4210</span> <span className="text-[#46D8C4]">▲0.42%</span></span>
                  <span className="text-[#8992A3]">BTC/USD <span className="text-[#E3A63E]">$61,204</span> <span className="text-red-400">▼0.11%</span></span>
                  <span className="text-[#8992A3]">ETH/USD <span className="text-[#46D8C4]">$3,388</span> <span className="text-[#46D8C4]">▲0.09%</span></span>
                  <span className="text-[#8992A3]">ACCESS <span className="text-[#E3A63E]">SECURE</span> · TLS 1.3</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#E3A63E] mb-3">
              ACT Coin — Account Access
            </p>
            <h1 className="font-mono text-3xl font-bold text-[#E9ECF1] mb-2 tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#8992A3] mb-8 text-sm">
              Sign in to manage your ACT Coin holdings.
            </p>

            <AuthForm mode="sign-in" />
          </div>
        </div>

        <p className="text-center text-[11px] text-[#8992A3]/70 font-mono mt-4 tracking-wide">
          256-BIT ENCRYPTED · MARKET DATA DELAYED 15 MIN
        </p>
      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}