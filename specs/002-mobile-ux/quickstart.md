# Quickstart: validación móvil de CTools

**Feature**: `specs/002-mobile-ux/spec.md` | **Date**: 2026-10-15

## Prerrequisitos

- `npm ci`, `npm run dev` (o `npm run build && npm run preview`).
- DevTools en 360×800 y, si es posible, un teléfono y una tablet
  vertical reales. Fixtures de 001 (PDFs, .docx).

## Escenarios (mapeo a Success Criteria)

1. **Menú** (SC-001): a 360 px, abrir menú hamburguesa → saltar a las 4
   herramientas y volver; el menú cierra solo. A ≥768 px, cabecera
   completa sin menú.
2. **Dropzone** (SC-002): en cada herramienta vacía a 360 px, texto
   "Toca para seleccionar…" + botón grande; en escritorio, texto de
   arrastrar.
3. **Reordenar** (SC-003): 3 PDF en Unir a 360 px → reordenar SOLO con
   Subir/Bajar y unir; repetir con pulsación mantenida; scroll normal no
   debe arrastrar tarjetas.
4. **Sin scroll-x** (SC-004): las 5 vistas a 360 px en los 4 pasos
   (vacía, cargada, procesando, éxito): cero desplazamiento horizontal.
5. **Barra fija** (SC-005): con archivos a 360 px, el botón principal
   fijo abajo y pulsable con scroll; sin archivos no hay barra; en
   éxito/procesando no hay barra duplicada; no tapa contenido (borde
   inferior visible).
6. **Regresión escritorio** (SC-006): las 5 vistas a ≥1024 px idénticas
   en lo visual y funcional (sin botones Subir/Bajar, sin barra fija,
   sin menú).
7. **Primera tarea** (SC-007): persona nueva en teléfono completa unir o
   convertir al primer intento y localiza la descarga.

## Referencias

- Contratos: `contracts/responsive.md` · Estados: `data-model.md` ·
  Decisiones: `research.md`.
