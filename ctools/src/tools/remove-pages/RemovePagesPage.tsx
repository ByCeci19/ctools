import { useCallback, useEffect, useState } from 'react'
import Alert from '../../components/Alert'
import Dropzone from '../../components/Dropzone'
import RangeInput from '../../components/RangeInput'
import ThumbnailGrid from '../../components/ThumbnailGrid'
import { downloadBytes } from '../../lib/download'
import { resultFilename } from '../../lib/filenames'
import { noticeForFile, type UserNotice } from '../../lib/notices'
import {
  closePdfDocument,
  getPdfPageCount,
  isPasswordError,
  loadPdfDocument,
  renderPageThumbnail,
} from '../../lib/pdf-render'
import { filterPdfPages } from '../../lib/pdf-engine'
import { formatRangeExpression, parseRangeExpression } from '../../lib/range-parser'

interface LoadedDoc {
  name: string
  bytes: Uint8Array
  pageCount: number
  thumbs: (string | null)[]
  thumbsLoaded: number
}

function revokeThumbs(thumbs: (string | null)[]) {
  for (const url of thumbs) {
    if (url) URL.revokeObjectURL(url)
  }
}

// Vista Eliminar páginas: cuadrícula numerada con clic ↔ campo de rangos
// sincronizados en ambos sentidos (FR-014/FR-015/FR-016). El procesado con
// barra, cancelación y pantalla de éxito llega en T031.
export default function RemovePagesPage() {
  const [doc, setDoc] = useState<LoadedDoc | null>(null)
  const [selection, setSelection] = useState<Set<number>>(new Set())
  const [expression, setExpression] = useState('')
  const [exprErrors, setExprErrors] = useState<string[]>([])
  const [notice, setNotice] = useState<UserNotice | null>(null)
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  // Libera miniaturas al desmontar (constitución IV).
  useEffect(() => {
    return () => {
      setDoc((current) => {
        if (current) revokeThumbs(current.thumbs)
        return current
      })
    }
  }, [])

  const resetDoc = useCallback(() => {
    setDoc((current) => {
      if (current) revokeThumbs(current.thumbs)
      return null
    })
    setSelection(new Set())
    setExpression('')
    setExprErrors([])
  }, [])

  const handleFiles = useCallback(
    async (files: File[]) => {
      const file = files[0]
      if (!file) return
      const rejected = noticeForFile(file.name, '.pdf')
      if (rejected) {
        setNotice(rejected)
        return
      }
      resetDoc()
      setNotice(null)
      const bytes = new Uint8Array(await file.arrayBuffer())
      try {
        const pdf = await loadPdfDocument(bytes)
        const pageCount = getPdfPageCount(pdf)
        setDoc({ name: file.name, bytes, pageCount, thumbs: Array(pageCount).fill(null), thumbsLoaded: 0 })
        for (let page = 1; page <= pageCount; page++) {
          const url = await renderPageThumbnail(pdf, page)
          setDoc((current) =>
            current
              ? {
                  ...current,
                  thumbs: current.thumbs.map((thumb, index) => (index === page - 1 ? url : thumb)),
                  thumbsLoaded: current.thumbsLoaded + 1,
                }
              : current,
          )
        }
        await closePdfDocument(pdf)
      } catch (error) {
        resetDoc()
        setNotice(
          isPasswordError(error)
            ? { kind: 'password', detail: file.name }
            : { kind: 'invalid-format', detail: `${file.name} no se pudo leer como PDF.` },
        )
      }
    },
    [resetDoc],
  )

  const applySelection = useCallback((next: Set<number>) => {
    setSelection(next)
    setExpression(formatRangeExpression(next))
    setExprErrors([])
  }, [])

  const togglePage = useCallback(
    (pageNumber: number) => {
      const next = new Set(selection)
      if (next.has(pageNumber)) next.delete(pageNumber)
      else next.add(pageNumber)
      applySelection(next)
    },
    [selection, applySelection],
  )

  const handleExpression = useCallback(
    (text: string) => {
      setExpression(text)
      if (!doc) return
      const { pages, errors } = parseRangeExpression(text, doc.pageCount)
      setExprErrors(errors)
      // Con errores se conserva la selección visual previa.
      if (errors.length === 0) setSelection(pages)
    },
    [doc],
  )

  const allPages = doc !== null && selection.size >= doc.pageCount

  const handleProcess = useCallback(async () => {
    if (!doc || processing) return
    if (selection.size >= doc.pageCount) {
      setNotice({ kind: 'all-pages' })
      return
    }
    setProcessing(true)
    setNotice(null)
    try {
      const out = await filterPdfPages(doc.bytes, selection, (done, total) =>
        setProgress({ done, total }),
      )
      downloadBytes(out, 'application/pdf', resultFilename(doc.name, 'pdf'))
    } catch (error) {
      setNotice(
        isPasswordError(error)
          ? { kind: 'password' }
          : { kind: 'invalid-format', detail: 'No se pudo completar la eliminación.' },
      )
    } finally {
      setProcessing(false)
      setProgress(null)
    }
  }, [doc, processing, selection])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Eliminar páginas PDF</h1>
          <p className="mt-1 text-gray-600">
            1. Elige tu PDF · 2. Marca páginas o escribe rangos · 3. Pulsa «Eliminar páginas»
          </p>
        </div>
        {doc && (
          <button
            type="button"
            onClick={resetDoc}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-accent hover:text-accent"
          >
            Usar otro archivo
          </button>
        )}
      </div>

      <Alert notice={notice} onClose={() => setNotice(null)} />

      {!doc ? (
        <Dropzone accept=".pdf" multiple={false} onFiles={handleFiles} onReject={setNotice} />
      ) : (
        <>
          {doc.thumbsLoaded < doc.pageCount && (
            <p className="text-sm text-gray-500" aria-live="polite">
              Cargando miniaturas {doc.thumbsLoaded} de {doc.pageCount}…
            </p>
          )}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex-1">
              <ThumbnailGrid
                pages={doc.thumbs.map((thumb, index) => ({
                  number: index + 1,
                  thumbnailUrl: thumb,
                  marked: selection.has(index + 1),
                  loading: thumb === null,
                }))}
                onToggle={togglePage}
              />
            </div>
            <aside className="w-full shrink-0 lg:w-72">
              <RangeInput
                expression={expression}
                pageCount={doc.pageCount}
                errors={exprErrors}
                onChange={handleExpression}
              />
              <p className="mt-2 text-sm text-gray-600" aria-live="polite">
                {selection.size === 0
                  ? 'Ninguna página marcada.'
                  : `Se eliminarán ${selection.size} de ${doc.pageCount}.`}
              </p>
            </aside>
          </div>

          <div className="flex flex-col items-stretch gap-2">
            <button
              type="button"
              onClick={handleProcess}
              disabled={selection.size === 0 || processing}
              className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing && progress
                ? `Eliminando ${progress.done} de ${progress.total}…`
                : 'Eliminar páginas'}
            </button>
            {selection.size === 0 && <p className="text-center text-sm text-gray-500">Marca al menos 1 página.</p>}
          </div>
        </>
      )}
    </div>
  )
}
