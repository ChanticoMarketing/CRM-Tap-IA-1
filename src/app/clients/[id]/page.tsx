import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'
import DatabaseWarning from '@/components/DatabaseWarning'
import { formatMoney, getAgencyCurrency } from '@/lib/crm'

export const dynamic = 'force-dynamic'

type ClientDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params
  let dbError = false
  let currency = 'USD'
  const getClientDetail = () =>
    prisma.client.findUnique({
      where: { id },
      include: {
        campaigns: {
          orderBy: { updatedAt: 'desc' },
        },
      },
    })

  let client: Awaited<ReturnType<typeof getClientDetail>> = null

  try {
    const [clientRow, agencyCurrency] = await Promise.all([
      getClientDetail(),
      getAgencyCurrency(),
    ])
    client = clientRow
    currency = agencyCurrency
  } catch {
    dbError = true
  }

  if (!client && !dbError) {
    notFound()
  }

  if (dbError || !client) {
    return (
      <>
        <Sidebar activeTab="clients" />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
            <DatabaseWarning message="Client details could not be loaded. Please verify the database connection and retry." />
            <Link
              href="/clients"
              className="inline-flex px-4 py-2 border border-outline-variant hover:bg-surface-container transition-colors rounded"
            >
              Back to Clients
            </Link>
          </main>
        </div>
      </>
    )
  }

  const totalSpend = client.campaigns.reduce((total, campaign) => total + campaign.spend, 0)

  return (
    <>
      <Sidebar activeTab="clients" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">{client.name}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {client.industry || 'Industry not specified'}
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/clients"
                className="px-4 py-2 border border-outline-variant hover:bg-surface-container transition-colors rounded"
              >
                Back to Clients
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-10">
            <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">CAMPAIGNS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{client.campaigns.length}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">TOTAL SPEND</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{formatMoney(totalSpend, currency)}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">JOINED</span>
              <span className="font-body-md text-body-md text-primary">
                {new Date(client.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8 rounded-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-lg text-headline-lg text-primary">Campaigns</h3>
              <Link href="/campaigns/new" className="text-on-surface-variant hover:text-primary transition-colors">
                New Campaign
              </Link>
            </div>
            {client.campaigns.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant py-6">
                No campaigns registered for this client yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-outline-variant">
                      <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">
                        PROJECT
                      </th>
                      <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">
                        STATUS
                      </th>
                      <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">
                        SPEND
                      </th>
                      <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">
                        UPDATED
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-data-tabular text-data-tabular">
                    {client.campaigns.map((campaign) => (
                      <tr key={campaign.id} className="border-b border-outline-variant">
                        <td className="py-4">
                          <Link href={`/campaigns/${campaign.id}`} className="text-primary hover:underline">
                            {campaign.project}
                          </Link>
                        </td>
                        <td className="py-4 text-on-surface-variant">{campaign.status}</td>
                        <td className="py-4 text-right text-primary">{formatMoney(campaign.spend, currency)}</td>
                        <td className="py-4 text-right text-on-surface-variant">
                          {new Date(campaign.updatedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  )
}
