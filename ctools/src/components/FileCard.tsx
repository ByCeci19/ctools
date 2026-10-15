import type { CSSProperties, HTMLAttributes, Ref } from 'react'
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react'

// Tarjeta por archivo en la cola de unión (FR-011): miniatura de la primera
// página, nombre, peso legible y número de páginas. El reordenamiento por
// arrastrar lo cablea la vista con dnd-kit (contrato shared-components).

export interface FileCardDoc {
  id: string
  name: string
  sizeBytes: number
  pageCount: number | null
  thumbnailUrl: string | null
}

interface FileCardProps {
  doc: FileCardDoc
  /** Posición 1-based en la cola. */
  position: number
  /** Props del asa de arrastre (`attributes` + `listeners` de useSortable). */
  dragHandleProps?: HTMLAttributes<HTMLElement>
  /** Ref del contenedor (`setNodeRef` de useSortable). */
  containerRef?: Ref<HTMLElement>
  /** Estilo de arrastre (`transform`/`transition` de useSortable). */
  dragStyle?: CSSProperties
  isDragging?: boolean
  /** Miniatura aún generándose. */
  loadingThumbnail?: boolean
  onRemove: () => void
  /** Reordenado explícito solo móvil (FR-005, `md:hidden`). */
  onMoveUp?: () => void
  onMoveDown?: () => void
  isFirst?: boolean
  isLast?: boolean
}

/** "1536" → "1,5 KB". Solo se usa aquí de momento. */
export function formatBytes(sizeBytes: number): string {
  if (sizeBytes < 1024) return `${sizeBytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = sizeBytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1).replace('.', ',')} ${units[unit]}`
}

export default function FileCard({
  doc,
  position,
  dragHandleProps,
  containerRef,
  dragStyle,
  isDragging = false,
  loadingThumbnail = false,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
}: FileCardProps) {
  return (
    <article
      ref={containerRef}
      style={dragStyle}
      className={`flex items-center gap-2 rounded-xl bg-white p-2.5 shadow-card md:gap-3 md:p-3 ${
        isDragging ? 'opacity-60 ring-2 ring-accent' : ''
      }`}
    >
      <span
        {...dragHandleProps}
        className="cursor-grab touch-none rounded p-1 text-gray-400 hover:text-accent"
        aria-label={`Arrastrar ${doc.name} para reordenar`}
      >
        <GripVertical className="h-5 w-5" aria-hidden="true" />
      </span>

      <span className="flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded bg-canvas">
        {doc.thumbnailUrl && !loadingThumbnail ? (
          <img src={doc.thumbnailUrl} alt="" className="h-full w-full object-cover" draggable={false} />
        ) : (
          <span className="h-full w-full animate-pulse bg-gray-200" aria-hidden="true" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-gray-800" title={doc.name}>
          {doc.name}
        </span>
        <span className="block text-xs text-gray-500">
          {formatBytes(doc.sizeBytes)}
          {doc.pageCount !== null ? ` · ${doc.pageCount} ${doc.pageCount === 1 ? 'página' : 'páginas'}` : ''}
        </span>
      </span>

      <span className="shrink-0 rounded-full bg-canvas px-2 py-1 text-xs font-bold text-gray-600">
        #{position}
      </span>

      {onMoveUp && onMoveDown && (
        <span className="flex shrink-0 flex-col gap-1 md:hidden" role="group" aria-label={`Orden de ${doc.name}`}>
          <button
            type="button"
            onClick={onMoveUp}
            disabled={isFirst}
            aria-label={`Subir ${doc.name}`}
            className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:border-accent hover:text-accent disabled:opacity-30"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            disabled={isLast}
            aria-label={`Bajar ${doc.name}`}
            className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:border-accent hover:text-accent disabled:opacity-30"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        </span>
      )}

      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
        aria-label={`Quitar ${doc.name} de la cola`}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </article>
  )
}
