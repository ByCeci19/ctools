# Implementation Plan: CTools — Experiencia móvil y táctil

**Branch**: `002-mobile-ux` | **Date**: 2026-10-15 | **Spec**: `specs/002-mobile-ux/spec.md`

**Input**: Feature specification from `/specs/002-mobile-ux/spec.md`

## Summary

Adaptar las 5 vistas de CTools a pantallas <768 px sin tocar
funcionalidad: cabecera con menú hamburguesa, Dropzone táctil, tarjetas
de Unir compactas con botones Subir/Bajar + DnD por pulsación mantenida,
rangos fijos arriba en Eliminar, contención de ancho en conversiones y
nuevo `StickyActionBar` compartido con el botón principal fijo abajo.
Todo con CSS mobile-first (`md:` Tailwind) + estado local mínimo;
escritorio intacto por construcción (variantes excluyentes).

## Technical Context

**Language/Version**: TypeScript 5.x + React 18+ (Vite 6, igual que 001)

**Primary Dependencies**: Las ya instaladas (`react-router-dom`,
Tailwind v3, `lucide-react`, `@dnd-kit/*` con `TouchSensor`); sin
dependencias nuevas

**Storage**: N/A — sin estado persistente (igual que 001)

**Testing**: Vitest + Testing Library para lógica pura nueva
(`moveUp`/`moveDown`, menú) y componentes; guía manual `quickstart.md`
a 360 px + dispositivo real para layout (R8)

**Target Platform**: Teléfonos (~360–390 px) y tablets verticales
(~768–820 px); escritorio ≥768 px sin cambios

**Project Type**: Web SPA estática (sin backend), mismo proyecto `ctools/`

**Performance Goals**: Cero JS de scroll/resize (todo CSS); sin
regresión de peso de bundle relevante (1 componente + clases)

**Constraints**: Zero-server y Pages estático (heredados); corte <768 px
(`md:`); safe-area en barra fija; sin `overflow-x-hidden` global;
español y accesibilidad conservados

**Scale/Scope**: 5 vistas + 1 componente nuevo + retoques en
`Dropzone`/`FileCard`/`RangeInput`/4 vistas/`App.tsx`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio | Evaluación |
|-----------|------------|
| I. Zero-Server (NON-NEGOTIABLE) | PASS — solo CSS + estado local; cero red nueva |
| II. Pages estático (NON-NEGOTIABLE) | PASS — sin cambios de rutas/router; `md:` compila a CSS estático |
| III. Marca y UX en español, flujo 3 pasos | PASS — mismos textos/flujos; variantes solo visuales |
| IV. Memoria y rendimiento | PASS — sin ObjectURLs/buffers nuevos; sin listeners de scroll (sticky/fixed CSS) |
| V. Modularidad escalable | PASS — `StickyActionBar` compartido en `src/components/`; vistas solo lo consumen |

Sin violaciones — no se requiere tabla de Complexity Tracking.

*Re-check post-Phase 1: el diseño mantiene los 5 gates (research R1–R8, contratos responsive).*

## Project Structure

### Documentation (this feature)

```text
specs/002-mobile-ux/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── responsive.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
ctools/
├── src/
│   ├── App.tsx                   # Header con menú hamburguesa (md:hidden)
│   ├── components/
│   │   ├── StickyActionBar.tsx   # NUEVO: barra fija inferior compartida
│   │   ├── Dropzone.tsx          # Texto táctil solo móvil (spans CSS)
│   │   ├── FileCard.tsx          # Variante compacta + Subir/Bajar (md:hidden)
│   │   ├── RangeInput.tsx        # (contenedor sticky lo pone la vista)
│   │   └── ThumbnailGrid.tsx     # Sin cambios (ya 2 cols en móvil)
│   ├── tools/
│   │   ├── merge/MergePage.tsx       # moveUp/moveDown + TouchSensor + barra
│   │   ├── remove-pages/RemovePagesPage.tsx  # rangos fijos arriba + barra
│   │   ├── word-to-pdf/WordToPdfPage.tsx     # contención ancho + barra
│   │   └── pdf-to-word/PdfToWordPage.tsx     # contención ancho + barra
│   └── (motores en src/lib/ sin cambios)
└── tests/                        # vitest: lógica pura nueva + menú
```

**Structure Decision**: mismo proyecto único Vite de 001; un componente
compartido nuevo + retoques por vista; ninguna herramienta toca a otra.

## Complexity Tracking

Sin violaciones constitucionales — tabla omitida.
