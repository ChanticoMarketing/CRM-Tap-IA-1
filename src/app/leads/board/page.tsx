import React from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import DatabaseWarning from '@/components/DatabaseWarning'
import LeadsNav from '@/components/leads/LeadsNav'
import LeadKanban from '@/components/leads/LeadKanban'
import { formatMoney, getAgencyCurrency } from '@/lib/crm'
import { getLeadsGroupedByStage } from '@/lib/leads'

export const dynamic = 'force-dynamic'

export default async function LeadsBoardPage() {
  let dbError = false
  let currency = 'USD'
  let grouped: Awaited<ReturnType<typeof getLeadsGroupedByStage>> = []

  try {
    const [groupedRows, agencyCurrency] = await Promise.all([
      getLeadsGroupedByStage(),
      getAgencyCurrency(),
    ])
    grouped = groupedRows
    currency = agencyCurrency
  } catch {
    dbError = true
  }

  const stages = grouped.map((g) => g.stage)
  const leadsByStage: Record<string, typeof grouped[0]['leads']> = {}
  for (const { stage, leads } of grouped) {
    leadsByStage[stage.id] = leads
  }

  const formatValue = (value: number) => formatMoney(value, currency)

  return (
    <>
      <Sidebar activeTab="leads" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-[100%] mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">Tablero de leads</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Arrastra los leads entre etapas para actualizar su estado en el pipeline.
              </p>
            </div>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/settings/pipeline"
                className="px-4 py-2 border border-outline-variant hover:bg-surface-container transition-colors rounded text-sm"
              >
                Editar pipeline
              </Link>
              <Link
                href="/leads/new"
                className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded hover:bg-on-surface-variant transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Nuevo lead
              </Link>
            </div>
          </div>

          <LeadsNav active="board" />

          {dbError && <DatabaseWarning />}

          {!dbError && stages.length > 0 && (
            <LeadKanban
              stages={stages.map((s) => ({
                id: s.id,
                name: s.name,
                color: s.color,
                order: s.order,
              }))}
              leadsByStage={Object.fromEntries(
                Object.entries(leadsByStage).map(([id, leads]) => [
                  id,
                  leads.map((l) => ({
                    id: l.id,
                    name: l.name,
                    company: l.company,
                    email: l.email,
                    value: l.value,
                    stageId: l.stageId,
                  })),
                ]),
              )}
              formatValue={formatValue}
            />
          )}

          {!dbError && stages.length === 0 && (
            <p className="text-on-surface-variant py-8">
              No hay etapas configuradas.{' '}
              <Link href="/settings/pipeline" className="text-primary hover:underline">
                Configura el pipeline
              </Link>
              .
            </p>
          )}
        </main>
      </div>
    </>
  )
}
