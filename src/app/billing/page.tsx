import React from 'react';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import DatabaseWarning from '@/components/DatabaseWarning'
import { formatMoney, getAgencyCurrency } from '@/lib/crm'

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const getCampaignRows = () =>
    prisma.campaign.findMany({
      include: { client: true },
      orderBy: { updatedAt: 'desc' },
    })

  let dbError = false
  let campaigns: Awaited<ReturnType<typeof getCampaignRows>> = []
  let totalClients = 0
  let currency = 'USD'

  try {
    const [campaignRows, clientCount, agencyCurrency] = await Promise.all([
      getCampaignRows(),
      prisma.client.count(),
      getAgencyCurrency(),
    ])
    campaigns = campaignRows
    totalClients = clientCount
    currency = agencyCurrency
  } catch {
    dbError = true
  }

  const totalInvoiced = campaigns.reduce((acc, curr) => acc + curr.spend, 0);
  const activeContracts = campaigns.filter(c => c.status === 'Running').length;

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Running':
        return 'bg-tertiary-fixed text-on-tertiary-fixed-variant'; // Paid
      case 'Needs Review':
        return 'bg-secondary-fixed text-on-secondary-fixed-variant'; // Pending Approval
      default:
        return 'bg-surface-container-high text-on-surface-variant'; // Pending
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Running':
        return 'PAID';
      case 'Needs Review':
        return 'UNPAID';
      default:
        return 'PENDING';
    }
  };

  return (
    <>
      <Sidebar activeTab="billing" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">Billing Center</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Invoices, payment status, and contract values mapping public budgets.</p>
            </div>
          </div>

          {dbError && <DatabaseWarning />}

          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-12">
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">TOTAL INVOICED</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{formatMoney(totalInvoiced, currency)}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">ACTIVE CONTRACTS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{activeContracts}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">TOTAL CUSTOMERS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{totalClients}</span>
            </div>
          </div>

          {/* Invoice History Table */}
          <div className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8 rounded-xl">
            <h3 className="font-headline-lg text-headline-lg text-primary mb-8">Invoice History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">INVOICE ID</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">CLIENT / PROJECT</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">STATUS</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">AMOUNT</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">DATE</th>
                  </tr>
                </thead>
                <tbody className="font-data-tabular text-data-tabular">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-b border-outline-variant group hover:bg-[#F1F3F5] transition-colors cursor-pointer">
                      <td className="py-5 text-primary font-medium">
                        #INV-{campaign.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="py-5">
                        <div>
                          <p className="font-medium text-primary">{campaign.client.name}</p>
                          <p className="text-on-surface-variant text-xs mt-0.5">{campaign.project}</p>
                        </div>
                      </td>
                      <td className="py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium tracking-wide ${getStatusStyles(campaign.status)}`}>
                          {getStatusLabel(campaign.status)}
                        </span>
                      </td>
                      <td className="py-5 text-right text-primary font-semibold">{formatMoney(campaign.spend, currency)}</td>
                      <td className="py-5 text-right text-on-surface-variant">
                        {new Date(campaign.updatedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {campaigns.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center font-body-md text-on-surface-variant">
                        No invoice history available.
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
