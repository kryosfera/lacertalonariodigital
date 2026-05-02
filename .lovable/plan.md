# Plan: arreglar filtros visibles en Pacientes

## Problema
En el header de Pacientes, los chips de filtro comparten una sola fila con el toggle de vista (card/list) y el botón "Nuevo". En móvil (390px) se cortan y los últimos chips ("Sin visitas", "Recientes") quedan ocultos tras un scroll horizontal poco descubrible.

Además, el filtro **"Sin visitas"** aporta poco valor (un paciente recién creado sin recetas casi siempre cae ahí, duplica con "Con recetas" invertido) y compite por espacio.

## Cambios — `src/components/PatientList.tsx`

### 1. Eliminar filtro "Sin visitas"
- Quitar `"no_visits"` del tipo `FilterType` y del array `filterOptions`.
- Eliminar la rama `if (activeFilter === "no_visits") return !patient.last_recipe_date;` del `useMemo`.
- Reordenar opciones restantes: `Todos`, `Recientes`, `Con recetas` (3 chips, caben sin scroll a 390px).

### 2. Reorganizar header en 2 filas
Sustituir la fila única `Filters + view toggle + add` por:

- **Fila A — Chips de filtro**: ocupa ancho completo, centrada, los 3 chips visibles a la vez en móvil. Mantiene `overflow-x-auto` por si en el futuro se añaden más.
- **Fila B — Acciones**: a la izquierda el toggle de vista (LayoutGrid/List), a la derecha el botón "Nuevo paciente" con texto completo siempre visible (no solo `sm:inline`).

Esto deja respiraderos, evita que se corten elementos, y el botón principal de acción gana presencia.

## Resultado
- Los 3 filtros se ven completos en móvil sin scroll.
- Toggle de vista y CTA "Nuevo paciente" tienen su propia fila clara.
- Header sigue centrado y compacto, alineado con el estilo de Historial / Recomendaciones.

## Archivos afectados
- `src/components/PatientList.tsx` (único)
