import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const DEFAULT_STAGES = [
  { name: 'Nuevo', order: 0, color: '#94a3b8', isWon: false, isLost: false },
  { name: 'Contactado', order: 1, color: '#60a5fa', isWon: false, isLost: false },
  { name: 'Propuesta', order: 2, color: '#a78bfa', isWon: false, isLost: false },
  { name: 'Negociación', order: 3, color: '#fbbf24', isWon: false, isLost: false },
  { name: 'Ganado', order: 4, color: '#34d399', isWon: true, isLost: false },
  { name: 'Perdido', order: 5, color: '#f87171', isWon: false, isLost: true },
] as const

const DEFAULT_PIPELINE_KEY = 'default'

async function ensureDefaultPipeline() {
  let pipeline = await prisma.pipeline.findFirst({
    where: { defaultKey: DEFAULT_PIPELINE_KEY },
    include: { stages: { orderBy: { order: 'asc' } } },
  })

  if (!pipeline) {
    const legacyDefaults = await prisma.pipeline.findMany({
      where: { isDefault: true },
      orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      include: { stages: { orderBy: { order: 'asc' } } },
    })

    const chosenLegacy = legacyDefaults[0]
    if (chosenLegacy) {
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

      pipeline = await prisma.pipeline.findFirst({
        where: { id: chosenLegacy.id },
        include: { stages: { orderBy: { order: 'asc' } } },
      })
    }
  }

  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        name: 'Ventas',
        isDefault: true,
        defaultKey: DEFAULT_PIPELINE_KEY,
        stages: {
          create: DEFAULT_STAGES.map((s) => ({ ...s })),
        },
      },
      include: { stages: { orderBy: { order: 'asc' } } },
    })
  } else if (pipeline.stages.length === 0) {
    await prisma.pipelineStage.createMany({
      data: DEFAULT_STAGES.map((s) => ({
        ...s,
        pipelineId: pipeline!.id,
      })),
    })
    pipeline = await prisma.pipeline.findFirstOrThrow({
      where: { id: pipeline.id },
      include: { stages: { orderBy: { order: 'asc' } } },
    })
  }

  return pipeline
}

async function main() {
  const client1 = await prisma.client.upsert({
    where: { id: 'aura' },
    update: {},
    create: {
      id: 'aura',
      name: 'Aura Botanicals',
      industry: 'Cosmetics',
    },
  })

  const client2 = await prisma.client.upsert({
    where: { id: 'lumina' },
    update: {},
    create: {
      id: 'lumina',
      name: 'Lumina EV',
      industry: 'Automotive',
    },
  })

  const client3 = await prisma.client.upsert({
    where: { id: 'vanguard' },
    update: {},
    create: {
      id: 'vanguard',
      name: 'Vanguard Interiors',
      industry: 'Interior Design',
    },
  })

  const existingCampaigns = await prisma.campaign.count()
  if (existingCampaigns === 0) {
    await prisma.campaign.createMany({
      data: [
        {
          name: 'Aura Botanicals',
          project: 'Q3 Brand Refresh',
          status: 'Running',
          spend: 45200,
          roas: 3.2,
          clientId: client1.id,
        },
        {
          name: 'Lumina EV',
          project: 'Market Launch',
          status: 'Drafting',
          spend: 12000,
          roas: 0,
          clientId: client2.id,
        },
        {
          name: 'Vanguard Interiors',
          project: 'Holiday Promo',
          status: 'Needs Review',
          spend: 8450,
          roas: 1.8,
          clientId: client3.id,
        },
      ],
    })
  }

  const existingActivities = await prisma.activity.count()
  if (existingActivities === 0) {
    await prisma.activity.createMany({
      data: [
        {
          user: 'Sarah Jenkins',
          action: 'uploaded new assets for',
          target: 'Aura Botanicals',
          type: 'info',
        },
        {
          user: 'Client',
          action: 'requested revisions on',
          target: 'Vanguard Interiors copy',
          type: 'alert',
        },
        {
          user: 'David Chen',
          action: 'approved budget increase for',
          target: 'Lumina EV',
          type: 'success',
        },
      ],
    })
  }

  const pipeline = await ensureDefaultPipeline()
  const stageByName = Object.fromEntries(pipeline.stages.map((s) => [s.name, s.id]))

  const existingLeads = await prisma.lead.count()
  if (existingLeads === 0) {
    await prisma.lead.createMany({
      data: [
        {
          name: 'María López',
          email: 'maria@techstart.io',
          company: 'TechStart',
          value: 15000,
          stageId: stageByName['Nuevo'],
        },
        {
          name: 'James Chen',
          email: 'j.chen@retailco.com',
          company: 'RetailCo',
          value: 28000,
          stageId: stageByName['Propuesta'],
        },
        {
          name: 'Sofia Martínez',
          email: 'sofia@greenleaf.mx',
          company: 'GreenLeaf',
          value: 42000,
          stageId: stageByName['Negociación'],
        },
        {
          name: 'Alex Rivera',
          email: 'alex@nomatch.com',
          value: 8000,
          stageId: stageByName['Perdido'],
        },
        {
          name: 'Elena Park',
          email: 'elena@wondeal.com',
          company: 'WonDeal Inc',
          value: 55000,
          stageId: stageByName['Ganado'],
        },
      ],
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
