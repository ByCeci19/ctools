import { useEffect, useState } from 'react'
import { HashRouter, Link, NavLink, useRoutes } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { TOOLS, routes } from './routes.tsx'

// Cabecera fija (FR-002): logotipo con la "C" en acento y navegación
// a las 4 herramientas + vuelta al inicio pinchando el logo.
// En móvil (<768 px, US1): cabecera compacta con botón de menú que
// despliega las 4 herramientas; se cierra al navegar o con Escape.
function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open ])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium ${
      isActive ? 'bg-canvas text-accent' : 'text-gray-600 hover:text-accent'
    }`

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="text-xl font-extrabold tracking-tight" aria-label="CTools - inicio">
          <span className="text-accent">C</span>
          <span className="text-gray-800">Tools</span>
        </Link>
        <nav className="hidden flex-wrap items-center gap-1 md:flex" aria-label="Herramientas">
          {TOOLS.map((tool) => (
            <NavLink key={tool.path} to={tool.path} className={linkClass}>
              {tool.title}
            </NavLink>
          ))}
        </nav>
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="rounded-md p-2 text-gray-700 hover:bg-canvas hover:text-accent"
          >
            {open ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <nav
                id="menu-movil"
                aria-label="Herramientas"
                className="absolute right-4 top-full z-20 flex w-56 flex-col gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-card"
              >
                {TOOLS.map((tool) => (
                  <NavLink
                    key={tool.path}
                    to={tool.path}
                    onClick={() => setOpen(false)}
                    className={linkClass}
                  >
                    <span className="block px-3 py-2">{tool.title}</span>
                  </NavLink>
                ))}
              </nav>
            </>
          )}
        </div>
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
