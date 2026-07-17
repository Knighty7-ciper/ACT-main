'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-xl w-full bg-slate-800 border border-red-500/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-400 mb-2">
          Something went wrong
        </h2>
        <p className="text-slate-300 text-sm mb-4">
          A server error occurred while rendering this page.
        </p>
        <div className="bg-slate-950 rounded p-3 mb-4 overflow-auto max-h-64">
          <p className="text-xs font-mono text-red-300 break-all whitespace-pre-wrap">
            {error.message}
          </p>
          {error.digest && (
            <p className="text-xs font-mono text-slate-500 mt-2 break-all">
              digest: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
