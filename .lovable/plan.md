
# Auditoría técnica: Puntos de fallo, escalabilidad y mantenimiento

## Estado actual de la aplicación

La app es una PWA React + Supabase (Lovable Cloud) con estas capas:
- Frontend: React + TanStack Query (caché de cliente)
- Backend: Base de datos Supabase con RLS + Edge Functions (IA, sincronización de imágenes)
- Almacenamiento: Buckets públicos para imágenes de productos/categorías
- Distribución: PWA con Workbox (caché offline)

---

## 1. Puntos de fallo identificados

### CRITICO - Consultas N+1 en `usePatients`
**Archivo:** `src/hooks/usePatients.tsx` (líneas 51-72)

El hook hace 1 consulta principal + 2 consultas adicionales por cada paciente (`count` + `last_recipe`). Con 50 pacientes = 101 peticiones simultáneas a la base de datos.

**Solución:** Reemplazar con una sola consulta usando agregación SQL mediante una función de base de datos o una vista.

```sql
-- Migración: crear vista optimizada
CREATE OR REPLACE VIEW patients_with_stats AS
SELECT 
  p.*,
  COUNT(r.id) as recipe_count,
  MAX(r.created_at) as last_recipe_date
FROM patients p
LEFT JOIN recipes r ON r.patient_id = p.id
GROUP BY p.id;
```

### CRITICO - `short_urls` crece sin límite y nunca se limpian
**Archivo:** `src/lib/recipeUtils.ts` + tabla `short_urls`

Las recetas de usuarios básicos crean entradas en `short_urls` con `expires_at = now() + 30 days`. Sin embargo, los registros expirados nunca se eliminan. Con muchos usuarios, la tabla crece indefinidamente y las consultas se ralentizan.

**Solución:** Añadir un índice en `expires_at` y una función de limpieza periódica.

```sql
-- Índice para acelerar búsquedas por código y limpiezas por fecha
CREATE INDEX IF NOT EXISTS idx_short_urls_code ON short_urls(code);
CREATE INDEX IF NOT EXISTS idx_short_urls_expires_at ON short_urls(expires_at);
```

### ALTO - La carga de productos no tiene caché persistente entre sesiones
**Archivo:** `src/components/RecipeCreator.tsx` (líneas 95-109)

Cada vez que el usuario abre la app, se vuelven a descargar todos los productos activos. La PWA cachea assets estáticos pero no los datos de la API. Con 87 productos y muchos usuarios simultáneos, esto genera carga repetitiva en la base de datos.

**Solución:** Configurar `staleTime` en TanStack Query para los productos y categorías (datos que cambian raramente). Ya hay configuración Workbox con `NetworkFirst` para Supabase, pero la caché de React Query no tiene `staleTime` definido.

### ALTO - La página de receta pública (`/receta?n=CODE`) no tiene manejo de rate limiting
**Archivo:** `src/pages/Recipe.tsx`

La receta pública se puede consultar por cualquiera sin autenticación. Una URL compartida masivamente (ej. en un grupo de farmacéuticos) puede generar picos de consultas directas a la base de datos. RLS permite acceso a todas las recetas con `recipe_code IS NOT NULL`, por lo que no hay protección adicional.

**Solución:** La PWA con Workbox ya cachea las respuestas de Supabase (NetworkFirst, 24h). Esto ayuda, pero convendría añadir `staleTime` en la consulta de receta.

### MEDIO - El historial de recetas carga todo sin paginación
**Archivo:** `src/components/RecipeHistory.tsx` + `src/hooks/useRecipes.tsx`

Un dentista activo con 500+ recetas las carga todas de golpe en memoria y las filtra en el cliente. Supabase tiene un límite de 1000 filas por defecto.

**Solución:** Añadir paginación o cursor-based loading con `.range()`.

### MEDIO - Validación de cantidad máxima sólo en cliente
**Archivo:** `src/components/RecipeCreator.tsx` (línea 180)

```tsx
next.set(productId, Math.min(quantity, 99));
```

El límite de 99 unidades sólo existe en frontend. No hay validación en la base de datos para el campo `products` (JSONB). Si alguien manipula la petición, puede insertar cantidades arbitrarias.

**Solución:** Añadir una constraint o trigger de validación en la base de datos.

### BAJO - La función de dictado de voz llama a la IA sin debounce
**Archivo:** `supabase/functions/process-voice-recipe/index.ts`

Cada activación del dictado de voz llama a la Edge Function con la transcripción. Si el usuario presiona varias veces, se generan múltiples llamadas concurrentes al modelo de IA, consumiendo créditos innecesariamente.

---

## 2. Cuellos de botella de rendimiento

### Carga inicial de la app
El `RecipeCreator` lanza en paralelo:
- `useQuery("products")` — todos los productos activos
- `useQuery("recipe-templates")` — todas las plantillas del usuario
- `usePatients()` — N+1 consultas como se describe arriba

Sin `staleTime`, cada mount del componente repite estas consultas.

### PDF generation en cliente
La generación de PDF (`jsPDF` + barcodes + QR) ocurre completamente en el navegador del usuario. Con muchos productos, puede bloquear el hilo principal varios segundos en dispositivos móviles de gama baja.

### Imágenes de productos sin optimización
Las imágenes en `product-images` y `category-images` son buckets públicos de Supabase. No hay CDN ni transformación/compresión automática. Cada imagen se sirve en su resolución original.

---

## 3. Plan de mejoras priorizadas

### Fase 1 - Correcciones críticas (inmediatas)

**1.1 - Corregir N+1 en `usePatients` con vista SQL**
- Crear migración con vista `patients_with_stats` que agrega conteos en una sola query
- Actualizar `usePatients.tsx` para usar la vista

**1.2 - Añadir índices a `short_urls`**
- Migración SQL con índice en `code` (búsquedas) y `expires_at` (limpieza)
- Añadir función de limpieza de registros expirados que se pueda ejecutar periódicamente

**1.3 - Configurar `staleTime` en TanStack Query para datos estáticos**
- Productos y categorías: `staleTime: 5 * 60 * 1000` (5 minutos)
- Receta pública: `staleTime: 10 * 60 * 1000` (10 minutos)
- Esto evita re-fetches innecesarios cuando el usuario navega entre pantallas

### Fase 2 - Mejoras de escalabilidad (esta semana)

**2.1 - Paginación en historial de recetas**
- Modificar `useRecipes` para cargar en lotes de 20-30 registros con cursor
- Añadir botón "Cargar más" o scroll infinito en `RecipeHistory`

**2.2 - Optimización de imágenes**
- Añadir `loading="lazy"` a todas las imágenes de producto (ya presentes en algunos lugares, no en todos)
- Definir tamaños explícitos (`width`/`height`) para evitar layout shifts
- Las imágenes se sirven desde un bucket público de Supabase que ya tiene CDN integrado (Supabase Storage usa CloudFlare)

### Fase 3 - Mantenimiento de productos/categorías (mejoras operativas)

**3.1 - Importación masiva de productos por CSV/Excel**
- Actualmente los productos se crean uno a uno desde el panel de admin
- Crear una Edge Function que procese un CSV y haga upsert masivo
- Añadir botón "Importar CSV" en `ProductsAdmin`

**3.2 - Bulk import de imágenes mejorado**
- El sistema de sync de imágenes ya existe (Edge Functions `sync-product-images` y `sync-category-images`)
- Mejora: mostrar un log de resultados más detallado y permitir re-sync individual

**3.3 - Panel de admin con ordenación drag-and-drop**
- El campo `sort_order` ya existe en productos y categorías pero se edita manualmente con un número
- Añadir interfaz drag-and-drop para reordenar visualmente

---

## Archivos a modificar

| Archivo | Cambio | Prioridad |
|---|---|---|
| `supabase/migrations/` | Nueva migración: vista `patients_with_stats` + índices `short_urls` + función de limpieza | Crítica |
| `src/hooks/usePatients.tsx` | Usar vista en lugar de N+1 queries | Crítica |
| `src/hooks/useRecipes.tsx` | Añadir paginación + `staleTime` | Alta |
| `src/components/RecipeHistory.tsx` | UI para paginación | Alta |
| `src/hooks/usePatients.tsx` | Añadir `staleTime` | Alta |
| `src/components/RecipeCreator.tsx` | Añadir `staleTime` a queries de productos y plantillas | Alta |

---

## Impacto esperado

Con las mejoras de Fase 1:
- Reducción de consultas a la base de datos al cargar pacientes: de N+1 a 1
- Reducción de re-fetches innecesarios de productos en un 80% (staleTime)
- La tabla `short_urls` dejará de crecer indefinidamente

Con las mejoras de Fase 2:
- El historial no consumirá memoria cargando cientos de recetas
- Las imágenes cargarán progresivamente en lugar de bloquear el render

El backend (Lovable Cloud / Supabase) escala automáticamente en conexiones y tiene CDN integrado, por lo que la principal optimización está en reducir el número de queries innecesarias desde el cliente, no en la infraestructura.
