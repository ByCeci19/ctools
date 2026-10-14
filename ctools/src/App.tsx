import { HashRouter, Link, NavLink, useRoutes } from 'react-router-dom'
import { TOOLS, routes } from './routes.tsx'

// Cabecera fija (FR-002): logotipo con la "C" en acento y navegación
// a las 4 herramientas + vuelta al inicio pinchando el logo.
function Header() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-canvas text-accent' : 'text-gray-600 hover:text-accent'
    }`

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight" aria-label="CTools - inicio">
          <span className="text-accent">C</span>
          <span className="text-gray-800">Tools</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Herramientas">
          {TOOLS.map((tool) => (
            <NavLink key={tool.path} to={tool.path} className={linkClass}>
              {tool.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}

// Pie limpio con el texto exacto de FR-003.
function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <p className="mx-auto max-w-5xl px-4 py-4 text-center text-sm text-gray-500">
        CTools — Desarrollado por Cecilio • Procesamiento 100% local en tu navegador
      </p>
    </footer>
  )
}

function Shell() {
  const element = useRoutes(routes)
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Header />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{element}</div>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
