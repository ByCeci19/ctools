# Tasks: CTools — Full Stack Upgrade Without Regression

**Input**: Design documents from `/specs/003-stack-upgrade/` (spec.md + clarificaciones 2026-10-15, plan.md, research.md R1–R9, data-model.md, contracts/upgrade-targets.md, quickstart.md).

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md — todos disponibles.

**Tests**: No se crean pruebas nuevas (decisión de clarificación: solo adaptar las existentes). Las tareas de verificación manual referencian pasos de `quickstart.md`.

**Organization**: Fases por historia de usuario (US1–US5 del spec). La subida técnica vive en Setup + Foundational (bloqueante); cada historia posterior es verificación independiente.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: paralelizable (distintos ficheros, sin dependencias).
- **[Story]**: historia del spec a la que pertenece la tarea.

## Phase 1: Setup (infraestructura compartida)

**Purpose**: Fijar la baseline pre-upgrade y el entorno antes de tocar dependencias.

- [X] T001 Registrar baseline en `ctools/`: versiones actuales de `ctools/package.json` y salida verde de `npm ci && npm test && npm run build` como referencia de comparación.
- [X] T002 [P] Confirmar toolchain disponible: `node --version` (objetivo CI 24 LTS) y npm funcional para `ctools/package-lock.json`.
- [X] T003 [P] Inventariar toques (solo lectura): `grep -rn react-router-dom ctools/src ctools/tests`, clases Tailwind afectadas y refs al worker en `ctools/src/lib/pdf-render.ts` y `ctools/vite.config.ts`.

---

## Phase 2: Foundational (prerrequisitos bloqueantes)

**Purpose**: Subida completa del stack con puerta verde tras cada grupo (R9). Nada de historias hasta G1–G3 en verde.

**⚠️ CRITICAL**: Ninguna tarea de historias (US1–US5) puede empezar hasta completar esta fase.

### Grupo 1 — Toolchain (R2 parcial, R3, R4, R6, R8)

- [X] T004 Actualizar `ctools/package.json` según `contracts/upgrade-targets.md` §1: quitar `react-router-dom`/`autoprefixer`/`postcss`, añadir `react-router` v8 + `@tailwindcss/vite` 4.3.x y subir toolchain (Vite 8.3.x, plugin-react 6.x —peers vite ^8—, Tailwind 4.3.x, TS 7.0.x estable, `@types/react` 19, Vitest 5.x, TLR/jsdom compatibles). Resuelto: react 19.3.1, router 8.4.0, vite 8.3.4, tailwind 4.3.3, TS 7.0.2, vitest 5.0.4, pdfjs 6.4.299, jspdf 3.0.4 (línea contrato).
- [X] T005 Regenerar `ctools/package-lock.json` mediante instalación (`npm install` en `ctools/`), sin edición manual. Resuelto limpio (176 paquetes; el lockfile previo de era-v6 bloqueaba ERESOLVE, se regeneró desde cero).
- [X] T006 Actualizar `ctools/vite.config.ts`: plugins React 5 + Tailwind v4, conservando `base: './'`, `worker: { format: 'es' }` y el bloque `test` (`globals`, `jsdom`, `setupFiles`). Hecho con plugin-react 6.x (línea que empareja Vite 8) + `@tailwindcss/vite`; resto intacto.
- [X] T007 Migrar `ctools/src/styles/tailwind.css` a `@import "tailwindcss"` + bloque `@theme` con los 4 tokens (`#F5F5FA`, `#E5322D`, `#B71F1B`, sombra `card`) y eliminar `ctools/tailwind.config.js` y `ctools/postcss.config.js`. Hecho; tokens verificados contra clases en uso (accent/accent-dark/canvas/shadow-card).
- [X] T008 Actualizar `ctools/tsconfig.app.json` y `ctools/tsconfig.node.json` a compatibilidad TS 6/7 manteniendo `strict`, `noUnusedLocals`, `noUnusedParameters`, `jsx: react-jsx`. Verificado con tsc 7.0.2 (`--showConfig` válido en ambas): sin cambios necesarios, estricto intacto.
- [X] T009 Actualizar `.github/workflows/deploy.yml`: `node-version: 24`. Hecho (era 20).
- [ ] T010 Puerta G1 toolchain: `npm run build` en `ctools/` en verde con `ctools/dist` generada. INTENTO 2026-10-15: toolchain OK (Vite 8 transforma 2363 módulos, CSS v4 21 kB, worker pdfjs6 1.26 MB empaquetado) pero build ROJA por causa única `react-router-dom` irresoluble desde `src/App.tsx` → alcance T011 (grupo 2). Reintentar tras T011; verificar en T014.

### Grupo 2 — Runtime + `src/` (R1, R2, R5)

- [ ] T011 Migrar imports del enrutador a `"react-router"` en `ctools/src/App.tsx`, `ctools/src/routes.tsx` y `ctools/src/tools/dashboard/Dashboard.tsx` (R1: `HashRouter/Link/NavLink/Navigate/useRoutes/RouteObject`).
- [ ] T012 Subir `pdfjs-dist` a 6.x y verificar `ctools/src/lib/pdf-render.ts` (`?url` + `GlobalWorkerOptions.workerSrc`); retrabajo del worker si 6.x lo exige, API del módulo intacta (R5).
- [ ] T013 Subir resto del runtime (jspdf 3.x, pdf-lib, docx, docx-preview, html2canvas, dnd-kit, lucide-react, react-dropzone) y corregir usos/tipos rotos en `ctools/src/lib/` y `ctools/src/components/`.
- [ ] T014 Puerta G1 runtime: `npm run build` en `ctools/` en verde tras el runtime.

### Grupo 3 — Tests existentes (R7)

- [ ] T015 Adaptar los 6 ficheros de `ctools/tests/` a Vitest 5 / React 19 sin añadir pruebas nuevas.
- [ ] T016 Puertas G2+G3: `npm test` (`vitest run`) en verde sin fallos y `npm ci` limpio en `ctools/`.

**Checkpoint**: Stack nuevo instalado, compilando y con tests en verde — la verificación por historias puede empezar.

---

## Phase 3: User Story 1 — 5 vistas igual que antes (Priority: P1) 🎯 MVP

**Goal**: Cero regresión funcional ni visual en Dashboard + 4 herramientas (FR-012, SC-002/SC-003).

**Independent Test**: Recorrer las 5 vistas con archivos de la spec 001 y confirmar mismos textos, pasos, avisos, nombres de descarga y calidad que la baseline T001.

- [ ] T017 [P] [US1] Verificar Dashboard + Unir PDF según `quickstart.md` paso 5 (tarjetas, reorden, `*_unido_CTools.pdf`, mínimo 2 archivos; cronometrar la unión, esperado < 3 min según SC-001).
- [ ] T018 [P] [US1] Verificar Eliminar páginas según `quickstart.md` paso 5 (cuadrícula, clic + rangos `1, 3, 5-8`, bloqueo de todas-marcadas).
- [ ] T019 [P] [US1] Verificar Word→PDF y PDF→Word según `quickstart.md` paso 5 (fidelidad, avisos de escaneado/contraseña/formato inválido/`.doc`).

**Checkpoint**: US1 verificada — la app se comporta igual que antes del upgrade.

---

## Phase 4: User Story 2 — Instalar, probar y compilar en verde (Priority: P1)

**Goal**: Reproducibilidad desde cero del nuevo stack (FR-011, SC-006).

**Independent Test**: En copia limpia, `npm ci && npm test && npm run build` terminan con salida cero al primer intento.

- [ ] T020 [US2] Validación en sala limpia: borrar `ctools/node_modules` y `ctools/dist`, ejecutar `npm ci && npm test && npm run build` y confirmar G1–G3 en verde.
- [ ] T021 [US2] Cazar restos obsoletos: `grep -rn react-router-dom|tailwind.config|autoprefixer|postcss.config` en `ctools/src`, `ctools/tests`, configs y `ctools/package-lock.json`; resultado vacío.

**Checkpoint**: US1 + US2 verificadas — MVP completo (upgrade funcional con paridad).

---

## Phase 5: User Story 3 — Subruta y sin conexión (Priority: P2)

**Goal**: Despliegue estático intacto y cero red con documentos (FR-002, FR-014, SC-005/SC-008).

**Independent Test**: App servida desde subruta navega las 5 vistas con recarga; con tráfico inspeccionado no hay peticiones con documentos y funciona offline.

- [ ] T022 [P] [US3] Servir `ctools/dist` desde subruta y recorrer las 5 vistas con recarga directa según `quickstart.md` paso 4 (G4).
- [ ] T023 [P] [US3] Inspeccionar tráfico procesando documentos reales y repetir offline tras la primera carga según `quickstart.md` paso 6 (G5).

**Checkpoint**: US3 verificada — constituciones I y II intactas.

---

## Phase 6: User Story 4 — Experiencia móvil 002 intacta (Priority: P2)

**Goal**: Variante < 768 px idéntica a la spec 002 y escritorio sin cambios (FR-013, SC-004).

**Independent Test**: En ventana < 768 px aparecen menú compacto, Subir/Bajar, 2 columnas y barra fija sin scroll horizontal; en escritorio nada de eso existe.

- [ ] T024 [US4] Matriz móvil/escritorio según `quickstart.md` paso 7 en las 4 herramientas con archivos cargados (G6).

**Checkpoint**: US4 verificada — sin regresión móvil ni de escritorio.

---

## Phase 7: User Story 5 — Grandes sin fugas ni bloqueos (Priority: P3)

**Goal**: Progreso, cancelación y liberación de memoria intactos tras el cambio de motores (FR-004, SC-007).

**Independent Test**: Archivo grande procesa con progreso visible, permite cancelar y rinde igual en usos repetidos.

- [ ] T025 [US5] Prueba de archivo grande (incluido aviso suave ≥ 50 MB) con descargar + "Empezar de nuevo" ×2 según `quickstart.md` paso 8 (G7).

**Checkpoint**: Todas las historias verificadas independientemente.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cierre global y garantía de alcance.

- [ ] T026 Pasar `quickstart.md` pasos 1–8 de principio a fin como validación final end-to-end.
- [ ] T027 Confirmar `ctools/package-lock.json` sincronizado (`npm ci` reproduce el árbol) y sin dependencias huérfanas (`react-router-dom`, `autoprefixer`, `postcss` fuera salvo exigencia transitiva).
- [ ] T028 Revisar el diff final contra `data-model.md` §2–§4: solo ficheros del inventario, cero cambios fuera de contrato y re-check constitucional I–V en PASS.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias — inicio inmediato.
- **Foundational (Phase 2)**: depende de Setup — BLOQUEA todas las historias; orden interno grupos 1→2→3 con puertas T010/T014/T016.
- **User Stories (Phases 3–7)**: dependen de Foundational; entre sí son independientes (verificación por historia).
- **Polish (Phase 8)**: depende de US1–US5 verificadas.

### User Story Dependencies

- **US1 (P1)**: tras Foundational, sin dependencias de otras historias.
- **US2 (P1)**: tras Foundational, independiente de US1 (sala limpia).
- **US3 (P2)**: tras Foundational, independiente (requiere `ctools/dist` de T014/T016).
- **US4 (P2)**: tras Foundational, independiente.
- **US5 (P3)**: tras Foundational, independiente.

### Within Each User Story

- Verificación manual por herramienta antes de dar la historia por cerrada; cualquier diff reabre la tarea Foundational correspondiente (no se maquilla el invariante).
- Historia completa antes de pasar a la siguiente prioridad (salvo paralelización por capacidad).

### Parallel Opportunities

- T002 ∥ T003 (archivos distintos, solo lectura/versión).
- T017 ∥ T018 ∥ T019 (herramientas distintas sobre la misma build).
- T022 ∥ T023 (servir/navegar vs. inspeccionar tráfico, distinto foco).
- Con equipo: US1–US5 verificables en paralelo tras Foundational.

---

## Parallel Example: User Story 1

```bash
# Tres verificadores en paralelo sobre la misma ctools/dist (quickstart.md paso 5):
Task: "T017 [US1] Dashboard + Unir PDF"
Task: "T018 [US1] Eliminar páginas (rangos 1, 3, 5-8)"
Task: "T019 [US1] Word→PDF y PDF→Word + avisos"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Completar Phase 1 (Setup: T001–T003).
2. Completar Phase 2 (Foundational: T004–T016, puertas G1–G3).
3. Completar Phase 3 (US1: T017–T019) + Phase 4 (US2: T020–T021).
4. **STOP and VALIDATE**: paridad total + reproducibilidad desde cero.
5. Solo entonces, fases P2/P3.

### Incremental Delivery

Setup → Foundational → US1+US2 (MVP) → US3 → US4 → US5 → Polish; cada incremento verifica sin romper el anterior (FR-010: sin nuevas features que interfieran).

---

## Notes

- Rutas exactas: todo el trabajo vive en `ctools/` salvo `.github/workflows/deploy.yml`.
- Condicional T012: si pdfjs-dist 6.x no exige retrabajo, la tarea se reduce a subir + verificar.
- Si T010/T014/T016 fallan, depurar dentro de su grupo (R9) sin avanzar.
- Commits tras cada tarea o grupo lógico; `package-lock.json` siempre regenerado, nunca editado a mano.

## Totals

- **28 tareas**: Setup 3 · Foundational 13 · US1 3 · US2 2 · US3 2 · US4 1 · US5 1 · Polish 3.
- **Paralelo**: T002–T003, T017–T019, T022–T023 (+ historias en paralelo con equipo).
- **Formato**: 28/28 tareas con checkbox + ID secuencial + `[P]` solo si paralelizable + `[USn]` solo en fases de historia + ruta/artefacto exacto en la descripción.
