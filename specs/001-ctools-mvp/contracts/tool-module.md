# Contracts: módulo de herramienta

**Feature**: `specs/001-ctools-mvp/spec.md` | **Date**: 2026-10-14

Cada carpeta `src/tools/<nombre>/` expone el mismo contrato; añadir una
herramienta = nueva carpeta + una línea en `routes.tsx` (constitución V).

## Obligatorio por módulo

| Elemento | Contrato |
|----------|----------|
| `route` | Entrada en `routes.tsx` con hash de `contracts/routes.md` |
| `accept` | Extensiones aceptadas (`.pdf` o `.docx`); resto → `UserNotice` sin perder estado (FR-007) |
| `Dropzone` | Zona amplia + selector por clic al entrar (FR-006) |
| `ConfigStep` | Configuración visual: tarjetas reordenables, cuadrícula de miniaturas o estado "listo para convertir" (FR-009) |
| `engine(input) → OutputDocument` | `mergeEngine(queue)` · `filterEngine(doc, RemovalSelection)` · `docxToPdfEngine(doc)` · `pdfToDocxEngine(doc)` |
| `Progress` | Indicador durante el procesado + cancelar (FR-023, FR-030) |
| `SuccessScreen` | Intento de descarga auto + botón manual + "Empezar de nuevo" con limpieza total (FR-024, FR-026) |
| `notices` | `password` → error pidiendo PDF sin contraseña (FR-008) · `legacy-doc` (FR-007) · `large-file` ≥50 MB (FR-029) · `scanned` con cero caracteres (FR-022) · `all-pages` bloqueante (FR-017) |

## Prohibido por módulo

- Importar código de otro módulo de `src/tools/` (solo `src/components/`,
  `src/lib/` compartidos).
- Peticiones de red con contenido de documentos (constitución I).
- Persistir estado entre sesiones.
