'use client'

import { convertLeadToClient } from '@/app/leads/actions'
import SubmitButton from '@/components/SubmitButton'

type ConvertLeadButtonProps = {
  leadId: string
  disabled?: boolean
}

export default function ConvertLeadButton({ leadId, disabled }: ConvertLeadButtonProps) {
  if (disabled) {
    return (
      <p className="text-sm text-on-surface-variant border border-outline-variant px-4 py-3 rounded">
        Este lead ya fue convertido a cliente.
      </p>
    )
  }

  return (
    <form action={convertLeadToClient}>
      <input type="hidden" name="leadId" value={leadId} />
      <SubmitButton
        idleLabel="CONVERTIR A CLIENTE"
        pendingLabel="CONVIRTIENDO..."
        className="w-full bg-tertiary-fixed text-on-tertiary-fixed-variant py-3 font-bold hover:opacity-90 transition-opacity rounded"
      />
    </form>
  )
}
