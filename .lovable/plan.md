# Filtro temporal global + Export en Dashboard Admin

## Confirmación: datos 100% reales (sin mockups)

He revisado `AdminDashboard.tsx` y verificado contra la base de datos. Todo se alimenta de Supabase en tiempo real:

| Widget | Fuente real |
|---|---|
| KPIs (Total, Hoy, Mes, Variación, Avg productos) | Tabla `recipes` + RPC `admin_recipes_comparison` |
| Profesionales / Productos / Dispensación | Tablas `profiles`, `products`, `recipes.dispensed_at` |
| Recetas por mes | RPC `admin_recipes_per_month` |
| Método de envío (donut) | Agregación real de `recipes.sent_via` |
| Top 10 productos | RPC `admin_top_products` (jsonb de recetas reales) |
| Mapa España + tabla provincias | RPC `admin_province_stats` |
| Heatmap día/hora | RPC `admin_activity_heatmap` (últimos 90 días) |
| Top profesionales | RPC `admin_top_professionals` |
| Recetas recientes | `recipes` ordenado por fecha |

Verificado en BBDD: 18 recetas, 3 profesionales, 95 productos. Todo real.

## Filtro temporal: diseño

Selector de rango en la cabecera del dashboard (segmented control, estilo Apple minimalista):

```text
[ Hoy ] [ 7 días ] [ 30 días ] [ Este mes ] [ 90 días ] [ Este año ] [ Todo ]  [ 📅 Personalizado ]   [ ⬇ Exportar ]
```

- Estado React `range` controla el periodo activo, incluido en `queryKey` → refetch automático.
- Animación del subrayado activo con framer-motion `layoutId`.
- En móvil: scroll horizontal.
- Persistencia en `localStorage` (`admin_dashboard_range`).

## Cambios técnicos

### 1. Nuevas funciones RPC (migración SQL) que aceptan `start_date` / `end_date`

- `admin_kpis_range(start, end)` → recetas, hoy, avg productos, dispensados, variación vs periodo anterior equivalente
- `admin_top_products_range(start, end, lim)`
- `admin_province_stats_range(start, end)`
- `admin_top_professionals_range(start, end, lim)`
- `admin_activity_heatmap_range(start, end)`
- `admin_send_methods_range(start, end)`
- `admin_recipes_timeseries(start, end, bucket)` → bucket dinámico (`hour`/`day`/`week`/`month`) según rango

KPIs globales no temporales (Total Productos, Total Profesionales) se mantienen y se marcan con badge "global".

### 2. Frontend (`AdminDashboard.tsx`)

- Componente nuevo `DashboardRangeFilter` con presets + date range picker shadcn (modo "Personalizado").
- Helper `getRangeBounds(preset)` → `{start, end, bucket, label}`.
- Eje X de la timeseries adaptado al bucket.
- Recetas recientes: feed global, no filtra.
- Skeleton overlay sutil durante refetch (no se desmontan widgets).
- Texto contextual: "Mostrando: últimos 30 días (28 mar – 28 abr)".

### 3. Export del dashboard filtrado

Botón **⬇ Exportar** junto al filtro, con dropdown de 3 formatos:

#### a) Excel (.xlsx) — recomendado
Genera un workbook con varias hojas, todas reflejando el rango activo:
- **Resumen**: KPIs (Total, Hoy, Mes, Variación %, Avg productos, Dispensación %, rango aplicado, fecha de exportación).
- **Recetas por periodo**: timeseries (fecha + total) según bucket.
- **Método de envío**: nombre + total + %.
- **Top productos**: ranking, nombre, referencia, veces prescrito.
- **Provincias**: provincia, profesionales, recetas.
- **Top profesionales**: clínica, profesional, provincia, localidad, recetas.
- **Heatmap**: matriz día×hora.
- **Recetas recientes**: paciente, fecha, vía, código, dispensada.

Implementación: librería `xlsx` (SheetJS) en cliente — sin servidor extra. Estilos básicos: header bold, tipografía consistente, anchos auto, totales con `SUM()` (formula real), negativos con paréntesis, fechas formateadas. Nombre archivo: `lacer-dashboard-{rango}-{YYYYMMDD}.xlsx`.

#### b) CSV
Un único CSV con la timeseries del periodo (más ligero, para análisis rápido en Excel/Sheets/BI).

#### c) PDF (snapshot visual)
Captura el contenedor del dashboard con `html2canvas` → genera PDF A4 horizontal con `jspdf`. Incluye encabezado con logo Lacer, rango aplicado y fecha. Útil para reportes a dirección.

Durante el export se muestra toast de progreso ("Generando export…") y al terminar toast de éxito con descarga automática.

### 4. UX export

- Confirmación visual del rango exportado en el nombre del archivo y en la primera hoja/portada del PDF.
- Si no hay datos en el rango, el botón se deshabilita con tooltip.
- Permisos: solo accesible desde `/admin` (ya protegido por `isAdmin`).

## Archivos a tocar

- `supabase/migrations/<timestamp>_admin_dashboard_filters.sql` (nuevas RPCs)
- `src/components/admin/AdminDashboard.tsx` (integración filtro + botón export)
- `src/components/admin/DashboardRangeFilter.tsx` (nuevo)
- `src/components/admin/DashboardExportMenu.tsx` (nuevo, dropdown XLSX/CSV/PDF)
- `src/lib/dateRanges.ts` (helper de rangos y buckets)
- `src/lib/dashboardExport.ts` (lógica xlsx + csv + pdf)
- `package.json`: añadir `xlsx`, `jspdf`, `html2canvas`

## Fuera de alcance

- Cambios en otras secciones del admin (Productos, Recetas, etc.)
- Programar exports recurrentes por email (se puede añadir después)
