'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'
import { moveLeadToStage } from '@/app/leads/actions'

export type KanbanLead = {
  id: string
  name: string
  company: string | null
  email: string | null
  value: number | null
  stageId: string
}

export type KanbanStage = {
  id: string
  name: string
  color: string | null
  order: number
}

type LeadKanbanProps = {
  stages: KanbanStage[]
  leadsByStage: Record<string, KanbanLead[]>
  formatValue: (value: number) => string
}

function LeadCard({
  lead,
  formatValue,
  isDragging,
}: {
  lead: KanbanLead
  formatValue: (value: number) => string
  isDragging?: boolean
}) {
  return (
    <div
      className={[
        'block border border-outline-variant bg-surface p-3 rounded-lg shadow-sm',
        isDragging ? 'opacity-50' : 'hover:border-primary/40 transition-colors',
      ].join(' ')}
    >
      <Link href={`/leads/${lead.id}`} className="font-medium text-primary text-sm hover:underline">
        {lead.name}
      </Link>
      {(lead.company || lead.email) && (
        <p className="text-xs text-on-surface-variant mt-1 truncate">{lead.company || lead.email}</p>
      )}
      {lead.value != null && (
        <p className="text-xs text-primary mt-2 font-medium">{formatValue(lead.value)}</p>
      )}
    </div>
  )
}

function DraggableLead({
  lead,
  formatValue,
}: {
  lead: KanbanLead
  formatValue: (value: number) => string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead, stageId: lead.stageId },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="touch-none">
      <LeadCard lead={lead} formatValue={formatValue} isDragging={isDragging} />
    </div>
  )
}

function KanbanColumn({
  stage,
  leads,
  formatValue,
}: {
  stage: KanbanStage
  leads: KanbanLead[]
  formatValue: (value: number) => string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id })

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col min-w-[260px] max-w-[280px] shrink-0 rounded-xl border border-outline-variant bg-surface-container-low',
        isOver ? 'ring-2 ring-primary ring-offset-1' : '',
      ].join(' ')}
    >
      <div
        className="px-4 py-3 border-b border-outline-variant flex items-center justify-between gap-2"
        style={stage.color ? { borderTopColor: stage.color, borderTopWidth: 3 } : undefined}
      >
        <h3 className="font-label-caps text-label-caps text-on-surface font-semibold truncate">{stage.name}</h3>
        <span className="text-xs text-on-surface-variant bg-surface px-2 py-0.5 rounded-full">{leads.length}</span>
      </div>
      <div className="flex flex-col gap-2 p-3 min-h-[120px] max-h-[calc(100vh-280px)] overflow-y-auto">
        {leads.map((lead) => (
          <DraggableLead key={lead.id} lead={lead} formatValue={formatValue} />
        ))}
      </div>
    </div>
  )
}

export default function LeadKanban({ stages, leadsByStage, formatValue }: LeadKanbanProps) {
  const router = useRouter()
  const [activeLead, setActiveLead] = useState<KanbanLead | null>(null)
  const [isMoving, setIsMoving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const lead = event.active.data.current?.lead as KanbanLead | undefined
    if (lead) setActiveLead(lead)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveLead(null)
      const { active, over } = event
      if (!over || active.id === over.id) return

      const lead = active.data.current?.lead as KanbanLead | undefined
      if (!lead) return

      const stageIds = new Set(stages.map((s) => s.id))
      let targetStageId: string | undefined

      if (stageIds.has(String(over.id))) {
        targetStageId = String(over.id)
      } else {
        for (const stage of stages) {
          const columnLeads = leadsByStage[stage.id] ?? []
          if (columnLeads.some((l) => l.id === over.id)) {
            targetStageId = stage.id
            break
          }
        }
      }

      if (!targetStageId || lead.stageId === targetStageId) return

      setIsMoving(true)
      const result = await moveLeadToStage(lead.id, targetStageId)
      setIsMoving(false)

      if (result.ok) {
        router.refresh()
      }
    },
    [router, stages, leadsByStage],
  )

  return (
    <div className="relative">
      {isMoving && (
        <div className="absolute inset-0 z-10 bg-surface/40 flex items-center justify-center rounded-xl" aria-hidden>
          <span className="text-sm text-on-surface-variant">Actualizando...</span>
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] ?? []}
              formatValue={formatValue}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <LeadCard lead={activeLead} formatValue={formatValue} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
