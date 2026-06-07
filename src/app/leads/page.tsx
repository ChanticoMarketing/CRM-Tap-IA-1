import React from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import DatabaseWarning from '@/components/DatabaseWarning'
import LeadsNav from '@/components/leads/LeadsNav'
import { formatMoney, getAgencyCurrency } from '@/lib/crm'
import { getAllLeads } from '@/lib/leads'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  let dbError = false
  let currency = 'USD'
  let leads: Awaited<ReturnType<typeof getAllLeads>> = []

  try {
    const [leadRows, agencyCurrency] = await Promise.all([getAllLeads(), getAgencyCurrency()])
    leads = leadRows
    currency = agencyCurrency
  } catch {
    dbError = true
  }

  const totalValue = leads.reduce((acc, l) => acc + (l.value ?? 0), 0)
  const convertedCount = leads.filter((l) => l.clientId).length

  return (
    <>
      <Sidebar activeTab="leads" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-6">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">Leads</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Gestiona prospectos y su posición en el pipeline de ventas.
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
                className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded hover:bg-on-surface-variant transition-colors font-body-md text-body-md"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                Nuevo lead
              </Link>
            </div>
          </div>

          <LeadsNav active="list" />

          {dbError && <DatabaseWarning />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">TOTAL LEADS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{leads.length}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">VALOR PIPELINE</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{formatMoney(totalValue, currency)}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">CONVERTIDOS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{convertedCount}</span>
            </div>
          </div>

          <div className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">LEAD</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">ETAPA</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">VALOR</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">ACTUALIZADO</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right"></th>
                  </tr>
                </thead>
                <tbody className="font-data-tabular text-data-tabular">
                  {leads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-b border-outline-variant group hover:bg-surface-container-low transition-all duration-300"
                    >
                      <td className="py-5">
                        <Link href={`/leads/${lead.id}`} className="block select-none">
                          <p className="font-medium text-primary hover:underline transition-colors">{lead.name}</p>
                          <p className="text-on-surface-variant text-xs mt-0.5">
                            {lead.company || lead.email || '—'}
                          </p>
                        </Link>
                      </td>
                      <td className="py-5 select-none">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium tracking-wide uppercase bg-surface-container-high text-on-surface-variant"
                          style={lead.stage.color ? { borderLeft: `3px solid ${lead.stage.color}` } : undefined}
                        >
                          {lead.stage.name}
                        </span>
                        {lead.clientId && (
                          <span className="ml-2 text-xs text-tertiary-fixed-dim">Cliente</span>
                        )}
                      </td>
                      <td className="py-5 text-right text-primary font-medium select-none">
                        {lead.value != null ? formatMoney(lead.value, currency) : '—'}
                      </td>
                      <td className="py-5 text-right text-on-surface-variant select-none">
                        {new Date(lead.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-5 text-right pr-2">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-end"
                        >
                          <span className="material-symbols-outlined text-[20px] transform group-hover:translate-x-1 transition-transform duration-300">
                            chevron_right
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && !dbError && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                        No hay leads registrados. Crea el primero o ejecuta el seed de la base de datos.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
