## Detalle de Usuario en Panel Admin

Añadir la posibilidad de hacer clic en una fila de Usuarios para abrir una **vista de detalle** completa con todos los datos del profesional, sus recetas, pacientes y métricas de uso.

### Comportamiento (UX)

1. La búsqueda actual en `UsersAdmin` se mantiene tal cual (clínica, profesional, localidad, filtro por provincia).
2. Cada fila pasa a ser **clickable** (cursor pointer + hover destacado). Se añade además un botón "Ver detalle" en la columna de acciones para que la intención sea explícita y no entre en conflicto con los botones de "Hacer admin / Quitar".
3. Al hacer clic se abre un **panel/sheet lateral** (`Sheet` de shadcn) ocupando ~720px en desktop y pantalla completa en móvil, sin perder el listado de fondo. Esto permite navegar entre usuarios rápido sin cambiar de ruta.
4. Dentro del panel: cabecera con nombre de clínica, profesional, badge admin, provincia/localidad, fecha de registro y nº colegiado. Debajo, **tabs**: Resumen · Recetas · Pacientes · Actividad.

### Contenido del detalle

**Tab Resumen**
- KPIs en tarjetas tipo Bento: total recetas, recetas este mes, recetas dispensadas, % dispensación, media productos por receta, último uso (hace X días).
- Datos del perfil: dirección clínica, logo, miniatura de firma si existe.
- Top 5 productos prescritos por este usuario.
- Mini gráfico de líneas de recetas en los últimos 90 días.

**Tab Recetas**
- Tabla con todas las recetas del usuario (código, paciente, fecha, canal de envío, estado dispensada/pendiente, nº productos).
- Buscador interno + filtro estado (dispensada / pendiente).
- Acción "Exportar CSV" del listado del usuario.

**Tab Pacientes**
- Listado de pacientes del usuario (nombre, teléfono, email, nº recetas, última receta).
- Buscador por nombre/teléfono/email.

**Tab Actividad**
- Distribución por día de la semana y hora (heatmap reducido).
- Distribución por canal de envío (whatsapp / email / etc.).
- Histograma mensual de los últimos 12 meses.

### Implementación técnica

**1. Nuevas RPCs en Supabase** (security definer, restringidas a `authenticated` con check de admin vía `has_role`):

- `admin_user_overview(target_user uuid)` → fila única con KPIs del usuario (total, mes actual, dispensadas, % dispensación, avg productos, last_used_at, total pacientes).
- `admin_user_recipes_timeseries(target_user uuid, days int default 90)` → serie diaria.
- `admin_user_top_products(target_user uuid, lim int default 5)`.
- `admin_user_activity_heatmap(target_user uuid)` → weekday/hour/total últimos 90 días.
- `admin_user_send_methods(target_user uuid)` → método/total.
- `admin_user_patients_with_stats(target_user uuid)` → pacientes + nº recetas + última receta.

Todas con `WHERE user_id = target_user` y verificación `IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION ...`.

Las recetas del usuario se consultan directo con `supabase.from('recipes').select('*').eq('user_id', target_user)` (la policy "Admins can view all recipes" ya lo permite).

**2. Nuevos componentes**

- `src/components/admin/UserDetailSheet.tsx` — `Sheet` con cabecera + `Tabs` + las 4 secciones. Recibe `userId`, `profile` y `open/onOpenChange`.
- `src/components/admin/userDetail/UserOverviewTab.tsx`
- `src/components/admin/userDetail/UserRecipesTab.tsx`
- `src/components/admin/userDetail/UserPatientsTab.tsx`
- `src/components/admin/userDetail/UserActivityTab.tsx`

**3. Cambios en `UsersAdmin.tsx`**
- Estado `selectedUserId`.
- Fila clickable + nuevo botón "Ver detalle" (icon `Eye`) antes del botón de rol; `e.stopPropagation()` en los botones de admin para evitar que abra el sheet.
- Renderizar `<UserDetailSheet>` al final.

**4. React Query**
- `queryKey: ['admin-user-overview', userId]`, etc. Habilitadas solo cuando hay `userId` y el sheet está abierto (`enabled`).
- `staleTime: 30_000` siguiendo política del proyecto.

**5. Estilo**
- Reutiliza `KpiCard`, `ActivityHeatmap` (parametrizándolo o creando `MiniHeatmap`), tokens Lacer (rojo `#E31937`), soporte dark mode, animaciones Framer Motion para entrada de tabs.

### Ficheros previstos

Nuevos:
- `supabase/migrations/<timestamp>_admin_user_detail_rpcs.sql`
- `src/components/admin/UserDetailSheet.tsx`
- `src/components/admin/userDetail/UserOverviewTab.tsx`
- `src/components/admin/userDetail/UserRecipesTab.tsx`
- `src/components/admin/userDetail/UserPatientsTab.tsx`
- `src/components/admin/userDetail/UserActivityTab.tsx`

Modificados:
- `src/components/admin/UsersAdmin.tsx`
- `src/integrations/supabase/types.ts` (autogenerado tras la migración)

### Datos
Toda la información mostrada será **100% real** desde Supabase, sin mockups, igual que el resto del dashboard admin.

¿Apruebas el plan?