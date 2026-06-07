'use server'

import { randomUUID } from 'crypto'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  getDefaultPipeline,
  getFirstStageId,
  getLeadWithStage,
  isStageInDefaultPipeline,
} from '@/lib/leads'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const MIN_STAGES = 2

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : ''
}

function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError
}

function revalidateLeadPaths() {
  revalidatePath('/leads')
  revalidatePath('/leads/board')
  revalidatePath('/settings/pipeline')
}

export type PipelineStageInput = {
  id?: string
  name: string
  order: number
  color?: string | null
  isWon: boolean
  isLost: boolean
}

function parseOptionalFloat(raw: string): number | null {
  if (!raw) return null
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export async function createLead(formData: FormData) {
  const name = cleanText(formData.get('name'))
  const email = cleanText(formData.get('email'))
  const phone = cleanText(formData.get('phone'))
  const company = cleanText(formData.get('company'))
  const notes = cleanText(formData.get('notes'))
  const rawValue = cleanText(formData.get('value'))
  const stageIdInput = cleanText(formData.get('stageId'))

  if (!name) {
    redirect('/leads/new?error=missing_fields')
  }

  const value = parseOptionalFloat(rawValue)
  if (rawValue && value === null) {
    redirect('/leads/new?error=invalid_value')
  }

  let stageId: string
  try {
    if (stageIdInput) {
      const valid = await isStageInDefaultPipeline(stageIdInput)
      if (!valid) redirect('/leads/new?error=invalid_stage')
      stageId = stageIdInput
    } else {
      stageId = await getFirstStageId()
    }
  } catch {
    redirect('/leads/new?error=save_failed')
  }

  try {
    await prisma.$transaction([
      prisma.lead.create({
        data: {
          name,
          email: email || null,
          phone: phone || null,
          company: company || null,
          notes: notes || null,
          value,
          stageId,
        },
      }),
      prisma.activity.create({
        data: {
          user: 'E. Sterling',
          action: 'created new lead',
          target: name,
          type: 'info',
        },
      }),
    ])
  } catch {
    redirect('/leads/new?error=save_failed')
  }

  revalidateLeadPaths()
  redirect('/leads')
}

export async function updateLead(formData: FormData) {
  const id = cleanText(formData.get('id'))
  const name = cleanText(formData.get('name'))
  const email = cleanText(formData.get('email'))
  const phone = cleanText(formData.get('phone'))
  const company = cleanText(formData.get('company'))
  const notes = cleanText(formData.get('notes'))
  const rawValue = cleanText(formData.get('value'))
  const stageId = cleanText(formData.get('stageId'))

  if (!id || !name) {
    redirect(`/leads/${id || ''}?error=missing_fields`)
  }

  const value = parseOptionalFloat(rawValue)
  if (rawValue && value === null) {
    redirect(`/leads/${id}?error=invalid_value`)
  }

  if (stageId) {
    const valid = await isStageInDefaultPipeline(stageId)
    if (!valid) redirect(`/leads/${id}?error=invalid_stage`)
  }

  try {
    await prisma.lead.update({
      where: { id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        company: company || null,
        notes: notes || null,
        value,
        ...(stageId ? { stageId } : {}),
      },
    })
  } catch {
    redirect(`/leads/${id}?error=save_failed`)
  }

  revalidateLeadPaths()
  revalidatePath(`/leads/${id}`)
  redirect(`/leads/${id}?saved=1`)
}

export async function moveLeadToStage(leadId: string, stageId: string) {
  if (!leadId || !stageId) {
    return { ok: false as const, error: 'missing_fields' }
  }

  const valid = await isStageInDefaultPipeline(stageId)
  if (!valid) {
    return { ok: false as const, error: 'invalid_stage' }
  }

  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, name: true, stageId: true },
  })

  if (!lead) {
    return { ok: false as const, error: 'lead_not_found' }
  }

  if (lead.stageId === stageId) {
    return { ok: true as const }
  }

  const stage = await prisma.pipelineStage.findUnique({
    where: { id: stageId },
    select: { name: true },
  })

  try {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: leadId },
        data: { stageId },
      }),
      prisma.activity.create({
        data: {
          user: 'E. Sterling',
          action: 'moved lead to',
          target: `${lead.name} → ${stage?.name ?? 'stage'}`,
          type: 'info',
        },
      }),
    ])
  } catch {
    return { ok: false as const, error: 'save_failed' }
  }

  revalidateLeadPaths()
  revalidatePath(`/leads/${leadId}`)
  return { ok: true as const }
}

export async function convertLeadToClient(formData: FormData) {
  const leadId = cleanText(formData.get('leadId'))

  if (!leadId) {
    redirect('/leads?error=missing_fields')
  }

  const lead = await getLeadWithStage(leadId)
  if (!lead) {
    redirect('/leads?error=lead_not_found')
  }

  if (lead.clientId) {
    redirect(`/leads/${leadId}?error=already_converted`)
  }

  const clientName = lead.company || lead.name

  const existingClient = await prisma.client.findFirst({
    where: { name: { equals: clientName, mode: 'insensitive' } },
    select: { id: true },
  })

  if (existingClient) {
    redirect(`/leads/${leadId}?error=duplicate_client`)
  }

  const pipeline = await getDefaultPipeline()
  const wonStage = pipeline.stages.find((s) => s.isWon)
  const clientId = randomUUID()

  try {
    await prisma.$transaction([
      prisma.client.create({
        data: {
          id: clientId,
          name: clientName,
          industry: null,
        },
      }),
      prisma.lead.update({
        where: { id: leadId },
        data: {
          clientId,
          convertedAt: new Date(),
          ...(wonStage ? { stageId: wonStage.id } : {}),
        },
      }),
      prisma.activity.create({
        data: {
          user: 'E. Sterling',
          action: 'converted lead to client',
          target: clientName,
          type: 'success',
        },
      }),
    ])
  } catch (error) {
    if (isPrismaKnownError(error) && error.code === 'P2002') {
      redirect(`/leads/${leadId}?error=duplicate_client`)
    }
    redirect(`/leads/${leadId}?error=save_failed`)
  }

  revalidateLeadPaths()
  revalidatePath('/clients')
  revalidatePath(`/leads/${leadId}`)
  redirect(`/leads/${leadId}?converted=1`)
}

function validateStagesPayload(stages: PipelineStageInput[]): string | null {
  if (stages.length < MIN_STAGES) return 'min_stages'

  const wonCount = stages.filter((s) => s.isWon).length
  const lostCount = stages.filter((s) => s.isLost).length
  if (wonCount > 1 || lostCount > 1) return 'invalid_stage_flags'

  for (const s of stages) {
    if (!s.name.trim()) return 'missing_fields'
    if (s.isWon && s.isLost) return 'invalid_stage_flags'
  }

  const names = stages.map((s) => s.name.trim().toLowerCase())
  if (new Set(names).size !== names.length) return 'duplicate_stage_name'

  return null
}

function resolveStageId(id: string | undefined, idMap: Map<string, string>): string | null {
  if (!id) return null
  return idMap.get(id) ?? (id.startsWith('new-') ? null : id)
}

export async function updatePipelineStages(formData: FormData) {
  const rawPayload = cleanText(formData.get('stagesPayload'))
  const reassignmentsRaw = cleanText(formData.get('reassignments'))

  if (!rawPayload) {
    redirect('/settings/pipeline?error=missing_fields')
  }

  let stages: PipelineStageInput[]
  let reassignments: Record<string, string> = {}

  try {
    stages = JSON.parse(rawPayload) as PipelineStageInput[]
    if (reassignmentsRaw) {
      reassignments = JSON.parse(reassignmentsRaw) as Record<string, string>
    }
  } catch {
    redirect('/settings/pipeline?error=invalid_payload')
  }

  const validationError = validateStagesPayload(stages)
  if (validationError) {
    redirect(`/settings/pipeline?error=${validationError}`)
  }

  const pipeline = await getDefaultPipeline()
  const existingStageIds = new Set(pipeline.stages.map((s) => s.id))
  const keptIds = new Set(
    stages.map((s) => s.id).filter((id): id is string => Boolean(id && existingStageIds.has(id))),
  )
  const removedIds = [...existingStageIds].filter((id) => !keptIds.has(id))
  const incomingKeys = new Set(stages.map((s) => s.id).filter(Boolean) as string[])

  for (const removedId of removedIds) {
    const leadCount = await prisma.lead.count({ where: { stageId: removedId } })
    if (leadCount > 0) {
      const targetKey = reassignments[removedId]
      if (!targetKey || !incomingKeys.has(targetKey)) {
        redirect('/settings/pipeline?error=stage_has_leads')
      }
    }
  }

  try {
    const idMap = new Map<string, string>()
    const operations: Prisma.PrismaPromise<unknown>[] = []

    for (const stage of stages) {
      if (stage.id && existingStageIds.has(stage.id)) {
        const tempName = `${stage.name.trim()}_temp_${randomUUID().slice(0, 8)}`
        operations.push(
          prisma.pipelineStage.update({
            where: { id: stage.id },
            data: {
              name: tempName,
              order: stage.order,
              color: stage.color || null,
              isWon: stage.isWon,
              isLost: stage.isLost,
            },
          }),
        )
        idMap.set(stage.id, stage.id)
        continue
      }

      const resolvedId = randomUUID()
      const tempKey = stage.id ?? `new-${stage.order}`
      const tempName = `${stage.name.trim()}_temp_${randomUUID().slice(0, 8)}`
      operations.push(
        prisma.pipelineStage.create({
          data: {
            id: resolvedId,
            pipelineId: pipeline.id,
            name: tempName,
            order: stage.order,
            color: stage.color || null,
            isWon: stage.isWon,
            isLost: stage.isLost,
          },
        }),
      )
      idMap.set(tempKey, resolvedId)
      if (stage.id) idMap.set(stage.id, resolvedId)
    }

    for (const removedId of removedIds) {
      const targetKey = reassignments[removedId]
      const resolvedTarget = targetKey ? resolveStageId(targetKey, idMap) : null
      if (resolvedTarget) {
        operations.push(
          prisma.lead.updateMany({
            where: { stageId: removedId },
            data: { stageId: resolvedTarget },
          }),
        )
      }
      operations.push(prisma.pipelineStage.delete({ where: { id: removedId } }))
    }

    for (const stage of stages) {
      const dbId = stage.id ? idMap.get(stage.id) : null
      const resolvedId = dbId ?? idMap.get(`new-${stage.order}`)
      if (resolvedId) {
        operations.push(
          prisma.pipelineStage.update({
            where: { id: resolvedId },
            data: {
              name: stage.name.trim(),
            },
          }),
        )
      }
    }

    operations.push(
      prisma.activity.create({
        data: {
          user: 'E. Sterling',
          action: 'updated sales pipeline stages',
          target: pipeline.name,
          type: 'info',
        },
      }),
    )

    await prisma.$transaction(operations)
  } catch (error) {
    if (isPrismaKnownError(error)) {
      if (error.code === 'P2002') {
        redirect('/settings/pipeline?error=duplicate_stage_name')
      }
      if (error.code === 'P2003' || error.code === 'P2014') {
        redirect('/settings/pipeline?error=stage_has_leads')
      }
    }
    redirect('/settings/pipeline?error=save_failed')
  }

  revalidateLeadPaths()
  redirect('/settings/pipeline?saved=1')
}
