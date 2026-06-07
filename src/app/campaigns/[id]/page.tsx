import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'
import DatabaseWarning from '@/components/DatabaseWarning'
import { formatMoney, getAgencyCurrency } from '@/lib/crm'

export const dynamic = 'force-dynamic'

type CampaignDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params
  let dbError = false
  let currency = 'USD'
  const getCampaignDetail = () =>
    prisma.campaign.findUnique({
      where: { id },
      include: {
        client: true,
      },
    })
  let campaign: Awaited<ReturnType<typeof getCampaignDetail>> = null

  try {
    const [campaignRow, agencyCurrency] = await Promise.all([
      getCampaignDetail(),
      getAgencyCurrency(),
    ])
    campaign = campaignRow
    currency = agencyCurrency
  } catch {
    dbError = true
  }

  if (!campaign && !dbError) {
    notFound()
  }

  if (dbError || !campaign) {
    return (
      <>
        <Sidebar activeTab="campaigns" />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
            <DatabaseWarning message="Campaign details could not be loaded. Please verify the database connection and retry." />
            <Link
              href="/campaigns"
              className="inline-flex px-4 py-2 border border-outline-variant hover:bg-surface-container transition-colors rounded"
            >
              Back to Campaigns
            </Link>
          </main>
        </div>
      </>
    )
  }

  return (
    <>
      <Sidebar activeTab="campaigns" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-4xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">{campaign.project}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{campaign.name}</p>
            </div>
            <div>
              <Link
                href="/campaigns"
                className="px-4 py-2 border border-outline-variant hover:bg-surface-container transition-colors rounded"
              >
                Back to Campaigns
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-10">
            <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">CLIENT</span>
              <Link href={`/clients/${campaign.client.id}`} className="font-body-md text-body-md text-primary hover:underline">
                {campaign.client.name}
              </Link>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">STATUS</span>
              <span className="font-body-md text-body-md text-primary">{campaign.status}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">BUDGET</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{formatMoney(campaign.spend, currency)}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 block">ROAS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{campaign.roas ? `${campaign.roas}x` : '-'}</span>
            </div>
          </div>

          <div className="border border-outline-variant bg-surface-container-lowest p-6 rounded-xl">
            <h3 className="font-headline-lg text-headline-lg text-primary mb-6">Timeline</h3>
            <div className="space-y-2 text-on-surface-variant">
              <p>Created: {new Date(campaign.createdAt).toLocaleString()}</p>
              <p>Last update: {new Date(campaign.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
