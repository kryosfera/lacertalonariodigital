## Objetivo

1. Mostrar el **email** de cada usuario en la tabla de Admin → Usuarios (para identificar los registros con clínica/profesional vacíos).
2. Permitir a un admin **eliminar un usuario** completamente (cuenta auth + perfil + recetas + pacientes asociados) con confirmación.

El email de auth no está accesible vía RLS desde el cliente: se necesita un Edge Function con `service_role`.

---

## Cambios

### 1. Edge Function nueva: `admin-manage-users`
Function única con dos acciones (validando que el llamante sea admin):

- `action: "list_emails"` → devuelve `{ user_id, email, last_sign_in_at }[]` desde `auth.admin.listUsers()`. Se pagina internamente hasta cubrir todos los usuarios.
- `action: "delete_user", target_user_id` → 
  - Bloquea autoeliminación (`target_user_id === caller`).
  - Bloquea eliminación de otros admins (para evitar lock-out accidental).
  - Llama `auth.admin.deleteUser(target_user_id)`.
  - Las tablas con `user_id` (profiles, patients, recipes, recipe_templates, tickets, ticket_messages, user_roles) **no tienen FK a auth.users**, así que se borran explícitamente con service_role tras eliminar la cuenta auth.

Patrón idéntico al `manage-admin-role` existente (validación de Authorization + comprobación de `user_roles`).

### 2. `src/components/admin/UsersAdmin.tsx`
- Nueva query `admin-user-emails` que invoca `admin-manage-users` con `list_emails` (sólo si el usuario es admin). Resultado: `Map<user_id, email>`.
- Nueva columna **Email** en la tabla, entre "Clínica/Profesional" y "Provincia". Si la clínica/profesional está vacío, el email es la pista principal de quién es.
- Búsqueda actualizada para incluir email.
- Nuevo botón **Eliminar** (icono `Trash2`, variant `ghost` rojo) en la columna Acciones, deshabilitado si:
  - es uno mismo, o
  - el usuario destino es admin.
- `AlertDialog` de confirmación con texto explícito advirtiendo que se borrarán **todos** los datos asociados (perfil, pacientes, recetas, plantillas, tickets) y es **irreversible**. Requiere escribir el nombre de la clínica (o el email si no hay clínica) para activar el botón "Eliminar definitivamente".
- Tras éxito: invalida `admin-profiles`, `admin-recipe-counts`, `admin-user-emails`.

### 3. `src/components/admin/UserDetailSheet.tsx` (menor)
- Mostrar el email bajo el nombre de la clínica en la cabecera (junto a localidad/colegiado), si está disponible (pasado por prop opcional).

---

## Notas técnicas
- `supabase/config.toml`: añadir bloque para `admin-manage-users` con `verify_jwt = true` (default).
- Se reutilizan los patrones de validación de admin del `manage-admin-role`.
- No se tocan tablas ni RLS — todo se hace vía service_role en el edge function.
- No se borra storage (firma/logo) explícitamente; quedan huérfanos en el bucket. Si quieres también limpieza de storage, dímelo y lo añado.
