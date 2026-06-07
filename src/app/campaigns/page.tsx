import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import DatabaseWarning from '@/components/DatabaseWarning'
import { formatMoney, getAgencyCurrency } from '@/lib/crm'

export const dynamic = 'force-dynamic'

export default async function CampaignsPage() {
  const getCampaignRows = () =>
    prisma.campaign.findMany({
      include: { client: true },
      orderBy: { updatedAt: 'desc' },
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

  const totalSpend = campaigns.reduce((acc, curr) => acc + curr.spend, 0);
  const avgRoas = campaigns.filter(c => c.roas).reduce((acc, curr) => acc + (curr.roas || 0), 0) / (campaigns.filter(c => c.roas).length || 1);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-tertiary-fixed text-on-tertiary-fixed-variant';
      case 'Needs Review':
        return 'bg-secondary-fixed text-on-secondary-fixed-variant';
      case 'Drafting':
        return 'bg-surface-container-high text-on-surface-variant';
      default:
        return 'bg-outline-variant text-on-surface-variant';
    }
  };

  return (
    <>
      <Sidebar activeTab="campaigns" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex justify-between items-center w-full px-margin-mobile h-20 border-b border-outline-variant bg-surface sticky top-0 z-40">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-semibold text-on-surface">Avenue</h1>
        </header>

        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">Campaign Manager</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Track performance, budgets, and status across all client initiatives.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/campaigns/new" className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded hover:bg-on-surface-variant transition-colors font-body-md text-body-md">
                <span className="material-symbols-outlined text-[18px]">add</span> Create Campaign
              </Link>
            </div>
          </div>

          {dbError && <DatabaseWarning />}

          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">TOTAL SPEND</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{formatMoney(totalSpend, currency)}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">AVG. ROAS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{avgRoas.toFixed(1)}x</span>
            </div>
          </div>

          {/* Campaigns Table */}
          <div className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">PROJECT / CLIENT</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">STATUS</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">SPEND</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">ROAS</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">LAST UPDATED</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right"></th>
                  </tr>
                </thead>
                <tbody className="font-data-tabular text-data-tabular">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-outline-variant group hover:bg-surface-container-low transition-all duration-300">
                      <td className="py-5">
                        <Link href={`/campaigns/${campaign.id}`} className="block select-none">
                          <p className="font-medium text-primary hover:underline transition-colors">{campaign.project}</p>
                          <p className="text-on-surface-variant text-xs mt-0.5">{campaign.client.name}</p>
                        </Link>
                      </td>
                      <td className="py-5 select-none">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium tracking-wide uppercase ${getStatusStyles(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-5 text-right text-primary font-medium select-none">{formatMoney(campaign.spend, currency)}</td>
                      <td className="py-5 text-right text-primary select-none">{campaign.roas ? `${campaign.roas}x` : '-'}</td>
                      <td className="py-5 text-right text-on-surface-variant select-none">
                        {new Date(campaign.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-5 text-right pr-2">
                        <Link href={`/campaigns/${campaign.id}`} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-end">
                          <span className="material-symbols-outlined text-[20px] transform group-hover:translate-x-1 transition-transform duration-300">
                            chevron_right
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                        No campaigns available yet.
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
  );
}
