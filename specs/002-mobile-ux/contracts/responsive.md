# Contracts: layout responsive móvil

**Feature**: `specs/002-mobile-ux/spec.md` | **Date**: 2026-10-15

Contratos UI (props y reglas de visibilidad). Todo lo no listado hereda
`contracts/` de 001-ctools-mvp. Corte: <768 px (`md:` Tailwind).

## `StickyActionBar` (nuevo, `src/components/`)

| Elemento | Contrato |
|----------|----------|
| `label: string` | Texto del botón principal en español |
| `disabled?: boolean` | Mismas reglas que el botón en flujo |
| `hint?: string` | Texto auxiliar (p. ej. "Añade al menos 2 archivos") |
| `onAction: () => void` | Mismo handler que el botón en flujo |
| Visibilidad | `fixed bottom-0 md:hidden`; solo si `visible` (fase config + hay archivos) |
| Safe-area | `padding-bottom: env(safe-area-inset-bottom)` |
| Prohibido | Duplicar el botón en flujo en móvil; mostrar sin archivos o fuera de configuración |

## Variantes por componente existente

| Componente | Contrato móvil |
|------------|----------------|
| `Header` (`App.tsx`) | Botón menú `md:hidden` con `aria-expanded/controls`; panel con los 4 `NavLink`; cierra al navegar/`Escape`; nav desktop `hidden md:flex` intacta |
| `Dropzone` | Texto táctil + botón grande solo móvil (spans `md:hidden`); texto arrastrar `hidden md:inline`; sin props nuevas obligatorias |
| `FileCard` (cola Unir) | Layout compacto apilado en móvil; botones Subir/Bajar `md:hidden` con `aria-label` ("Subir {nombre}") |
| `ThumbnailGrid` | Sin cambios (ya 2 columnas en teléfono) |
| `RangeInput` + contador | Contenedor `sticky` bajo cabecera solo móvil; sin cambios en escritorio |
| Vistas (4) | Espaciador inferior en móvil (`pb` para la barra); botón en flujo `max-md:hidden` donde lo absorba la barra; tarjetas con `min-w-0`/cortes (conversiones) |

## Prohibido por la feature

- Cambiar motores, rutas, formatos, avisos o textos de escritorio.
- `matchMedia`/listeners JS para el corte (solo CSS).
- `overflow-x-hidden` global como atajo.
