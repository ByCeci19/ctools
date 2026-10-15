# Quickstart: verificación del upgrade sin regresión

**Fecha**: 2026-10-15 | **Spec**: [spec.md](spec.md) | **Contrato**: [contracts/upgrade-targets.md](contracts/upgrade-targets.md). Guía de validación end-to-end; sin código de implementación.

## Requisitos

- Node 24 LTS (`node --version`), copia limpia del repo, navegador moderno actualizado, archivos de prueba de la spec 001 (PDF multipágina, `.docx` con formato, `.txt`, `.doc` antiguo, PDF con contraseña, PDF escaneado, archivo ≥ 50 MB).

## Pasos

1. **Instalación limpia** — `cd ctools && npm ci`. Esperado: salida cero, sin conflictos (G3).
2. **Tests** — `npm test`. Esperado: los 6 ficheros de `tests/` en verde, 0 fallos (G2).
3. **Build** — `npm run build`. Esperado: `tsc --noEmit` + `vite build` sin errores y `dist/` generada (G1).
4. **Subruta** — Servir `dist/` desde una subruta (p. ej. `npx serve dist -l 4173` traspuesta a subruta o cualquier estático con prefijo) y recorrer las 5 vistas con recarga directa en cada una. Esperado: sin 404 ni pantallas en blanco, assets relativos resueltos (G4, SC-008).
5. **Regresión funcional** — Completar los 3 pasos en las 4 herramientas con archivos válidos; repetir casos inválidos (`.txt`, `.doc`, contraseña, todas-las-páginas, rangos `1, 3, 5-8`, escaneado). Esperado: mismos resultados, nombres con sufijo CTools, mismos avisos en español (SC-002/SC-003).
6. **Red cero** — Con DevTools en la pestaña Red, procesar documentos reales; tras la primera carga, cortar la conexión y repetir las 4 herramientas. Esperado: cero peticiones con contenido de usuario y funcionamiento offline (SC-005).
7. **Móvil** — Ventana < 768 px: menú compacto, dropzone táctil, Subir/Bajar en Unir, 2 columnas en Eliminar, barra fija inferior, sin scroll horizontal en ningún paso; en escritorio, ausencia de esos elementos. Esperado: 002 intacta (SC-004).
8. **Memoria** — Archivo grande: comprobar progreso visible, cancelar, descargar, "Empezar de nuevo" y repetir. Esperado: UI responde siempre, segundo uso igual que el primero (SC-007). Aviso suave ante ≥ 50 MB sin bloqueo.

## Referencias

- Puertas G1–G7 y matriz de invariantes: [data-model.md](data-model.md).
- Decisiones de migración (router, worker, Tailwind, orden por grupos): [research.md](research.md).
