import { useCallback, useEffect, useState } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Alert from '../../components/Alert'
import Dropzone from '../../components/Dropzone'
import FileCard from '../../components/FileCard'
import { downloadBytes } from '../../lib/download'
import { mergeFilename } from '../../lib/filenames'
import {
  closePdfDocument,
  getPdfPageCount,
  isPasswordError,
  loadPdfDocument,
  renderPageThumbnail,
} from '../../lib/pdf-render'
import { mergePdfs } from '../../lib/pdf-engine'
import { noticeForFile, type UserNotice } from '../../lib/notices'

// Cola de unión (entidad MergeQueue del data-model).
interface QueueItem {
  id: string
  name: string
  sizeBytes: number
  bytes: Uint8Array
  pageCount: number | null
  thumbnailUrl: string | null
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function SortableFileCard({
  item,
  position,
  onRemove,
}: {
  item: QueueItem
  position: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  return (
    <FileCard
      doc={item}
      position={position}
      dragHandleProps={{ ...attributes, ...listeners }}
      containerRef={setNodeRef}
      dragStyle={{ transform: CSS.Transform.toString(transform), transition }}
      isDragging={isDragging}
      loadingThumbnail={item.thumbnailUrl === null}
      onRemove={onRemove}
    />
  )
}

// Vista Unir PDF (FR-010/FR-012): zona de carga, cola reordenable por
// arrastrar, añadir más, quitar y botón "Unir PDF" (mínimo 2 archivos).
// El progreso con barra, la cancelación y la pantalla de éxito llegan en T026.
export default function MergePage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [notice, setNotice] = useState<UserNotice | null>(null)
  const [merging, setMerging] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Libera miniaturas al desmontar (constitución IV).
  useEffect(() => {
    return () => {
      setItems((current) => {
        for (const item of current) {
          if (item.thumbnailUrl) URL.revokeObjectURL(item.thumbnailUrl)
        }
        return current
      })
    }
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id)
      if (target?.thumbnailUrl) URL.revokeObjectURL(target.thumbnailUrl)
      return current.filter((item) => item.id !== id)
    })
  }, [])

  const handleFiles = useCallback(async (files: File[]) => {
    for (const file of files) {
      const rejected = noticeForFile(file.name, '.pdf')
      if (rejected) {
        setNotice(rejected)
        continue
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      try {
        const doc = await loadPdfDocument(bytes)
        const pageCount = getPdfPageCount(doc)
        const thumbnailUrl = await renderPageThumbnail(doc, 1)
        await closePdfDocument(doc)
        setItems((current) => [
          ...current,
          { id: newId(), name: file.name, sizeBytes: file.size, bytes, pageCount, thumbnailUrl },
        ])
      } catch (error) {
        setNotice(
          isPasswordError(error)
            ? { kind: 'password', detail: file.name }
            : { kind: 'invalid-format', detail: `${file.name} no se pudo leer como PDF.` },
        )
      }
    }
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setItems((current) => {
      const from = current.findIndex((item) => item.id === active.id)
      const to = current.findIndex((item) => item.id === over.id)
      return arrayMove(current, from, to)
    })
  }, [])

  const handleMerge = useCallback(async () => {
    if (items.length < 2 || merging) return
    setMerging(true)
    setNotice(null)
    try {
      const out = await mergePdfs(
        items.map((item) => item.bytes),
        (done, total) => setProgress({ done, total }),
      )
      downloadBytes(out, 'application/pdf', mergeFilename(items[0].name))
    } catch (error) {
      setNotice(
        isPasswordError(error)
          ? { kind: 'password' }
          : { kind: 'invalid-format', detail: 'No se pudo completar la unión.' },
      )
    } finally {
      setMerging(false)
      setProgress(null)
    }
  }, [items, merging])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Unir PDF</h1>
        <p className="mt-1 text-gray-600">
          1. Elige tus PDF · 2. Ordénalos arrastrando · 3. Pulsa «Unir PDF»
        </p>
      </div>

      <Alert notice={notice} onClose={() => setNotice(null)} />

      <Dropzone accept=".pdf" onFiles={handleFiles} onReject={setNotice} />

      {items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <ol className="flex flex-col gap-3">
              {items.map((item, index) => (
                <li key={item.id}>
                  <SortableFileCard item={item} position={index + 1} onRemove={() => removeItem(item.id)} />
                </li>
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex flex-col items-stretch gap-2">
        <button
          type="button"
          onClick={handleMerge}
          disabled={items.length < 2 || merging}
          className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {merging && progress
            ? `Uniendo ${progress.done} de ${progress.total}…`
            : 'Unir PDF'}
        </button>
        {items.length < 2 && !merging && (
          <p className="text-center text-sm text-gray-500">Añade al menos 2 archivos PDF para unirlos.</p>
        )}
      </div>
    </div>
  )
}
