import { useCallback, useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import Alert from '../../components/Alert'
import Dropzone from '../../components/Dropzone'
import ProgressBar from '../../components/ProgressBar'
import SuccessScreen from '../../components/SuccessScreen'
import StickyActionBar from '../../components/StickyActionBar'
import { formatBytes } from '../../components/FileCard'
import { downloadBytes } from '../../lib/download'
import { resultFilename } from '../../lib/filenames'
import { isLargeFile, noticeForFile, type UserNotice } from '../../lib/notices'
import {
  closePdfDocument,
  getPdfPageCount,
  isPasswordError,
  loadPdfDocument,
} from '../../lib/pdf-render'
import { extractPdfText, type PdfTextResult } from '../../lib/pdf-text'
import { packTextToDocx } from '../../lib/pdf-to-docx'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

interface LoadedPdf {
  name: string
  sizeBytes: number
  bytes: Uint8Array
  pageCount: number
  preview: PdfTextResult
  /** Cero caracteres extraídos → aparentemente escaneado (FR-022). */
  scanned: boolean
  paragraphCount: number
}

// Vista PDF a Word: 1) carga con validación (contraseña → error FR-008) y
// pre-extracción de texto, 2) tarjeta de preparación con aviso de escaneado
// previo si no hay texto seleccionable (FR-022), 3) conversión cancelable
// con progreso y pantalla de éxito con reset total (FR-023/FR-024/FR-030).
export default function PdfToWordPage() {
  const [doc, setDoc] = useState<LoadedPdf | null>(null)
  const [notice, setNotice] = useState<UserNotice | null>(null)
  const [phase, setPhase] = useState<'config' | 'working' | 'done'>('config')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [result, setResult] = useState<{ bytes: Uint8Array; filename: string } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  // "Empezar de nuevo" / "Usar otro archivo": limpia todo (FR-024/FR-026).
  // Sin ObjectURLs en esta vista: basta con soltar los bytes.
  const handleReset = useCallback(() => {
    setDoc(null)
    setResult(null)
    setNotice(null)
    setProgress(null)
    setPhase('config')
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
      handleReset()
      const bytes = new Uint8Array(await file.arrayBuffer())
      try {
        const pdf = await loadPdfDocument(bytes)
        const pageCount = getPdfPageCount(pdf)
        await closePdfDocument(pdf)
        const preview = await extractPdfText(bytes)
        const scanned = preview.totalChars === 0
        const paragraphCount = preview.pages.reduce(
          (total, page) => total + page.paragraphs.length,
          0,
        )
        setDoc({
          name: file.name,
          sizeBytes: file.size,
          bytes,
          pageCount,
          preview,
          scanned,
          paragraphCount,
        })
        // Aviso previo de escaneado: informa sin bloquear (FR-022).
        // Si no es escaneado pero es grande, se conserva la advertencia
        // suave ≥50 MB (FR-029); en otro caso se limpia el aviso.
        setNotice(
          scanned
            ? { kind: 'scanned', detail: file.name }
            : isLargeFile(file.size)
              ? { kind: 'large-file', detail: file.name }
              : null,
        )
      } catch (error) {
        handleReset()
        setNotice(
          isPasswordError(error)
            ? { kind: 'password', detail: file.name }
            : { kind: 'invalid-format', detail: `${file.name} no se pudo leer como PDF.` },
        )
      }
    },
    [handleReset],
  )

  const handleConvert = useCallback(async () => {
    if (!doc || phase !== 'config') return
    const controller = new AbortController()
    abortRef.current = controller
    setPhase('working')
    setNotice(null)
    try {
      // Re-extracción con progreso y cancelación (FR-023/FR-030); el
      // empaquetado posterior es rápido y no necesita progreso propio.
      const extracted = await extractPdfText(
        doc.bytes,
        (done, total) => setProgress({ done, total }),
        controller.signal,
      )
      const out = await packTextToDocx(extracted)
      setResult({ bytes: out, filename: resultFilename(doc.name, 'docx') })
      setPhase('done')
    } catch {
      if (controller.signal.aborted) {
        // Cancelado por el usuario: vuelta a la configuración sin aviso
        // (FR-030); el documento se conserva para reintentar.
        setPhase('config')
      } else {
        setNotice({ kind: 'invalid-format', detail: `${doc.name} no se pudo convertir a Word.` })
        setPhase('config')
      }
    } finally {
      setProgress(null)
      abortRef.current = null
    }
  }, [doc, phase])

  const handleCancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const handleDownload = useCallback(() => {
    if (result) downloadBytes(result.bytes, DOCX_MIME, result.filename)
  }, [result])

  if (phase === 'done' && result) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">PDF a Word</h1>
        </div>
        <SuccessScreen filename={result.filename} onDownload={handleDownload} onReset={handleReset} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-28 md:pb-0">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">PDF a Word</h1>
          <p className="mt-1 text-gray-600">
            1. Elige tu PDF · 2. Revisa que está listo · 3. Pulsa «Convertir a Word»
          </p>
        </div>
        {doc && (
          <button
            type="button"
            onClick={handleReset}
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
          <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-card">
            <span className="rounded-lg bg-red-50 p-3 text-accent">
              <FileText className="h-8 w-8" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold text-gray-800" title={doc.name}>
                {doc.name}
              </span>
              <span className="block text-sm text-gray-500">
                {formatBytes(doc.sizeBytes)} · {doc.pageCount}{' '}
                {doc.pageCount === 1 ? 'página' : 'páginas'}
                {!doc.scanned && (
                  <>
                    {' '}· {doc.paragraphCount}{' '}
                    {doc.paragraphCount === 1 ? 'párrafo' : 'párrafos'}
                  </>
                )}
              </span>
              {doc.scanned ? (
                <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-900">
                  Sin texto seleccionable (parece escaneado)
                </span>
              ) : (
                <span className="mt-1 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                  Listo para convertir
                </span>
              )}
            </span>
          </div>

          {phase === 'working' && progress && (
            <ProgressBar
              value={(progress.done / progress.total) * 100}
              label={`Extrayendo texto, página ${progress.done} de ${progress.total}`}
              onCancel={handleCancel}
            />
          )}

          <div className="flex flex-col items-stretch gap-2 max-md:hidden">
            <button
              type="button"
              onClick={handleConvert}
              disabled={phase !== 'config'}
              className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === 'working' ? 'Convirtiendo…' : 'Convertir a Word'}
            </button>
          </div>

          <StickyActionBar
            label="Convertir a Word"
            disabled={phase !== 'config'}
            visible={doc !== null && phase === 'config'}
            onAction={handleConvert}
          />
        </>
      )}
    </div>
  )
}
