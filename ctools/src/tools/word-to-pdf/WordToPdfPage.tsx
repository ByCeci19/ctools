import { useCallback, useState } from 'react'
import { FileText } from 'lucide-react'
import Alert from '../../components/Alert'
import Dropzone from '../../components/Dropzone'
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

// Vista Word a PDF: tarjeta de preparación simple (nombre, tamaño y
// "listo para convertir", FR-019) y botón de conversión. El progreso con
// barra, la cancelación y la pantalla de éxito llegan en T034.
export default function WordToPdfPage() {
  const [doc, setDoc] = useState<LoadedDocx | null>(null)
  const [notice, setNotice] = useState<UserNotice | null>(null)
  const [converting, setConverting] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

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
    if (!doc || converting) return
    setConverting(true)
    setNotice(null)
    try {
      const out = await convertDocxToPdf(doc.bytes, (done, total) => setProgress({ done, total }))
      downloadBytes(out, 'application/pdf', resultFilename(doc.name, 'pdf'))
    } catch {
      setNotice({ kind: 'invalid-format', detail: `${doc.name} no se pudo convertir a PDF.` })
    } finally {
      setConverting(false)
      setProgress(null)
    }
  }, [doc, converting])

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
            onClick={() => setDoc(null)}
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

          <div className="flex flex-col items-stretch gap-2">
            <button
              type="button"
              onClick={handleConvert}
              disabled={converting}
              className="rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {converting && progress
                ? `Convirtiendo página ${progress.done} de ${progress.total}…`
                : 'Convertir a PDF'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
