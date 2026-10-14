import { useCallback, useEffect, useRef, useState } from 'react'
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
import ProgressBar from '../../components/ProgressBar'
import SuccessScreen from '../../components/SuccessScreen'
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

// Vista Unir PDF: 1) carga con validación y miniaturas, 2) cola reordenable,
// 3) procesado cancelable con progreso y pantalla de éxito con reset total.
export default function MergePage() {
  const [items, setItems] = useState<QueueItem[]>([])
  const [notice, setNotice] = useState<UserNotice | null>(null)
  const [phase, setPhase] = useState<'config' | 'working' | 'done'>('config')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [result, setResult] = useState<{ bytes: Uint8Array; filename: string } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  // Generación de carga: invalida miniaturas en vuelo si se resetea o se
  // desmonta antes de que terminen (evita ObjectURLs huérfanas, FR-026).
  const loadRef = useRef(0)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // Libera miniaturas al desmontar (constitución IV).
  useEffect(() => {
    return () => {
      loadRef.current += 1
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
    const loadId = loadRef.current
    for (const file of files) {
      const rejected = noticeForFile(file.name, '.pdf')
      if (rejected) {
        setNotice(rejected)
        continue
      }
      const bytes = new Uint8Array(await file.arrayBuffer())
      try {
        const doc = await loadPdfDocument(bytes)
        if (loadRef.current !== loadId) {
          await closePdfDocument(doc)
          return
        }
        const pageCount = getPdfPageCount(doc)
        const thumbnailUrl = await renderPageThumbnail(doc, 1)
        await closePdfDocument(doc)
        if (loadRef.current !== loadId) {
          URL.revokeObjectURL(thumbnailUrl)
          return
        }
        setItems((current) => [
          ...current,
          { id: newId(), name: file.name, sizeBytes: file.size, bytes, pageCount, thumbnailUrl },
        ])
      } catch (error) {
        if (loadRef.current !== loadId) return
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
    if (items.length < 2 || phase !== 'config') return
    const controller = new AbortController()
    abortRef.current = controller
    setPhase('working')
    setNotice(null)
    setProgress({ done: 0, total: items.length })
    try {
      const out = await mergePdfs(
        items.map((item) => item.bytes),
        (done, total) => setProgress({ done, total }),
        controller.signal,
      )
      setResult({ bytes: out, filename: mergeFilename(items[0].name) })
      setPhase('done')
    } catch (error) {
      if (controller.signal.aborted) {
        // Cancelado por el usuario: vuelta a la configuración sin aviso (FR-030).
        setPhase('config')
      } else {
        setNotice(
          isPasswordError(error)
            ? { kind: 'password' }
            : { kind: 'invalid-format', detail: 'No se pudo completar la unión.' },
        )
        setPhase('config')
      }
    } finally {
      setProgress(null)
      abortRef.current = null
    }
  }, [items, phase])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const handleDownload = useCallback(() => {
    if (result) downloadBytes(result.bytes, 'application/pdf', result.filename)
  }, [result])

  // "Empezar de nuevo": limpia cola, miniaturas, resultado y avisos (FR-024/FR-026).
  const handleReset = useCallback(() => {
    loadRef.current += 1
    setItems((current) => {
      for (const item of current) {
        if (item.thumbnailUrl) URL.revokeObjectURL(item.thumbnailUrl)
      }
      return []
    })
    setResult(null)
    setNotice(null)
    setProgress(null)
    setPhase('config')
  }, [])

  if (phase === 'done' && result) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Unir PDF</h1>
        </div>
        <SuccessScreen filename={result.filename} onDownload={handleDownload} onReset={handleReset} />
      </div>
    )
  }

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

      {phase === 'working' && progress && (
        <ProgressBar
          value={(progress.done / progress.total) * 100}
          label={`Uniendo ${progress.done} de ${progress.total}`}
          onCancel={handleCancel}
        />
      )}

      <div className="flex flex-col items-stretch gap-2">
        <button
          type="button"
          onClick={handleMerge}
          disabled={items.length < 2 || phase !== 'config'}
          className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {phase === 'working' ? 'Uniendo…' : 'Unir PDF'}
        </button>
        {items.length < 2 && phase === 'config' && (
          <p className="text-center text-sm text-gray-500">Añade al menos 2 archivos PDF para unirlos.</p>
        )}
      </div>
    </div>
  )
}
