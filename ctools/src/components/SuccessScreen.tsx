import { useEffect, useRef } from 'react'
import { CheckCircle2, Download, RotateCcw } from 'lucide-react'

interface SuccessScreenProps {
  filename: string
  onDownload: () => void
  onReset: () => void
}

// Pantalla final de éxito (FR-024): intenta la descarga automática al
// mostrarse y mantiene el botón manual siempre visible. "Empezar de nuevo"
// limpia el estado por completo en la herramienta que la usa.
export default function SuccessScreen({ filename, onDownload, onReset }: SuccessScreenProps) {
  const attempted = useRef(false)

  useEffect(() => {
    // Guarda contra la doble invocación de StrictMode en desarrollo.
    if (!attempted.current) {
      attempted.current = true
      onDownload()
    }
  }, [onDownload])

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-6 py-10 text-center shadow-card">
      <CheckCircle2 className="h-14 w-14 text-green-600" aria-hidden="true" />
      <h2 className="text-xl font-bold text-gray-800">¡Listo! Tu archivo está preparado</h2>
      <p className="max-w-md break-all text-sm text-gray-500">{filename}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onDownload}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark"
        >
          <Download className="h-5 w-5" aria-hidden="true" />
          Descargar
        </button>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 hover:border-accent hover:text-accent"
        >
          <RotateCcw className="h-5 w-5" aria-hidden="true" />
          Empezar de nuevo
        </button>
      </div>
    </div>
  )
}
