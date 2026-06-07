import React from 'react'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import Sidebar from '@/components/Sidebar'
import { createCampaign } from '@/app/actions'
import DatabaseWarning from '@/components/DatabaseWarning'
import SubmitButton from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

type NewCampaignPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'All required fields must be completed.',
  invalid_spend: 'Budget must be a valid number greater than or equal to 0.',
  invalid_status: 'Selected status is not valid.',
  client_not_found: 'Selected client no longer exists. Please select another one.',
  duplicate_campaign: 'A campaign with this project already exists for this client.',
  save_failed: 'The campaign could not be saved. Please try again.',
}

export default async function NewCampaignPage({ searchParams }: NewCampaignPageProps) {
  const { error } = await searchParams
  let dbError = false
  let clients: Awaited<ReturnType<typeof prisma.client.findMany>> = []

  try {
    clients = await prisma.client.findMany({
      orderBy: { name: 'asc' },
    })
  } catch {
    dbError = true
  }

  const errorMessage = error ? ERROR_MESSAGES[error] ?? 'Unexpected error. Please try again.' : null
  const hasClients = clients.length > 0

  return (
    <>
      <Sidebar activeTab="campaigns" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-2xl mx-auto w-full">
          <div className="mb-12">
            <h2 className="font-display-lg text-display-lg text-primary mb-2">New Campaign</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Initialize a new marketing initiative for a client.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 border border-error bg-error-container text-on-error-container px-4 py-3 rounded" aria-live="polite">
              {errorMessage}
            </div>
          )}

          {dbError && (
            <DatabaseWarning message="Clients could not be loaded. Database connection is required to create campaigns." />
          )}

          {!hasClients && !dbError && (
            <div className="mb-6 border border-secondary-fixed-dim bg-secondary-fixed text-on-secondary-fixed-variant px-4 py-3 rounded">
              Add at least one client before creating a campaign.
            </div>
          )}

          <form
            action={createCampaign}
            className="space-y-8 border border-outline-variant bg-surface-container-lowest p-8 rounded-xl"
          >
            <div className="space-y-2">
              <label htmlFor="clientId" className="font-label-caps text-label-caps text-on-surface-variant block">
                CLIENT
              </label>
              <select
                id="clientId"
                name="clientId"
                required
                disabled={!hasClients}
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded disabled:opacity-60"
              >
                <option value="">{hasClients ? 'Select a client...' : 'No clients available'}</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="font-label-caps text-label-caps text-on-surface-variant block">
                CAMPAIGN NAME (internal)
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. Q4 Growth Strategy"
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="project" className="font-label-caps text-label-caps text-on-surface-variant block">
                PROJECT DESCRIPTION
              </label>
              <input
                type="text"
                id="project"
                name="project"
                required
                placeholder="e.g. Social Media Refresh"
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="spend" className="font-label-caps text-label-caps text-on-surface-variant block">
                  INITIAL BUDGET ($)
                </label>
                <input
                  type="number"
                  id="spend"
                  name="spend"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="status" className="font-label-caps text-label-caps text-on-surface-variant block">
                  STATUS
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
                >
                  <option value="Drafting">Drafting</option>
                  <option value="Running">Running</option>
                  <option value="Needs Review">Needs Review</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <SubmitButton
                idleLabel="CREATE CAMPAIGN"
                pendingLabel="CREATING..."
                disabled={!hasClients}
                className="flex-1 bg-primary text-on-primary py-4 font-bold hover:bg-on-surface-variant transition-colors rounded disabled:opacity-60 disabled:hover:bg-primary"
              />
              <Link
                href="/campaigns"
                className="px-8 py-4 border border-outline-variant hover:bg-surface-container transition-colors text-center rounded"
              >
                CANCEL
              </Link>
            </div>
          </form>
        </main>
      </div>
    </>
  )
}
