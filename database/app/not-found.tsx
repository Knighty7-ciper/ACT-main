import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-slate-700 mb-2">404</p>
        <h1 className="text-2xl font-semibold text-white mb-2">Page not found</h1>
        <p className="text-slate-400 mb-6">The page you’re looking for doesn’t exist.</p>
        <Link
          href="/"
          className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
