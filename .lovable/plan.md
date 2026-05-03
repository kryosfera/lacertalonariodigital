## Objective

Dar a toda la app una identidad visual coherente y "acabada", aplicando el mismo lenguaje visual (header, tipografía, tarjetas, chips, botones, separadores y fondos) que ya está consolidado en **Pacientes** e **Historial**, al resto de pantallas (Inicio/Recetas/Recomendaciones/Perfil/Detalle paciente y wrappers de `Index.tsx`).

## Identidad visual canónica (la que tomamos como referencia)

Extraída de `PatientList.tsx` y `RecipeHistory.tsx`:

- **Wrapper de pantalla**: `space-y-5 pb-24 md:pb-8 pt-safe`
- **Header centrado**:
  - Título: `text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none`
  - Subtítulo: `text-sm md:text-base text-muted-foreground mt-1`
  - Sin logo dentro del header (el logo Lacer queda reservado al FAB y al hero del Home)
- **Padding lateral unificado**: `px-3 md:px-5` (eliminar `px-4`/`px-5` sueltos)
- **Buscador**: input `h-10 rounded-full bg-background` con icono lupa absoluto
- **Filter chips**: pill `px-3.5 py-1.5 rounded-full text-xs font-medium border` con estado activo `border-primary text-primary bg-background shadow-sm`
- **Toggle vista (grid/list)**: `bg-muted rounded-full p-0.5` con botones circulares `w-8 h-8`
- **Cards**:
  - List item: `bg-card rounded-2xl border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]`
  - Card grande: `rounded-2xl border border-border/40 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]`
- **Botones primarios**: `rounded-full`, altura `h-8` (compactos) o `h-9` (acción principal)
- **Badges**: `text-[10px] px-1.5 py-0`
- **Color**: rojo Lacer `--primary` (sin azules accidentales)

## Cambios concretos por pantalla

### 1. `src/pages/Index.tsx` (wrappers)
- Quitar el wrapper extra con `px-4` y `pb-20 md:pb-0` que envuelve a `SurgeryRecommendations`, `PatientList`, `RecipeHistory` y `ProfilePage` (esos componentes ya gestionan su padding y `pt-safe`); dejarlos renderizar directamente.
- Rehacer el header de **Nueva Receta** (`case "nueva-receta"`) con el patrón canónico (sin caja blanca con logo): título centrado `Nueva receta` + subtítulo, padding `px-3 md:px-5 pt-4`.
- Quitar el bloque header del **Dashboard** (`case "dashboard"`) y rehacerlo igual.

### 2. `src/components/SurgeryRecommendations.tsx`
- Header actual incluye un logo Lacer suelto y `px-5`. Cambiar a:
  - Quitar el `<img lacerLogo />` del header (mantenemos identidad sin logo redundante; el logo ya vive en el FAB y en el Home).
  - Aplicar `px-3 md:px-5` y subtítulo "Material para tus pacientes" con tipografía canónica.
  - Reorganizar la fila de filtros + toggle al mismo orden que Pacientes/Historial (chips arriba, toggle debajo a la derecha) para coherencia.

### 3. `src/components/ProfilePage.tsx`
- Ya está cerca; ajustar:
  - Reducir `space-y-3` entre cards a `space-y-2` y unificar al `gap-2` que usan list items en Pacientes.
  - Asegurar mismo subtítulo del header y mismo `text-sm md:text-base text-muted-foreground mt-1` (ya lo tiene).
  - Iconos de cabecera de `SectionCard`: usar siempre `bg-primary/10 text-primary` para evitar cambios de color (azul `accent`/`secondary`) que rompen la identidad rojo Lacer. Cambiar todos los `iconBg` a la variante primary.

### 4. `src/components/PatientDetail.tsx`
- Adaptar su header al patrón canónico (título `text-2xl md:text-3xl font-bold tracking-tight`, subtítulo `text-sm md:text-base text-muted-foreground`), botón "Volver" como pill `rounded-full h-8 text-xs`, padding `px-3 md:px-5 pt-4`, wrapper `space-y-5 pb-24 md:pb-8 pt-safe`. Tarjetas internas con el mismo estilo `rounded-2xl border border-border/40`.

### 5. `src/components/RecipeCreator.tsx` (solo barniz visual de cabecera y botones de acción superior)
- No tocar la lógica. Cambiar:
  - Botones principales (Enviar, PDF, etc.) a `rounded-full` y altura coherente `h-9`.
  - Card de paciente / notas: `rounded-2xl border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)]` para igualar al resto.
  - Eliminar cualquier sombra `shadow-md/lg` heredada de `Card` por defecto en bloques superiores.

### 6. `src/components/HomeScreen.tsx` (modo básico) y `src/components/home/HomeScreenBento.tsx`
- Mantener el hero rojo (es la firma del Home), pero:
  - Asegurar mismo padding lateral en el resto del Home (`px-3 md:px-5` debajo del hero) y mismo `rounded-2xl border border-border/40` en las tiles secundarias para que casen visualmente con Pacientes/Historial.
  - Botones del hero a `rounded-full` con la misma altura.

### 7. `src/index.css`
- Añadir clases utilitarias compartidas para no repetir cadenas largas:
  - `.screen-wrapper` → `space-y-5 pb-24 md:pb-8 pt-safe`
  - `.screen-header` → `px-3 md:px-5 pt-4 text-center`
  - `.screen-title` → `text-2xl md:text-3xl font-bold text-foreground tracking-tight leading-none`
  - `.screen-subtitle` → `text-sm md:text-base text-muted-foreground mt-1`
  - `.card-soft` → `bg-card rounded-2xl border border-border/40 shadow-[0_1px_4px_rgba(0,0,0,0.03)]`
  - `.chip-pill` (activo/inactivo via modificador) — opcional
- Aplicar estas clases en los componentes anteriores.

## Out of scope

- Pantallas de admin (`src/components/admin/*`) — tienen su propio sistema y no son parte del flujo de usuario.
- Páginas legales (`CookiePolicy`, `PrivacyPolicy`, `LegalNotice`) — solo retoque mínimo del header si ya destaca; no rediseño.
- Lógica de negocio, hooks, datos.

## Resultado esperado

Todas las pantallas principales comparten:
- El mismo header centrado (título + subtítulo) sin logos sueltos.
- Las mismas tarjetas redondeadas (`rounded-2xl`, borde `border/40`, sombra suave).
- Los mismos chips y toggles tipo pill.
- Botones `rounded-full` y paleta rojo Lacer consistente.
- Padding lateral `px-3 md:px-5` y `pt-safe` en todas.
