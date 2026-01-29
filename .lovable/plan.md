
# Plan: Rediseño de Página de Inicio y Navegación

## Resumen

Rediseño completo de la página de inicio con mejor distribución responsive, navegación mejorada para desktop/tablet, y aplicación consistente del rojo Lacer en ambos modos (básico y profesional).

---

## Problemas Actuales Identificados

1. **Hero y botones compiten por espacio** - En desktop el hero y los quick actions no aprovechan el ancho disponible
2. **Navegación desktop poco intuitiva** - Los tabs genéricos no destacan las acciones principales
3. **Inconsistencia visual** - El modo profesional no usa suficiente el rojo corporativo de Lacer
4. **Distribución vertical** - Los elementos se apilan verticalmente sin aprovechar layouts de 2 columnas en pantallas grandes

---

## Diseño Propuesto

### Estructura Desktop/Tablet (Nueva)

```text
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo + Nav Links + User Actions                │
│  [Inicio] [Nueva Receta] [Cirugía] [Historial] [Perfil] │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ┌─────────────────────┐  ┌──────────────────────────┐ │
│  │                     │  │                          │ │
│  │    HERO BANNER      │  │   QUICK ACTIONS GRID     │ │
│  │    (60% width)      │  │   (40% width)            │ │
│  │                     │  │   ┌─────┐  ┌─────┐       │ │
│  │  Logo + Título      │  │   │Nueva│  │Cirug│       │ │
│  │  "¿Qué deseas..."   │  │   │Recet│  │ía   │       │ │
│  │                     │  │   └─────┘  └─────┘       │ │
│  │                     │  │   ┌─────┐  ┌─────┐       │ │
│  │                     │  │   │Histo│  │Pacie│       │ │
│  │                     │  │   │rial │  │ntes │       │ │
│  └─────────────────────┘  └──────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │          STATS ROW (solo profesional)               ││
│  │  [Este mes: X]  |  [Recetas: Y]  |  [Pacientes: Z]  ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estructura Móvil (Optimizada)

```text
┌───────────────────────┐
│  HERO BANNER          │
│  (altura adaptativa)  │
│  Logo + Título        │
└───────────────────────┘

┌───────────────────────┐
│  QUICK ACTIONS 2x2    │
│  ┌─────┐  ┌─────┐    │
│  │Nueva│  │Cirug│    │
│  └─────┘  └─────┘    │
│  ┌─────┐  ┌─────┐    │
│  │Hist │  │Paci │    │
│  └─────┘  └─────┘    │
└───────────────────────┘

┌───────────────────────┐
│  STATS (profesional)  │
└───────────────────────┘

===== BOTTOM NAV =====
```

---

## Cambios Específicos

### 1. Header Rediseñado (Desktop/Tablet)

**Cambios:**
- Navegación horizontal con enlaces de texto en lugar de tabs con iconos
- Diseño más limpio y profesional
- Indicador de pestaña activa con borde inferior rojo
- Logo de Lacer más prominente
- Botones de usuario con fondo sutil al hover

### 2. HomeScreen - Layout de 2 Columnas

**Desktop/Tablet:**
- Hero ocupa 60% del ancho, quick actions el 40%
- Layout side-by-side para mejor aprovechamiento del espacio
- Hero con altura fija que muestra la cara de la dentista
- Quick actions en grid 2x2 con más espacio para respirar

**Móvil:**
- Mantiene layout vertical actual
- Hero proporcionalmente más pequeño
- Quick actions prominentes

### 3. Aplicación Consistente del Rojo Lacer

**Elementos que usarán el rojo (#E31937 / secondary):**
- Botones de acción rápida (ambos modos)
- Indicador de tab activo en navegación
- Iconos destacados
- Barra de stats en modo profesional
- Hover states en links principales

### 4. Quick Actions Mejorados

**Diseño:**
- Iconos más grandes y centrados
- Efecto hover con elevación
- Borde sutil para definición
- Fondo con gradiente sutil rojo-oscuro

### 5. Stats Row Mejorado (Profesional)

**Cambios:**
- Diseño en tarjetas individuales en lugar de barra sólida
- Iconos junto a los números
- Animación de entrada

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/pages/Index.tsx` | Nuevo header con navegación horizontal, layout de 2 columnas |
| `src/components/HomeScreen.tsx` | Layout responsive mejorado, distribución hero/actions |
| `src/components/BottomNavigation.tsx` | Ajustes menores de color |
| `src/index.css` | Nuevas utilidades CSS para el layout |

---

## Detalles Técnicos

### Nueva Navegación Desktop

```typescript
// Navegación horizontal limpia
<nav className="hidden md:flex items-center gap-6">
  <NavLink active={tab === "home"}>Inicio</NavLink>
  <NavLink active={tab === "nueva-receta"}>Nueva Receta</NavLink>
  <NavLink active={tab === "recomendaciones"}>Post-Cirugía</NavLink>
  {isProfessional && (
    <>
      <NavLink active={tab === "historial"}>Historial</NavLink>
      <NavLink active={tab === "pacientes"}>Pacientes</NavLink>
    </>
  )}
</nav>
```

### Layout 2 Columnas HomeScreen

```typescript
// Desktop: Hero izquierda, Actions derecha
<div className="flex flex-col lg:flex-row gap-6">
  <div className="lg:w-3/5">
    {/* Hero Banner */}
  </div>
  <div className="lg:w-2/5">
    {/* Quick Actions */}
  </div>
</div>
```

### Estilos de Botones de Acción

```typescript
// Botón de acción con rojo Lacer
className="group flex flex-col items-center gap-3 p-6 
  rounded-2xl bg-gradient-to-br from-secondary to-secondary/90
  shadow-lg hover:shadow-xl hover:-translate-y-1 
  transition-all duration-300"
```

---

## Breakpoints Responsivos

| Pantalla | Comportamiento |
|----------|----------------|
| **Mobile** (<768px) | Layout vertical, bottom nav |
| **Tablet** (768-1024px) | Header con nav, layout 2 columnas más compacto |
| **Desktop** (>1024px) | Header completo, layout 2 columnas amplio |

---

## Mejoras UX Incluidas

1. **Jerarquía visual clara** - Hero como punto focal, acciones como CTA secundario
2. **Espaciado consistente** - Sistema de 8px para todos los gaps
3. **Feedback táctil** - Hover states, press states con escalado
4. **Accesibilidad** - Contraste adecuado texto/fondo en todos los botones
5. **Performance** - Sin cambios de layout al cargar (evita CLS)

---

## Resultado Esperado

- Home que aprovecha todo el ancho en desktop/tablet
- Navegación más profesional y limpia
- Identidad visual Lacer reforzada con el rojo corporativo
- Experiencia consistente entre modo básico y profesional
- Mejor visibilidad de la imagen del hero (cara de la dentista)
