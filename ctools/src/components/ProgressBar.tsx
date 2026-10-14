import { X } from 'lucide-react'

interface ProgressBarProps {
  /** 0–100. Se recorta automáticamente a ese intervalo. */
  value: number
  label: string
  onCancel?: () => void
}

export default function ProgressBar({ value, label, onCancel }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)))

  return (
    <div className="rounded-xl bg-white p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-gray-700" aria-live="polite">
          {label}: {clamped}%
        </p>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-gray-500 hover:text-red-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Cancelar
          </button>
        )}
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  )
}
