# Inventario de toques (T003)

**Fecha**: 2026-10-15 | Solo lectura; confirma la matriz `data-model.md` §2–§3 sin hallazgos extra.

## Imports `react-router-dom` → `react-router` (T011)

- `ctools/src/App.tsx:2` — `HashRouter, Link, NavLink, useRoutes`
- `ctools/src/routes.tsx:1` — `Navigate, type RouteObject`
- `ctools/src/tools/dashboard/Dashboard.tsx:1` — `Link`

Sin refs en `ctools/tests/` (usan `App`/`Dropzone`/`StickyActionBar` indirectamente) ni en `vite.config.ts`.

## Tailwind v3 (T007)

- `ctools/src/styles/tailwind.css:2-4` — `@tailwind base/components/utilities` (migrar a `@import "tailwindcss"` + `@theme`)
- `ctools/src/index.css:1` — `@import './styles/tailwind.css'` (cadena de entrada intacta)
- Clases en uso con equivalente directo v4: `ring-2`, `ring-accent`, `shadow-card` (custom → `--shadow-card`), `shadow-lg`, `bg-white/95`. Vigilar: `focus:outline-none` (`RangeInput.tsx:28`).

## Worker PDF (T012)

- `ctools/src/lib/pdf-render.ts:6,8` — `?url` + `GlobalWorkerOptions.workerSrc`
- `ctools/vite.config.ts:7-8` — comentario ya alineado (F6); `worker.format: 'es'` vigente
