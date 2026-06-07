import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import DatabaseWarning from '@/components/DatabaseWarning'
import ConvertLeadButton from '@/components/leads/ConvertLeadButton'
import SubmitButton from '@/components/SubmitButton'
import { updateLead } from '@/app/leads/actions'
import { formatMoney, getAgencyCurrency } from '@/lib/crm'
import { getDefaultPipeline, getLeadWithStage } from '@/lib/leads'

export const dynamic = 'force-dynamic'

type LeadDetailPageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string; saved?: string; converted?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'El nombre del lead es obligatorio.',
  invalid_value: 'El valor debe ser un número válido.',
  invalid_stage: 'La etapa seleccionada no es válida.',
  already_converted: 'Este lead ya fue convertido a cliente.',
  duplicate_client: 'Ya existe un cliente con ese nombre.',
  save_failed: 'No se pudo guardar. Inténtalo de nuevo.',
}

export default async function LeadDetailPage({ params, searchParams }: LeadDetailPageProps) {
  const { id } = await params
  const { error, saved, converted } = await searchParams

  let dbError = false
  let currency = 'USD'
  let lead: Awaited<ReturnType<typeof getLeadWithStage>> = null
  let stages: { id: string; name: string }[] = []

  try {
    const [leadRow, pipeline, agencyCurrency] = await Promise.all([
      getLeadWithStage(id),
      getDefaultPipeline(),
      getAgencyCurrency(),
    ])
    lead = leadRow
    stages = pipeline.stages.map((s) => ({ id: s.id, name: s.name }))
    currency = agencyCurrency
  } catch {
    dbError = true
  }

  if (!lead && !dbError) notFound()

  const errorMessage = error ? (ERROR_MESSAGES[error] ?? 'Error inesperado.') : null
  const successMessage =
    saved === '1' ? 'Lead actualizado correctamente.' : converted === '1' ? 'Lead convertido a cliente.' : null

  if (dbError || !lead) {
    return (
      <>
        <Sidebar activeTab="leads" />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
            <DatabaseWarning message="No se pudo cargar el lead." />
            <Link href="/leads" className="inline-flex px-4 py-2 border border-outline-variant rounded mt-4">
              Volver a Leads
            </Link>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar activeTab="leads" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-2xl mx-auto w-full">
          <div className="flex justify-between items-start mb-8 gap-4">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">{lead.name}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Etapa actual: <strong>{lead.stage.name}</strong>
              </p>
            </div>
            <Link
              href="/leads"
              className="px-4 py-2 border border-outline-variant hover:bg-surface-container transition-colors rounded shrink-0"
            >
              Volver
            </Link>
          </div>

          {errorMessage && (
            <div className="mb-6 border border-error bg-error-container text-on-error-container px-4 py-3 rounded" aria-live="polite">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 border border-tertiary-fixed-dim bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-3 rounded" aria-live="polite">
              {successMessage}
            </div>
          )}

          {lead.clientId && lead.client && (
            <div className="mb-6 border border-outline-variant bg-surface-container p-4 rounded-xl">
              <p className="text-sm text-on-surface-variant mb-1">Cliente vinculado</p>
              <Link href={`/clients/${lead.client.id}`} className="text-primary font-medium hover:underline">
                {lead.client.name}
              </Link>
            </div>
          )}

          <form
            action={updateLead}
            className="space-y-6 border border-outline-variant bg-surface-container-lowest p-8 rounded-xl mb-8"
          >
            <input type="hidden" name="id" value={lead.id} />

            <div className="space-y-2">
              <label htmlFor="name" className="font-label-caps text-label-caps text-on-surface-variant block">
                NOMBRE
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={lead.name}
                required
                className="w-full border border-outline-variant bg-surface p-3 font-body-md rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="company" className="font-label-caps text-label-caps text-on-surface-variant block">
                EMPRESA
              </label>
              <input
                type="text"
                id="company"
                name="company"
                defaultValue={lead.company ?? ''}
                className="w-full border border-outline-variant bg-surface p-3 font-body-md rounded"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="email" className="font-label-caps text-label-caps text-on-surface-variant block">
                  EMAIL
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={lead.email ?? ''}
                  className="w-full border border-outline-variant bg-surface p-3 font-body-md rounded"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="phone" className="font-label-caps text-label-caps text-on-surface-variant block">
                  TELÉFONO
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  defaultValue={lead.phone ?? ''}
                  className="w-full border border-outline-variant bg-surface p-3 font-body-md rounded"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="value" className="font-label-caps text-label-caps text-on-surface-variant block">
                VALOR ESTIMADO
              </label>
              <input
                type="number"
                id="value"
                name="value"
                min="0"
                step="0.01"
                defaultValue={lead.value ?? ''}
                className="w-full border border-outline-variant bg-surface p-3 font-body-md rounded"
              />
              {lead.value != null && (
                <p className="text-xs text-on-surface-variant">{formatMoney(lead.value, currency)}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="stageId" className="font-label-caps text-label-caps text-on-surface-variant block">
                ETAPA
              </label>
              <select
                id="stageId"
                name="stageId"
                defaultValue={lead.stageId}
                className="w-full border border-outline-variant bg-surface p-3 font-body-md rounded"
              >
                {stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="font-label-caps text-label-caps text-on-surface-variant block">
                NOTAS
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={4}
                defaultValue={lead.notes ?? ''}
                className="w-full border border-outline-variant bg-surface p-3 font-body-md rounded"
              />
            </div>

            <SubmitButton
              idleLabel="GUARDAR CAMBIOS"
              pendingLabel="GUARDANDO..."
              className="w-full bg-primary text-on-primary py-4 font-bold hover:bg-on-surface-variant transition-colors rounded"
            />
          </form>

          <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
            <h3 className="font-headline-lg text-headline-lg text-primary mb-4">Conversión</h3>
            <p className="text-sm text-on-surface-variant mb-4">
              Crea un cliente en el CRM a partir de este lead (usa empresa o nombre).
            </p>
            <ConvertLeadButton leadId={lead.id} disabled={Boolean(lead.clientId)} />
          </div>
        </main>
      </div>
    </>
  )
}
