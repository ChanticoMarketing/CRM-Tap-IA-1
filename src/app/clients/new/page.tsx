import React from 'react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import { createClient } from '@/app/actions'
import SubmitButton from '@/components/SubmitButton'

type NewClientPageProps = {
  searchParams: Promise<{
    error?: string
  }>
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_name: 'Client name is required.',
  duplicate_client: 'A client with this name already exists.',
  save_failed: 'The client could not be saved. Please try again.',
}

export default async function NewClientPage({ searchParams }: NewClientPageProps) {
  const { error } = await searchParams
  const errorMessage = error ? ERROR_MESSAGES[error] ?? 'Unexpected error. Please try again.' : null

  return (
    <>
      <Sidebar activeTab="clients" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-2xl mx-auto w-full">
          <div className="mb-12">
            <h2 className="font-display-lg text-display-lg text-primary mb-2">New Client</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Register a new client relationship in Avenue CRM.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 border border-error bg-error-container text-on-error-container px-4 py-3 rounded" aria-live="polite">
              {errorMessage}
            </div>
          )}

          <form
            action={createClient}
            className="space-y-8 border border-outline-variant bg-surface-container-lowest p-8 rounded-xl"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="font-label-caps text-label-caps text-on-surface-variant block">
                CLIENT NAME
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                placeholder="e.g. Acme Corporation"
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="industry" className="font-label-caps text-label-caps text-on-surface-variant block">
                INDUSTRY / SECTOR
              </label>
              <select
                id="industry"
                name="industry"
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              >
                <option value="">Select an industry...</option>
                <option value="Cosmetics">Cosmetics</option>
                <option value="Automotive">Automotive</option>
                <option value="Interior Design">Interior Design</option>
                <option value="Retail">Retail</option>
                <option value="Technology">Technology</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="pt-4 flex gap-4">
              <SubmitButton
                idleLabel="CREATE CLIENT"
                pendingLabel="CREATING..."
                className="flex-1 bg-primary text-on-primary py-4 font-bold hover:bg-on-surface-variant transition-colors rounded"
              />
              <Link
                href="/clients"
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
