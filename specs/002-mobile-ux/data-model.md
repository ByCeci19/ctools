# Data Model: CTools — Experiencia móvil y táctil

**Feature**: `specs/002-mobile-ux/spec.md` | **Date**: 2026-10-15

Feature puramente presentacional: **cero entidades de datos nuevas**.
Este documento fija los estados de UI y reglas de visibilidad que rigen
las 4 vistas bajo 768 px. Todo lo no mencionado hereda `data-model.md`
de 001-ctools-mvp.

## Variante de layout (derivada, sin estado)

| Condición | Variante | Efectos |
|-----------|----------|---------|
| Ancho < 768 px | compacta | Cabecera con menú, textos táctiles, tarjetas compactas, botones Subir/Bajar, rangos fijos arriba, barra de acción fija abajo |
| Ancho ≥ 768 px | escritorio | Todo idéntico a 001-ctools-mvp (FR-012) |

Resuelta solo con CSS (`md:`); sin estado JS ni persistencia.

## Estados de UI nuevos (locales, efímeros)

### Menú móvil (`Header`, en `App.tsx`)

| Campo | Tipo | Reglas |
|-------|------|--------|
| open | boolean | Solo existe bajo 768 px (botón `md:hidden`); `false` inicial |
| Transiciones | — | `cerrado → abierto` (pulsar botón) · `abierto → cerrado` (elegir herramienta, `Escape`, clic fuera). Al pasar a ≥768 px el panel queda oculto por CSS sin necesidad de cerrar el estado |

### Barra de acción fija (`StickyActionBar`, compartido)

| Campo | Tipo | Reglas |
|-------|------|--------|
| visible | boolean derivado | `ancho < 768 AND fase == config AND hay archivos` |
| acción | botón principal | Mismo handler que el botón en flujo (Unir/Eliminar/Convertir); deshabilitado con las mismas reglas (p. ej. <2 archivos, 0 seleccionadas) |

Reglas: nunca coexiste con el botón en flujo (visibilidades
excluyentes `md:hidden` / `max-md:hidden`); respeta safe-area;
la vista reserva espacio inferior (FR-010); no aparece sin archivos
(FR-011) ni fuera de configuración (clarify FR-009).

## Reglas por vista (< 768 px)

- **Unir**: tarjetas apiladas (miniatura izq. / datos der.) + botones
  Subir/Bajar por tarjeta (`md:hidden`); DnD por pulsación mantenida
  (TouchSensor con retardo) + ratón/teclado como antes.
- **Eliminar**: cuadrícula 2 columnas (ya existente); bloque
  rangos+contador fijo arriba bajo cabecera; éxito/progreso igual.
- **Conversiones**: tarjetas contenidas (`min-w-0`, cortes de texto);
  cero scroll-x en todos los pasos.
