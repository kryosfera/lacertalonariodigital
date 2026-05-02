# Plan: Historial y Pacientes — limpieza y modal de detalle

## 1. Quitar títulos duplicados (`src/pages/Index.tsx`)

Actualmente `Index.tsx` añade un header propio (`<h2>Historial</h2>` / `<h2>Pacientes</h2>` + subtítulo) por encima de los componentes, que ya pintan su propio header centrado. Se eliminarán esos wrappers para los casos `historial`, `pacientes` y `dashboard`/`perfil` (revisar consistencia), dejando que cada componente gestione su propio encabezado.

- `case "historial"`: renderizar `<RecipeHistory ... />` directo (sin div extra con `space-y-4 px-4` ni `<h2>`).
- `case "pacientes"`: renderizar `<PatientList ... />` directo.
- Mantener `pb-20 md:pb-0` aplicado dentro de los propios componentes (ya lo hacen con `pb-24 md:pb-8`).

## 2. Aprovechar mejor el ancho (paddings)

En móvil hoy se acumula: `main` con `container` + `px-4` del wrapper + `px-5` interno del componente = ~36px laterales.

- En `Index.tsx` quitar el `px-4` del wrapper de historial/pacientes (al eliminar el wrapper queda resuelto).
- En `RecipeHistory.tsx` y `PatientList.tsx`:
  - Header: `px-4` en lugar de `px-5`.
  - Lista/contenido: `px-3 md:px-5` para ganar ancho en móvil.
  - Items de lista: `px-3 py-2.5` en lugar de `px-4 py-3`.

## 3. Simplificar listados (no truncar, menos info)

Objetivo: que el nombre completo del paciente/receta se vea sin `truncate`, mostrando solo lo esencial. El resto va al modal de detalle.

### `RecipeHistory.tsx` — vista lista
Cada item se reduce a una sola línea visual flexible:
- Icono de canal (pequeño)
- Nombre del paciente con `whitespace-normal break-words` (sin `truncate`), ocupa el espacio disponible
- Badge de estado único: Retirada / Pendiente (quitar el badge de canal redundante, ya está el icono)
- Fecha corta a la derecha (solo `dd MMM`)
- Botón único `chevron-right` (abre modal de detalle)

Quitar de la lista: resumen de productos, badge de canal, botones de duplicar/descargar (se moverán al modal).

### `PatientList.tsx` — vista lista
Cada item:
- Avatar con inicial
- Nombre completo (`whitespace-normal break-words`, sin `truncate`)
- Badge `N recetas`
- Botón único `chevron-right` (abre modal de detalle)

Quitar de la lista: teléfono, email, fecha última visita, botones editar/eliminar/recetas.

Toda la fila es clickable (`<button>` envolviendo el contenido) además del chevron explícito, para mejor target táctil.

## 4. Modal de detalle por elemento

Crear dos componentes nuevos basados en `Sheet` (drawer lateral en desktop, bottom sheet en móvil — ya existe `@/components/ui/sheet`).

### `src/components/RecipeDetailSheet.tsx`
Props: `recipe: Recipe | null`, `open`, `onOpenChange`, `onDuplicate`, `onDownloadPDF`.

Contenido:
- Cabecera: nombre paciente, fecha larga, badges (canal + estado dispensación)
- Sección Productos: lista completa con cantidades (sin `+N`, todos visibles)
- Sección Notas (si existen)
- ID receta (monospace, pequeño)
- Acciones al pie: `Duplicar`, `Descargar PDF`

### `src/components/PatientDetailSheet.tsx`
Props: `patient: Patient | null`, `open`, `onOpenChange`, `onViewRecipes`, `onEdit`, `onDelete`.

Contenido:
- Avatar grande + nombre
- Badge de nº recetas, fecha última visita
- Datos de contacto: teléfono, email (con iconos)
- Notas si existen
- Acciones: `Ver recetas`, `Editar`, `Eliminar` (destructivo)

Nota: `PatientList` ya tiene los handlers `handleOpenEdit`, `handleOpenDelete`, y `onViewPatient`; el sheet los reutiliza. `RecipeHistory` reutilizará `onDuplicate` y `handleDownloadPDF`.

## 5. Vista card

Mantener la vista card existente con cambios mínimos: al pulsar la card también abre el sheet (en lugar de tener botones redundantes), conservando solo el botón principal de acción dentro de la card. Criterios pequeños de padding (`p-3` en vez de `p-4`) para coherencia.

## Archivos a modificar
- `src/pages/Index.tsx` — quitar wrappers con título duplicado
- `src/components/RecipeHistory.tsx` — simplificar lista, integrar sheet, ajustar padding
- `src/components/PatientList.tsx` — simplificar lista, integrar sheet, ajustar padding

## Archivos nuevos
- `src/components/RecipeDetailSheet.tsx`
- `src/components/PatientDetailSheet.tsx`
