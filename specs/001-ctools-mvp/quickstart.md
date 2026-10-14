# Quickstart: validación del MVP de CTools

**Feature**: `specs/001-ctools-mvp/spec.md` | **Date**: 2026-10-14

## Prerrequisitos

- Node.js 20+ y npm. Sin backend ni claves: todo es estático.
- Fixtures de prueba: 3 PDF multipágina, 1 PDF escaneado (solo imágenes),
  1 PDF con contraseña, 1 `.docx` con título/negrita/lista/tabla/imagen,
  1 `.doc` antiguo, 1 `.txt`.

## Puesta en marcha

```bash
npm ci
npm run dev      # desarrollo en http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/ como lo servirá Pages
```

## Escenarios de validación (mapeo a Success Criteria)

1. **Dashboard** (SC-010): abrir `#/`, ver bienvenida + 4 tarjetas + sello
   "100% Privado…"; navegar a cada herramienta y volver con el logo.
2. **Unir** (SC-001/SC-002): 3 PDF → reordenar por DnD → eliminar uno →
   añadir otro → "Unir PDF" → descarga `*_unido_CTools.pdf` con el orden
   elegido. Con 0–1 archivos el botón sigue deshabilitado.
3. **Eliminar** (SC-003/SC-004): PDF 8 páginas → marcar 1 y 3 con clic
   (overlay "X" roja, campo refleja "1, 3") → escribir "5-8" (miniaturas
   5–8 marcadas) → marcar todas → procesar bloqueado con aviso.
4. **Word→PDF** (SC-005): subir .docx → tarjeta "listo para convertir" →
   "Convertir a PDF" → PDF con estructura/listas/tabla/imagen en orden.
5. **PDF→Word** (SC-006/SC-007): PDF con texto → .docx editable con
   párrafos y saltos; PDF escaneado → aviso previo de escaneado.
6. **Rechazos** (SC-008): `.txt` en herramienta PDF, `.doc` (aviso de
   guardar como .docx), PDF con contraseña (error pidiendo PDF sin
   contraseña) → alertas sin bloquear.
7. **Offline** (SC-009): cargar una vez, cortar red, repetir 2–5 → todo
   funciona (cero subidas).
8. **Descarga y reset** (FR-024/FR-026): tras cada éxito, descarga auto +
   botón manual + "Empezar de nuevo" que vacía la herramienta; sin fugas
   entre usos (DevTools → sin ObjectURLs colgadas).
9. **Archivo grande** (FR-029): PDF ≥50 MB → advertencia suave, procesa
   igual con progreso y opción de cancelar (FR-030).

## Despliegue

Push a `main` → Actions compila y publica `dist/` en Pages. Verificar las
5 rutas con refresh (ninguna debe dar 404) y assets con rutas relativas.
