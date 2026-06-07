import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg border border-outline-variant bg-surface-container-lowest rounded-xl p-8 text-center">
        <h1 className="font-display-lg text-display-lg text-primary mb-3">Page not found</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          The resource you requested does not exist or was moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-primary text-on-primary px-5 py-3 rounded font-semibold hover:bg-on-surface-variant transition-colors"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
