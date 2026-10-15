# Research: 003-stack-upgrade

**Fecha**: 2026-10-15 | **Spec**: [spec.md](spec.md) | **Decisiones de clarificación**: Node 24 LTS · TS última estable · visor PDF exigir 6.x · estilos vía plugin Vite · pruebas solo adaptar.

Todas las líneas objetivo se verificaron contra documentación oficial y
registro npm (búsquedas web 2026-10-15). Sin `NEEDS CLARIFICATION` abiertos.

## R1 — Enrutador v8: `react-router-dom` → `react-router`

- **Decision**: Desinstalar `react-router-dom`, instalar `react-router` v8 y reescribir los imports en los 3 ficheros afectados (`src/App.tsx`, `src/routes.tsx`, `src/tools/dashboard/Dashboard.tsx`): `HashRouter, Link, NavLink, Navigate, useRoutes, type RouteObject` pasan a importarse desde `"react-router"`.
- **Rationale**: La guía oficial de upgrade v7→v8 confirma que v8 elimina el paquete re-export `react-router-dom`; todo lo no-DOM se importa desde `react-router` y solo `RouterProvider`/`HydratedRouter` van a `react-router/dom`. CTools no usa ninguno de esos dos (usa `HashRouter` + `useRoutes`), así que el cambio es mecánico y `HashRouter` (constitución II) se conserva. Requisitos oficiales de v8 (Node 22.22+, React 19.2.7+) quedan cubiertos por las decisiones de Node 24 y React 19.3.x.
- **Alternatives considered**: Quedarse en v6 (rechazado: rompe el objetivo del upgrade y bloquea React 19); pasar por v7 intermedio (rechazado: paso extra sin valor, el cambio de imports es idéntico).

## R2 — React 19.3.x + `@types/react` 19

- **Decision**: Subir `react`, `react-dom` a 19.3.x y `@types/react`, `@types/react-dom` a la línea 19.
- **Rationale**: Requisito previo del enrutador v8 y del plugin React 5. El código actual (`StrictMode`, `createRoot`, hooks, JSX `react-jsx`) es compatible sin cambios de API; el riesgo queda en tipos más estrictos, que se resuelven en la pasada de `tsc --noEmit`.
- **Alternatives considered**: React 19.0/19.2 (rechazado: la línea 19.3.x es la estable objetivo y cumple el mínimo del router con margen).

## R3 — Vite 8.3.x + `@vitejs/plugin-react` 5.x, worker intacto

- **Decision**: Subir `vite` a 8.3.x y `@vitejs/plugin-react` a 5.x; conservar `base: './'` y `worker.format: 'es'`.
- **Rationale**: `worker.format: 'es'` sigue existiendo en la rama Vite 8 (docs `main`: opciones de worker vigentes; el renombre `rollupOptions`→`rolldownOptions` es alias deprecado y CTools no usa esa opción, así que no hay cambio). El worker de PDF.js se referencia hoy con `import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'` (asset relativo, compatible con subruta) y ese patrón sigue válido en Vite 8.
- **Alternatives considered**: Cambiar a `new URL(..., import.meta.url)` (rechazado: el patrón `?url` actual ya cumple y minimiza el diff); activar `worker.rolldownOptions` (rechazado: innecesario sin opciones custom).

## R4 — Tailwind v4.3.x vía plugin oficial de Vite

- **Decision**: `npm i tailwindcss@4.3 @tailwindcss/vite`, registrar el plugin en `vite.config.ts`, convertir `src/styles/tailwind.css` a `@import "tailwindcss"` + bloque `@theme` con los tokens actuales (`--color-canvas: #F5F5FA`, `--color-accent: #E5322D`, `--color-accent-dark: #B71F1B`, `--shadow-card: ...`), y eliminar `tailwind.config.js`, `postcss.config.js` y `autoprefixer`.
- **Rationale**: Es la vía oficial recomendada (upgrade guide Tailwind: el plugin PostCSS vive ahora en `@tailwindcss/postcss` y con Vite se recomienda el plugin dedicado; autoprefixer se elimina porque v4 gestiona prefijos automáticamente; npm confirma `@tailwindcss/vite@4.3.0` publicado). La auditoría de clases del código muestra riesgo bajo: `ring-2`/`ring-accent`, `shadow-card` (custom), `shadow-lg`, `bg-white/95` tienen equivalente directo en v4; el único punto a vigilar en la pasada visual es `focus:outline-none` (semántica de outline retocada en v4).
- **Alternatives considered**: Vía `@tailwindcss/postcss` (rechazado en clarificación: se fijó plugin Vite); mantener `tailwind.config.js` con `@config` (rechazado: deuda a corto plazo, la migración a `@theme` es trivial con 3 tokens + 1 sombra).

## R5 — pdfjs-dist 6.x exigido, worker como asset relativo

- **Decision**: Subir a la línea 6.x (npm confirma `6.4.299` vigente; el layout `build/pdf.worker.min.mjs` existe en 5.x y 6.x) manteniendo el patrón `?url` + `GlobalWorkerOptions.workerSrc`; si 6.x exige retrabajo del worker, entra en alcance (decisión de clarificación).
- **Rationale**: El render de miniaturas (`loadPdfDocument`, `renderPageThumbnail`, `closePdfDocument`, `isPasswordError` en `src/lib/pdf-render.ts`) es el motor central de 2 herramientas; fijar 6.x sin fallback elimina la ambigüedad 5.x/6.x y la verificación visual/funcional (US1, SC-002/SC-003) detecta cualquier deriva. Se preservan `revokeObjectURL`, render por página y cancelación (constitución IV).
- **Alternatives considered**: Fijar 5.x conservadora (rechazado en clarificación: se exigió 6.x).

## R6 — TypeScript última estable, estricto intacto

- **Decision**: Adoptar la última estable disponible al implementar (6.0.x o 7.0.x) manteniendo `strict`, `noUnusedLocals`, `noUnusedParameters` y `jsx: react-jsx` en `tsconfig.app.json` / `tsconfig.node.json`.
- **Rationale**: Decisión de clarificación; el modo estricto es mandato constitucional (V) y la subida de versión solo endurece la comprobación, que actúa como red de seguridad del resto de cambios.
- **Alternatives considered**: Fijar 6.0.x preventiva (rechazado en clarificación).

## R7 — Vitest 5 + `@testing-library/react` v16 + jsdom, solo adaptar

- **Decision**: Subir `vitest` a 5.x con `@testing-library/react` en línea v16 (releases confirman soporte React 19 desde 16.x: "Add support for React 19", tipos `onCaughtError` para v19) y `jsdom` compatible; adaptar los 6 ficheros de `ctools/tests/` sin añadir pruebas nuevas (decisión de clarificación); conservar `globals`, `environment: 'jsdom'`, `setupFiles` en `vite.config.ts`.
- **Rationale**: Los tests actuales usan `render/screen/fireEvent/within` estándar, sin APIs eliminadas; la configuración de entorno no cambia entre Vitest 3 y 5.
- **Alternatives considered**: Ampliar cobertura de regresión (rechazado en clarificación: solo adaptar); migrar a `vitest-browser-react` (rechazado: cambio de paradigma fuera de alcance).

## R8 — Node 24 LTS en CI

- **Decision**: `node-version: 24` en `.github/workflows/deploy.yml` (decisión de clarificación; local verificado con Node v22.23.2 disponible, el workflow usará 24).
- **Rationale**: Cumple el mínimo del enrutador v8 (22.22+) con margen y alinea CI con el runtime objetivo.
- **Alternatives considered**: Matriz 22+24 (rechazado: duplica tiempo de CI sin valor para una SPA estática).

## R9 — Orden de ejecución y regeneración del lockfile

- **Decision**: Secuencia en 4 grupos con puerta verde tras cada uno: (1) toolchain (`Node` workflow, TS, Vite+plugin-react, Tailwind+plugin, tipos) → `tsc --noEmit` + `vite build`; (2) runtime React 19 + enrutador v8 + libs PDF/Word (pdfjs 6, jspdf 3, resto) → adaptar `src/` (imports router ×3 ficheros, worker si 6.x lo exige) → `npm test`; (3) adaptar tests existentes → `vitest run` en verde; (4) verificación de regresión (quickstart.md). `package-lock.json` se regenera por instalación (no edición manual).
- **Rationale**: Aísla el origen de cada rotura (config vs. runtime vs. tests) y respeta FR-010 (sin nuevas features) y FR-011 (verde en los tres comandos).
- **Alternatives considered**: Subida monolítica de todo + depurar al final (rechazado: mezcla señales de fallo de 1–2 majors por paquete).
