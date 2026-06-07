'use server'

import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const CAMPAIGN_STATUSES = ['Drafting', 'Running', 'Needs Review'] as const
const SUPPORTED_CURRENCIES = new Set(['USD', 'MXN', 'EUR'])

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError
}

export async function createCampaign(formData: FormData) {
  const name = cleanText(formData.get('name'))
  const project = cleanText(formData.get('project'))
  const clientId = cleanText(formData.get('clientId'))
  const status = cleanText(formData.get('status'))
  const rawSpend = cleanText(formData.get('spend'))
  const spend = Number.parseFloat(rawSpend)

  if (!name || !project || !clientId) {
    redirect('/campaigns/new?error=missing_fields')
  }

  if (!Number.isFinite(spend) || spend < 0) {
    redirect('/campaigns/new?error=invalid_spend')
  }

  if (!CAMPAIGN_STATUSES.includes(status as (typeof CAMPAIGN_STATUSES)[number])) {
    redirect('/campaigns/new?error=invalid_status')
  }

  let clientExists = false
  let duplicateCampaign = false

  try {
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    })
    clientExists = Boolean(client)

    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        clientId,
        project: {
          equals: project,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    })
    duplicateCampaign = Boolean(existingCampaign)
  } catch {
    redirect('/campaigns/new?error=save_failed')
  }

  if (!clientExists) {
    redirect('/campaigns/new?error=client_not_found')
  }

  if (duplicateCampaign) {
    redirect('/campaigns/new?error=duplicate_campaign')
  }

  try {
    await prisma.$transaction([
      prisma.campaign.create({
        data: {
          name,
          project,
          clientId,
          spend,
          status,
          roas: 0,
        },
      }),
      prisma.activity.create({
        data: {
          user: 'E. Sterling',
          action: 'created new campaign',
          target: project,
          type: 'info',
        },
      }),
    ])
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === 'P2003') {
        redirect('/campaigns/new?error=client_not_found')
      }

      if (error.code === 'P2002') {
        redirect('/campaigns/new?error=duplicate_campaign')
      }
    }

    redirect('/campaigns/new?error=save_failed')
  }

  revalidatePath('/')
  revalidatePath('/campaigns')
  redirect('/campaigns')
}

export async function createClient(formData: FormData) {
  const name = cleanText(formData.get('name'))
  const industry = cleanText(formData.get('industry'))

  if (!name) {
    redirect('/clients/new?error=missing_name')
  }

  let duplicateClient = false

  try {
    const existingClient = await prisma.client.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
      select: { id: true },
    })
    duplicateClient = Boolean(existingClient)
  } catch {
    redirect('/clients/new?error=save_failed')
  }

  if (duplicateClient) {
    redirect('/clients/new?error=duplicate_client')
  }

  try {
    await prisma.$transaction([
      prisma.client.create({
        data: {
          name,
          industry: industry || null,
        },
      }),
      prisma.activity.create({
        data: {
          user: 'E. Sterling',
          action: 'added new client',
          target: name,
          type: 'success',
        },
      }),
    ])
  } catch (error) {
    if (isPrismaKnownError(error) && error.code === 'P2002') {
      redirect('/clients/new?error=duplicate_client')
    }

    redirect('/clients/new?error=save_failed')
  }

  revalidatePath('/')
  revalidatePath('/clients')
  redirect('/clients')
}

export async function saveAgencySettings(formData: FormData) {
  const companyName = cleanText(formData.get('companyName'))
  const website = cleanText(formData.get('website'))
  const currency = cleanText(formData.get('currency')).toUpperCase()

  if (!companyName) {
    redirect('/settings?error=missing_company_name')
  }

  if (!currency) {
    redirect('/settings?error=missing_currency')
  }

  if (!SUPPORTED_CURRENCIES.has(currency)) {
    redirect('/settings?error=invalid_currency')
  }

  if (website) {
    try {
      new URL(website)
    } catch {
      redirect('/settings?error=invalid_website')
    }
  }

  try {
    const existingSettings = await prisma.agencySettings.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (existingSettings) {
      await prisma.agencySettings.update({
        where: { id: existingSettings.id },
        data: {
          companyName,
          website: website || null,
          currency,
        },
      })
    } else {
      await prisma.agencySettings.create({
        data: {
          companyName,
          website: website || null,
          currency,
        },
      })
    }
  } catch {
    redirect('/settings?error=save_failed')
  }

  revalidatePath('/settings')
  redirect('/settings?saved=1')
}

