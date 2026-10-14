import { OctagonX, TriangleAlert, X } from 'lucide-react'
import { NOTICE_MESSAGES, type NoticeKind, type UserNotice } from '../lib/notices'

interface AlertProps {
  notice: UserNotice | null
  onClose?: () => void
}

const TONE: Record<NoticeKind, string> = {
  password: 'border-red-200 bg-red-50 text-red-800',
  'all-pages': 'border-red-200 bg-red-50 text-red-800',
  'invalid-format': 'border-amber-200 bg-amber-50 text-amber-900',
  'legacy-doc': 'border-amber-200 bg-amber-50 text-amber-900',
  'invalid-range': 'border-amber-200 bg-amber-50 text-amber-900',
  scanned: 'border-blue-200 bg-blue-50 text-blue-900',
  'large-file': 'border-blue-200 bg-blue-50 text-blue-900',
}

export default function Alert({ notice, onClose }: AlertProps) {
  if (!notice) return null
  const blocking = notice.kind === 'all-pages' || notice.kind === 'password'
  const Icon = blocking ? OctagonX : TriangleAlert

  return (
    <div
      role="alert"
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${TONE[notice.kind]}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <p className="flex-1">
        {NOTICE_MESSAGES[notice.kind]}
        {notice.detail ? ` ${notice.detail}` : ''}
      </p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 hover:opacity-70"
          aria-label="Cerrar aviso"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
