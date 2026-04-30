## Problema

En la pantalla de Inicio, las cifras de "Este mes / Recetas / Pacientes" muestran 0/0/0, mientras que el Dashboard muestra 7/3/11 para el mismo usuario. Los datos en BD confirman que las cifras del Dashboard son correctas (usuario `3e96…`: 11 recetas, 7 este mes, 3 pacientes).

## Causa raíz

Dos problemas combinados en `src/hooks/useHomeStats.tsx`:

1. **Caché obsoleta**: usa `staleTime: 30s` y solo refresca al enfocar la ventana o cada 60 s mientras está montado. Si el usuario crea recetas en otra pestaña/PWA o vuelve al Home antes de que pase el intervalo, sigue viendo 0.
2. **Sin realtime ni invalidación tras navegación**: aunque `useRecipes` y `usePatients` invalidan la query `['home-stats']` al crear recetas/pacientes localmente, si los datos llegan por otra vía (otro dispositivo, segundo tab, edge case durante la sesión inicial donde `user.id` aún no estaba listo) la card del Home no se entera. Además, la query inicial puede haberse ejecutado **antes** de que `user` estuviera disponible y haber cacheado un resultado vacío con clave `['home-stats', undefined]` que luego nunca se invalida.

El Dashboard (`DashboardStats`) usa `staleTime: 60s` también pero se monta solo al entrar a esa pestaña, por lo que casi siempre refetchea fresco — por eso se ven datos correctos ahí.

## Plan

### 1. Robustecer `src/hooks/useHomeStats.tsx`
- Reducir `staleTime` a `0` (siempre considerar datos viejos) y mantener `refetchOnWindowFocus: true`.
- Añadir `refetchOnMount: 'always'` para que al volver al Home siempre traiga datos frescos.
- Asegurar `enabled: !!user?.id` (ya está) y usar `user?.id` como dependencia única, así nunca se cachea con `undefined`.
- Añadir suscripción Realtime a `recipes` y `patients` filtradas por `user_id` que invaliden `['home-stats', user.id]` al detectar `INSERT/UPDATE/DELETE`.

### 2. Habilitar Realtime en BD (migración)
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.patients;
ALTER TABLE public.recipes REPLICA IDENTITY FULL;
ALTER TABLE public.patients REPLICA IDENTITY FULL;
```
(Si ya están añadidas, los `ADD TABLE` fallarán de forma idempotente — se envuelven en un bloque `DO` que ignora el error.)

### 3. Invalidación al volver al tab Home
En `src/pages/Index.tsx`, cuando `activeTab` cambia a `"home"`, llamar a `refetchHomeStats()` para garantizar refresco inmediato al volver desde Nueva Receta o Dashboard.

## Archivos

- editado: `src/hooks/useHomeStats.tsx` (staleTime 0, refetchOnMount, suscripción Realtime)
- editado: `src/pages/Index.tsx` (refetch al activar tab Home)
- nuevo: `supabase/migrations/<timestamp>_realtime_home_stats.sql`

## Resultado esperado

Al abrir el Home (incluso tras crear recetas en otra pestaña o dispositivo), las cifras de "este mes / recetas / pacientes" coincidirán siempre con las del Dashboard, y se actualizarán en vivo sin recargar.
