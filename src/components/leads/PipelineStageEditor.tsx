'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { updatePipelineStages } from '@/app/leads/actions'
import SubmitButton from '@/components/SubmitButton'

export type EditorStage = {
  key: string
  id?: string
  name: string
  order: number
  color: string
  isWon: boolean
  isLost: boolean
  leadCount: number
}

type PipelineStageEditorProps = {
  initialStages: EditorStage[]
}

function SortableStageRow({
  stage,
  onUpdate,
  onRemove,
}: {
  stage: EditorStage
  onUpdate: (key: string, patch: Partial<EditorStage>) => void
  onRemove: (key: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.key,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const needsReassign = stage.leadCount > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-outline-variant bg-surface p-4 rounded-lg space-y-3"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-2 text-on-surface-variant cursor-grab active:cursor-grabbing touch-none"
          aria-label="Reordenar etapa"
          {...attributes}
          {...listeners}
        >
          <span className="material-symbols-outlined">drag_indicator</span>
        </button>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1 text-xs">
              NOMBRE
            </label>
            <input
              type="text"
              value={stage.name}
              onChange={(e) => onUpdate(stage.key, { name: e.target.value })}
              className="w-full border border-outline-variant bg-surface-container-lowest p-2 text-sm rounded"
              required
            />
          </div>
          <div>
            <label className="font-label-caps text-label-caps text-on-surface-variant block mb-1 text-xs">
              COLOR
            </label>
            <input
              type="color"
              value={stage.color || '#94a3b8'}
              onChange={(e) => onUpdate(stage.key, { color: e.target.value })}
              className="w-full h-10 border border-outline-variant rounded cursor-pointer"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(stage.key)}
          className="text-error hover:opacity-80 p-1"
          aria-label="Eliminar etapa"
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-4 pl-9">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={stage.isWon}
            onChange={(e) =>
              onUpdate(stage.key, {
                isWon: e.target.checked,
                isLost: e.target.checked ? false : stage.isLost,
              })
            }
          />
          Etapa ganada
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={stage.isLost}
            onChange={(e) =>
              onUpdate(stage.key, {
                isLost: e.target.checked,
                isWon: e.target.checked ? false : stage.isWon,
              })
            }
          />
          Etapa perdida
        </label>
        {stage.leadCount > 0 && (
          <span className="text-xs text-on-surface-variant">
            {stage.leadCount} lead{stage.leadCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {needsReassign && (
        <p className="text-xs text-on-surface-variant pl-9">
          Esta etapa tiene leads. Reasígnalos antes de eliminar.
        </p>
      )}
    </div>
  )
}

export default function PipelineStageEditor({ initialStages }: PipelineStageEditorProps) {
  const [stages, setStages] = useState<EditorStage[]>(initialStages)
  const [pendingRemove, setPendingRemove] = useState<{
    key: string
    stage: EditorStage
  } | null>(null)
  const [reassignments, setReassignments] = useState<Record<string, string>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const stageKeys = useMemo(() => stages.map((s) => s.key), [stages])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    setStages((items) => {
      const oldIndex = items.findIndex((s) => s.key === active.id)
      const newIndex = items.findIndex((s) => s.key === over.id)
      const reordered = arrayMove(items, oldIndex, newIndex)
      return reordered.map((s, i) => ({ ...s, order: i }))
    })
  }, [])

  const updateStage = (key: string, patch: Partial<EditorStage>) => {
    setStages((prev) =>
      prev.map((s) => {
        if (s.key !== key) {
          if (patch.isWon) return { ...s, isWon: false }
          if (patch.isLost) return { ...s, isLost: false }
          return s
        }
        return { ...s, ...patch }
      }),
    )
  }

  const addStage = () => {
    const key = `new-${Date.now()}`
    setStages((prev) => [
      ...prev,
      {
        key,
        name: 'Nueva etapa',
        order: prev.length,
        color: '#94a3b8',
        isWon: false,
        isLost: false,
        leadCount: 0,
      },
    ])
  }

  const requestRemove = (key: string) => {
    const stage = stages.find((s) => s.key === key)
    if (!stage) return

    if (stage.leadCount > 0) {
      setPendingRemove({ key, stage })
      return
    }

    setStages((prev) => prev.filter((s) => s.key !== key).map((s, i) => ({ ...s, order: i })))
  }

  const confirmRemove = () => {
    if (!pendingRemove) return
    const targetKey = reassignments[pendingRemove.key]
    const others = stages.filter((s) => s.key !== pendingRemove.key)
    if (!targetKey || !others.some((s) => s.key === targetKey)) return

    const targetStage = others.find((s) => s.key === targetKey)
    const targetForServer = targetStage?.id ?? targetKey

    if (pendingRemove.stage.id) {
      setReassignments((prev) => ({
        ...prev,
        [pendingRemove.stage.id!]: targetForServer,
      }))
    }

    setStages(others.map((s, i) => ({ ...s, order: i })))
    setPendingRemove(null)
  }

  const buildPayload = () => {
    const payload = stages.map((s, i) => ({
      id: s.id ?? s.key,
      name: s.name,
      order: i,
      color: s.color || null,
      isWon: s.isWon,
      isLost: s.isLost,
    }))

    return { payload, reassignForServer: reassignments }
  }

  return (
    <>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stageKeys} strategy={verticalListSortingStrategy}>
          <div className="space-y-3 mb-6">
            {stages.map((stage) => (
              <SortableStageRow
                key={stage.key}
                stage={stage}
                onUpdate={updateStage}
                onRemove={requestRemove}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <button
        type="button"
        onClick={addStage}
        className="w-full border border-dashed border-outline-variant py-3 rounded-lg text-sm text-on-surface-variant hover:bg-surface-container transition-colors mb-8"
      >
        + Añadir etapa
      </button>

      {pendingRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reassign-title"
        >
          <div className="bg-surface border border-outline-variant rounded-xl p-6 max-w-md w-full shadow-lg">
            <h3 id="reassign-title" className="font-headline-lg text-headline-lg text-primary mb-2">
              Reasignar leads
            </h3>
            <p className="text-sm text-on-surface-variant mb-4">
              La etapa &quot;{pendingRemove.stage.name}&quot; tiene {pendingRemove.stage.leadCount}{' '}
              lead(s). Elige a qué etapa moverlos antes de eliminarla.
            </p>
            <select
              className="w-full border border-outline-variant p-3 rounded mb-4"
              value={reassignments[pendingRemove.key] ?? ''}
              onChange={(e) =>
                setReassignments((prev) => ({ ...prev, [pendingRemove.key]: e.target.value }))
              }
            >
              <option value="">Seleccionar etapa...</option>
              {stages
                .filter((s) => s.key !== pendingRemove.key)
                .map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.name}
                  </option>
                ))}
            </select>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={confirmRemove}
                disabled={!reassignments[pendingRemove.key]}
                className="flex-1 bg-primary text-on-primary py-2 rounded disabled:opacity-50"
              >
                Reasignar y eliminar
              </button>
              <button
                type="button"
                onClick={() => setPendingRemove(null)}
                className="px-4 py-2 border border-outline-variant rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        action={updatePipelineStages}
        onSubmit={(e) => {
          if (stages.length < 2) {
            e.preventDefault()
            alert('Debe haber al menos 2 etapas en el pipeline.')
            return
          }
          const { payload, reassignForServer } = buildPayload()
          const form = e.currentTarget
          const payloadInput = form.elements.namedItem('stagesPayload') as HTMLInputElement
          const reassignInput = form.elements.namedItem('reassignments') as HTMLInputElement
          payloadInput.value = JSON.stringify(payload)
          reassignInput.value = JSON.stringify(reassignForServer)
        }}
      >
        <input type="hidden" name="stagesPayload" defaultValue="" />
        <input type="hidden" name="reassignments" defaultValue="{}" />
        <SubmitButton
          idleLabel="GUARDAR PIPELINE"
          pendingLabel="GUARDANDO..."
          className="w-full bg-primary text-on-primary py-4 font-bold hover:bg-on-surface-variant transition-colors rounded"
        />
      </form>
    </>
  )
}
