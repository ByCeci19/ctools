# Implementation Plan: CTools MVP — Suite local de herramientas de documentos

**Branch**: `001-ctools-mvp` | **Date**: 2026-10-14 | **Spec**: `specs/001-ctools-mvp/spec.md`

**Input**: Feature specification from `/specs/001-ctools-mvp/spec.md`

## Summary

Construir CTools como SPA estática 100% client-side (Vite + React 18 + TypeScript),
desplegable en GitHub Pages, con Dashboard y 4 herramientas locales: unir PDF,
eliminar páginas PDF, Word→PDF y PDF→Word. Motores en navegador: `pdf-lib` para
manipulación PDF, `pdfjs-dist` + worker local para render/extracción,
`docx-preview` + `jspdf`/`html2canvas` para docx→pdf, y `pdfjs-dist` + `docx`
para pdf→docx. Sin backend, sin subidas, interfaz en español con flujo de
3 pasos por herramienta.

## Technical Context

**Language/Version**: TypeScript 5.x + React 18+ (Vite 5/6)

**Primary Dependencies**: `react-router-dom` (HashRouter), Tailwind CSS,
`lucide-react`, `pdf-lib`, `pdfjs-dist`, `@dnd-kit/core` + `@dnd-kit/sortable`,
`react-dropzone`, `docx-preview`, `jspdf` + `html2canvas`, `docx`

**Storage**: N/A — solo memoria del navegador; sin persistencia (al recargar o
"Empezar de nuevo" todo se descarta, FR-024/Assumptions)

**Testing**: Vitest + React Testing Library para unitarias de motores puros
(rangos, nombres, agrupación de texto) y componentes; verificación manual
guiada por `quickstart.md` para flujos e2e (ver research R7)

**Target Platform**: Navegadores modernos (Chrome/Edge/Firefox/Safari,
escritorio prioritario + móvil con selector de archivos); hosting estático
GitHub Pages

**Project Type**: Web SPA estática (sin backend)

**Performance Goals**: Interfaz siempre respondiendo durante operaciones
(FR-023); progreso por archivo/página; unión de 3 PDF descargada en <3 min
(SC-001); render de miniaturas paginado/progresivo

**Constraints**: Zero-server (ningún byte de documento sale del navegador);
build 100% estática; `HashRouter` + `base: './'`; UI íntegramente en español;
liberar `ObjectURL`/buffers tras descarga o reset; advertencia suave ≥50 MB
por archivo sin bloqueo (FR-029)

**Scale/Scope**: 5 rutas (Dashboard + 4 herramientas), ~10 componentes
compartidos, 4 módulos de herramienta, referencia típica PDF ~500 páginas /
.docx ~20 MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|-----------|------------|
| I. Zero-Server (NON-NEGOTIABLE) | PASS — todas las dependencias elegidas ejecutan en el navegador (`pdf-lib`, `pdfjs-dist`, `docx-preview`, `jspdf`, `html2canvas`, `docx`); prohibidas llamadas de red con documentos; `quickstart.md` incluye verificación offline |
| II. GitHub Pages estático (NON-NEGOTIABLE) | PASS — build Vite estática, `HashRouter`, `base: './'`, worker PDF.js servido como asset relativo, workflow Actions `dist` → Pages |
| III. Marca y UX en español, flujo 3 pasos | PASS — Header/Footer/brand según FR-001–FR-004, Dropzone + configuración visual + progreso/descarga en las 4 herramientas, título/favicon por FR-027/FR-028 |
| IV. Memoria y rendimiento | PASS — helper central de descarga con `revokeObjectURL`, render/extracción paginada y motores pesados fuera del hilo principal donde aplique |
| V. Modularidad escalable | PASS — `src/tools/<herramienta>/` desacoplados + `src/components/` y `src/lib/` compartidos; nueva herramienta = nuevo módulo + registro de ruta |

Sin violaciones — no se requiere tabla de Complexity Tracking.

*Re-check post-Phase 1: el diseño mantiene los 5 gates (ver research.md R1–R8 y contratos de módulo).*

**Nota de discrepancia resuelta**: el input del plan sugería el título
"CTools | Herramientas PDF Locales"; prevalece la spec clarificada
(FR-027): "CTools | Herramientas PDF y Word 100% Locales".

## Project Structure

### Documentation (this feature)

```text
specs/001-ctools-mvp/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
ctools/
├── index.html                    # lang="es", título FR-027, favicon "C" (FR-028)
├── vite.config.ts                # base: './', worker PDF.js como asset relativo
├── public/
│   └── favicon-c.svg
├── src/
│   ├── main.tsx                  # bootstrap + estilos
│   ├── App.tsx                   # HashRouter + Header + Footer + rutas
│   ├── routes.tsx                # registro de las 5 rutas (contrato routes)
│   ├── components/               # UI base compartida
│   │   ├── Dropzone.tsx          # react-dropzone + validación de extensión
│   │   ├── FileCard.tsx          # miniatura + nombre + peso + páginas
│   │   ├── ThumbnailGrid.tsx     # cuadrícula numerada + overlay "X" roja
│   │   ├── RangeInput.tsx        # campo "1, 3, 5-8" <-> selección
│   │   ├── ProgressBar.tsx
│   │   ├── SuccessScreen.tsx     # descarga manual + "Empezar de nuevo"
│   │   ├── PrivacyBadge.tsx / Alert.tsx   # Header/Footer viven en App.tsx
│   ├── tools/                    # módulos desacoplados (uno por herramienta)
│   │   ├── merge/                # Unir PDF (dnd-kit sortable + pdf-lib)
│   │   ├── remove-pages/         # Eliminar páginas (pdf-lib + pdfjs)
│   │   ├── word-to-pdf/          # docx-preview + jspdf/html2canvas
│   │   └── pdf-to-word/          # pdfjs getTextContent + docx
│   ├── lib/                      # motores y utilidades compartidas
│   │   ├── pdf-engine.ts         # unir / filtrar páginas (pdf-lib)
│   │   ├── pdf-render.ts         # miniaturas canvas + worker local (pdfjs)
│   │   ├── pdf-text.ts           # extracción y agrupación por coordenadas
│   │   ├── docx-to-pdf.ts        # render A4 + impresión a PDF
│   │   ├── pdf-to-docx.ts        # empaquetado .docx
│   │   ├── download.ts           # Blob + descarga + revokeObjectURL
│   │   ├── range-parser.ts       # "1, 3, 5-8" <-> Set<number>
│   │   └── filenames.ts          # sufijos *_unido_CTools.pdf, *_CTools.*
│   └── styles/                   # tailwind (fondo #F5F5FA, acento #E5322D)
├── .github/workflows/deploy.yml  # build dist → GitHub Pages en push a main
└── tests/                        # vitest: lib/ (rangos, nombres, agrupación)
```

**Structure Decision**: proyecto único Vite (SPA). Cada herramienta es un
módulo en `src/tools/<nombre>/` que solo depende de `src/components/` y
`src/lib/`; añadir herramientas futuras no toca las existentes, solo
`src/routes.tsx`.

## Complexity Tracking

Sin violaciones constitucionales — tabla omitida.
