type DatabaseWarningProps = {
  message?: string
}

export default function DatabaseWarning({
  message = 'Data could not be loaded right now. Check your database connection and try again.',
}: DatabaseWarningProps) {
  return (
    <div className="mb-6 border border-secondary-fixed-dim bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-3 rounded">
      {message}
    </div>
  )
}
