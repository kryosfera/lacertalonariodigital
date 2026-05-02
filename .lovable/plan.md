
# Rediseño de Historial y Pacientes

Aplicar el mismo lenguaje visual de la pantalla de Recomendaciones a las pantallas de **Historial de Recetas** (`RecipeHistory.tsx`) y **Pacientes** (`PatientList.tsx`), maximizando la densidad de información en la vista inicial.

## Objetivo

- Encabezado centrado, compacto y consistente con Recomendaciones.
- Fila única de filtros + selector de vista (tarjeta / lista).
- Por defecto, **vista de lista** para que se vean más datos en pantalla.
- Vista de tarjeta como alternativa para quien prefiera más detalle visual.

---

## 1. Pantalla "Historial de Recetas"

### Encabezado (replicando Recomendaciones)
- Título compacto `text-2xl md:text-3xl` "Historial".
- Subtítulo `text-sm` "Recetas enviadas y dispensadas".
- **Buscador** con icono lupa, full width, redondeado.
- **Fila única**: chips de filtro (Todos · WhatsApp · Email · PDF · Pendientes · Retiradas) con scroll horizontal `overflow-x-auto scrollbar-none`, y a la derecha el toggle `LayoutGrid` / `List`.

### Vista LISTA (por defecto, alta densidad)
Cada receta es una fila `<li>` compacta con dos líneas:
- **Línea 1**: Nombre paciente (bold) · fecha corta · badge canal envío (icono pequeño) · badge estado (Pendiente/Retirada).
- **Línea 2**: Resumen productos `2x Lacer · Bexident · +3` (text-xs muted) y a la derecha mini-iconos acción: Duplicar, PDF.
- Tap en la fila abre acciones; foco/hover con anillo accesible.

### Vista TARJETA
Mantener estructura actual de `Card` pero más compacta: grid `md:grid-cols-2 lg:grid-cols-3`, padding reducido, badges en una fila.

### "Cargar más"
Se mantiene tal cual al final, fuera del listado.

---

## 2. Pantalla "Pacientes"

### Encabezado
- Título `text-2xl md:text-3xl` "Pacientes".
- Subtítulo `text-sm` "Tu base de pacientes".
- **Buscador** con icono lupa.
- **Fila única**: a la izquierda chips de filtro rápido (Todos · Con recetas · Sin visitas · Recientes), a la derecha el toggle vista + botón **"+ Nuevo"** compacto (icono `Plus`).

### Vista LISTA (por defecto)
Cada paciente como fila `<li>` con dos líneas:
- **Línea 1**: Nombre paciente · badge `N recetas` · última visita (fecha corta).
- **Línea 2**: Teléfono · email truncado · iconos acción a la derecha (Ver recetas, Editar, Eliminar) en botones circulares pequeños.
- Click en la fila → `onViewPatient`.

### Vista TARJETA
Grid `md:grid-cols-2 lg:grid-cols-3` con la `Card` actual ligeramente compactada (avatar/inicial opcional, padding reducido).

### Diálogos
Se conservan los diálogos existentes (crear/editar/eliminar) sin cambios funcionales.

---

## Detalles técnicos

- Nuevo estado en cada componente: `viewMode: 'card' | 'list'` (default `'list'`) y `activeFilter`.
- Iconos `LayoutGrid` y `List` de `lucide-react` (ya usados en Recomendaciones).
- Reutilizar utilidades `cn` y clases del toggle ya validadas en `SurgeryRecommendations.tsx` (`bg-muted rounded-full p-0.5`, botones `w-8 h-8`).
- Listas semánticas: `<ul role="list">` + `<li>`, `aria-label` en botones de acción, anillos `focus-visible:ring-2 ring-ring`.
- Mantener intactos hooks (`useRecipes`, `usePatients`), tipos y handlers existentes — solo se reemplaza la capa de presentación.
- Sin cambios de DB ni de rutas.

## Archivos a modificar

- `src/components/RecipeHistory.tsx`
- `src/components/PatientList.tsx`

## Fuera de alcance

- No se cambia la lógica de paginación, filtros de datos del servidor, ni el `RecipeCreator`.
- No se modifica el `PatientDetail`.
