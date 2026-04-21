
# Mejorar Dashboard Admin: más compacto, animaciones y mapa de España

## Objetivo
Rediseñar el dashboard admin para que sea más denso visualmente, con micro-animaciones fluidas y una visualización geográfica real de España por provincias.

## Cambios principales

### 1. Layout más compacto
- **KPI cards**: reducir padding (`p-3` en lugar de `p-4`), iconos más pequeños, agrupar 5 KPIs en una fila en desktop y añadir 2 nuevos:
  - **Recetas hoy** (created_at = hoy)
  - **Ticket medio productos/receta** (promedio de items por receta)
- **Cards de gráficos**: reducir altura de 256px (h-64) a 200px (h-52), padding interno menor, títulos más pequeños (`text-sm`).
- **Grid denso**: pasar de `gap-6` a `gap-4` y reorganizar en columnas de 3 donde quepa (KPIs + métricas rápidas + sparklines).
- **Tablas**: filas más compactas (`py-1.5`), tipografía `text-xs` en celdas secundarias.

### 2. Animaciones
- **Fade-in escalonado** al cargar cada sección con Framer Motion (ya disponible en el proyecto):
  - KPIs entran con `stagger` de 0.05s
  - Charts hacen `fade-in + slide-up` con delay incremental
- **Counter animado** en los KPIs (números suben de 0 al valor real en ~800ms).
- **Hover states**: cards con `hover:shadow-md hover:-translate-y-0.5 transition-all`.
- **Recharts**: activar `isAnimationActive` con duración 800ms y easing suave.
- **Barras del top productos**: animación de ancho al cargar (de 0% al % real).

### 3. Nuevos datos visuales
- **Sparkline** dentro de cada KPI card (mini-gráfico de últimos 7 días para "Recetas") usando Recharts `<LineChart>` minimalista sin ejes.
- **Heatmap de actividad por día/hora** (estilo GitHub contributions) — grid 7×24 mostrando cuándo se crean más recetas.
- **Comparativa mes actual vs mes anterior** con flechas ↑↓ y porcentaje de variación en los KPIs principales.
- **Distribución temporal**: añadir línea de tendencia al gráfico mensual.

### 4. Mapa coroplético de España por provincias
Implementación con **react-simple-maps** + GeoJSON oficial de provincias españolas:
- Cada provincia se colorea según intensidad de recetas (escala de blancos a rojo Lacer #E31937).
- Tooltip al pasar mostrando: nombre provincia, nº profesionales, nº recetas.
- Leyenda con escala de color (0 → max).
- Click en provincia filtra el resto del dashboard (opcional, fase 2).

**Fuente GeoJSON**: usar el archivo público de provincias de España (50 polígonos), embebido en `src/data/spain-provinces.json` para evitar fetch externo en runtime.

**Mapeo nombre provincia → datos**: normalizar acentos y mayúsculas (`Á Coruña` ↔ `A Coruña`, etc.) con una función helper.

## Archivos

### Nuevos
| Archivo | Propósito |
|---------|-----------|
| `src/components/admin/SpainProvinceMap.tsx` | Mapa coroplético con react-simple-maps |
| `src/components/admin/ActivityHeatmap.tsx` | Grid 7×24 estilo GitHub |
| `src/components/admin/AnimatedCounter.tsx` | Hook/componente para números animados |
| `src/components/admin/KpiCard.tsx` | Extraer KpiCard a archivo propio con sparkline + variación % |
| `src/data/spain-provinces.json` | GeoJSON de provincias españolas |

### Modificados
| Archivo | Cambio |
|---------|--------|
| `src/components/admin/AdminDashboard.tsx` | Layout compacto, animaciones, nuevos KPIs, integración mapa y heatmap |
| `package.json` | Añadir `react-simple-maps` y `framer-motion` (si no están) |

### Base de datos
Nuevas funciones SQL `security definer` para admin:
- `admin_recipes_per_day(days int)` — series diarias para sparklines.
- `admin_activity_heatmap()` — agrupación por día_semana × hora.
- `admin_recipes_comparison()` — totales mes actual vs mes anterior.

## Resultado visual esperado

```text
┌─────────────────────────────────────────────────────────────┐
│ Dashboard                                                   │
├──┬──┬──┬──┬──┬──┬──┐                                         │
│KPI│KPI│KPI│KPI│KPI│KPI│KPI│  ← 7 KPIs compactos con sparkline│
└──┴──┴──┴──┴──┴──┴──┘                                         │
┌──────────────┬──────────────┬──────────────┐                │
│ Recetas/mes  │ Método envío │ Top productos│                │
│ (con tend.)  │ (donut)      │ (con imgs)   │                │
└──────────────┴──────────────┴──────────────┘                │
┌──────────────────────────────┬──────────────┐               │
│ MAPA ESPAÑA (coroplético)    │ Heatmap      │               │
│ rojo = más recetas           │ día × hora   │               │
└──────────────────────────────┴──────────────┘               │
┌──────────────┬──────────────────────────────┐               │
│ Top profes.  │ Actividad reciente           │               │
└──────────────┴──────────────────────────────┘               │
```

Todo con paleta roja Lacer, dark mode soportado, y animaciones discretas estilo Apple.
