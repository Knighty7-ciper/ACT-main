import Link from 'next/link'
import { AuthForm } from '@/components/auth-form'

export const dynamic = 'force-dynamic'

export default function SignInPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_35%)]" />
      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-12 px-6 py-10 lg:grid-cols-[1fr_440px] lg:px-10">
        <section className="hidden lg:block">
          <Link href="/" className="mb-16 inline-flex items-center gap-3 text-sm font-semibold tracking-[0.18em] text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-lg font-black text-slate-950">A</span>
            ACT COIN
          </Link>
          <p className="mb-5 max-w-xl text-5xl font-semibold leading-tight tracking-tight">Move money with clarity, speed, and confidence.</p>
          <p className="max-w-md text-lg leading-8 text-slate-400">Your secure home for ACT Coin, wallet management, and global financial access.</p>
          <div className="mt-10 flex gap-8 text-sm text-slate-400"><span><strong className="block text-xl text-cyan-300">24/7</strong>Secure access</span><span><strong className="block text-xl text-cyan-300">1</strong>Connected wallet</span></div>
        </section>

        <section className="w-full">
          <div className="mb-6 lg:hidden"><Link href="/" className="inline-flex items-center gap-3 font-semibold tracking-[0.18em]"><span className="grid h-9 w-9 place-items-center rounded-lg bg-cyan-400 font-black text-slate-950">A</span>ACT COIN</Link></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl sm:p-9">
            <div className="mb-8"><p className="mb-2 text-sm font-medium uppercase tracking-[0.16em] text-cyan-300">Member access</p><h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1><p className="mt-2 text-sm text-slate-400">Sign in to continue to your ACT Coin account.</p></div>
            <AuthForm mode="sign-in" />
            <p className="mt-7 text-center text-xs leading-5 text-slate-500">By continuing, you agree to our <a href="#" className="text-slate-300 underline underline-offset-4">Terms</a> and <a href="#" className="text-slate-300 underline underline-offset-4">Privacy Policy</a>.</p>
          </div>
        </section>
      </div>
    </main>
  )
}
