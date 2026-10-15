# Feature Specification: CTools — Experiencia móvil y táctil

**Feature Branch**: `002-mobile-ux`

**Created**: 2026-10-15

**Status**: Draft

**Input**: User description: "Quiero optimizar la experiencia de usuario y el diseño visual de CTools específicamente para dispositivos móviles y pantallas táctiles (smartphones y tablets verticales), manteniendo intacta la funcionalidad en escritorio. (1) Navegación y cabecera compacta con menú desplegable; (2) Dropzone adaptada ('Toca para seleccionar archivos', botón grande); (3) Unir PDF con tarjetas compactas y reordenar por arrastrar + botones Subir/Bajar; (4) Eliminar páginas con cuadrícula de 2 columnas y barra de rangos accesible; (5) Conversiones sin scroll horizontal; (6) Barra de acción fija inferior con el botón principal en las 4 herramientas."

## Clarifications

### Session 2026-10-15

- Q: ¿Los botones "Subir" y "Bajar" de cada tarjeta deben aparecer también en escritorio, o solo en móvil? (FR-005) → A: Solo en móvil (escritorio intacto, solo arrastre).
- Q: ¿En qué fases debe aparecer la barra de acción fija inferior en móvil? (FR-009) → A: Solo en configuración con archivos cargados, antes de procesar.
- Q: ¿Dónde debe ir la barra de rangos y contador en Eliminar para no chocar con la barra de acción fija? (FR-007) → A: Rangos fijos arriba bajo la cabecera, acción fija abajo.
- Q: ¿A partir de qué ancho debe aplicarse la variante móvil compacta? (FR-001) → A: Menos de 768 px.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navegar entre herramientas con una mano (Priority: P1)

Persona usuaria abre CTools en su teléfono y ve una cabecera compacta con
el logo "CTools" y un botón de menú. Lo pulsa con el pulgar, se despliega
la lista de las 4 herramientas, elige una y llega a ella; el menú se
cierra solo. En escritorio todo sigue exactamente igual.

**Why this priority**: Sin navegación usable con una mano, ninguna
herramienta es alcanzable en móvil; es la puerta de entrada de toda la
experiencia móvil.

**Independent Test**: En un teléfono, abrir la app, abrir el menú, saltar a
cada una de las 4 herramientas y volver al inicio; comprobar que en
escritorio la cabecera no ha cambiado.

**Acceptance Scenarios**:

1. **Given** la app abierta en un teléfono, **When** la persona usuaria
   mira la parte superior, **Then** ve el logo "CTools" y un botón de menú
   en una barra compacta de una sola fila.
2. **Given** el menú cerrado, **When** pulsa el botón de menú, **Then** se
   despliegan las 4 herramientas con nombres legibles y tocables con el
   pulgar.
3. **Given** el menú abierto, **When** elige una herramienta, **Then**
   navega a ella y el menú se cierra automáticamente.
4. **Given** la app abierta en escritorio, **When** visualiza la cabecera,
   **Then** ve la misma navegación completa de siempre, sin menú
   hamburguesa ni cambios visuales.

---

### User Story 2 - Cargar archivos tocando, sin arrastrar (Priority: P1)

Persona usuaria entra a cualquier herramienta en su teléfono y ve una zona
de carga cuyo texto principal dice "Toca para seleccionar archivos", con
un botón grande fácil de pulsar con el pulgar. Lo toca, se abre el
selector del sistema, elige sus archivos y continúa.

**Why this priority**: Arrastrar y soltar no existe en táctil; sin una
llamada a la acción pensada para el dedo, el flujo de 3 pasos se rompe en
el paso 1.

**Independent Test**: En un teléfono, entrar a cada herramienta vacía y
verificar texto táctil + botón grande; en escritorio sigue el texto de
arrastrar.

**Acceptance Scenarios**:

1. **Given** una herramienta vacía en un teléfono, **When** la visualiza,
   **Then** el texto principal invita a tocar para seleccionar (no a
   arrastrar) y hay un botón grande de selección.
2. **Given** la zona de carga en un teléfono, **When** toca el botón,
   **Then** se abre el selector de archivos del sistema.
3. **Given** la misma herramienta en escritorio, **When** la visualiza,
   **Then** mantiene el texto y comportamiento de arrastrar de siempre.

---

### User Story 3 - Reordenar PDFs sin pelear con el scroll (Priority: P2)

Persona usuaria une PDFs en su teléfono: las tarjetas se apilan de forma
compacta (miniatura a la izquierda, datos a la derecha). Para reordenar,
puede arrastrar con pulsación mantenida o, sin ambigüedad con el scroll,
pulsar botones explícitos "Subir" y "Bajar" en cada tarjeta.

**Why this priority**: El reordenado por arrastre compite con el gesto de
scroll en táctil; los botones garantizan que cualquiera pueda ordenar sin
frustración.

**Independent Test**: En un teléfono, cargar 3 PDF, reordenar solo con los
botones Subir/Bajar y unir; repetir arrastrando con el dedo.

**Acceptance Scenarios**:

1. **Given** 3 archivos cargados en Unir en un teléfono, **When** los
   visualiza, **Then** cada tarjeta muestra miniatura a la izquierda y
   datos a la derecha en formato compacto apilado.
2. **Given** la cola en un teléfono, **When** pulsa "Bajar" en la primera
   tarjeta, **Then** ese archivo pasa a segunda posición sin arrastrar.
3. **Given** la cola en un teléfono, **When** arrastra una tarjeta con
   pulsación mantenida, **Then** puede reordenarla con el dedo.
4. **Given** la cola en escritorio, **When** la visualiza, **Then** las
   tarjetas y el reordenado funcionan como siempre.

---

### User Story 4 - Marcar páginas en cuadrícula legible (Priority: P2)

Persona usuaria elimina páginas en su teléfono: ve las miniaturas en 2
columnas con números legibles, y el campo de rangos ("1, 3, 5-8") con su
contador en una barra accesible que no tapa las miniaturas al hacer
scroll.

**Why this priority**: Con miniaturas demasiado pequeñas o el campo de
rangos tapándolas, la selección fina por página es inviable en teléfono.

**Independent Test**: En un teléfono, cargar un PDF de 8 páginas, marcar
por clic y por rangos, hacer scroll y comprobar que nada queda tapado.

**Acceptance Scenarios**:

1. **Given** un PDF cargado en Eliminar en un teléfono, **When** lo
   visualiza, **Then** las miniaturas se muestran en 2 columnas con número
   y contenido legibles.
2. **Given** la cuadrícula visible, **When** hace scroll, **Then** el campo
   de rangos y el contador siguen accesibles sin tapar miniaturas.
3. **Given** la herramienta en escritorio, **When** la visualiza, **Then**
   mantiene su cuadrícula amplia y panel lateral de siempre.

---

### User Story 5 - Botón principal siempre al alcance del pulgar (Priority: P2)

Persona usuaria trabaja en cualquier herramienta en su teléfono con
archivos ya cargados: el botón principal ("Unir PDF", "Eliminar páginas",
"Convertir a PDF", "Convertir a Word") queda fijo en la parte inferior de
la pantalla, siempre visible sin hacer scroll hasta el final.

**Why this priority**: Es el cambio transversal de mayor impacto en
completitud de tarea: elimina el scroll de ida y vuelta en pantallas
largas.

**Independent Test**: En un teléfono, cargar archivos en cada herramienta,
hacer scroll arriba y abajo y comprobar que el botón sigue fijo abajo; en
escritorio no hay barra fija.

**Acceptance Scenarios**:

1. **Given** archivos cargados en cualquier herramienta en un teléfono,
   **When** hace scroll, **Then** el botón principal permanece fijo en la
   parte inferior y sigue siendo pulsable.
2. **Given** la barra fija visible, **When** la visualiza, **Then** no tapa
   contenido importante (hay espacio inferior suficiente).
3. **Given** la herramienta sin archivos, **When** la visualiza en un
   teléfono, **Then** no aparece barra fija (nada que procesar).
4. **Given** cualquier herramienta en escritorio, **When** la visualiza,
   **Then** el botón está en su posición normal del flujo, sin barra fija.

---

### User Story 6 - Conversiones sin scroll horizontal (Priority: P3)

Persona usuaria convierte documentos en su teléfono: la tarjeta de
preparación y el contenido se adaptan al ancho de la pantalla sin generar
scroll horizontal en la página.

**Why this priority**: El scroll horizontal accidental es el defecto visual
más grave en móvil; va en último lugar porque las tarjetas actuales ya
son casi correctas y es un ajuste de contención.

**Independent Test**: En un teléfono, cargar un .docx y un PDF en sus
herramientas y comprobar que no hay scroll horizontal en ningún momento.

**Acceptance Scenarios**:

1. **Given** un archivo cargado en Word a PDF en un teléfono, **When** lo
   visualiza, **Then** la tarjeta se ajusta al ancho sin scroll
   horizontal en la página.
2. **Given** un archivo cargado en PDF a Word en un teléfono, **When** lo
   visualiza, **Then** ocurre lo mismo.

---

### Edge Cases

- ¿Qué ocurre al rotar el teléfono a horizontal? El layout se adapta al
  nuevo ancho disponible; ninguna acción pierde el estado cargado.
- ¿Qué ocurre en tablet vertical? Se aplican las mismas adaptaciones
  táctiles que en teléfono (botones grandes, menú, barra fija).
- ¿Qué ocurre si se abre el teclado virtual al escribir rangos? El campo
  y el contador siguen usables; la barra fija no impide escribir ni
  oculta el campo con foco.
- ¿Qué ocurre si el gesto de arrastrar en Unir entra en conflicto con el
  scroll? Los botones Subir/Bajar garantizan el reordenado sin depender
  del gesto.
- ¿Qué ocurre en escritorio con ventana estrecha? Al ser diseño
  adaptable por ancho, se muestra la variante compacta; al ensanchar,
  vuelve la de escritorio sin recargar ni perder estado.
- ¿Qué ocurre con áreas seguras (notch, bordes redondeados)? La barra
  fija inferior respeta el área segura del dispositivo.
- ¿Qué ocurre si el menú móvil queda abierto y se navega con el botón
  atrás del sistema? El menú se cierra y la navegación sigue
  funcionando.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: En pantallas de menos de 768 px de ancho (teléfonos y
  tablets verticales pequeñas) el sistema MUST mostrar una cabecera
  compacta de una fila con el logo "CTools" y un botón de menú que
  despliegue las 4 herramientas.
- **FR-002**: El menú móvil MUST cerrarse automáticamente al elegir una
  herramienta y MUST ser operable con una sola mano (objetivos táctiles
  grandes).
- **FR-003**: En pantallas estrechas, la zona de carga MUST priorizar el
  texto "Toca para seleccionar archivos" con un botón grande de
  selección; en escritorio MUST mantener el texto de arrastrar actual.
- **FR-004**: En pantallas estrechas, cada tarjeta de la cola de unión
  MUST mostrarse compacta y apilada verticalmente, con miniatura a la
  izquierda y datos a la derecha.
- **FR-005**: En pantallas estrechas, cada tarjeta de la cola de unión
  MUST ofrecer botones explícitos "Subir" y "Bajar" para reordenar sin
  arrastrar, ADEMÁS de mantener el reordenado por arrastre con pulsación
  mantenida. En escritorio el reordenado sigue siendo solo por arrastre
  con ratón (sin botones, según FR-012).
- **FR-006**: En teléfonos, la cuadrícula de Eliminar páginas MUST
  mostrarse en 2 columnas con números y contenido legibles.
- **FR-007**: El campo de rangos y el contador de páginas seleccionadas
  MUST permanecer accesibles durante el scroll sin tapar las miniaturas.
  En pantallas estrechas van fijos en la parte superior (bajo la
  cabecera), separados de la barra de acción inferior (FR-009).
- **FR-008**: Las vistas de Word a PDF y PDF a Word MUST adaptarse al
  ancho de la pantalla sin producir scroll horizontal en la página.
- **FR-009**: En pantallas estrechas, en fase de configuración con archivos
  ya cargados (antes de procesar), el botón principal de cada herramienta
  MUST permanecer fijo en la parte inferior (sticky bottom bar) y visible
  sin hacer scroll. No aparece durante el procesado (ya hay progreso con
  cancelar) ni en la pantalla de éxito (ya hay descarga y reset).
- **FR-010**: La barra fija inferior MUST NOT tapar contenido ni controles
  (la página MUST reservar espacio inferior suficiente) y MUST respetar
  el área segura del dispositivo.
- **FR-011**: Sin archivos cargados, el sistema MUST NOT mostrar barra
  fija inferior.
- **FR-012**: En escritorio el sistema MUST mantener la apariencia y el
  comportamiento actuales (cabecera completa, textos de arrastrar,
  tarjetas, cuadrícula amplia y botones en flujo normal): cero regresión
  visual y funcional.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 9 de cada 10 personas usuarias en teléfono cambian de
  herramienta desde el menú al primer intento, sin ayuda.
- **SC-002**: 9 de cada 10 personas usuarias en teléfono cargan archivos
  tocando el botón grande al primer intento, sin intentar arrastrar.
- **SC-003**: Una persona usuaria en teléfono reordena 3 PDF usando SOLO
  los botones Subir/Bajar y completa la unión sin errores.
- **SC-004**: En un teléfono de ~360 px de ancho, ninguna de las 5 vistas
  produce scroll horizontal en ningún paso (vacía, cargada, procesando,
  éxito).
- **SC-005**: Con archivos cargados en teléfono, el botón principal es
  visible y pulsable sin hacer scroll en las 4 herramientas.
- **SC-006**: Tras el cambio, una pasada de regresión en escritorio
  muestra cero diferencias visuales y funcionales en las 5 vistas.
- **SC-007**: 8 de cada 10 personas usuarias completan su primera tarea en
  teléfono al primer intento y localizan la descarga sin ayuda.

## Assumptions

- Variante compacta por debajo de 768 px de ancho ("pantallas estrechas",
  según FR-001), no por tipo de dispositivo: una ventana estrecha de
  escritorio muestra la variante compacta.
- No cambia ninguna funcionalidad ni motor: mismos formatos, mismos
  avisos, mismos flujos de 3 pasos y mismos sufijos de descarga.
- La interfaz sigue íntegramente en español y se conservan contraste,
  foco visible y etiquetas accesibles existentes.
- Los gestos táctiles conviven con ratón/teclado: nada de lo táctil
  rompe el uso con puntero.
- Referencia de prueba: teléfono de ~360–390 px de ancho y tablet
  vertical de ~768–820 px.
