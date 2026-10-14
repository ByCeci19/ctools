import { Navigate, type RouteObject } from 'react-router-dom'
import Dashboard from './tools/dashboard/Dashboard'
import MergePage from './tools/merge/MergePage'

// Metadatos de las 5 rutas (contrato `contracts/routes.md`).
// Las vistas reales llegan en sus historias (T022, T025, T030, T033, T038);
// hasta entonces cada ruta muestra un marcador temporal.
export interface ToolMeta {
  path: string
  title: string
  accept: '.pdf' | '.docx'
}

export const TOOLS: ToolMeta[] = [
  { path: '/unir-pdf', title: 'Unir PDF', accept: '.pdf' },
  { path: '/eliminar-paginas', title: 'Eliminar páginas PDF', accept: '.pdf' },
  { path: '/word-a-pdf', title: 'Word a PDF', accept: '.docx' },
  { path: '/pdf-a-word', title: 'PDF a Word', accept: '.pdf' },
]

function Placeholder({ title }: { title: string }) {
  return (
    <main>
      <h1>{title}</h1>
      <p>Herramienta en construcción — llega en su historia del backlog.</p>
    </main>
  )
}

export const routes: RouteObject[] = [
  { path: '/', element: <Dashboard /> },
  { path: '/unir-pdf', element: <MergePage /> },
  ...TOOLS.filter((tool) => tool.path !== '/unir-pdf').map((tool) => ({
    path: tool.path,
    element: <Placeholder title={tool.title} />,
  })),
  // Hash desconocido → Dashboard (contrato routes.md).
  { path: '*', element: <Navigate to="/" replace /> },
]
