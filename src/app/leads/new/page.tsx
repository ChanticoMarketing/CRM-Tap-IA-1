import React from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import SubmitButton from '@/components/SubmitButton'
import { createLead } from '@/app/leads/actions'
import { getDefaultPipeline } from '@/lib/leads'

export const dynamic = 'force-dynamic'

type NewLeadPageProps = {
  searchParams: Promise<{ error?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'El nombre del lead es obligatorio.',
  invalid_value: 'El valor debe ser un número válido mayor o igual a cero.',
  invalid_stage: 'La etapa seleccionada no es válida.',
  save_failed: 'No se pudo guardar el lead. Inténtalo de nuevo.',
}

export default async function NewLeadPage({ searchParams }: NewLeadPageProps) {
  const { error } = await searchParams
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? 'Error inesperado. Inténtalo de nuevo.') : null

  let stages: { id: string; name: string }[] = []
  try {
    const pipeline = await getDefaultPipeline()
    stages = pipeline.stages.map((s) => ({ id: s.id, name: s.name }))
  } catch {
    stages = []
  }

  const defaultStageId = stages[0]?.id ?? ''

  return (
    <>
      <Sidebar activeTab="leads" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-2xl mx-auto w-full">
          <div className="mb-12">
            <h2 className="font-display-lg text-display-lg text-primary mb-2">Nuevo lead</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Registra un prospecto en el pipeline de ventas.
            </p>
          </div>

          {errorMessage && (
            <div
              className="mb-6 border border-error bg-error-container text-on-error-container px-4 py-3 rounded"
              aria-live="polite"
            >
              {errorMessage}
            </div>
          )}

          <form
            action={createLead}
            className="space-y-8 border border-outline-variant bg-surface-container-lowest p-8 rounded-xl"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="font-label-caps text-label-caps text-on-surface-variant block">
                NOMBRE
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="ej. María López"
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
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
                placeholder="ej. TechStart"
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
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
                  className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
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
                  className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
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
                placeholder="0"
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              />
            </div>

            {stages.length > 0 && (
              <div className="space-y-2">
                <label htmlFor="stageId" className="font-label-caps text-label-caps text-on-surface-variant block">
                  ETAPA INICIAL
                </label>
                <select
                  id="stageId"
                  name="stageId"
                  defaultValue={defaultStageId}
                  className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
                >
                  {stages.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="notes" className="font-label-caps text-label-caps text-on-surface-variant block">
                NOTAS
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              />
            </div>

            <div className="pt-4 flex gap-4">
              <SubmitButton
                idleLabel="CREAR LEAD"
                pendingLabel="CREANDO..."
                className="flex-1 bg-primary text-on-primary py-4 font-bold hover:bg-on-surface-variant transition-colors rounded"
              />
              <Link
                href="/leads"
                className="px-8 py-4 border border-outline-variant hover:bg-surface-container transition-colors text-center rounded"
              >
                CANCELAR
              </Link>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}
