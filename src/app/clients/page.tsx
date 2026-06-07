import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Sidebar from '@/components/Sidebar';
import DatabaseWarning from '@/components/DatabaseWarning'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
  const getClientRows = () =>
    prisma.client.findMany({
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
      orderBy: { name: 'asc' },
    })

  let dbError = false
  let clients: Awaited<ReturnType<typeof getClientRows>> = []

  try {
    clients = await getClientRows()
  } catch {
    dbError = true
  }

  const totalClients = clients.length;
  const industries = Array.from(new Set(clients.map(c => c.industry).filter(Boolean))).length;

  return (
    <>
      <Sidebar activeTab="clients" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNavBar (Mobile Only) */}
        <header className="md:hidden flex justify-between items-center w-full px-margin-mobile h-20 border-b border-outline-variant bg-surface sticky top-0 z-40">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-semibold text-on-surface">Avenue</h1>
          <div className="flex items-center gap-4 text-on-surface-variant">
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">search</span></button>
            <button className="hover:text-primary transition-colors"><span className="material-symbols-outlined">menu</span></button>
          </div>
        </header>

        {/* Canvas */}
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-container-max mx-auto w-full">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="font-display-lg text-display-lg text-primary mb-2">Client Portfolio</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Manage your agency&apos;s client relationships and industry reach.</p>
            </div>
            <div className="flex gap-4">
              <Link href="/clients/new" className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded hover:bg-on-surface-variant transition-colors font-body-md text-body-md">
                <span className="material-symbols-outlined text-[18px]">add</span> Add Client
              </Link>
            </div>
          </div>

          {dbError && <DatabaseWarning />}

          {/* KPI Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-12">
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">TOTAL CLIENTS</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{totalClients}</span>
            </div>
            <div className="border border-outline-variant bg-surface-container-lowest p-6 flex flex-col rounded-xl">
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">INDUSTRIES</span>
              <span className="font-kpi-metric text-kpi-metric text-primary">{industries}</span>
            </div>
          </div>

          {/* Clients Table */}
          <div className="border border-outline-variant bg-surface-container-lowest p-6 md:p-8 rounded-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">CLIENT NAME</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal">INDUSTRY</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">CAMPAIGNS</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right">JOINED</th>
                    <th className="py-4 font-label-caps text-label-caps text-on-surface-variant font-normal text-right"></th>
                  </tr>
                </thead>
                <tbody className="font-data-tabular text-data-tabular">
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-outline-variant group hover:bg-surface-container-low transition-all duration-300">
                      <td className="py-5">
                        <Link href={`/clients/${client.id}`} className="flex items-center gap-3 select-none">
                          <div className="w-8 h-8 bg-surface-container-high rounded flex items-center justify-center text-on-surface-variant group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary transition-all duration-300">
                            <span className="material-symbols-outlined text-[16px]">
                              {client.industry === 'Cosmetics' ? 'apartment' : 
                               client.industry === 'Automotive' ? 'directions_car' : 'chair'}
                            </span>
                          </div>
                          <span className="font-medium text-primary hover:underline transition-colors">{client.name}</span>
                        </Link>
                      </td>
                      <td className="py-5 text-on-surface-variant select-none">{client.industry || 'N/A'}</td>
                      <td className="py-5 text-right text-primary font-medium select-none">{client._count.campaigns}</td>
                      <td className="py-5 text-right text-on-surface-variant select-none">
                        {new Date(client.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-5 text-right pr-2">
                        <Link href={`/clients/${client.id}`} className="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-end">
                          <span className="material-symbols-outlined text-[20px] transform group-hover:translate-x-1 transition-transform duration-300">
                            chevron_right
                          </span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {clients.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-on-surface-variant">
                        No clients registered yet.
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
