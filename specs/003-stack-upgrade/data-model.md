# Data Model: 003-stack-upgrade

**Fecha**: 2026-10-15 | **Spec**: [spec.md](spec.md) | **Tipo**: upgrade de stack, sin entidades de dominio nuevas. Este modelo describe el inventario de cambio y sus invariantes.

## Entidades

### 1. DependencyPin

Versión fijada en `ctools/package.json` + `package-lock.json`.

| Campo | Descripción | Regla |
|-------|-------------|-------|
| name | Nombre del paquete | Único por manifiesto |
| current | Versión instalada hoy | Solo lectura (referencia) |
| target | Línea objetivo Oct-2026 | Ver `contracts/upgrade-targets.md` |
| kind | `runtime` \| `build` \| `test` \| `types` | Determina el grupo de ejecución (R9) |
| breaking | Refs a cambios rotos conocidos | p. ej. router: paquete eliminado |

### 2. ConfigChange

| Campo | Descripción |
|-------|-------------|
| file | Ruta del fichero de configuración |
| action | `update` \| `delete` \| `create` |
| reason | Cambio roto que lo exige |

Matriz completa:

| file | action | reason |
|------|--------|--------|
| `ctools/package.json` | update | Subida de versiones (contrato) |
| `ctools/package-lock.json` | update | Regenerado por instalación |
| `ctools/vite.config.ts` | update | Plugin React 5 + plugin Tailwind v4; conserva `base './'`, `worker.format 'es'`, bloque `test` |
| `ctools/tsconfig.app.json` | update | Compatibilidad TS 6/7, estricto intacto |
| `ctools/tsconfig.node.json` | update | Compatibilidad TS 6/7 (incluye `vite.config.ts`) |
| `ctools/tailwind.config.js` | delete | v4 no lo autodetecta; tokens migran a `@theme` en CSS |
| `ctools/postcss.config.js` | delete | Plugin Vite sustituye el pipeline PostCSS |
| `ctools/src/styles/tailwind.css` | update | `@import "tailwindcss"` + `@theme` con los 4 tokens |
| `.github/workflows/deploy.yml` | update | `node-version: 24` |

### 3. SourceTouch

Ficheros `src/`/`tests/` que MUST cambiar (todo lo demás MUST NOT cambiar, FR-010):

| file | reason |
|------|--------|
| `ctools/src/App.tsx` | Imports `react-router-dom` → `react-router` (R1) |
| `ctools/src/routes.tsx` | Imports `react-router-dom` → `react-router` (R1) |
| `ctools/src/tools/dashboard/Dashboard.tsx` | Import `Link` → `react-router` (R1) |
| `ctools/src/lib/pdf-render.ts` | Solo si pdfjs-dist 6.x exige retrabajo del worker; API pública del módulo intacta (R5) |
| `ctools/tests/*` (6 ficheros) | Adaptación a Vitest 5 / React 19; cero pruebas nuevas (R7) |

### 4. Invariant (no cambia)

- Rutas: `/`, `/unir-pdf`, `/eliminar-paginas`, `/word-a-pdf`, `/pdf-a-word`, `*`→`/` con `HashRouter`.
- Textos UI en español, flujo de 3 pasos, marca CTools y pie con crédito a Cecilio.
- Sufijos de descarga (`*_unido_CTools.pdf`, `*_CTools.pdf`, `*_CTools.docx`).
- Avisos: formato inválido, `.doc` antiguo, contraseña, todas-las-páginas, rangos, escaneado.
- Tokens visuales: `#F5F5FA`, `#E5322D`, `#B71F1B`, sombra `card`.
- Comportamientos: `revokeObjectURL` tras descarga/reset, render por página, progreso + cancelar, descarga automática + manual, "Empezar de nuevo" limpia estado.
- `base: './'`, `worker.format: 'es'`, `globals/jsdom/setupFiles` en bloque `test`.

### 5. VerificationGate

| Puerta | Comando / acción | Esperado |
|--------|------------------|----------|
| G1 tipos+build | `tsc --noEmit && vite build` (vía `npm run build`) | Salida cero, `dist/` generada |
| G2 tests | `npm test` (`vitest run`) | 6 ficheros en verde, 0 fallos |
| G3 instalación | `npm ci` limpia | Sin errores ni conflictos |
| G4 subruta | Servir `dist/` desde subruta, recorrer 5 vistas con recarga | Sin 404 ni pantalla en blanco |
| G5 red cero | Inspeccionar tráfico procesando documentos reales | Cero peticiones con contenido de usuario |
| G6 móvil | Ventana < 768 px, 4 herramientas cargadas | Comportamiento 002 intacto, sin scroll horizontal |
| G7 memoria | Archivo grande: progreso, cancelar, descargar, reiniciar ×2 | UI responde, sin degradación entre usos |

## Transiciones de estado

`Estado actual (v6/v3/React18)` → `grupo 1 toolchain en verde` → `grupo 2 runtime en verde` → `grupo 3 tests en verde` → `grupo 4 regresión verificada`. No se avanza de grupo con su puerta en rojo.
