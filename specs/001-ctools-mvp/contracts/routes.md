# Contracts: rutas (HashRouter)

**Feature**: `specs/001-ctools-mvp/spec.md` | **Date**: 2026-10-14

Rutas hash (compatibles con GitHub Pages sin servidor). Sin parámetros:
cada herramienta guarda su estado en memoria y lo limpia al salir o
"Empezar de nuevo".

| Hash | Pantalla | Herramienta |
|------|----------|-------------|
| `#/` | Dashboard: bienvenida + 4 tarjetas + sello privacidad | — |
| `#/unir-pdf` | Unir PDF | merge |
| `#/eliminar-paginas` | Eliminar páginas PDF | remove-pages |
| `#/word-a-pdf` | Word a PDF | word-to-pdf |
| `#/pdf-a-word` | PDF a Word | pdf-to-word |

Reglas:

- La cabecera fija con logo (→ `#/`), las 4 rutas y el pie FR-003 están
  presentes en todas las rutas (FR-002).
- Hash desconocido → redirige a `#/` con aviso suave.
- Título de pestaña global: "CTools | Herramientas PDF y Word 100% Locales"
  (FR-027); favicon "C" (FR-028).
