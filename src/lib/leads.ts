import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const DEFAULT_PIPELINE_KEY = 'default'

const DEFAULT_STAGES = [
  { name: 'Nuevo', order: 0, color: '#94a3b8', isWon: false, isLost: false },
  { name: 'Contactado', order: 1, color: '#60a5fa', isWon: false, isLost: false },
  { name: 'Propuesta', order: 2, color: '#a78bfa', isWon: false, isLost: false },
  { name: 'Negociación', order: 3, color: '#fbbf24', isWon: false, isLost: false },
  { name: 'Ganado', order: 4, color: '#34d399', isWon: true, isLost: false },
  { name: 'Perdido', order: 5, color: '#f87171', isWon: false, isLost: true },
] as const

function includeOrderedStages() {
  return { stages: { orderBy: { order: 'asc' as const } } }
}

async function loadCanonicalDefaultPipeline() {
  return prisma.pipeline.findFirst({
    where: { defaultKey: DEFAULT_PIPELINE_KEY },
    include: includeOrderedStages(),
  })
}

async function repairLegacyDefaultPipeline() {
  const legacyDefaults = await prisma.pipeline.findMany({
    where: { isDefault: true },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    include: includeOrderedStages(),
  })

  const chosenLegacy = legacyDefaults[0]
  if (!chosenLegacy) return null

  await prisma.$transaction([
    prisma.pipeline.updateMany({
      where: {
        isDefault: true,
        id: { not: chosenLegacy.id },
      },
      data: {
        isDefault: false,
        defaultKey: null,
      },
    }),
    prisma.pipeline.update({
      where: { id: chosenLegacy.id },
      data: {
        isDefault: true,
        defaultKey: DEFAULT_PIPELINE_KEY,
      },
    }),
  ])

  return prisma.pipeline.findFirst({
    where: { id: chosenLegacy.id },
    include: includeOrderedStages(),
  })
}

function isPrismaKnownError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError
}

async function createCanonicalDefaultPipeline() {
  try {
    return await prisma.pipeline.create({
      data: {
        name: 'Ventas',
        isDefault: true,
        defaultKey: DEFAULT_PIPELINE_KEY,
        stages: {
          create: DEFAULT_STAGES.map((stage) => ({ ...stage })),
        },
      },
      include: includeOrderedStages(),
    })
  } catch (error) {
    if (isPrismaKnownError(error) && error.code === 'P2002') {
      const existing = await loadCanonicalDefaultPipeline()
      if (existing) return existing
    }
    throw error
  }
}

async function ensureDefaultStages(pipelineId: string) {
  await prisma.pipelineStage.createMany({
    data: DEFAULT_STAGES.map((stage) => ({
      ...stage,
      pipelineId,
    })),
  })

  return prisma.pipeline.findFirstOrThrow({
    where: { id: pipelineId },
    include: includeOrderedStages(),
  })
}

export async function getDefaultPipeline() {
  let pipeline = await loadCanonicalDefaultPipeline()

  if (!pipeline) {
    pipeline = await repairLegacyDefaultPipeline()
  }

  if (!pipeline) {
    pipeline = await createCanonicalDefaultPipeline()
  }

  if (pipeline.stages.length === 0) {
    pipeline = await ensureDefaultStages(pipeline.id)
  }

  return pipeline
}

export async function getFirstStageId() {
  const pipeline = await getDefaultPipeline()
  const first = pipeline.stages[0]
  if (!first) {
    throw new Error('Pipeline has no stages')
  }
  return first.id
}

export async function isStageInDefaultPipeline(stageId: string) {
  const pipeline = await getDefaultPipeline()
  return pipeline.stages.some((s) => s.id === stageId)
}

export async function getLeadsGroupedByStage() {
  const pipeline = await getDefaultPipeline()
  const leads = await prisma.lead.findMany({
    include: { stage: true, client: true },
    orderBy: { updatedAt: 'desc' },
  })

  return pipeline.stages.map((stage) => ({
    stage,
    leads: leads.filter((lead) => lead.stageId === stage.id),
  }))
}

export async function getLeadWithStage(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      stage: { include: { pipeline: true } },
      client: true,
    },
  })
}

export async function getAllLeads() {
  return prisma.lead.findMany({
    include: { stage: true, client: true },
    orderBy: { updatedAt: 'desc' },
  })
}
