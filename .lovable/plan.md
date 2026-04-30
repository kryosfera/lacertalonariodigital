## Objetivo

Adaptar la pantalla de selección de categorías (mobile) al rediseño de la maqueta, manteniendo intacta la `BottomNavigation` actual.

## Cambios visuales (mobile)

Archivo único a modificar: `src/components/CategorySelector.tsx` (bloque mobile).

### 1. Header rediseñado
Reemplazar el header compacto actual por uno tipo "modal screen" inspirado en Apple:

```text
[ ←  ]        [ Logo Lacer rojo ]        [ × ]
              Selecciona categoría
```

- Fondo blanco/`bg-background`, sin borde inferior visible.
- Botón izquierdo: flecha `ArrowLeft` (icon ghost) → llama a `onClose` (volver atrás funcionalmente equivalente a cerrar).
- Centro: imagen del logo Lacer (gota roja) — usaremos `lacer-logo-bocas_sanas.jpg` recortado o el icono de la PWA. Tamaño ~48px.
- Botón derecho: `X` → `onClose`.
- Debajo, centrado, título grande: `Selecciona categoría` (texto en `text-2xl font-medium text-foreground`, sin uppercase, sin badge a la izquierda).
- Badge del contador de seleccionados se mueve a la derecha del título o se mantiene flotante en la action bar inferior (ya existente).
- Botón "Plantillas" se mueve a un pequeño chip debajo del título (alineado a la derecha) para no saturar el header limpio.

### 2. Grid de categorías
- Mantener `grid-cols-2` con `gap-3`.
- Cambiar `aspect-square` → `aspect-[4/3]` para tarjetas más anchas que altas (como en la maqueta).
- Tarjetas: `bg-white rounded-2xl border border-border/40` (borde gris muy suave, esquinas más redondeadas), sin sombra por defecto, sombra sutil al hover/active.
- Logo de la marca: `object-contain p-4` (más padding interno para que el logo respire).
- Eliminar el `card-scale-in` con delay escalonado largo — mantener animación pero más rápida (delay 15ms) para que entre fluido.

### 3. Espaciado general
- Contenedor principal: `pt-safe` (ya existe) + `pt-2` extra para separar del notch.
- Padding lateral: `px-5` (más aire lateral, como en la maqueta).
- Asegurar `pb-[88px]` en el grid para que la última fila no quede tapada por la `BottomNavigation` (72px + safe area).

### 4. Action bar de continuar
- Mantener la barra flotante inferior cuando hay productos seleccionados, pero posicionarla **por encima** de la BottomNavigation (`bottom-[72px]` + safe area) en lugar de empujar el grid.
- Mantener estilo `btn-gradient-red`.

### 5. NO se toca
- `BottomNavigation.tsx` (queda exactamente como está).
- Versión desktop del `CategorySelector` (sin cambios).
- Lógica de carga de categorías, plantillas, navegación.

## Detalles técnicos

- Importar `ArrowLeft` desde `lucide-react` además de los iconos ya usados.
- Reutilizar el asset `@/assets/lacer-logo-bocas_sanas.jpg` ya importado, o si conviene usar el icono PWA cuadrado para el header. Verificaremos cuál se ve mejor recortado a 48x48.
- Las tarjetas mantienen `onClick={() => onSelectCategory(...)}` sin cambios funcionales.
- Animación: mantener `card-scale-in` con `animationDelay: ${index * 15}ms`.

## Resultado esperado

Pantalla de categorías con apariencia mucho más Apple-minimal: header amplio y aireado, título grande sin badge ruidoso a la izquierda, tarjetas amplias 4:3 con bordes suaves, y la `BottomNavigation` actual visible debajo sin alteraciones.
