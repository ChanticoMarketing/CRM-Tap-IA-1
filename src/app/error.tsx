'use client'

import Link from 'next/link'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  return (
    <html lang="en">
      <body className="bg-background text-on-background min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-lg border border-outline-variant bg-surface-container-lowest rounded-xl p-8">
          <h1 className="font-display-lg text-display-lg text-primary mb-3">Something went wrong</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            The page could not be loaded. Please try again.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="bg-primary text-on-primary px-5 py-3 rounded font-semibold hover:bg-on-surface-variant transition-colors"
            >
              Retry
            </button>
            <Link
              href="/"
              className="border border-outline-variant px-5 py-3 rounded text-center hover:bg-surface-container transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
          {error.digest && (
            <p className="mt-5 text-xs text-on-surface-variant">
              Error reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
