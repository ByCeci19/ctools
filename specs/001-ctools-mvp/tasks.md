# Tasks: CTools MVP — Suite local de herramientas de documentos

**Input**: Design documents from `/specs/001-ctools-mvp/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Unitarias Vitest solo para lógica pura (`range-parser`, `filenames`, agrupación de texto) según decisión R9 del plan; flujos e2e por `quickstart.md`.

**Organization**: Tareas agrupadas por historia de usuario para implementación y test independientes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Puede correr en paralelo (distintos archivos, sin dependencias)
- **[Story]**: Historia usuaria (US1–US5 del spec)
- Todas incluyen rutas de archivo exactas

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold del proyecto y configuración base

- [X] T001 Crear scaffold Vite + React 18 + TypeScript estricto en `ctools/` con `package.json`, `tsconfig.json`, `vite.config.ts`
- [X] T002 Configurar `base: './'` y asset relativo del worker PDF.js en `ctools/vite.config.ts`
- [X] T003 Instalar dependencias en `ctools/package.json` (react-router-dom, tailwind, lucide-react, pdf-lib, pdfjs-dist, dnd-kit, react-dropzone, docx-preview, jspdf, html2canvas, docx, vitest)
- [X] T004 Configurar `index.html` en `ctools/index.html` (lang es, título FR-027, favicon C FR-028, `public/favicon-c.svg`)
- [X] T005 Configurar Tailwind con paleta (fondo `#F5F5FA`, acento `#E5322D`) en `ctools/src/styles/tailwind.css`
- [X] T006 Crear workflow de deploy a Pages en `ctools/.github/workflows/deploy.yml` (npm ci, build, dist en push a main)
- [X] T007 Configurar Vitest + React Testing Library en `ctools/vite.config.ts` y `ctools/tests/setup.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shell, rutas y librerías compartidas que bloquean todas las historias

**⚠️ CRITICAL**: Ninguna historia empieza hasta completar esta fase

- [X] T008 Crear registro de rutas HashRouter en `ctools/src/routes.tsx` según `contracts/routes.md`
- [X] T009 Crear shell App con Header/Footer en `ctools/src/App.tsx` (logo, nav 4 rutas, pie FR-003)
- [X] T010 Implementar `PrivacyBadge` en `ctools/src/components/PrivacyBadge.tsx` (texto FR-001)
- [X] T011 Implementar `Alert` de avisos en español en `ctools/src/components/Alert.tsx` (kinds de `UserNotice`)
- [X] T012 Implementar `Dropzone` con validación de extensión en `ctools/src/components/Dropzone.tsx` (FR-006/FR-007)
- [X] T013 Implementar `ProgressBar` con cancelar en `ctools/src/components/ProgressBar.tsx` (FR-023/FR-030)
- [X] T014 Implementar `SuccessScreen` (descarga auto + manual + reset) en `ctools/src/components/SuccessScreen.tsx` (FR-024/FR-026)
- [X] T015 Implementar helper de descarga con `revokeObjectURL` en `ctools/src/lib/download.ts` (FR-024/FR-026)
- [X] T016 Implementar sufijos de nombre en `ctools/src/lib/filenames.ts` (FR-025: `*_unido_CTools.pdf`, `*_CTools.*`)
- [X] T017 Implementar parser bidireccional de rangos en `ctools/src/lib/range-parser.ts` (`"1, 3, 5-8"` ↔ Set, FR-016)
- [X] T018 Implementar infraestructura de render PDF con worker local en `ctools/src/lib/pdf-render.ts` (miniaturas canvas, R4)
- [X] T019 Tests unitarios de `range-parser` y `filenames` en `ctools/tests/unit/range-filenames.test.ts`
- [X] T020 Verificar build estática y carga con rutas relativas en `ctools/dist/` (`npm run build && npm run preview`)

**Checkpoint**: Foundation ready — las historias pueden implementarse en paralelo

---

## Phase 3: User Story 1 - Dashboard (Priority: P1) 🎯 MVP

**Goal**: Página principal con bienvenida, 4 tarjetas y sello de privacidad

**Independent Test**: Abrir `#/`, ver bienvenida + 4 tarjetas + sello, navegar a cada ruta y volver con el logo (quickstart escenario 1)

- [X] T021 [US1] Crear página Dashboard en `ctools/src/tools/dashboard/Dashboard.tsx` (bienvenida, tarjetas, sello)
- [X] T022 [US1] Registrar ruta `#/` y enlazar tarjetas a las 4 herramientas en `ctools/src/routes.tsx`

**Checkpoint**: US1 funcional y navegable sin herramientas

---

## Phase 4: User Story 2 - Unir PDF (Priority: P1)

**Goal**: Cola de PDFs reordenable que genera un único PDF en el orden elegido

**Independent Test**: Unir 3 PDF reordenados por DnD con alta/baja y añadido, verificar orden y descarga `*_unido_CTools.pdf` (quickstart escenario 2)

- [X] T023 [US2] Implementar motor de unión con pdf-lib en `ctools/src/lib/pdf-engine.ts` (`mergeEngine`, FR-013)
- [X] T024 [US2] Crear `FileCard` (miniatura 1ª página, nombre, peso, nº páginas) en `ctools/src/components/FileCard.tsx` (FR-011)
- [ ] T025 [US2] Crear vista Unir con cola sortable dnd-kit en `ctools/src/tools/merge/MergePage.tsx` (FR-010/FR-012, mín. 2 archivos)
- [ ] T026 [US2] Integrar progreso, motor, SuccessScreen y avisos (contraseña, formato, ≥50 MB) en `ctools/src/tools/merge/MergePage.tsx`

**Checkpoint**: US1 + US2 funcionan independientes (MVP usable)

---

## Phase 5: User Story 3 - Eliminar páginas (Priority: P2)

**Goal**: Cuadrícula de miniaturas + campo de rangos sincronizados que genera el PDF filtrado

**Independent Test**: PDF 8 páginas, clic en 1 y 3, rango "5-8", intento de borrado total bloqueado (quickstart escenario 3)

- [ ] T027 [P] [US3] Implementar motor de filtrado con pdf-lib en `ctools/src/lib/pdf-engine.ts` (`filterEngine`, FR-018)
- [ ] T028 [P] [US3] Crear `ThumbnailGrid` con overlay "X" roja en `ctools/src/components/ThumbnailGrid.tsx` (FR-014/FR-015)
- [ ] T029 [P] [US3] Crear `RangeInput` bidireccional en `ctools/src/components/RangeInput.tsx` (FR-016/FR-017)
- [ ] T030 [US3] Crear vista Eliminar con sincronización visual↔rangos en `ctools/src/tools/remove-pages/RemovePagesPage.tsx`
- [ ] T031 [US3] Integrar progreso, motor, SuccessScreen y aviso `all-pages` en `ctools/src/tools/remove-pages/RemovePagesPage.tsx`

**Checkpoint**: US1–US3 independientes

---

## Phase 6: User Story 4 - Word a PDF (Priority: P2)

**Goal**: .docx con estado "listo para convertir" que genera un PDF fiel descargable

**Independent Test**: .docx con formato/lista/tabla/imagen → PDF con esos elementos en orden; .doc y .txt rechazados con aviso (quickstart escenarios 4 y 6)

- [ ] T032 [P] [US4] Implementar render A4 + paginado a PDF en `ctools/src/lib/docx-to-pdf.ts` (docx-preview + html2canvas + jspdf, R6)
- [ ] T033 [US4] Crear vista Word→PDF con tarjeta de preparación en `ctools/src/tools/word-to-pdf/WordToPdfPage.tsx` (FR-019)
- [ ] T034 [US4] Integrar progreso, cancelar, SuccessScreen y aviso `.doc` legacy en `ctools/src/tools/word-to-pdf/WordToPdfPage.tsx`

**Checkpoint**: US1–US4 independientes

---

## Phase 7: User Story 5 - PDF a Word (Priority: P3)

**Goal**: PDF con texto → .docx editable; PDF sin texto → aviso de escaneado

**Independent Test**: PDF 2 páginas → .docx con párrafos y saltos; PDF sin caracteres → aviso previo (quickstart escenarios 5 y 6)

- [ ] T035 [P] [US5] Implementar extracción y agrupación por coordenadas en `ctools/src/lib/pdf-text.ts` (getTextContent, líneas/párrafos/títulos, R7)
- [ ] T036 [P] [US5] Implementar empaquetado .docx en `ctools/src/lib/pdf-to-docx.ts` (librería docx, umbral cero caracteres FR-022)
- [ ] T037 [P] [US5] Tests unitarios de agrupación de texto en `ctools/tests/unit/pdf-text.test.ts`
- [ ] T038 [US5] Crear vista PDF→Word con aviso de escaneado en `ctools/src/tools/pdf-to-word/PdfToWordPage.tsx` (FR-021/FR-022)
- [ ] T039 [US5] Integrar progreso, cancelar, SuccessScreen y reintento en `ctools/src/tools/pdf-to-word/PdfToWordPage.tsx`

**Checkpoint**: Las 5 historias funcionan independientes

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verificación transversal de privacidad, memoria, idioma y despliegue

- [ ] T040 [P] Auditoría de memoria: verificar `revokeObjectURL` y limpieza en `ctools/src/lib/download.ts` y las 4 vistas (FR-026)
- [ ] T041 [P] Revisión de textos en español y tooltips de accesibilidad en `ctools/src/components/*.tsx` y `ctools/src/tools/*/*.tsx` (FR-004)
- [ ] T042 Verificación offline completa tras carga inicial según `specs/001-ctools-mvp/quickstart.md` escenario 7 (FR-005)
- [ ] T043 Ejecutar validación e2e guiada completa de `specs/001-ctools-mvp/quickstart.md` escenarios 1–9
- [ ] T044 Verificar deploy en GitHub Pages con refresh en las 5 rutas y assets relativos (plan § Despliegue)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sin dependencias — inicio inmediato
- **Foundational (Phase 2)**: Depende de Setup — BLOQUEA todas las historias
- **User Stories (Phase 3–7)**: Dependen de Foundational; entre sí en paralelo o en orden P1 → P2 → P3
- **Polish (Phase 8)**: Depende de las historias que se quieran incluir

### User Story Dependencies

- **US1 Dashboard (P1)**: Tras Foundational, sin dependencias
- **US2 Unir (P1)**: Tras Foundational, independiente de US1 (solo comparte shell y lib)
- **US3 Eliminar (P2)**: Tras Foundational, independiente (reutiliza `pdf-render.ts`, `range-parser.ts`)
- **US4 Word→PDF (P2)**: Tras Foundational, independiente (nuevo `docx-to-pdf.ts`)
- **US5 PDF→Word (P3)**: Tras Foundational, independiente (nuevos `pdf-text.ts`, `pdf-to-docx.ts`)

### Within Each User Story

- Motores `src/lib/` antes que vistas `src/tools/`
- Componentes compartidos nuevos antes que la vista que los usa
- Implementación antes que integración con SuccessScreen/avisos

### Parallel Opportunities

- [P] Setup: T004, T005, T006 en paralelo
- [P] Foundational: T010–T019 en paralelo tras T008/T009
- Historias US1–US5 en paralelo tras Foundational (con equipo suficiente)
- [P] US5: T035, T036, T037 en paralelo
- [P] Polish: T040, T041 en paralelo

---

## Parallel Example: User Story 5

```bash
# Motores y tests de US5 juntos (archivos distintos, sin dependencias):
Task: "Implementar extracción y agrupación por coordenadas en ctools/src/lib/pdf-text.ts"
Task: "Implementar empaquetado .docx en ctools/src/lib/pdf-to-docx.ts"
Task: "Tests unitarios de agrupación de texto en ctools/tests/unit/pdf-text.test.ts"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Completar Phase 1: Setup
2. Completar Phase 2: Foundational (CRÍTICO — bloquea historias)
3. Completar Phase 3: US1 Dashboard + Phase 4: US2 Unir
4. **STOP and VALIDATE**: quickstart escenarios 1–2 + descarga y reset
5. Deploy/demo en Pages si está listo

### Incremental Delivery

1. Setup + Foundational → base lista
2. + US1 → navegar (orientación)
3. + US2 → unir (primer valor real, MVP)
4. + US3 → eliminar páginas
5. + US4 → Word→PDF
6. + US5 → PDF→Word (suite completa)
7. Phase 8 Polish → verificación offline, memoria, deploy

### Parallel Team Strategy

Con varios desarrolladores: juntos Setup + Foundational; después A: US2, B: US3, C: US4, D: US5 (US1 cabe en cualquiera). Cada historia integra sin tocar las demás.

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- Etiqueta [USn] traza cada tarea a su historia del spec
- Límites textuales aplicados: `"1, 3, 5-8"` y `1 ≤ size ≤ pageCount − 1` (T017/T029), `*_unido_CTools.pdf` / `*_CTools.*` (T016), cero caracteres para `scanned` (T036), ≥50 MB advertencia sin bloqueo (T026/T031/T034/T039)
- Commit tras cada tarea o grupo lógico; validar cada checkpoint antes de seguir
