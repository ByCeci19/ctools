# Implementation Plan: CTools — Full Stack Upgrade Without Regression

**Branch**: `003-stack-upgrade` | **Date**: 2026-10-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-stack-upgrade/spec.md` (con clarificaciones 2026-10-15: Node 24 LTS · TS última estable · visor PDF exigir 6.x · estilos vía plugin Vite · pruebas solo adaptar).

## Summary

Migrar la SPA `ctools/` (React 18 + router-dom v6 + Vite 6 + Tailwind v3 + TS 5.6 + Vitest 3 + Node 20) a las líneas estables Oct-2026 (React 19.3.x, router v8, Vite 8.3.x, Tailwind v4.3.x vía plugin Vite, TS 6/7, Vitest 5, pdfjs-dist 6.x, Node 24) con cero regresión funcional ni visual. Enfoque (ver [research.md](research.md)): 4 grupos secuenciales con puerta verde tras cada uno (toolchain → runtime+`src/` → tests → regresión end-to-end), inventario de ficheros cerrado (contrato en [contracts/upgrade-targets.md](contracts/upgrade-targets.md)) y verificación según [quickstart.md](quickstart.md).

## Technical Context

**Language/Version**: TypeScript última estable al implementar (6.0.x/7.0.x), `strict` + `noUnusedLocals`/`noUnusedParameters` + `jsx: react-jsx` intactos.

**Primary Dependencies**: React 19.3.x + `@types/react` 19; `react-router` v8 (reemplaza `react-router-dom`); Vite 8.3.x + `@vitejs/plugin-react` 5.x + `@tailwindcss/vite`; Tailwind v4.3.x (tokens a `@theme`, sin config JS ni autoprefixer); pdfjs-dist 6.x (worker `?url` + `GlobalWorkerOptions`); jspdf 3.x; últimas compatibles de pdf-lib, docx, docx-preview, html2canvas, dnd-kit, lucide-react, react-dropzone.

**Storage**: N/A — sin persistencia; documentos solo en memoria, recursos temporales liberados tras descarga/reset.

**Testing**: Vitest 5 + `@testing-library/react` v16 (compatible React 19) + jsdom; se adaptan los 6 ficheros existentes de `ctools/tests/`, sin pruebas nuevas; se conserva `globals/jsdom/setupFiles` en `vite.config.ts`.

**Target Platform**: Navegadores modernos (escritorio + móvil); hosting estático GitHub Pages servido desde subruta.

**Project Type**: SPA 100% client-side, build estática, `HashRouter`, `base: './'`.

**Performance Goals**: Paridad con el estado previo — unión de 3 PDF < 3 min; UI responde con progreso visible y cancelación ante archivos grandes; usos repetidos sin degradación ni estado residual.

**Constraints**: 100% local / cero subidas (solo assets estáticos en red); UI íntegramente en español, flujo 3-pasos y marca intactos; TS estricto; módulos desacoplados; Node 24 en CI; **sin nuevas features**.

**Scale/Scope**: 5 vistas (Dashboard + 4 herramientas), ~9 componentes compartidos + 9 módulos `lib/`, 6 ficheros de tests; un solo paquete (`ctools/`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. 100% local**: PASS — ningún cambio introduce red en runtime; el worker PDF sigue siendo asset relativo empaquetado; verificado por G5 (inspección de tráfico + offline).
- **II. GitHub Pages estático**: PASS — se conservan `HashRouter`, `base: './'`, `worker.format: 'es'`; sin SSR, rewrites ni headers; verificado por G4 (subruta + recarga).
- **III. Identidad y UX**: PASS — FR-010 prohíbe cambios de UI/textos/flujo; tokens visuales preservados como `@theme`; verificado por SC-002/SC-004.
- **IV. Memoria y rendimiento**: PASS con atención — el retrabajo condicional del worker 6.x MUST preservar `revokeObjectURL`, render por página y cancelación; verificado por G7.
- **V. Modularidad y TS estricto**: PASS — cambios confinados a configs + 3 ficheros de imports router + worker condicional + tests; estricto retained; ninguna herramienta toca a otra.

Sin violaciones: no hay nada que justificar. *Re-check post-Phase 1 (2026-10-15)*: el diseño (inventario cerrado, invariantes §4 de `data-model.md`, puertas G1–G7) mantiene los 5 gates en PASS.

## Project Structure

### Documentation (this feature)

```text
specs/003-stack-upgrade/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── upgrade-targets.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
ctools/
├── src/
│   ├── App.tsx                    # TOUCH: imports router (R1)
│   ├── routes.tsx                 # TOUCH: imports router (R1)
│   ├── main.tsx
│   ├── index.css
│   ├── styles/tailwind.css        # UPDATE: @import + @theme (R4)
│   ├── components/                # INVARIANT (9 componentes)
│   ├── lib/                       # pdf-render.ts TOUCH condicional (R5); resto INVARIANT
│   └── tools/                     # Dashboard.tsx TOUCH import Link (R1); resto INVARIANT
├── tests/                         # ADAPT a Vitest 5 / React 19 (R7)
├── vite.config.ts                 # UPDATE (R3+R4)
├── tsconfig.app.json / tsconfig.node.json  # UPDATE compat (R6)
├── tailwind.config.js / postcss.config.js  # DELETE (R4)
├── package.json / package-lock.json         # UPDATE (contrato)
└── index.html / public / vite-env.d.ts      # INVARIANT
.github/workflows/deploy.yml       # UPDATE: node-version 24 (R8)
```

**Structure Decision**: Sin cambios de estructura — el upgrade opera sobre el árbol existente de `ctools/` (paquete único) más el workflow raíz; la documentación vive en `specs/003-stack-upgrade/`.

## Complexity Tracking

Sin violaciones constitucionales que justificar — sección sin contenido.
