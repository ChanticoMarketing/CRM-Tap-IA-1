export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-on-background flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-outline-variant bg-surface-container-lowest rounded-xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-2/3 bg-surface-container-high rounded" />
          <div className="h-4 w-full bg-surface-container-high rounded" />
          <div className="h-4 w-5/6 bg-surface-container-high rounded" />
          <div className="h-10 w-1/3 bg-surface-container-high rounded mt-2" />
        </div>
      </div>
    </div>
  )
}
