import Link from 'next/link'

type LeadsNavProps = {
  active: 'list' | 'board'
}

export default function LeadsNav({ active }: LeadsNavProps) {
  return (
    <div className="flex gap-2 mb-8 border-b border-outline-variant">
      <Link
        href="/leads"
        className={[
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
          active === 'list'
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface',
        ].join(' ')}
        aria-current={active === 'list' ? 'page' : undefined}
      >
        Lista
      </Link>
      <Link
        href="/leads/board"
        className={[
          'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
          active === 'board'
            ? 'border-primary text-primary'
            : 'border-transparent text-on-surface-variant hover:text-on-surface',
        ].join(' ')}
        aria-current={active === 'board' ? 'page' : undefined}
      >
        Tablero
      </Link>
    </div>
  )
}
