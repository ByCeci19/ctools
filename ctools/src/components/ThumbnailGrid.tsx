import { X } from 'lucide-react'

// Cuadrícula de miniaturas numeradas (FR-014/FR-015). Cada miniatura es un
// botón conmutador: marcada muestra overlay con "X" roja y anillo rojo.

export interface GridPage {
  number: number // 1-based
  thumbnailUrl: string | null
  marked: boolean
  loading?: boolean
}

interface ThumbnailGridProps {
  pages: GridPage[]
  onToggle: (pageNumber: number) => void
}

export default function ThumbnailGrid({ pages, onToggle }: ThumbnailGridProps) {
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4" aria-label="Páginas del documento">
      {pages.map((page) => (
        <li key={page.number}>
          <button
            type="button"
            onClick={() => onToggle(page.number)}
            aria-pressed={page.marked}
            aria-label={`Página ${page.number}${page.marked ? ', marcada para eliminar' : ''}`}
            className={`relative block w-full overflow-hidden rounded-xl bg-white shadow-card ring-2 transition ${
              page.marked ? 'ring-accent' : 'ring-transparent hover:ring-gray-300'
            }`}
          >
            <span className="block aspect-[3/4] w-full bg-canvas">
              {page.thumbnailUrl && !page.loading ? (
                <img
                  src={page.thumbnailUrl}
                  alt=""
                  className={`h-full w-full object-cover ${page.marked ? 'opacity-40' : ''}`}
                  draggable={false}
                />
              ) : (
                <span className="block h-full w-full animate-pulse bg-gray-200" aria-hidden="true" />
              )}
            </span>
            <span className="absolute left-2 top-2 rounded-full bg-gray-900/70 px-2 py-0.5 text-xs font-bold text-white">
              {page.number}
            </span>
            {page.marked && (
              <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                <span className="rounded-full bg-accent p-2 text-white shadow">
                  <X className="h-6 w-6" strokeWidth={3} />
                </span>
              </span>
            )}
          </button>
        </li>
      ))}
    </ol>
  )
}
