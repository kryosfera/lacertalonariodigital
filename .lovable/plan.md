
# Sistema de Ticketing de Incidencias

Crear un sistema para que los usuarios (dentistas) reporten incidencias/bugs/sugerencias, y los admins las gestionen desde el panel.

## Funcionalidad

**Para usuarios autenticados (Modo Pro):**
- Botón "Reportar incidencia" en `ProfilePage` (sustituye el espacio del tutorial eliminado).
- Modal con formulario: título, categoría (bug/sugerencia/pregunta/otro), prioridad (baja/media/alta), descripción, captura opcional.
- Vista "Mis incidencias" con listado de tickets propios, estado y conversación.
- Pueden añadir comentarios y cerrar sus propios tickets.

**Para admins (`/admin` → nueva sección "Incidencias"):**
- Bandeja con todos los tickets, filtros por estado/prioridad/categoría, buscador.
- Detalle del ticket con conversación, cambio de estado (abierto/en_progreso/resuelto/cerrado), asignación de prioridad, respuesta interna.
- KPIs: tickets abiertos, tiempo medio de respuesta, por categoría.

## Estructura de datos

**Tabla `tickets`:**
- id, user_id (FK auth.users vía profile), title, description, category (enum: bug/feature/question/other), priority (enum: low/medium/high), status (enum: open/in_progress/resolved/closed), screenshot_url (nullable), created_at, updated_at, resolved_at.

**Tabla `ticket_messages`:**
- id, ticket_id, user_id, message, is_admin_reply (bool), created_at.

**Bucket de Storage:** `ticket-attachments` (privado, solo lectura para owner y admin).

## RLS

- `tickets`: usuario ve/edita los suyos (`auth.uid() = user_id`); admin ve todos (`has_role admin`); insertar requiere `auth.uid() = user_id`.
- `ticket_messages`: visible si el usuario es dueño del ticket o admin; insert sólo dueño o admin; trigger marca `is_admin_reply` automáticamente comprobando `has_role`.
- Trigger que actualiza `tickets.updated_at` y `resolved_at` al cambiar status.
- Trigger anti-escalada: usuarios no pueden cambiar `status` a otro valor que no sea `closed` ni modificar prioridad si no son admin.

## Componentes a crear

- `src/components/tickets/TicketDialog.tsx` — formulario de creación.
- `src/components/tickets/MyTicketsSheet.tsx` — listado y detalle del usuario.
- `src/components/tickets/TicketThread.tsx` — conversación reutilizable.
- `src/components/admin/TicketsAdmin.tsx` — bandeja admin con tabla, filtros y panel de detalle.
- `src/hooks/useTickets.tsx` — TanStack Query hooks (30s staleTime según convención).

## Integración UI

- `ProfilePage.tsx`: nueva sección "Soporte" con botones "Reportar incidencia" y "Mis incidencias".
- `AdminSidebar.tsx`: añadir entrada "Incidencias" (icono `LifeBuoy`) entre "Recetas" y "Mantenimiento".
- `Admin.tsx`: registrar la nueva sección y renderizar `TicketsAdmin`.
- Badge con contador de tickets abiertos en el sidebar admin.

## Realtime

- Habilitar `supabase_realtime` para `tickets` y `ticket_messages` para que admin y usuario vean nuevas respuestas sin refrescar.

## Notas

- Modo Básico (sin login) NO tiene acceso al sistema de tickets — debe iniciar sesión.
- Diseño Apple-minimal con rojo Lacer #E31937 para estados de prioridad alta.
- Soporta dark mode.
