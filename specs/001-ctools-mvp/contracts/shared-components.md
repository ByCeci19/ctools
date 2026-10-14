# Contracts: componentes compartidos

**Feature**: `specs/001-ctools-mvp/spec.md` | **Date**: 2026-10-14

Props mínimas (nombres orientativos) que todo módulo reutiliza sin
duplicar lógica.

## Dropzone

- In: `accept: ".pdf" | ".docx"`, `multiple: boolean`, `onFiles(File[])`,
  `onReject(reason: UserNotice)`.
- Muestra zona amplia destacada + selector por clic (FR-006); rechaza
  extensiones ajenas y `.doc` con su aviso (FR-007).

## FileCard

- In: `doc: InputDocument` (miniatura primera página, nombre, peso legible,
  nº páginas), `dragHandle`, `onRemove()`.
- Out (dnd-kit): reordenación en `MergeQueue` (FR-011/FR-012).

## ThumbnailGrid + RangeInput

- `ThumbnailGrid`: In `pages: PdfPage[]`, `onToggle(n)`; overlay "X" roja en
  marcadas, numeración 1-based (FR-014/FR-015).
- `RangeInput`: In `expression`, `pageCount`; Out `Set<number>`; parseo
  bidireccional `"1, 3, 5-8"` con señalización de inválidos (FR-016).
- Regla conjunta: `pages.size ≤ pageCount − 1` o aviso `all-pages` (FR-017).

## ProgressBar

- In: `value (0-100)`, `label` por archivo/página, `onCancel()` (FR-023,
  FR-030).

## SuccessScreen

- In: `output: OutputDocument`, `onDownload()` (reintento manual),
  `onReset()`.
- Intenta descarga automática al montar; botón manual siempre visible;
  "Empezar de nuevo" limpia binarios y ObjectURLs (FR-024, FR-026).

## Header / Footer / PrivacyBadge / Alert

- `Header`: logo "CTools" (C en `#E5322D`), nav a 4 rutas, volver a `#/`.
- `Footer`: texto FR-003 exacto.
- `PrivacyBadge`: texto FR-001 exacto, visible en Dashboard.
- `Alert`: avisos `UserNotice` en español, no bloqueantes salvo `all-pages`.
