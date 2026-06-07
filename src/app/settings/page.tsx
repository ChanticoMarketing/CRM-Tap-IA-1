import React from 'react'
import Sidebar from '@/components/Sidebar'
import { prisma } from '@/lib/prisma'
import { saveAgencySettings } from '@/app/actions'
import DatabaseWarning from '@/components/DatabaseWarning'
import SubmitButton from '@/components/SubmitButton'

export const dynamic = 'force-dynamic'

type SettingsPageProps = {
  searchParams: Promise<{
    error?: string
    saved?: string
  }>
}

const ERROR_MESSAGES: Record<string, string> = {
  missing_company_name: 'Company name is required.',
  missing_currency: 'Currency is required.',
  invalid_currency: 'The selected currency is not supported.',
  invalid_website: 'Website must be a valid URL, for example https://example.com.',
  save_failed: 'Settings could not be saved. Please try again.',
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const { error, saved } = await searchParams
  let dbError = false
  let settings: Awaited<ReturnType<typeof prisma.agencySettings.findFirst>> = null

  try {
    settings = await prisma.agencySettings.findFirst({
      orderBy: { createdAt: 'asc' },
    })
  } catch {
    dbError = true
  }

  const errorMessage = error ? ERROR_MESSAGES[error] ?? 'Unexpected error. Please try again.' : null
  const successMessage = saved === '1' ? 'Settings saved successfully.' : null

  return (
    <>
      <Sidebar activeTab="settings" />

      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:py-12 max-w-2xl mx-auto w-full">
          <div className="mb-12">
            <h2 className="font-display-lg text-display-lg text-primary mb-2">Agency Settings</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Update basic agency information used by the CRM.
            </p>
          </div>

          {dbError && (
            <DatabaseWarning message="Settings were loaded with fallback values. Database is not reachable right now." />
          )}

          {errorMessage && (
            <div className="mb-6 border border-error bg-error-container text-on-error-container px-4 py-3 rounded" aria-live="polite">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-6 border border-tertiary-fixed-dim bg-tertiary-fixed text-on-tertiary-fixed-variant px-4 py-3 rounded" aria-live="polite">
              {successMessage}
            </div>
          )}

          <form
            action={saveAgencySettings}
            className="space-y-8 border border-outline-variant bg-surface-container-lowest p-8 rounded-xl"
          >
            <div className="space-y-2">
              <label htmlFor="companyName" className="font-label-caps text-label-caps text-on-surface-variant block">
                AGENCY NAME
              </label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                defaultValue={settings?.companyName ?? 'Avenue CRM'}
                required
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="website" className="font-label-caps text-label-caps text-on-surface-variant block">
                WEBSITE
              </label>
              <input
                type="url"
                id="website"
                name="website"
                defaultValue={settings?.website ?? ''}
                placeholder="https://example.com"
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="currency" className="font-label-caps text-label-caps text-on-surface-variant block">
                CURRENCY
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={settings?.currency ?? 'USD'}
                className="w-full border border-outline-variant bg-surface p-3 font-body-md focus:outline-primary rounded"
              >
                <option value="USD">USD</option>
                <option value="MXN">MXN</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="pt-4">
              <SubmitButton
                idleLabel="SAVE SETTINGS"
                pendingLabel="SAVING..."
                className="w-full bg-primary text-on-primary py-4 font-bold hover:bg-on-surface-variant transition-colors rounded"
              />
            </div>
          </form>

          <div className="mt-8 border border-outline-variant bg-surface-container p-6 rounded-xl">
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">SALES PIPELINE</p>
            <p className="text-sm text-on-surface-variant mb-4">
              Configura las etapas del embudo de leads (nuevo, contactado, ganado, etc.).
            </p>
            <a
              href="/settings/pipeline"
              className="inline-flex items-center gap-2 text-primary font-medium hover:underline text-sm"
            >
              Editar pipeline
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </a>
          </div>

          <div className="mt-8 border border-outline-variant bg-surface-container p-6 rounded-xl">
            <p className="font-label-caps text-label-caps text-on-surface-variant mb-3">PROFILE (READ ONLY)</p>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <p>Director: E. Sterling</p>
              <p>Role: DIRECTOR</p>
              <p>Email: sterling@avenue.agency</p>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
