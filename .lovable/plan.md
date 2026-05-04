## Buscador y filtros en Sesiones activas

Añadir controles de búsqueda y filtrado client-side al panel de Sesiones Activas (`src/components/admin/ActiveSessionsAdmin.tsx`). Los datos siguen viniendo del RPC `admin_active_sessions` con auto-refresh cada 30s; el filtrado se aplica en memoria sobre el array ya cargado.

### Controles a añadir (encima de la tabla)

1. **Buscador de texto libre** (`Input` con icono `Search`)
   - Coincide (case-insensitive) contra: `email`, `clinic_name`, `professional_name`, `ip`.
   - Placeholder: "Buscar por email, profesional, clínica o IP…"
   - Botón "X" para limpiar cuando hay texto.

2. **Filtro por dispositivo** (`Select`)
   - Opciones: Todos · iOS · Android · macOS · Windows · Linux · Otro.
   - Usa la misma función `parseUserAgent` ya existente para clasificar cada fila.

3. **Filtro por estado** (`Select`)
   - Opciones: Todos · En línea (últimos 5 min) · Inactivas.
   - Reutiliza el umbral `onlineThreshold` que ya existe.

### Comportamiento

- Los tres filtros se combinan con AND.
- El contador del header pasa a mostrar: `X de Y sesiones · Z en línea` (X = resultados filtrados, Y = total, Z = en línea dentro del filtrado).
- Si los filtros no devuelven resultados pero sí hay datos cargados, mostrar mensaje "No hay sesiones que coincidan con los filtros aplicados." con un botón "Limpiar filtros".
- Estado local con `useState` para los tres filtros; cálculo derivado con `useMemo` para no recomputar en cada render.

### Layout

```text
┌─ Sesiones activas ──────────────── [Actualizar] ┐
│ 12 de 45 sesiones · 8 en línea ahora            │
├─────────────────────────────────────────────────┤
│ [🔍 Buscar...]  [Dispositivo ▾] [Estado ▾]      │
├─────────────────────────────────────────────────┤
│ Tabla (sin cambios estructurales)               │
└─────────────────────────────────────────────────┘
```

En viewport ≥ md los tres controles se alinean en fila (`flex gap-2`); en móvil se apilan (`flex-col`).

### Archivos modificados

- `src/components/admin/ActiveSessionsAdmin.tsx` — único archivo. No hace falta tocar backend, RPC, ni tipos: todos los campos ya vienen en la respuesta actual.

### Fuera de alcance

- Persistir filtros entre recargas (no se guardan en URL ni localStorage).
- Filtrado server-side (innecesario: el volumen de sesiones activas concurrentes es bajo).
- Filtros equivalentes en Auditoría de Accesos — se pueden añadir aparte si lo necesitas.
