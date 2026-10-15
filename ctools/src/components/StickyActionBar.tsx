interface StickyActionBarProps {
  /** Texto del botón principal en español (p. ej. "Unir PDF"). */
  label: string
  /** Mismas reglas de deshabilitado que el botón en flujo. */
  disabled?: boolean
  /** Texto auxiliar (p. ej. "Añade al menos 2 archivos"). */
  hint?: string
  /** Solo `true` en fase config con archivos; en `false` no renderiza nada. */
  visible: boolean
  onAction: () => void
}

// Barra de acción fija inferior solo móvil (FR-009/FR-010/FR-011):
// `fixed bottom-0 md:hidden`, visible solo en configuración con archivos.
// Respeta el área segura del dispositivo; la vista reserva espacio
// inferior para no tapar contenido. El botón en flujo se oculta en móvil
// (visibilidades excluyentes): un solo botón lógico.
export default function StickyActionBar({
  label,
  disabled = false,
  hint,
  visible,
  onAction,
}: StickyActionBarProps) {
  if (!visible) return null
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur md:hidden">
      <button
        type="button"
        onClick={onAction}
        disabled={disabled}
        className="w-full rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {label}
      </button>
      {hint && <p className="mt-1 text-center text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
