import { ShieldCheck } from 'lucide-react'

// Sello de privacidad visible con el texto exacto de FR-001.
export default function PrivacyBadge() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-sm font-medium text-green-800">
      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
      100% Privado: Tus archivos no salen de tu dispositivo
    </p>
  )
}
