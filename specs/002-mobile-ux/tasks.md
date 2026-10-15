# Tasks: CTools — Experiencia móvil y táctil

**Input**: Design documents from `/specs/002-mobile-ux/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/responsive.md, quickstart.md

**Tests**: Vitest para lógica pura nueva (`moveUp`/`moveDown`, apertura de menú) según R8; layout verificado por guía manual `quickstart.md` a 360 px (jsdom no evalúa media queries ni sticky).

**Organization**: Tareas agrupadas por historia de usuario para implementación y test independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (distintos archivos, sin dependencias)
- **[Story]**: Historia usuaria (US1–US6 del spec)
- Todas incluyen rutas de archivo exactas

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Línea base verificada antes de tocar UI

- [X] T001 Verificar línea base en `ctools/` (`npm run build`, `npm run test`, 21 tests en verde) sin cambios

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Componente compartido que bloquea las 4 vistas

**⚠️ CRITICAL**: Ninguna historia empieza hasta completar esta fase

- [X] T002 Crear `StickyActionBar` compartido en `ctools/src/components/StickyActionBar.tsx` según `contracts/responsive.md` (fixed bottom, `md:hidden`, safe-area, props label/disabled/hint/onAction)
- [X] T003 Tests unitarios de `StickyActionBar` en `ctools/tests/unit/sticky-action-bar.test.tsx` (render condicional por `visible`, click, disabled)

**Checkpoint**: Foundation ready — las historias pueden implementarse en paralelo

---

## Phase 3: User Story 1 - Navegación con una mano (Priority: P1) 🎯 MVP

**Goal**: Cabecera compacta con menú hamburguesa bajo 768 px; escritorio intacto

**Independent Test**: A 360 px, abrir menú, saltar a las 4 herramientas y volver; a ≥768 px cabecera completa sin menú (quickstart escenario 1)

- [X] T004 [US1] Test de apertura/cierre del menú en `ctools/tests/unit/header-menu.test.tsx` (abre, navega y cierra, Escape)
- [X] T005 [US1] Implementar menú hamburguesa en `ctools/src/App.tsx` (estado local, `aria-expanded`, cierra al navegar, nav desktop intacta)

**Checkpoint**: US1 funcional y navegable en móvil y escritorio

---

## Phase 4: User Story 2 - Carga por toque (Priority: P1)

**Goal**: Dropzone con texto táctil y botón grande en móvil; arrastrar intacto en escritorio

**Independent Test**: Cada herramienta vacía a 360 px muestra "Toca para seleccionar…"; en escritorio texto de arrastrar (quickstart escenario 2)

- [X] T006 [P] [US2] Test de textos por variante en `ctools/tests/unit/dropzone.test.tsx` (spans móvil/escritorio presentes)
- [X] T007 [P] [US2] Implementar textos conmutados por CSS en `ctools/src/components/Dropzone.tsx` (R3, sin JS nuevo)

**Checkpoint**: US1 + US2 listas (entrada móvil completa)

---

## Phase 5: User Story 3 - Reordenar sin pelear con el scroll (Priority: P2)

**Goal**: Tarjetas compactas + Subir/Bajar solo móvil + DnD por pulsación mantenida

**Independent Test**: 3 PDF a 360 px, reordenar solo con botones y unir; repetir arrastrando; scroll normal no arrastra (quickstart escenario 3)

- [X] T008 [P] [US3] Tests unitarios de `moveUp`/`moveDown` en `ctools/tests/unit/merge-order.test.ts`
- [X] T009 [US3] Implementar variante compacta + botones Subir/Bajar (`md:hidden`) en `ctools/src/components/FileCard.tsx` (FR-004/FR-005)
- [X] T010 [US3] Integrar botones + `TouchSensor` (delay 250 ms, tolerancia 5 px) en `ctools/src/tools/merge/MergePage.tsx` (R4)

**Checkpoint**: Unir usable con una mano

---

## Phase 6: User Story 4 - Cuadrícula legible con rangos fijos (Priority: P2)

**Goal**: 2 columnas en teléfono (ya existe) + bloque rangos+contador fijo arriba

**Independent Test**: PDF 8 páginas a 360 px, marcar por clic y rangos con scroll sin tapados (quickstart escenario 4)

- [X] T011 [US4] Fijar bloque de rangos bajo cabecera solo en móvil en `ctools/src/tools/remove-pages/RemovePagesPage.tsx` (R5, `ThumbnailGrid.tsx` sin cambios)

**Checkpoint**: Eliminar usable en teléfono

---

## Phase 7: User Story 5 - Botón principal al alcance del pulgar (Priority: P2)

**Goal**: Sticky bottom bar en las 4 herramientas (solo config con archivos)

**Independent Test**: Con archivos a 360 px, botón fijo abajo y pulsable con scroll en las 4 vistas; sin archivos/procesando/éxito no hay barra (quickstart escenario 5)

- [X] T012 [P] [US5] Integrar `StickyActionBar` + espaciador inferior en `ctools/src/tools/merge/MergePage.tsx`
- [X] T013 [P] [US5] Integrar `StickyActionBar` + espaciador inferior en `ctools/src/tools/remove-pages/RemovePagesPage.tsx`
- [X] T014 [P] [US5] Integrar `StickyActionBar` + espaciador inferior en `ctools/src/tools/word-to-pdf/WordToPdfPage.tsx`
- [X] T015 [P] [US5] Integrar `StickyActionBar` + espaciador inferior en `ctools/src/tools/pdf-to-word/PdfToWordPage.tsx`

**Checkpoint**: Acción principal siempre visible en móvil

---

## Phase 8: User Story 6 - Conversiones sin scroll horizontal (Priority: P3)

**Goal**: Tarjetas contenidas al ancho en ambas conversiones

**Independent Test**: .docx y PDF cargados a 360 px en los 4 pasos: cero scroll-x (quickstart escenario 6)

- [X] T016 [P] [US6] Auditar y contener ancho en `ctools/src/tools/word-to-pdf/WordToPdfPage.tsx` (`min-w-0`, cortes de texto)
- [X] T017 [P] [US6] Auditar y contener ancho en `ctools/src/tools/pdf-to-word/PdfToWordPage.tsx` (`min-w-0`, cortes de texto)

**Checkpoint**: Las 6 historias funcionan independientes

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Validación móvil completa y regresión de escritorio

- [X] T018 Ejecutar validación guiada completa de `specs/002-mobile-ux/quickstart.md` escenarios 1–7 a 360 px
- [ ] T019 Verificación de regresión en escritorio ≥1024 px (5 vistas idénticas, sin botones/barra/menú móvil) + `npm run build`
- [ ] T020 Verificar deploy en GitHub Pages y vista móvil del sitio publicado

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — inicio inmediato
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEA todas las historias
- **User Stories (Phase 3–8)**: Dependen de Foundational; entre sí en paralelo o en orden P1 → P2 → P3
- **Polish (Phase 9)**: Depende de las historias que se quieran incluir

### User Story Dependencies

- **US1 Menú (P1)**: Tras Foundational, sin dependencias
- **US2 Dropzone (P1)**: Tras Foundational, independiente (solo `Dropzone.tsx`)
- **US3 Unir (P2)**: Tras Foundational, independiente (usa `StickyActionBar` en US5 aparte)
- **US4 Eliminar (P2)**: Tras Foundational, independiente
- **US5 Sticky bar (P2)**: Tras Foundational + T002; toca las 4 vistas
- **US6 Conversiones (P3)**: Tras Foundational, independiente

### Within Each User Story

- Tests antes que implementación (TDD donde haya test)
- Componente compartido antes que la vista que lo usa
- Lógica pura (`moveUp`/`moveDown`) antes que su cableado

### Parallel Opportunities

- [P] US2: T006, T007 en paralelo (archivos distintos; en TDD escribir el test primero)
- [P] US3: T008 en paralelo con T009 (distintos archivos)
- [P] US6: T016, T017 en paralelo (vistas distintas)
- Historias US1–US6 en paralelo tras Foundational (con equipo suficiente)

---

## Parallel Example: User Story 6

```bash
# Vistas distintas, sin dependencias:
Task: "Auditar y contener ancho en ctools/src/tools/word-to-pdf/WordToPdfPage.tsx"
Task: "Auditar y contener ancho en ctools/src/tools/pdf-to-word/PdfToWordPage.tsx"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Completar Phase 1: Setup (línea base verde)
2. Completar Phase 2: Foundational (CRÍTICO — `StickyActionBar`)
3. Completar Phase 3: US1 Menú + Phase 4: US2 Dropzone
4. **STOP and VALIDATE**: quickstart escenarios 1–2 a 360 px y en escritorio
5. Deploy/demo en Pages si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. + US1 + US2 → entrada móvil (navegar + cargar)
3. + US3 → unir con una mano
4. + US4 → eliminar legible
5. + US5 → acción siempre visible
6. + US6 → conversiones contenidas
7. Phase 9 Polish → validación 360 px + regresión escritorio + deploy

### Parallel Team Strategy

Con varios desarrolladores: juntos Setup + Foundational; después A: US1+US2, B: US3, C: US4, D: US5+US6. Cada historia integra sin tocar las demás (US5 toca las 4 vistas solo para la barra).

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- Etiqueta [USn] traza cada tarea a su historia del spec
- Límites textuales aplicados: corte <768 px (`md:`), botones Subir/Bajar solo móvil, sticky bar solo en config con archivos, rangos fijos arriba en Eliminar
- Commit tras cada tarea o grupo lógico; validar cada checkpoint antes de seguir
