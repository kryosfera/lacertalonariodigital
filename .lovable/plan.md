# Panel de Sesiones Activas y Auditoría de Accesos

Añadir dos nuevas vistas en el panel de Admin (`/admin`) accesibles solo para usuarios con rol `admin`:

1. **Sesiones Activas** — quién está autenticado ahora mismo.
2. **Auditoría de Accesos** — historial de logins (cuándo se conectó cada usuario).

## 1. Backend: funciones SECURITY DEFINER

Como `auth.sessions` y `auth.audit_log_entries` están en el schema reservado `auth`, no se pueden consultar desde el cliente. Crearemos dos funciones en `public` protegidas con `has_role(auth.uid(), 'admin')`:

- **`admin_active_sessions()`** — lee de `auth.sessions` (filtrando `not_after > now()` o sin expirar) + `auth.users` + `public.profiles`. Devuelve: `user_id`, `email`, `clinic_name`, `professional_name`, `created_at` (inicio sesión), `updated_at` (última actividad), `user_agent`, `ip`.
- **`admin_login_audit(days int default 30, lim int default 200)`** — lee de `auth.audit_log_entries` filtrando `payload->>'action' IN ('login','logout','token_refreshed','user_signedup')`. Devuelve: `timestamp`, `user_id`, `email`, `action`, `ip_address`, `user_agent`.

Ambas lanzan `RAISE EXCEPTION 'Not authorized'` si el solicitante no es admin.

## 2. Frontend: dos secciones en el sidebar de Admin

En `src/components/admin/AdminSidebar.tsx` añadir dos items: "Sesiones activas" y "Auditoría". Crear:

- **`src/components/admin/ActiveSessionsAdmin.tsx`** — tabla con auto-refresh cada 30s. Columnas: clínica/profesional, email, inicio sesión, última actividad, IP, dispositivo (parseo simple de `user_agent`). Badge verde "En línea" si `updated_at` < 5 min.
- **`src/components/admin/AuditLogAdmin.tsx`** — tabla paginada con filtro por rango de fechas (reutilizando `DashboardRangeFilter`) y por tipo de acción (login/logout/signup). Export a CSV opcional usando el patrón de `dashboardExport.ts`.

Registrar las rutas en `src/pages/Admin.tsx`.

## 3. Detalles técnicos

```text
Migration → 2 funciones SECURITY DEFINER en public, search_path=public,auth
Frontend  → React Query (staleTime 0, refetchInterval 30s para sesiones)
Estilo    → mismo patrón visual que UsersAdmin / RecipesAdmin (Card + Table shadcn)
Acceso    → solo usuarios en user_roles con role='admin'
```

No se modifica nada del flujo de autenticación existente; solo lectura de tablas internas de Supabase Auth a través de funciones seguras.

## Fuera de alcance

- No se cierran sesiones de forma remota (requeriría service_role en una edge function — lo añadimos en una siguiente iteración si lo necesitas).
- No se guardan logs propios duplicados; se aprovecha lo que Supabase ya registra.