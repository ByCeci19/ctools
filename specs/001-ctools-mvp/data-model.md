# Data Model: CTools MVP

**Feature**: `specs/001-ctools-mvp/spec.md` | **Date**: 2026-10-14

Modelo en memoria (sin persistencia). Al recargar o "Empezar de nuevo" todo
se descarta. Los binarios viven como `Uint8Array`/`Blob` + `ObjectURL` de
vista; el helper `download.ts` los libera.

## Entidades

### Documento de entrada (InputDocument)

Archivo aportado por la persona usuaria.

| Campo | Tipo | Reglas |
|-------|------|--------|
| id | string (uuid) | Único por sesión |
| name | string | Nombre original |
| sizeBytes | number | ≥50 MB → advertencia suave FR-029, sin bloqueo |
| mime/ext | pdf \| docx | Solo la extensión de la herramienta; `.doc` → aviso FR-007 |
| status | pending \| ready \| error | `error` con motivo: formato \| contraseña \| ilegible |
| pageCount | number \| null | PDF vía pdfjs; docx: null (sin paginado previo) |
| bytes | Uint8Array | En memoria; se libera al resetear |
| previewUrl | string \| null | ObjectURL temporal para miniaturas |

Transiciones: `pending → ready` (validado) · `pending → error` (formato o
contraseña, con aviso y sin bloquear) · `ready → descartado` (reset).

### Cola de unión (MergeQueue)

| Campo | Tipo | Reglas |
|-------|------|--------|
| items | InputDocument[] (pdf, status=ready) | Mínimo 2 para habilitar "Unir PDF" (FR-010) |
| order | string[] (ids) | Define el orden de páginas del resultado; reordenable por DnD (FR-012) |

### Página de PDF (PdfPage)

| Campo | Tipo | Reglas |
|-------|------|--------|
| docId | string | Documento origen (Eliminar: un solo doc) |
| number | number (1-based) | Visible en la miniatura (FR-014) |
| thumbnailUrl | string | ObjectURL del canvas renderizado |
| markedForRemoval | boolean | Toggle por clic con overlay "X" roja (FR-015) |

### Selección de eliminación (RemovalSelection)

Conjunto de páginas a descartar, doble representación sincronizada (FR-016):

| Campo | Tipo | Reglas |
|-------|------|--------|
| pages | Set<number> (1-based) | `1 ≤ size ≤ pageCount − 1` (FR-017: queda ≥1 página) |
| expression | string | Gramática `"1, 3, 5-8"`; inválidos (`0`, `3-2`, `abc`, fuera de rango) se señalan sin aplicar |

### Documento resultado (OutputDocument)

| Campo | Tipo | Reglas |
|-------|------|--------|
| kind | merged-pdf \| filtered-pdf \| converted-pdf \| converted-docx | Según herramienta |
| filename | string | Base del primer/de entrada + sufijo: `*_unido_CTools.pdf`, `*_CTools.pdf`, `*_CTools.docx` (FR-025) |
| bytes | Uint8Array/Blob | Generado por el motor correspondiente |
| sourceLabel | string | Origen para trazar el nombre (p. ej. primer archivo de la cola) |

### Aviso al usuario (UserNotice)

| Campo | Tipo | Reglas |
|-------|------|--------|
| kind | invalid-format \| legacy-doc \| password \| all-pages \| invalid-range \| scanned \| large-file | Uno por causa; textos en español, amigables |
| blocking | boolean | Solo `all-pages` bloquea el procesado; el resto informa sin bloquear |

## Relaciones

- `MergeQueue` 1—N `InputDocument`; el orden de la cola determina el orden
  de páginas del `OutputDocument` merged-pdf.
- Herramienta Eliminar: 1 `InputDocument` — N `PdfPage` — 1
  `RemovalSelection` → 1 `OutputDocument` filtered-pdf.
- Conversiones: 1 `InputDocument` → (aviso `scanned` si cero caracteres,
  FR-022) → 1 `OutputDocument`.
- Cada herramienta termina en `SuccessScreen`: descarga (auto + manual,
  FR-024) y reset total (FR-024/FR-026).
