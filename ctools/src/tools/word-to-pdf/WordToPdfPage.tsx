import { useCallback, useRef, useState } from 'react'
import { FileText } from 'lucide-react'
import Alert from '../../components/Alert'
import Dropzone from '../../components/Dropzone'
import ProgressBar from '../../components/ProgressBar'
import SuccessScreen from '../../components/SuccessScreen'
import { formatBytes } from '../../components/FileCard'
import { downloadBytes } from '../../lib/download'
import { resultFilename } from '../../lib/filenames'
import { noticeForFile, type UserNotice } from '../../lib/notices'
import { convertDocxToPdf } from '../../lib/docx-to-pdf'

interface LoadedDocx {
  name: string
  sizeBytes: number
  bytes: Uint8Array
}

// Vista Word a PDF: 1) carga con validación (.doc legacy → aviso FR-007),
// 2) tarjeta de preparación, 3) conversión cancelable con progreso y
// pantalla de éxito con reset total.
export default function WordToPdfPage() {
  const [doc, setDoc] = useState<LoadedDocx | null>(null)
  const [notice, setNotice] = useState<UserNotice | null>(null)
  const [phase, setPhase] = useState<'config' | 'working' | 'done'>('config')
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [result, setResult] = useState<{ bytes: Uint8Array; filename: string } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const handleFiles = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file) return
    const rejected = noticeForFile(file.name, '.docx')
    if (rejected) {
      setNotice(rejected)
      return
    }
    setNotice(null)
    setDoc({ name: file.name, sizeBytes: file.size, bytes: new Uint8Array(await file.arrayBuffer()) })
  }, [])

  const handleConvert = useCallback(async () => {
    if (!doc || phase !== 'config') return
    const controller = new AbortController()
    abortRef.current = controller
    setPhase('working')
    setNotice(null)
    try {
      const out = await convertDocxToPdf(
        doc.bytes,
        (done, total) => setProgress({ done, total }),
        controller.signal,
      )
      setResult({ bytes: out, filename: resultFilename(doc.name, 'pdf') })
      setPhase('done')
    } catch {
      if (controller.signal.aborted) {
        // Cancelado por el usuario: vuelta a la configuración sin aviso (FR-030).
        setPhase('config')
      } else {
        setNotice({ kind: 'invalid-format', detail: `${doc.name} no se pudo convertir a PDF.` })
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
    if (result) downloadBytes(result.bytes, 'application/pdf', result.filename)
  }, [result])

  // "Empezar de nuevo": limpia documento, resultado y avisos (FR-024/FR-026).
  const handleReset = useCallback(() => {
    setDoc(null)
    setResult(null)
    setNotice(null)
    setProgress(null)
    setPhase('config')
  }, [])

  if (phase === 'done' && result) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Word a PDF</h1>
        </div>
        <SuccessScreen filename={result.filename} onDownload={handleDownload} onReset={handleReset} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Word a PDF</h1>
          <p className="mt-1 text-gray-600">
            1. Elige tu .docx · 2. Revisa que está listo · 3. Pulsa «Convertir a PDF»
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
        <Dropzone accept=".docx" multiple={false} onFiles={handleFiles} onReject={setNotice} />
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
              <span className="block text-sm text-gray-500">{formatBytes(doc.sizeBytes)}</span>
              <span className="mt-1 inline-block rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-800">
                Listo para convertir
              </span>
            </span>
          </div>

          {phase === 'working' && progress && (
            <ProgressBar
              value={(progress.done / progress.total) * 100}
              label={`Convirtiendo página ${progress.done} de ${progress.total}`}
              onCancel={handleCancel}
            />
          )}

          <div className="flex flex-col items-stretch gap-2">
            <button
              type="button"
              onClick={handleConvert}
              disabled={phase !== 'config'}
              className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {phase === 'working' ? 'Convirtiendo…' : 'Convertir a PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
