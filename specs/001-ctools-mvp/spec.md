# Feature Specification: CTools MVP — Suite local de herramientas de documentos

**Feature Branch**: `001-ctools-mvp`

**Created**: 2026-10-14

**Status**: Draft

**Input**: User description: "Construir CTools (Cecilio Tools), aplicación web en español estilo iLovePDF que funciona 100% local en el navegador, con Dashboard y 4 herramientas MVP: unir PDF, eliminar páginas PDF, Word a PDF y PDF a Word, más requisitos transversales de marca, privacidad y flujo de 3 pasos."

## Clarifications

### Session 2026-10-14

- Q: ¿Debe CTools imponer un límite máximo explícito de tamaño de archivo o número de páginas, o aceptar cualquier archivo que el navegador pueda procesar? → A: Advertencia suave a partir de 50 MB por archivo, sin bloqueo estricto; el límite real es la RAM del navegador.
- Q: ¿Qué título y favicon debe tener la pestaña del navegador? → A: Título "CTools | Herramientas PDF y Word 100% Locales" con favicon personalizado con la letra "C".
- Q: ¿Qué debe mostrarse ante un PDF protegido con contraseña? → A: Mensaje de error pidiendo un PDF sin contraseña.
- Q: ¿Qué formatos Word se soportan? → A: Exclusivamente .docx; ante un .doc antiguo mostrar aviso pidiendo guardarlo como .docx.
- Q: ¿Qué debe mostrar la herramienta Word a PDF como "vista previa o estado de preparación" antes de convertir? → A: Estado simple — tarjeta con nombre, tamaño y "listo para convertir", sin renderizado del contenido.
- Q: ¿Qué criterio exacto debe activar el aviso de "documento aparentemente escaneado" en la conversión PDF a Word? → A: Cero caracteres de texto extraíbles en todo el documento.
- Q: ¿Debe la pantalla de éxito intentar la descarga automáticamente al terminar el procesamiento, o limitarse al botón manual? → A: Intentar descarga automática al terminar y mantener el botón manual visible siempre.
- Q: ¿Debe el usuario poder cancelar una operación larga en curso y reintentar tras un fallo? → A: Botón cancelar visible durante operaciones largas y opción de reintentar tras un error.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Descubrir herramientas desde el Dashboard (Priority: P1)

Persona usuaria abre CTools y ve un encabezado de bienvenida, el sello de
privacidad ("100% Privado: Tus archivos no salen de tu dispositivo") y
tarjetas de acceso rápido a las 4 herramientas. Pulsa una tarjeta y llega a
la herramienta elegida; desde la cabecera fija puede saltar a otra
herramienta o volver al inicio.

**Why this priority**: Es la puerta de entrada; sin dashboard navegable el
resto no es descubrible ni usable como suite.

**Independent Test**: Abrir la página principal, verificar bienvenida,
4 tarjetas y sello de privacidad, navegar a cada herramienta y volver al
inicio solo con la cabecera. Entrega valor de orientación aunque las
herramientas aún no procesen.

**Acceptance Scenarios**:

1. **Given** la página principal cargada, **When** la persona usuaria la
   visualiza, **Then** ve el encabezado de bienvenida de CTools, las 4
   tarjetas de herramientas y el sello de privacidad visible.
2. **Given** la página principal, **When** pulsa la tarjeta "Unir PDF",
   **Then** accede a la herramienta Unir PDF.
3. **Given** cualquier herramienta, **When** pulsa el logotipo o el botón
   de inicio en la cabecera fija, **Then** regresa al Dashboard.
4. **Given** cualquier página, **When** visualiza el pie de página,
   **Then** lee "CTools — Desarrollado por Cecilio • Procesamiento 100%
   local en tu navegador".

---

### User Story 2 - Unir varios PDF en uno solo (Priority: P1)

Persona usuaria entra a "Unir PDF", arrastra o selecciona 2 o más archivos
PDF, ve una tarjeta por archivo (miniatura de la primera página, nombre,
peso y número de páginas), reordena arrastrando, añade más archivos o
elimina alguno, pulsa "Unir PDF", ve progreso y obtiene un único PDF
descargable en el orden elegido.

**Why this priority**: Es la herramienta más demandada y demuestra el flujo
de 3 pasos (seleccionar → ordenar → procesar/descargar) que rige la suite.

**Independent Test**: Unir 3 PDF de varias páginas en un orden no original y
comprobar que el descargado contiene todas las páginas en ese orden con
calidad legible equivalente a los originales.

**Acceptance Scenarios**:

1. **Given** la herramienta Unir vacía, **When** arrastra 3 archivos PDF,
   **Then** aparecen 3 tarjetas con miniatura de primera página, nombre,
   peso y número de páginas.
2. **Given** 3 archivos en cola, **When** arrastra la tercera tarjeta a la
   primera posición y elimina la segunda, **When** pulsa "Unir PDF",
   **Then** el PDF resultante contiene solo los archivos restantes en el
   nuevo orden.
3. **Given** archivos en cola, **When** pulsa "añadir más archivos" y
   selecciona otro PDF, **Then** se suma al final de la cola sin perder el
   orden previo.
4. **Given** el procesamiento terminado, **When** se muestra la pantalla de
   éxito, **Then** hay un botón grande de descarga del archivo
   `*_unido_CTools.pdf` y un botón "Empezar de nuevo" que limpia la cola.

---

### User Story 3 - Eliminar páginas de un PDF (Priority: P2)

Persona usuaria sube un PDF, ve una cuadrícula con todas las páginas
numeradas en miniatura, marca con clic las páginas a eliminar (overlay con
"X" roja), o escribe rangos en el campo lateral (p. ej. "1, 3, 5-8") que se
sincroniza en tiempo real con la selección visual, pulsa "Eliminar páginas"
y descarga el PDF sin esas páginas.

**Why this priority**: Segunda herramienta de manipulación PDF; reutiliza el
mismo flujo de 3 pasos y valida la interacción fina por página.

**Independent Test**: Subir un PDF de 8 páginas, seleccionar "2, 4-5" desde
el campo de texto, verificar que las miniaturas 2, 4 y 5 muestran la "X"
roja, procesar y comprobar que el resultado tiene 5 páginas en orden.

**Acceptance Scenarios**:

1. **Given** un PDF de 8 páginas cargado, **When** hace clic en las
   miniaturas 1 y 3, **Then** ambas muestran el overlay con "X" roja y el
   campo de texto refleja "1, 3".
2. **Given** la cuadrícula visible, **When** escribe "5-8" en el campo de
   rangos, **Then** las miniaturas 5, 6, 7 y 8 quedan marcadas al instante.
3. **Given** todas las páginas marcadas para eliminar, **When** intenta
   procesar, **Then** el sistema lo impide con un aviso de que debe quedar
   al menos 1 página y no genera descarga.
4. **Given** el procesamiento terminado, **When** se muestra la pantalla de
   éxito, **Then** puede descargar el PDF resultante y "Empezar de nuevo".

---

### User Story 4 - Convertir un documento Word a PDF (Priority: P2)

Persona usuaria sube un archivo .docx, ve el estado de preparación
(tarjeta con nombre, tamaño y "listo para convertir"), pulsa
"Convertir a PDF" y descarga un .pdf que conserva
estructura, negritas, cursivas, listas, tablas e imágenes básicas del
original.

**Why this priority**: Cubre el puente Word→PDF, el caso de "documento
final para compartir" complementario a la manipulación de PDF.

**Independent Test**: Subir un .docx con título, párrafo con negrita y
cursiva, lista, tabla simple e imagen, convertir y verificar visualmente
que el PDF contiene todos esos elementos en el mismo orden.

**Acceptance Scenarios**:

1. **Given** la herramienta Word a PDF vacía, **When** selecciona un
   archivo .docx válido, **Then** ve la tarjeta con nombre, tamaño y
   estado "listo para convertir", y el botón "Convertir a PDF" habilitado.
2. **Given** un .docx preparado, **When** pulsa "Convertir a PDF",
   **Then** ve un indicador de progreso y al terminar llega a la pantalla
   de éxito con descarga del PDF.
3. **Given** un archivo con otro formato (p. ej. .pdf o .txt),
   **When** intenta cargarlo aquí, **Then** recibe una alerta amigable de
   formato inválido y no se inicia conversión.

---

### User Story 5 - Convertir un PDF con texto a Word editable (Priority: P3)

Persona usuaria sube un PDF con texto seleccionable, pulsa "Convertir a
Word" y descarga un .docx editable que reconstruye párrafos, títulos y
saltos de página (alcance MVP: solo texto; las imágenes del PDF no se
transfieren). Si del PDF no se extrae ningún carácter de texto (cero
caracteres extraíbles), ve un aviso claro de documento aparentemente
escaneado antes de continuar.

**Why this priority**: Es la conversión más compleja y con fidelidad
variable; va en último lugar para no bloquear el resto del MVP.

**Independent Test**: Subir un PDF de 2 páginas con títulos y párrafos,
convertir y abrir el .docx para comprobar texto editable en orden con
saltos de página; repetir con un PDF escaneado y verificar el aviso previo.

**Acceptance Scenarios**:

1. **Given** un PDF con texto cargado, **When** pulsa "Convertir a Word",
   **Then** ve progreso y obtiene un .docx descargable con sufijo
   `*_CTools.docx`.
2. **Given** un PDF del que no se extrae ningún carácter de texto,
   **When** lo carga, **Then** ve un aviso claro de documento
   aparentemente escaneado antes o durante la conversión, y el resultado
   contiene el contenido disponible sin prometer texto reconocido de
   imágenes.
3. **Given** un PDF protegido con contraseña, **When** intenta cargarlo en
   cualquier herramienta, **Then** recibe una alerta amigable y no se
   bloquea la aplicación.

---

### Edge Cases

- ¿Qué ocurre cuando se suelta un archivo con extensión incorrecta (.txt en
  herramienta PDF, .pdf en herramienta Word)? Se muestra alerta amigable y
  el archivo se rechaza sin romper la cola o el estado actual.
- ¿Qué ocurre si se sube un .doc (Word 97-2003) en una herramienta Word?
  Se rechaza con un aviso que pide guardarlo como .docx.
- ¿Qué ocurre con un PDF protegido con contraseña? Se muestra un mensaje de
  error pidiendo un PDF sin contraseña; la herramienta queda lista para
  otro archivo.
- ¿Qué ocurre si en "Eliminar páginas" se marcan todas las páginas? El
  botón de procesar se bloquea o muestra aviso; se exige conservar mínimo
  1 página.
- ¿Qué ocurre si el rango escrito es inválido ("0", "3-2", "abc",
  páginas fuera del total)? El campo lo señala y no se aplica selección
  hasta corregirlo; la selección visual previa se conserva.
- ¿Qué ocurre si en "Unir PDF" solo hay 0–1 archivos? El botón "Unir PDF"
  permanece deshabilitado con indicación de mínimo 2 archivos.
- ¿Qué ocurre con archivos grandes (50 MB o más, o muchas páginas)? Se
  muestra una advertencia suave sin bloquear; la interfaz sigue
  respondiendo, muestra progreso/carga por archivo o página y permite
  cancelar o reintentar.
- ¿Qué ocurre si el usuario recarga o pulsa "Empezar de nuevo" tras el
  éxito? El estado se limpia por completo y la herramienta vuelve a su
  estado inicial vacía.
- ¿Qué ocurre si la descarga automática del navegador está bloqueada? La
  pantalla de éxito siempre ofrece botón manual de descarga visible.
- ¿Qué ocurre si el .docx tiene elementos no soportados (macros,
  tipografías raras, diseños complejos)? La conversión conserva lo posible
  y el resultado sigue siendo un archivo válido y descargable.
- ¿Qué ocurre si el PDF a Word no trae imágenes extraíbles o trae
  tipografías inusuales? El .docx conserva texto y estructura disponible;
  nunca se entrega un archivo corrupto.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La página principal MUST mostrar encabezado de bienvenida de
  CTools, tarjetas de acceso a las 4 herramientas y sello de privacidad
  visible con el texto "100% Privado: Tus archivos no salen de tu
  dispositivo".
- **FR-002**: La cabecera fija MUST mostrar el logotipo "CTools", enlaces
  de navegación a las 4 herramientas y un control para volver al inicio,
  visible en todas las páginas.
- **FR-003**: El pie de página MUST mostrar el texto "CTools — Desarrollado
  por Cecilio • Procesamiento 100% local en tu navegador".
- **FR-004**: Toda la interfaz MUST estar íntegramente en español.
- **FR-005**: Ningún archivo subido MUST salir del dispositivo; todo el
  procesamiento MUST ocurrir localmente en el navegador sin subidas.
- **FR-006**: Cada herramienta MUST presentar una zona amplia y destacada
  de arrastrar y soltar además de selector de archivos por clic.
- **FR-007**: Cada herramienta MUST aceptar solo su extensión
  correspondiente (.pdf o .docx) y MUST rechazar otras con una alerta
  amigable sin perder el estado actual. Un archivo .doc (Word antiguo)
  MUST rechazarse en las herramientas Word con un aviso que pida
  guardarlo como .docx.
- **FR-008**: Al detectar un PDF protegido con contraseña, el sistema MUST
  mostrar un mensaje de error que pida un PDF sin contraseña y MUST NOT
  bloquear la herramienta.
- **FR-009**: Cada herramienta MUST seguir el flujo de 3 pasos:
  seleccionar → configurar visualmente → procesar con progreso y descarga.
- **FR-010**: La herramienta Unir MUST exigir un mínimo de 2 archivos PDF;
  con menos, el botón "Unir PDF" MUST estar deshabilitado con indicación
  del requisito.
- **FR-011**: La herramienta Unir MUST mostrar por cada archivo una tarjeta
  con miniatura de la primera página, nombre, peso y número de páginas.
- **FR-012**: La herramienta Unir MUST permitir reordenar por arrastrar y
  soltar, añadir más archivos y eliminar archivos antes de procesar.
- **FR-013**: La herramienta Unir MUST generar un único PDF con todos los
  documentos en el orden elegido, manteniendo calidad original legible.
- **FR-014**: La herramienta Eliminar páginas MUST mostrar cuadrícula de
  miniaturas numeradas de todas las páginas del PDF cargado.
- **FR-015**: La herramienta Eliminar páginas MUST permitir marcar o
  desmarcar páginas con clic, mostrando overlay con "X" roja en las
  seleccionadas para eliminar.
- **FR-016**: La herramienta Eliminar páginas MUST ofrecer un campo lateral
  de rangos (formato "1, 3, 5-8") sincronizado en tiempo real y en ambos
  sentidos con la selección visual.
- **FR-017**: La herramienta Eliminar páginas MUST impedir eliminar todas
  las páginas; debe quedar al menos 1 página, con aviso visible.
- **FR-018**: La herramienta Eliminar páginas MUST generar un PDF sin las
  páginas descartadas, conservando el orden de las restantes.
- **FR-019**: La herramienta Word a PDF MUST aceptar un archivo .docx y
  mostrar un estado de preparación simple (tarjeta con nombre, tamaño y
  estado "listo para convertir") antes de convertir; no se requiere
  renderizar el contenido del documento.
- **FR-020**: La herramienta Word a PDF MUST generar un PDF descargable que
  conserve estructura, negritas, cursivas, listas, tablas e imágenes
  básicas del original con la mayor fidelidad posible.
- **FR-021**: La herramienta PDF a Word MUST generar un .docx editable que
  reconstruya párrafos, títulos y saltos de página del PDF con texto
  seleccionable. Las imágenes quedan fuera del alcance del MVP.
- **FR-022**: Cuando de un PDF no se extrae ningún carácter de texto en
  todo el documento (cero caracteres extraíbles), el sistema MUST mostrar
  un aviso claro de documento aparentemente escaneado e indicar que se
  extraerá el contenido disponible sin reconocimiento pesado de texto en
  imágenes.
- **FR-023**: Durante operaciones largas, el sistema MUST mostrar indicador
  de progreso o estados de carga y MUST mantener la interfaz respondiendo.
- **FR-024**: Tras cada procesamiento exitoso, el sistema MUST intentar la
  descarga automática del resultado y mostrar la pantalla de éxito con el
  botón grande de descarga manual siempre visible, más el botón "Empezar
  de nuevo" que limpia el estado por completo.
- **FR-025**: Los archivos generados MUST usar sufijos limpios
  (`*_unido_CTools.pdf` para unidos, `*_CTools.pdf` / `*_CTools.docx` para
  conversiones y resultados de páginas).
- **FR-026**: El sistema MUST liberar recursos temporales tras la descarga
  o al reiniciar ("Empezar de nuevo"), sin acumular archivos en memoria
  entre usos sucesivos.
- **FR-027**: La pestaña del navegador MUST mostrar el título "CTools |
  Herramientas PDF y Word 100% Locales".
- **FR-028**: La aplicación MUST usar un favicon personalizado con la
  letra "C".
- **FR-029**: Ante un archivo de 50 MB o más, el sistema MUST mostrar una
  advertencia suave sin bloquear; no existe bloqueo estricto por tamaño,
  el límite práctico es la memoria del navegador.
- **FR-030**: Durante operaciones largas el sistema MUST ofrecer un control
  para cancelarlas, y tras un error MUST ofrecer reintentar conservando
  los archivos ya cargados.

### Key Entities

- **Documento de entrada**: Archivo aportado por la persona usuaria (.pdf
  o .docx según herramienta); atributos: nombre, peso, número de páginas o
  secciones, estado (pendiente, listo, error por formato o contraseña).
- **Cola de unión**: Lista ordenada de documentos PDF a unir; el orden
  define el orden de páginas del resultado.
- **Página de PDF**: Unidad numerada de un documento; atributos: número,
  miniatura, marcada-para-eliminar (sí/no).
- **Selección de eliminación**: Conjunto de páginas a descartar,
  representable como selección visual y como expresión de rangos
  ("1, 3, 5-8"); ambas vistas sincronizadas.
- **Documento resultado**: Archivo generado (PDF unido, PDF filtrado, PDF
  convertido, Word convertido); atributos: nombre con sufijo CTools,
  listo para descarga.
- **Aviso al usuario**: Mensaje amigable ante formato inválido,
  contraseña, todas-las-páginas, rango inválido o PDF escaneado.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Una persona usuaria nueva completa la unión de 3 PDF y
  descarga el resultado en menos de 3 minutos desde que entra a la
  herramienta, sin ayuda externa.
- **SC-002**: El 95% de intentos de unir PDFs válidos terminan en un PDF
  descargado con todas las páginas en el orden elegido.
- **SC-003**: Una persona usuaria elimina páginas usando solo el campo de
  rangos ("1, 3, 5-8") y la selección visual coincide al instante en el
  100% de los casos válidos.
- **SC-004**: El sistema impide el 100% de los intentos de eliminar todas
  las páginas, mostrando aviso y sin generar archivo vacío o corrupto.
- **SC-005**: El 90% de las conversiones Word→PDF de documentos típicos
  (texto con formato, lista, tabla simple, imagen) producen un PDF válido
  que conserva esos elementos en orden.
- **SC-006**: El 90% de las conversiones PDF→Word de documentos con texto
  seleccionable producen un .docx editable válido con párrafos y saltos de
  página preservados.
- **SC-007**: El 100% de los PDF escaneados probados muestran el aviso de
  documento escaneado antes de entregar el resultado parcial.
- **SC-008**: El 100% de los archivos con formato incorrecto o PDF con
  contraseña muestran alerta amigable sin bloquear ni reiniciar la
  herramienta.
- **SC-009**: Tras cargar la aplicación una vez, las 4 herramientas
  completan sus tareas con el dispositivo sin conexión, demostrando que
  ningún archivo sale del dispositivo.
- **SC-010**: 9 de cada 10 personas usuarias completan su primera tarea
  (cualquiera de las 4) al primer intento y localizan la descarga y el
  botón "Empezar de nuevo" sin ayuda.

## Assumptions

- Se asumen navegadores modernos actualizados en escritorio y móvil; la
  experiencia prioritaria es escritorio con arrastrar y soltar, con
  alternativa por selector de archivos en táctil.
- Volumen de uso: a partir de 50 MB por archivo se muestra una
  advertencia suave sin bloquear; no hay límite estricto, el tope práctico
  lo pone la memoria del navegador. Referencia típica: PDF de hasta ~500
  páginas y .docx de hasta ~20 MB; archivos mayores pueden procesarse más
  lento pero no deben bloquear la interfaz.
- "Mantener calidad original" en la unión significa no recomprimir ni
  degradar el contenido: las páginas resultantes son visualmente
  equivalentes a las originales.
- "Mayor fidelidad posible" en conversiones significa mejor esfuerzo
  local: se conservan estructura, estilos básicos, listas, tablas simples
  e imágenes incrustadas; diseños complejos, macros o tipografías no
  estándar pueden simplificarse sin romper el archivo.
- Los PDF protegidos con contraseña quedan fuera del MVP: se detectan y se
  rechazan con aviso, no se solicita ni gestiona la contraseña.
- No hay cuentas, historial ni almacenamiento persistente: al recargar o
  pulsar "Empezar de nuevo" todo se descarta.
- Los nombres de descarga usan el nombre base del primer archivo o del
  archivo de entrada más el sufijo CTools indicado en FR-025.
- La referencia visual es iLovePDF en español solo como experiencia de
  simplicidad y flujo, no como copia de marca o diseño.
