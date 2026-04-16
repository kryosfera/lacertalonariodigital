

# Añadir Top Productos y Clasificación por Provincias/Profesionales al Dashboard Admin

## Contexto

El dashboard admin aún no se ha construido (el plan anterior fue aprobado pero no implementado). Se incorporan estas dos secciones adicionales al plan del dashboard completo.

## Alcance — lo que se construye ahora

Dado que el dashboard admin completo aún no existe, se implementará todo el rediseño aprobado previamente **más** las dos nuevas secciones solicitadas. Resumen de secciones:

### Estructura con Sidebar

```text
┌──────────────────┬──────────────────────────────────┐
│  SIDEBAR         │  CONTENIDO                       │
│  ◉ Dashboard     │  KPIs + Gráficos                 │
│  ◎ Productos     │  CRUD existente                  │
│  ◎ Categorías    │  CRUD existente                  │
│  ◎ Usuarios      │  Tabla + filtros provincia       │
│  ◎ Recetas       │  Tabla global + filtros           │
│  ◎ Mantenimiento │  Sync + limpieza                 │
└──────────────────┴──────────────────────────────────┘
```

### Dashboard principal — KPIs + nuevas visualizaciones

1. **KPI cards**: Total recetas, usuarios, productos, recetas mes, tasa dispensación
2. **Top 10 productos más recetados** — Gráfico de barras horizontales. Se extrae del campo JSONB `products` de la tabla `recipes` mediante una query que desanida los productos y cuenta ocurrencias
3. **Clasificación por provincias** — Gráfico de barras/donut agrupando usuarios registrados por `profiles.province`, con número de recetas por provincia
4. **Ranking de profesionales** — Tabla con los profesionales más activos: nombre clínica, provincia, localidad, número de recetas creadas
5. **Gráfico de recetas por mes** (últimos 6 meses) con recharts
6. **Actividad reciente** — últimas 10 recetas

### Sección Usuarios

- Tabla de perfiles con columnas: clínica, profesional, localidad, provincia, fecha registro, nº recetas
- Filtros por provincia y localidad
- Ordenación por actividad

## Cambios técnicos

### Base de datos (migraciones)

1. **RLS admin en `recipes`**: Añadir policy SELECT para admin (`has_role(auth.uid(), 'admin')`) — necesario para que el admin vea todas las recetas
2. **RLS admin en `patients`**: Añadir policy SELECT para admin
3. **Vista SQL `admin_top_products`**: Función o vista que desanida `recipes.products` JSONB y agrupa por nombre/referencia para obtener el ranking

### Archivos nuevos

| Archivo | Propósito |
|---------|-----------|
| `src/components/admin/AdminSidebar.tsx` | Sidebar con navegación |
| `src/components/admin/AdminDashboard.tsx` | KPIs + gráficos (recharts) incluyendo top productos y clasificación provincias |
| `src/components/admin/UsersAdmin.tsx` | Tabla de usuarios con filtros por provincia |
| `src/components/admin/RecipesAdmin.tsx` | Tabla global de recetas |
| `src/components/admin/MaintenanceAdmin.tsx` | Herramientas sync y limpieza (migradas del header actual) |

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/pages/Admin.tsx` | Reescribir con SidebarProvider + navegación por estado interno |

### Queries clave para las nuevas secciones

**Top productos recetados** — Se ejecutará client-side con RPC o query directa:
```sql
SELECT elem->>'name' as product_name, elem->>'reference' as reference,
       COUNT(*) as times_prescribed
FROM recipes, jsonb_array_elements(products) as elem
GROUP BY product_name, reference
ORDER BY times_prescribed DESC
LIMIT 10
```
Se implementará como función SQL `security definer` para admin.

**Clasificación por provincias**:
```sql
SELECT p.province, COUNT(DISTINCT p.user_id) as professionals,
       COUNT(r.id) as total_recipes
FROM profiles p
LEFT JOIN recipes r ON r.user_id = p.user_id
WHERE p.province IS NOT NULL
GROUP BY p.province
ORDER BY total_recipes DESC
```
También como función SQL para admin.

### Diseño visual
- Recharts (ya disponible via shadcn chart) para barras horizontales y donut
- Paleta: degradado rojo corporativo en acentos, cards con `bg-card`
- Sidebar colapsable en tablet/móvil

