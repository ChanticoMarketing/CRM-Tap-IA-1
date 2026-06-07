import React from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import DatabaseWarning from '@/components/DatabaseWarning'
import PipelineStageEditor, { type EditorStage } from '@/components/leads/PipelineStageEditor'
import { getDefaultPipeline } from '@/lib/leads'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type PipelineSettingsPageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'Completa todos los campos obligatorios.',
  min_stages: 'El pipeline debe tener al menos 2 etapas.',
  invalid_stage_flags: 'Solo puede haber una etapa ganada y una perdida.',
  duplicate_stage_name: 'No puede haber dos etapas con el mismo nombre.',
  stage_has_leads: 'Reasigna los leads antes de eliminar una etapa.',
  invalid_payload: 'Datos del formulario no válidos.',
  save_failed: 'No se pudo guardar el pipeline.',
}

export default async function PipelineSettingsPage({ searchParams }: PipelineSettingsPageProps) {
  const { error, saved } = await searchParams
  let dbError = false
  let initialStages: EditorStage[] = []

  try {
    const pipeline = await getDefaultPipeline()
    const leadCounts = await prisma.lead.groupBy({
      by: ['stageId'],
      _count: { id: true },
    })
    const countByStage = Object.fromEntries(leadCounts.map((r) => [r.stageId, r._count.id]))

    initialStages = pipeline.stages.map((s) => ({
      key: s.id,
      id: s.id,
      name: s.name,
      order: s.order,
      color: s.color ?? '#94a3b8',
      isWon: s.isWon,
      isLost: s.isLost,
      leadCount: countByStage[s.id] ?? 0,
    }))
  } catch {
    dbError = true
  }

  const errorMessage = error ? (ERROR_MESSAGES[error] ?? 'Error inesperado.') : null
  const successMessage = saved === '1' ? 'Pipeline guardado correctamente.' : null

  return (
    <>
      <Sidebar activeTab="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-2xl mx-auto w-full">
          <div className="mb-8">
            <Link
              href="/settings"
              className="text-sm text-on-surface-variant hover:text-primary mb-4 inline-block"
            >
              ← Volver a configuración
            </Link>
            <h2 className="font-display-lg text-display-lg text-primary mb-2">Pipeline de ventas</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Personaliza las etapas por las que pasan tus leads. Arrastra para reordenar.
            </p>
          </div>

          {dbError && <DatabaseWarning />}

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

          {!dbError && initialStages.length > 0 && (
            <div className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8 rounded-xl">
              <PipelineStageEditor initialStages={initialStages} />
            </div>
          )}

          {!dbError && initialStages.length === 0 && (
            <p className="text-on-surface-variant">
              No hay pipeline configurado. Ejecuta la migración y el seed de la base de datos.
            </p>
          )}
        </main>
      </div>
    </>
  )
}
