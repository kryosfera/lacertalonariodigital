## Objetivo

Adaptar la pantalla de selección de productos (mobile) al rediseño propuesto: header tipo "modal screen" con título de categoría centrado, logo Lacer destacado, buscador grande tipo iOS, tarjetas de producto verticales grandes con imagen y nombre debajo, y action bar con dos botones secundarios. La `BottomNavigation` actual se mantiene intacta.

## Cambios visuales (mobile)

Archivo único a modificar: `src/components/ProductSelector.tsx` (bloque mobile, líneas 80–222). Desktop sin cambios.

### 1. Header rediseñado
Reemplazar el header compacto actual por uno limpio inspirado en Apple:

```text
[ ←  ]      GINGILACER       [ × ]
─────────────────────────────────
            [ Logo Lacer ]
```

- Botón izquierdo: `ChevronLeft` grande (icon ghost) → `onBack`.
- Centro: nombre de la categoría en `uppercase` (`text-base font-bold tracking-wide`).
- Botón derecho: `X` → `onClose`.
- Línea separadora inferior (`border-b border-border/40`).
- Justo debajo del header, en un bloque con fondo `bg-muted/40`: logo Lacer (`@/assets/lacer-logo.png`) centrado, h-12 aproximadamente.

### 2. Buscador estilo iOS
- Contenedor con padding lateral `px-4 py-3` sobre fondo `bg-muted/40` (continuación visual del bloque del logo).
- Input grande: `h-12 rounded-xl bg-background border border-border/40 pl-11 text-base`.
- Icono `Search` a la izquierda, placeholder `"Buscar..."`.

### 3. Lista de productos (vertical)
- Reemplazar el grid actual de tarjetas cuadradas por una **lista vertical de cards grandes** (1 columna, full width):
  - Contenedor `bg-muted/40` con `px-4 pt-3 pb-[180px]` (espacio para action bar + bottom nav).
  - Cards: `bg-background rounded-2xl border border-border/30 shadow-sm overflow-hidden`.
  - Layout interno: imagen del producto centrada y muy grande (`h-40 object-contain p-4`) y debajo el nombre del producto en `uppercase font-bold text-base text-center px-3 pb-4`.
  - Estado seleccionado: borde `border-secondary border-2` + ring `ring-2 ring-secondary/20` + indicador `Check` en círculo rojo arriba-derecha (mantener el actual).
  - Animación `card-scale-in` con `delay: index * 20ms`.

### 4. Action bar inferior
Reemplazar los dos botones rojos actuales por dos botones blancos tipo "secundarios" como en la maqueta:

```text
[  📁 Otra categoría  ]   [  ✕ Cerrar  ]
```

- Posicionada `fixed bottom-[72px]` (sobre la BottomNavigation) con `bg-background/95 backdrop-blur-md` y `border-t border-border/30`.
- Dos botones `flex-1` con estilo:
  - "Otra categoría": `variant="outline"` + icono `FolderOpen` → `onBack`.
  - "Cerrar"/"Continuar": cuando hay productos seleccionados → cambia a botón rojo `btn-gradient-red` con texto `Continuar (N)`. Sin selección → `variant="outline"` con `X` y texto `Cerrar` → `onClose`.

### 5. Empty state
- Cuando no hay productos: mantener mensaje centrado con icono `Package` y texto.

### 6. NO se toca
- `BottomNavigation.tsx`.
- Bloque desktop del `ProductSelector` (líneas 224-end).
- Lógica de filtrado, props, búsqueda, selección.
- Función `getGridConfig` (queda sin uso en mobile pero la dejamos para no afectar desktop si se usa).

## Detalles técnicos

- Imports nuevos: añadir `lacerIcon` desde `@/assets/lacer-logo.png`.
- Eliminar el grid `getGridConfig` para mobile (lista vertical fija de 1 columna).
- Asegurar `pt-safe` en el contenedor raíz (ya está) para iOS notch.
- Reservar espacio inferior para que la última card no quede tapada por action bar (~80px) + BottomNavigation (72px) = `pb-[170px]`.
- Mantener `card-scale-in` en cards y todos los handlers actuales (`onToggleProduct`, `onBack`, `onClose`).

## Resultado esperado

Pantalla de selección de productos con look Apple-minimal: header con título de categoría en mayúsculas centrado, bloque destacado con logo Lacer + buscador grande sobre fondo gris claro, lista vertical de productos con imágenes grandes, y action bar con dos botones blancos sobre la `BottomNavigation` actual.
