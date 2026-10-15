import { Link } from 'react-router'
import { FilePenLine, Files, FileText, Scissors, type LucideIcon } from 'lucide-react'
import PrivacyBadge from '../../components/PrivacyBadge'
import { TOOLS } from '../../routes'

const ICONS: Record<string, LucideIcon> = {
  '/unir-pdf': Files,
  '/eliminar-paginas': Scissors,
  '/word-a-pdf': FileText,
  '/pdf-a-word': FilePenLine,
}

const DESCRIPTIONS: Record<string, string> = {
  '/unir-pdf': 'Combina varios PDF en uno solo, en el orden que elijas.',
  '/eliminar-paginas': 'Quita las páginas que no necesites de un PDF.',
  '/word-a-pdf': 'Convierte un .docx a PDF manteniendo el formato.',
  '/pdf-a-word': 'Convierte un PDF con texto a .docx editable.',
}

// Página principal (FR-001): bienvenida, tarjetas de acceso a las
// 4 herramientas y sello de privacidad visible.
export default function Dashboard() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
          Tus herramientas PDF y Word, <span className="text-accent">100% locales</span>
        </h1>
        <p className="max-w-xl text-gray-600">
          Une, recorta y convierte tus documentos sin subirlos a ningún servidor.
        </p>
        <PrivacyBadge />
      </div>

      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => {
          const Icon = ICONS[tool.path] ?? FileText
          return (
            <Link
              key={tool.path}
              to={tool.path}
              className="group flex items-start gap-4 rounded-xl bg-white p-5 shadow-card transition-shadow hover:shadow-lg"
            >
              <span className="rounded-lg bg-red-50 p-3 text-accent">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-lg font-semibold text-gray-800 group-hover:text-accent">
                  {tool.title}
                </span>
                <span className="block text-sm text-gray-500">{DESCRIPTIONS[tool.path]}</span>
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
