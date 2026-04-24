## Diagnóstico

Hay dos cosas distintas llamadas "Dashboard" en la app:

1. **Dashboard del admin** (`/admin` → `AdminDashboard.tsx`): el nuevo con 7 KPIs, mapa de España, heatmap, top productos, etc. **Ya existe y funciona.**
2. **Dashboard del profesional** (`/` → tab "dashboard" → `DashboardStats.tsx`): el antiguo de 5 KPIs personales del usuario. Es lo que Joaquín está viendo.

Joaquín entra como admin pero la auto-redirección a `/admin` **solo está activa en móvil** (`Index.tsx` línea 46: `if (isMobile && isAdmin)`). En desktop (1336px) aterriza en la home normal y, al pulsar "Dashboard" en la navegación lateral, ve el `DashboardStats` antiguo en lugar del panel admin.

## Cambios a aplicar

### 1. Auto-redirect admin → `/admin` en todos los dispositivos
En `src/pages/Index.tsx` quitar la condición `isMobile` para que **cualquier admin** que entre a `/` sea redirigido a `/admin` (respetando el flag `admin_skip_mobile_redirect` cuando viene de pulsar "Ver como profesional" en el header del panel).

```ts
useEffect(() => {
  if (isAdmin) {
    if (sessionStorage.getItem('admin_skip_mobile_redirect') === '1') {
      sessionStorage.removeItem('admin_skip_mobile_redirect');
      return;
    }
    navigate("/admin", { replace: true });
  }
}, [isAdmin, navigate]);
```

Renombro mentalmente la flag (el nombre se queda igual para no romper nada en `Admin.tsx`, solo cambia el comportamiento).

### 2. Redirección post-login para admins
En `src/pages/Auth.tsx`, tras un login exitoso, comprobar el rol y enviar al admin a `/admin` directamente en lugar de a `/`. Igualmente en el `useEffect` que redirige cuando ya hay sesión activa.

Esto evita el "parpadeo" de cargar Index → detectar admin → redirigir.

### 3. Unificar el Dashboard del profesional con el del admin (opcional pero recomendado)
El tab "dashboard" del Index (que ven los profesionales no-admin) sigue mostrando `DashboardStats` (5 KPIs básicos). Para evitar confusión futura propongo dejarlo como está porque:
- Un profesional ve **sus** estadísticas (filtradas por `user_id`).
- Un admin ve **todas** las estadísticas globales en `/admin`.

Son audiencias y datos distintos, no conviene fusionarlos. Si prefieres que también el profesional vea un dashboard más rico, lo abordamos en una iteración aparte.

### 4. Limpieza del header del Index para admins
Como un admin nunca verá el Index (siempre redirigido), no hace falta tocar el botón ⚙️ del header. Se mantiene por si el admin pulsa "Ver como profesional" desde `/admin` y quiere volver.

## Archivos a modificar
- `src/pages/Index.tsx` — quitar la restricción `isMobile` del redirect admin.
- `src/pages/Auth.tsx` — tras login, comprobar rol admin vía `user_roles` y redirigir a `/admin` si aplica.

No requiere migraciones ni cambios en backend.

## Resultado esperado
- Joaquín (admin) entra con `joaquin@kryofera.com` → aterriza directo en `/admin` con el dashboard nuevo (7 KPIs, mapa, heatmap, etc.).
- Si pulsa "Ver como profesional" desde el header del panel, va a `/` y puede navegar como profesional sin que le redirija de vuelta (gracias a la flag de sesión).
- Cualquier otro admin (Enrique cuando entre) tendrá el mismo flujo.
