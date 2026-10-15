import { useCallback } from 'react'
import { useDropzone, type FileRejection } from 'react-dropzone'
import { FileUp } from 'lucide-react'
import {
  isLargeFile,
  noticeForFile,
  type AcceptExt,
  type UserNotice,
} from '../lib/notices'

interface DropzoneProps {
  accept: AcceptExt
  multiple?: boolean
  onFiles: (files: File[]) => void
  /** Canal de avisos: rechazos de formato y advertencia suave ≥50 MB (FR-029). */
  onReject: (notice: UserNotice) => void
  title?: string
  hint?: string
}

const MIME: Record<AcceptExt, Record<string, string[]>> = {
  '.pdf': { 'application/pdf': ['.pdf'] },
  '.docx': {
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
}

export default function Dropzone({ accept, multiple = true, onFiles, onReject, title, hint }: DropzoneProps) {
  const handleRejected = useCallback(
    (rejections: FileRejection[]) => {
      const first = rejections[0]
      if (!first) return
      const notice = noticeForFile(first.file.name, accept) ?? {
        kind: 'invalid-format' as const,
        detail: `Solo se aceptan archivos ${accept}.`,
      }
      onReject(notice)
    },
    [accept, onReject],
  )

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted.length === 0) return
      onFiles(accepted)
      // Advertencia suave sin bloquear: el archivo se acepta igualmente (FR-029).
      const big = accepted.find((file) => isLargeFile(file.size))
      if (big) onReject({ kind: 'large-file', detail: big.name })
    },
    [onFiles, onReject],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: MIME[accept],
    multiple,
    onDrop,
    onDropRejected: handleRejected,
  })

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-white px-6 py-12 text-center shadow-card transition-colors ${
        isDragActive ? 'border-accent bg-red-50' : 'border-gray-300 hover:border-accent'
      }`}
    >
      <input {...getInputProps()} />
      <FileUp className="h-10 w-10 text-accent" aria-hidden="true" />
      {title ? (
        <p className="text-lg font-semibold text-gray-800">{title}</p>
      ) : (
        <>
          <p className="text-lg font-semibold text-gray-800 md:hidden">
            Toca para seleccionar {multiple ? 'archivos' : 'tu archivo'}
          </p>
          <p className="hidden text-lg font-semibold text-gray-800 md:block">
            {isDragActive
              ? multiple
                ? 'Suelta los archivos aquí'
                : 'Suelta el archivo aquí'
              : multiple
                ? 'Arrastra tus archivos aquí'
                : 'Arrastra tu archivo aquí'}
          </p>
          <span
            aria-hidden="true"
            className="mt-1 inline-block rounded-lg bg-accent px-8 py-3 text-base font-semibold text-white md:hidden"
          >
            Seleccionar {multiple ? 'archivos' : 'archivo'}
          </span>
        </>
      )}
      <p className="text-sm text-gray-500">
        {hint ?? `o haz clic para seleccionar (${accept}${multiple ? ', varios permitidos' : ''})`}
      </p>
    </div>
  )
}
