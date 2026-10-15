# Feature Specification: CTools — Full Stack Upgrade Without Regression

**Feature Branch**: `003-stack-upgrade`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "003-stack-upgrade: Actualizar stack completo de CTools a últimas versiones estables (Oct-2026) sin regresión funcional ni visual. Contexto: SPA 100% client-side en `ctools/` con React 18.3.1, react-router-dom 6.28.0 (HashRouter), Vite 6.0.0, Tailwind 3.4.14 + PostCSS + Autoprefixer, TypeScript ~5.6.2, Vitest 3.2.7, Node 20 en `.github/workflows/deploy.yml`. Desplegado en GitHub Pages con `base:'./'` y worker pdf.js `format:'es'`. Todo el stack está 1-2 majors atrás. Objetivo: migrar a React 19.3.x + @types/react 19, react-router v8 (migrar desde react-router-dom v6, ESM-only, requiere React 19 + Node 22+), Vite 8.3.x + @vitejs/plugin-react 5.x compatible, Tailwind v4.3.x (con @tailwindcss/vite o @tailwindcss/postcss, eliminar config v3 y autoprefixer si ya no aplica), TypeScript 6.0.x/7.0.x estable, Vitest 5.0.x + @testing-library/react + jsdom compatibles con React 19, Node 24 LTS en workflow (mínimo Node 22), y últimas compatibles de pdf-lib, pdfjs-dist (4.2.67 -> 5.x/6.x), jspdf (2.5.1 -> 3.x), docx, docx-preview, html2canvas, dnd-kit, lucide-react, react-dropzone. Restricciones NON-NEGOTIABLE (constitución v1.0.0): I. 100% local, cero subidas, solo assets estáticos. II. Build estática para GitHub Pages, mantener HashRouter y rutas relativas. III. UI en español, flujo 3-pasos y marca CTools intactos. IV. Sin fugas (revokeObjectURL) y sin bloquear UI. V. Módulos desacoplados, TS estricto. Alcance: solo upgrade + adaptación a breaking changes (imports `react-router` vs `react-router-dom`, JSX, pdf.worker.mjs, config Tailwind v4, Vite Rolldown, TS config). No nuevas features. Actualizar `package.json`, `package-lock.json`, `vite.config.ts`, `tsconfig.*`, `tailwind/postcss`, `deploy.yml`, y código afectado en `src/`. Criterios de aceptación: `npm ci && npm test && npm run build` en verde, `vitest run` sin fallos, preview servido desde subruta funciona con HashRouter, las 5 vistas (Dashboard + 4 herramientas) sin regresión visual/funcional, verificación de spec 002-mobile-ux intacta (<768px), y cero peticiones de red con documentos."

## Clarifications

### Session 2026-10-15

- Q: ¿Qué versión de Node debe fijarse en el workflow de despliegue para el stack nuevo? → A: Node 24 LTS.
- Q: ¿Qué línea de TypeScript debe adoptarse si ambas son estables en el momento de implementar? → A: Última estable.
- Q: ¿Qué línea del visor PDF debe adoptarse para el render de miniaturas y páginas? → A: Exigir 6.x.
- Q: ¿Qué vía de integración debe usarse para los estilos v4? → A: Plugin Vite.
- Q: ¿Qué alcance debe tener la suite de pruebas tras el upgrade? → A: Solo adaptar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Usar las 5 vistas igual que antes del upgrade (Priority: P1)

Persona usuaria habitual abre CTools tras la actualización y recorre el
Dashboard y las 4 herramientas (Unir PDF, Eliminar páginas, Word a PDF,
PDF a Word). Todo se ve igual, los textos siguen en español, cada
herramienta mantiene su flujo de 3 pasos (seleccionar → configurar →
procesar con progreso y descarga), la marca CTools y el pie con crédito
a Cecilio están intactos, y los archivos resultantes se descargan con
los mismos nombres y calidad de antes.

**Why this priority**: Es la garantía central del cambio: si hay
regresión visible o funcional, el upgrade fracasa aunque la instalación
compile. Protege directamente la constitución III.

**Independent Test**: Recorrer las 5 vistas con archivos reales de prueba
(PDF de varias páginas, .docx con formato), completar cada flujo de 3
pasos y comparar textos, orden de pasos, nombres de descarga y calidad
visual contra el comportamiento previo. Pasa si una persona que conoce
la app no nota ninguna diferencia.

**Acceptance Scenarios**:

1. **Given** la app actualizada cargada, **When** la persona usuaria visita
   el Dashboard, **Then** ve bienvenida, las 4 tarjetas, sello de
   privacidad y pie de CTools exactamente como antes, todo en español.
2. **Given** cualquier herramienta, **When** completa sus 3 pasos con
   archivos válidos, **Then** obtiene el mismo resultado descargable
   (mismo contenido, orden y sufijo de nombre) que antes del upgrade.
3. **Given** un archivo inválido (.txt en herramienta PDF, .doc antiguo,
   PDF con contraseña), **When** intenta cargarlo, **Then** recibe el
   mismo aviso amigable en español sin que la herramienta se bloquee.
4. **Given** la pantalla de éxito, **When** termina un procesamiento,
   **Then** ve descarga (automática + botón manual) y "Empezar de nuevo"
   que limpia el estado, como antes.

---

### User Story 2 - Instalar, probar y compilar en verde con el stack nuevo (Priority: P1)

Responsable técnico clona el repositorio, instala dependencias,
ejecuta la suite de pruebas y compila la app con el stack actualizado.
Los tres comandos terminan sin errores ni fallos de tipos en un entorno
con versión de Node soportada por el nuevo stack.

**Why this priority**: Sin instalación, pruebas y build reproducibles en
verde no hay entrega posible a GitHub Pages; es el quality gate que
desbloquea todo lo demás.

**Independent Test**: En una copia limpia, ejecutar instalación,
pruebas y compilación de principio a fin y comprobar código de salida
cero en los tres pasos. No requiere abrir la app en el navegador.

**Acceptance Scenarios**:

1. **Given** una copia limpia del repositorio, **When** ejecuta la
   instalación de dependencias, **Then** termina sin errores ni
   conflictos de versiones.
2. **Given** dependencias instaladas, **When** ejecuta la suite completa
   de pruebas, **Then** todas las pruebas pasan sin fallos ni omisiones.
3. **Given** dependencias instaladas, **When** ejecuta la compilación
   (incluida la comprobación de tipos), **Then** termina sin errores y
   produce la carpeta de salida estática lista para desplegar.

---

### User Story 3 - Abrir la app desplegada desde subruta y trabajar sin conexión (Priority: P2)

Persona usuaria abre la versión desplegada en GitHub Pages (servida
desde una subruta de repositorio), navega entre herramientas sin que
ninguna ruta falle, y tras la primera carga puede completar las 4
herramientas con el dispositivo sin conexión, sin que ningún documento
provoque peticiones de red.

**Why this priority**: Protege la constitución I (100% local) y II
(estática + HashRouter + rutas relativas); un upgrade que rompa la
base relativa o el enrutado deja la app desplegada rota aunque en local
funcione.

**Independent Test**: Servir la carpeta compilada desde una subruta,
navegar a las 5 vistas con recarga, inspeccionar el tráfico de red
mientras se procesan documentos reales y confirmar cero peticiones con
contenido de usuario. Repetir sin conexión tras la primera carga.

**Acceptance Scenarios**:

1. **Given** la app compilada servida desde una subruta, **When** navega
   a cada una de las 5 vistas y recarga, **Then** todas cargan sin error
   404 ni pantalla en blanco y los assets resuelven correctamente.
2. **Given** la app cargada una vez, **When** procesa documentos con la
   red inspeccionada, **Then** no se observa ninguna petición que lleve
   contenido de documentos fuera del dispositivo.
3. **Given** la app cargada una vez, **When** corta la conexión y usa las
   4 herramientas, **Then** todas completan sus tareas igual que en línea.

---

### User Story 4 - Conservar la experiencia móvil de 002 en pantallas estrechas (Priority: P2)

Persona usuaria en teléfono (< 768 px) usa CTools tras el upgrade:
cabecera compacta con menú, dropzone táctil, tarjetas compactas de
unión con Subir/Bajar, cuadrícula de 2 columnas en Eliminar, sin scroll
horizontal y con barra de acción fija inferior. En escritorio todo sigue
igual que antes.

**Why this priority**: La spec 002-mobile-ux es funcionalidad ya
entregada; el upgrade no debe degradarla. Es regresión de segundo
orden tras las 5 vistas de escritorio.

**Independent Test**: En ventana estrecha (< 768 px), recorrer cada
herramienta con archivos cargados y verificar menú, textos táctiles,
botones Subir/Bajar, cuadrícula, barra fija y ausencia de scroll
horizontal; repetir en escritorio y verificar cero cambios.

**Acceptance Scenarios**:

1. **Given** la app en menos de 768 px con archivos cargados, **When**
   recorre las 4 herramientas, **Then** encuentra menú compacto, botón
   principal fijo abajo y layouts compactos idénticos a los de 002.
2. **Given** la app en menos de 768 px, **When** visualiza cualquier
   vista en cualquier paso (vacía, cargada, procesando, éxito), **Then**
   no hay scroll horizontal en la página.
3. **Given** la app en escritorio, **When** visualiza las 5 vistas,
   **Then** no hay menú hamburguesa, ni botones Subir/Bajar, ni barra
   fija: todo como antes del upgrade.

---

### User Story 5 - Procesar documentos grandes sin fugas ni bloqueos (Priority: P3)

Persona usuaria procesa archivos grandes (p. ej. PDF de decenas de MB o
cientos de páginas) tras el upgrade: ve progreso, puede cancelar
operaciones largas, la interfaz sigue respondiendo y tras descargar o
pulsar "Empezar de nuevo" no queda memoria acumulada entre usos
sucesivos.

**Why this priority**: Protege la constitución IV; los cambios de motor
de render (visor de PDF, workers) son el punto de mayor riesgo de
regresión no visual (fugas, congelamientos).

**Independent Test**: Procesar un archivo grande de prueba, observar
progreso y capacidad de respuesta, cancelar y reintentar, descargar y
reiniciar, y comprobar que usos repetidos no degradan ni acumulan
estado.

**Acceptance Scenarios**:

1. **Given** un archivo grande cargado, **When** inicia el procesamiento,
   **Then** ve progreso visible y la interfaz sigue respondiendo
   (puede cancelar).
2. **Given** un procesamiento terminado o reiniciado, **When** descarga o
   pulsa "Empezar de nuevo", **Then** los recursos temporales quedan
   liberados y un segundo uso rinde igual que el primero.
3. **Given** un archivo de 50 MB o más, **When** lo carga, **Then** ve la
   advertencia suave habitual sin bloqueo.

---

### Edge Cases

- ¿Qué ocurre si el nuevo enrutador cambia la forma de importar o el
  paquete de origen? La navegación entre las 5 vistas sigue funcionando
  con HashRouter y ninguna ruta queda rota.
- ¿Qué ocurre si el visor de PDF cambia el nombre o formato del worker
  (p. ej. `pdf.worker.mjs`)? Las miniaturas y el render de páginas
  siguen mostrándose con la misma calidad y sin errores de carga.
- ¿Qué ocurre si el sistema de estilos elimina su archivo de
  configuración o el post-procesado anterior? Las 5 vistas se ven
  idénticas (misma paleta, espaciados, responsive) sin clases rotas.
- ¿Qué ocurre si el nuevo compilador es más estricto con tipos o JSX?
  La compilación no deja errores silenciosos: o pasa en verde o falla
  de forma visible antes de desplegar.
- ¿Qué ocurre si alguien intenta compilar con una versión de Node
  antigua no soportada? El workflow y la documentación exigen una
  versión soportada y la instalación falla de forma clara, no con
  errores crípticos a mitad de build.
- ¿Qué ocurre si el lockfile queda desincronizado tras el upgrade? La
  instalación limpia falla de forma visible en lugar de producir una
  build con versiones mezcladas.
- ¿Qué ocurre con PDFs con contraseña, .doc antiguos o PDFs escaneados
  tras el upgrade? Se mantienen exactamente los mismos avisos y
  comportamientos definidos en la spec 001.
- ¿Qué ocurre al rotar el teléfono o abrir el teclado virtual tras el
  upgrade? Los layouts de 002 se adaptan sin perder archivos cargados
  ni tapar controles.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema MUST seguir siendo 100% local: ningún archivo
  de usuario MUST salir del navegador y todo procesamiento MUST ocurrir
  en el cliente; en tiempo de ejecución solo se permite la entrega de
  activos estáticos.
- **FR-002**: La build MUST seguir generando solo archivos estáticos
  desplegables en GitHub Pages, con enrutado HashRouter y rutas base
  relativas que funcionen servidas desde subruta.
- **FR-003**: La interfaz MUST permanecer íntegramente en español, con
  la marca CTools, el pie con crédito a Cecilio y el flujo de 3 pasos
  (seleccionar → configurar → procesar con progreso y descarga) intactos
  en las 4 herramientas.
- **FR-004**: El sistema MUST liberar recursos temporales tras descarga
  o reinicio y MUST NOT bloquear la interfaz durante operaciones
  pesadas (render o conversión por página/archivo, asíncrono, con
  progreso y opción de cancelar).
- **FR-005**: Cada herramienta MUST seguir siendo un módulo desacoplado
  que comparte componentes base, con tipado estricto y sin acoplar
  herramientas entre sí; añadir o tocar una MUST NOT romper las demás.
- **FR-006**: El sistema MUST ejecutarse sobre las últimas versiones
  estables del stack (línea objetivo Oct-2026): interfaz React 19.3.x,
  enrutador v8 compatible, compilador Vite 8.3.x con plugin React 5.x
  compatible, estilos Tailwind v4.3.x, TypeScript estable 6.0.x/7.0.x,
  suite Vitest 5.0.x con librerías de pruebas y DOM compatibles con
  React 19, y últimas compatibles de pdf-lib, visor PDF, jspdf 3.x,
  docx, docx-preview, html2canvas, dnd-kit, lucide-react y
  react-dropzone.
- **FR-007**: El entorno de integración continua MUST usar Node 24 LTS.
- **FR-008**: La migración MUST adaptarse a todos los breaking changes
  del nuevo stack: origen de imports del enrutador, sintaxis JSX,
  referencia al worker del visor PDF, configuración del sistema de
  estilos (eliminar config anterior y post-procesado si ya no aplica),
  configuración del compilador y configuración de tipos.
- **FR-009**: La migración MUST actualizar el manifiesto y bloqueo de
  dependencias, la configuración de build, las configuraciones de tipos,
  la configuración de estilos/post-procesado, el workflow de despliegue
  y el código afectado en `src/`, sin dejar referencias a APIs o
  paquetes eliminados.
- **FR-010**: La migración MUST NOT añadir nuevas funcionalidades ni
  cambiar comportamientos, textos, rutas o formatos de descarga: solo
  upgrade y adaptación.
- **FR-011**: Tras el upgrade, la instalación limpia, la suite de
  pruebas existente adaptada al nuevo stack (sin exigir pruebas nuevas)
  y la compilación con comprobación de tipos MUST terminar en verde sin
  errores ni fallos.
- **FR-012**: Las 5 vistas (Dashboard + 4 herramientas) MUST NOT mostrar
  regresión funcional ni visual en escritorio respecto al estado previo.
- **FR-013**: La experiencia móvil de la spec 002 MUST permanecer
  intacta en pantallas de menos de 768 px (cabecera compacta, dropzone
  táctil, tarjetas compactas con Subir/Bajar, cuadrícula de 2 columnas,
  sin scroll horizontal, barra fija inferior) y MUST NOT aparecer en
  escritorio.
- **FR-014**: Con documentos cargados, el sistema MUST NOT emitir
  peticiones de red con contenido de usuario; tras la primera carga la
  app MUST funcionar sin conexión.

### Key Entities

- **Pila de dependencias**: Conjunto de librerías y herramientas de
  build sobre las que corre la app; atributos: nombre, versión fijada
  en manifiesto y bloqueo, compatibilidad entre sí.
- **Módulo de herramienta**: Cada una de las 4 herramientas
  desacopladas más el Dashboard; atributos: ruta, flujo de 3 pasos,
  estado (vacía, configurando, procesando, éxito).
- **Artefacto estático compilado**: Salida de la build (HTML/CSS/JS);
  atributos: rutas relativas, enrutado por hash, servible desde
  cualquier subruta sin servidor.
- **Suite de pruebas y tipos**: Verificaciones automatizadas y
  comprobación estática; atributos: resultado (verde/rojo), cobertura
  de las 5 vistas, cero errores de tipos.
- **Canal de despliegue**: Pipeline que instala, compila y publica en
  GitHub Pages; atributos: versión de Node, pasos en verde, destino de
  publicación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona usuaria nueva completa la unión de 3 PDF y
  descarga el resultado en menos de 3 minutos al primer intento, igual
  que antes del upgrade.
- **SC-002**: Una pasada de regresión sobre las 5 vistas en escritorio
  muestra cero diferencias visuales ni funcionales (mismos textos,
  pasos, avisos, nombres de descarga y calidad) respecto al estado
  previo.
- **SC-003**: El 100% de los flujos de prueba existentes (formatos
  válidos, inválidos, contraseña, rangos, escaneado, cancelación,
  reintento, reinicio) se comporta igual que antes del upgrade.
- **SC-004**: En un teléfono de ~360 px de ancho, ninguna de las 5
  vistas produce scroll horizontal en ningún paso y el botón principal
  es visible y pulsable sin hacer scroll cuando hay archivos cargados.
- **SC-005**: Durante el procesamiento de documentos reales con el
  tráfico inspeccionado se observan cero peticiones con contenido de
  usuario, y tras la primera carga las 4 herramientas completan sus
  tareas sin conexión.
- **SC-006**: La instalación limpia, la suite de pruebas y la
  compilación terminan en verde al primer intento en un entorno
  soportado, sin intervención manual.
- **SC-007**: Al procesar un archivo grande de prueba, la interfaz sigue
  respondiendo con progreso visible y permite cancelar; tras descargar
  y reiniciar, un segundo uso rinde igual que el primero sin degradación
  ni estado residual.
- **SC-008**: La app compilada servida desde una subruta carga las 5
  vistas con recarga directa sin errores. (Nota post-lanzamiento, no
  verificable en implementación: 9 de cada 10 personas usuarias
  completan su primera tarea al primer intento, igual que antes.)

## Assumptions

- Línea objetivo Oct-2026 según la descripción: React 19.3.x, enrutador
  v8, Vite 8.3.x + plugin React 5.x, Tailwind v4.3.x, Vitest 5.0.x,
  Node 24 LTS (decisión de clarificación 2026-10-15).
- TypeScript: se adopta la última estable disponible en el momento de
  implementar (decisión de clarificación 2026-10-15).
- Visor PDF: se exige la línea 6.x con el empaquetado del worker como
  módulo con ruta relativa; si 6.x exige retrabajo del worker, este se
  asume dentro del alcance (decisión de clarificación 2026-10-15).
- Glosario: "visor PDF" = `pdfjs-dist` (motor de render de miniaturas y páginas).
- Estilos: se usa el plugin oficial de Vite para Tailwind v4; la config
  v3 y autoprefixer se eliminan al no aplicar en v4 (decisión de
  clarificación 2026-10-15).
- Se acepta el carácter ESM-only del nuevo enrutador y las subidas de
  Node que exige; no se mantiene compatibilidad con Node 20 ni con
  CommonJS donde el stack ya no lo soporte.
- Referencia de prueba: escritorio con navegador moderno actualizado,
  teléfono de ~360–390 px y ventana estrecha < 768 px para la variante
  compacta; archivos de prueba de la spec 001 (PDF multipágina, .docx
  con formato, inválidos, protegido, escaneado).
- Sin nuevas features, sin cambios de alcance y sin persistencia: al
  recargar o pulsar "Empezar de nuevo" todo se descarta, como antes.
