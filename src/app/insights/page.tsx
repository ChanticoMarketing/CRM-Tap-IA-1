import React from 'react'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'
import DatabaseWarning from '@/components/DatabaseWarning'
import { formatMoney, getAgencyCurrency } from '@/lib/crm'

export const dynamic = 'force-dynamic'

export default async function InsightsPage() {
  const getCampaignRows = () =>
    prisma.campaign.findMany({
      include: { client: true },
      orderBy: { spend: 'desc' },
    })

  let dbError = false
  let campaigns: Awaited<ReturnType<typeof getCampaignRows>> = []
  let currency = 'USD'

  try {
    const [campaignRows, agencyCurrency] = await Promise.all([
      getCampaignRows(),
      getAgencyCurrency(),
    ])
    campaigns = campaignRows
    currency = agencyCurrency
  } catch {
    dbError = true
  }

  const totalSpend = campaigns.reduce((acc, curr) => acc + curr.spend, 0)
  const runningCampaigns = campaigns.filter((c) => c.status === 'Running')
  const avgRoas =
    runningCampaigns.filter((c) => c.roas).reduce((acc, curr) => acc + (curr.roas || 0), 0) /
    (runningCampaigns.filter((c) => c.roas).length || 1)

  const statusCounts = campaigns.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const statuses = ['Running', 'Drafting', 'Needs Review']
  const maxCount = Math.max(...statuses.map((s) => statusCounts[s] || 0), 1)

  return (
    <>
      <Sidebar activeTab="insights" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">Performance Insights</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Advanced business intelligence and distribution of agency initiatives.
              </p>
            </div>
          </div>

          {dbError && <DatabaseWarning />}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">GLOBAL PUBLIC INVESTMENT</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{formatMoney(totalSpend, currency)}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">AVG. ACTIVE ROAS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{avgRoas.toFixed(2)}x</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">TOTAL ACTIVE CAMPAIGNS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{campaigns.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="col-span-1 md:col-span-6 border border-outline-variant bg-surface-container-lowest p-6 md:p-8 rounded-xl flex flex-col">
              <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Campaign Status Distribution</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">Visual metrics of active pipelines.</p>

              <div className="flex-1 flex items-center justify-center min-h-[250px]">
                <svg viewBox="0 0 400 200" className="w-full h-full max-h-[300px]">
                  <line x1="60" y1="30" x2="360" y2="30" stroke="#e7e8ea" strokeWidth="1" strokeDasharray="4" />
                  <line x1="60" y1="90" x2="360" y2="90" stroke="#e7e8ea" strokeWidth="1" strokeDasharray="4" />
                  <line x1="60" y1="150" x2="360" y2="150" stroke="#e7e8ea" strokeWidth="1" strokeDasharray="4" />
                  <line x1="60" y1="10" x2="60" y2="170" stroke="#c5c6ca" strokeWidth="1" />
                  <line x1="60" y1="170" x2="370" y2="170" stroke="#c5c6ca" strokeWidth="1" />

                  {statuses.map((status, index) => {
                    const count = statusCounts[status] || 0
                    const barHeight = (count / maxCount) * 130
                    const x = 90 + index * 95
                    const y = 170 - barHeight
                    const colorClass =
                      status === 'Running'
                        ? 'fill-secondary'
                        : status === 'Needs Review'
                          ? 'fill-error-container'
                          : 'fill-primary-container'

                    return (
                      <g key={status} className="group">
                        <rect
                          x={x}
                          y={y}
                          width="45"
                          height={barHeight}
                          rx="6"
                          ry="6"
                          className={`${colorClass} opacity-85 hover:opacity-100 transition-opacity duration-200 cursor-pointer`}
                        />
                        <text x={x + 22.5} y={y - 8} textAnchor="middle" className="font-data-tabular text-xs font-semibold fill-primary">
                          {count}
                        </text>
                        <text
                          x={x + 22.5}
                          y="188"
                          textAnchor="middle"
                          className="font-label-caps text-[10px] tracking-wide fill-on-surface-variant"
                        >
                          {status.toUpperCase()}
                        </text>
                      </g>
                    )
                  })}
                </svg>
              </div>
            </div>

            <div className="col-span-1 md:col-span-6 border border-outline-variant bg-surface-container-lowest p-6 md:p-8 rounded-xl">
              <h3 className="font-headline-lg text-headline-lg text-primary mb-2">Campaign Budget Rankings</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8">Detailed campaign allocations and metrics.</p>

              <div className="space-y-6">
                {campaigns.slice(0, 4).map((campaign) => {
                  const percentage = totalSpend > 0 ? (campaign.spend / totalSpend) * 100 : 0
                  return (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="font-body-md text-body-md font-semibold text-primary">{campaign.project}</p>
                          <p className="font-label-caps text-xs text-on-surface-variant mt-0.5">{campaign.client.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-data-tabular text-sm font-semibold text-primary">{formatMoney(campaign.spend, currency)}</p>
                          <p className="font-data-tabular text-xs text-on-surface-variant">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="w-full bg-surface-container h-2.5 rounded-full overflow-hidden">
                        <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  )
                })}
                {campaigns.length === 0 && (
                  <p className="font-body-md text-body-md text-on-surface-variant py-8 text-center">No campaign data available.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
