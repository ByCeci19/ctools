# Research: CTools — Experiencia móvil y táctil

**Feature**: `specs/002-mobile-ux/spec.md` | **Date**: 2026-10-15

La feature es puramente presentacional: cero cambios en motores, rutas,
formatos o avisos. Todo se resuelve con CSS responsive (Tailwind v3,
mobile-first) + estado local mínimo (menú abierto/cerrado) + 2 helpers de
lógica pura testeables. Verificaciones de estado actual en código entre
paréntesis.

## R1. Punto de corte: `md:` de Tailwind (= 768 px)

- **Decision**: Variante compacta por debajo de 768 px con clases
  `md:` (mobile-first); sin breakpoints personalizados ni JS de
  `matchMedia`.
- **Rationale**: Coincide exacto con lo aclarado (FR-001, corte <768 px);
  Tailwind v3 trae `md: 768px` por defecto (`tailwind.config.js` no
  redefine `screens`); CSS puro = sin listeners, sin fugas, funciona con
  JS desactivado tras carga.
- **Alternatives considered**: `matchMedia` en JS (re-render + listeners
  que limpiar — rechazado), breakpoint 640 px (dejaría tablets de 768 px
  con layout de teléfono apretado — rechazado en clarify).

## R2. Menú hamburguesa en cabecera

- **Decision**: `useState` local en `Header` (`App.tsx`): botón
  `md:hidden` con `aria-expanded`/`aria-controls` que despliega panel con
  los 4 `NavLink` existentes; el panel se cierra al navegar (`onClick`),
  con `Escape` y al pasar a escritorio. Navegación desktop intacta
  (`hidden md:flex`).
- **Rationale**: Reutiliza `TOOLS` y `NavLink` (activo resaltado gratis);
  sin librerías; accesible por teclado.
- **Alternatives considered**: Selector `<select>` (menos descubrible,
  peor táctil — rechazado), bottom-tab-bar (cambia desktop si se
  comparte código; además el spec pide hamburguesa — rechazado).

## R3. Dropzone con texto táctil (sin JS)

- **Decision**: Dos `<span>` conmutados por CSS (`md:hidden` /
  `hidden md:inline`): "Toca para seleccionar archivos" + botón grande en
  móvil; texto de arrastrar actual en escritorio. El `<input type=file>`
  nativo abre el selector del sistema en táctil sin código extra.
- **Rationale**: Cero lógica, cero riesgo; el input real ya es
  grande/tocable al ocupar toda la zona (cursor-pointer).
- **Alternatives considered**: `matchMedia` + props (complejidad
  innecesaria — rechazado).

## R4. Reordenado en Unir: botones + DnD táctil

- **Decision**: (a) Helpers puros `moveUp`/`moveDown` en la vista con
  botones visibles solo en móvil (`md:hidden`), etiquetas
  "Subir"/"Bajar" + `aria-label` con nombre de archivo. (b) Añadir
  `TouchSensor` de dnd-kit con `delay: 250ms, tolerance: 5px` junto al
  `PointerSensor` actual: la pulsación mantenida arrastra, el scroll
  normal no dispara arrastre.
- **Rationale**: Los botones garantizan SC-003 sin depender del gesto;
  el `TouchSensor` con retardo es el patrón documentado de dnd-kit para
  convivir con scroll. Hoy solo hay `PointerSensor` (+ teclado), que en
  táctil compite con el scroll.
- **Alternatives considered**: Solo botones (pierde paridad con
  escritorio — rechazado), solo DnD táctil (frustración al hacer scroll
  — rechazado por el spec).

## R5. Barra de rangos fija arriba en Eliminar

- **Decision**: El bloque de rangos+contador (`RangeInput` + contador) se
  vuelve `sticky` bajo la cabecera solo en móvil (`max-md:sticky
  top-[altura-cabecera]`, z bajo la cabecera `z-10`). La cuadrícula ya es
  de 2 columnas en teléfono (`grid-cols-2`, verificado) — no se toca.
- **Rationale**: `position: sticky` es CSS puro (sin listeners de
  scroll); separa los dos elementos fijos (rangos arriba, acción abajo,
  FR-007) sin solapes.
- **Alternatives considered**: Rangos sobre la barra inferior (colisiona
  con teclado virtual — rechazado), rangos al final del scroll (rompe
  FR-007 — rechazado).

## R6. Sticky bottom bar compartida

- **Decision**: Nuevo `src/components/StickyActionBar.tsx` (constitución
  V): `fixed bottom-0 md:hidden`, visible solo en fase configuración con
  archivos; `padding-bottom: env(safe-area-inset-bottom)`; cada vista
  añade espaciador inferior (`pb-28 md:pb-0`) para no tapar contenido
  (FR-010). El botón en flujo se oculta en móvil (`md:` inverso) para no
  duplicar: un solo botón lógico, dos renderizados excluyentes.
- **Rationale**: Un componente evita cuadruplicar el patrón; CSS fijo sin
  JS de scroll; safe-area cubre notch.
- **Alternatives considered**: `sticky` en flujo (exige reordenar el DOM
  y falla con scroll largo — rechazado), barra también en escritorio
  (viola FR-012 — rechazado).

## R7. Contención de ancho en conversiones

- **Decision**: Auditoría de clases en las 2 vistas: `min-w-0` en hijos
  flex, `truncate`/`break-words` en nombres, `max-w-full` en tarjetas;
  sin scroll-x verificado a 360 px (SC-004).
- **Rationale**: El desbordamiento típico viene de flex-items que no
  encogen (`min-width: auto`) y nombres largos sin corte; fix CSS local.
- **Alternatives considered**: `overflow-x-hidden` en body (enmascara el
  síntoma y rompe sticky — rechazado).

## R8. Testing

- **Decision**: Vitest para lógica pura nueva (`moveUp`/`moveDown`,
  helpers si los hay) + apertura/cierre del menú con Testing Library;
  layout verificado por guía manual `quickstart.md` (DevTools 360 px +
  dispositivo real), igual que R9 de 001-ctools-mvp.
- **Rationale**: jsdom no tiene layout: los media queries y sticky no son
  testeables unitariamente; la guía manual es el canal e2e del proyecto.
- **Alternatives considered**: Playwright con viewports (diferido a
  post-MVP como en 001 — rechazado por coste).
