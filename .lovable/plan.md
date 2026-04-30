## Problema

En la pantalla de selección de productos (móvil) se ve el contenido de la pantalla padre ("Nueva Receta") **transparentándose por la zona superior** (safe area del notch). Además, al hacer scroll, los productos pasan visibles por debajo de esa franja superior.

**Causa**: el contenedor raíz del overlay tiene `pt-safe` (padding-top para la safe area de iOS) pero el fondo `bg-background` aplica al contenedor entero. El padding crea una zona en la parte superior donde no hay contenido, y como el header interno (`bg-background`) empieza **debajo** del padding, esa franja superior queda "translúcida" visualmente respecto al contenido que scrollea por detrás dentro del flex layout.

## Solución

En `src/components/ProductSelector.tsx`, bloque mobile:

1. **Quitar `pt-safe` del contenedor raíz** (línea 85).
2. **Añadir `pt-safe` al header interno** (back / título / cerrar) en línea 90, junto con su `bg-background` ya existente. Así la safe area queda cubierta por el header opaco, sin hueco transparente.

```tsx
{/* Antes */}
<div className="fixed inset-0 z-50 bg-background flex flex-col pt-safe ...">
  <div className="flex items-center justify-between px-2 py-2 border-b ... bg-background">

{/* Después */}
<div className="fixed inset-0 z-50 bg-background flex flex-col ...">
  <div className="flex items-center justify-between px-2 py-2 pt-safe border-b ... bg-background">
```

## Lo que NO se toca

- Lógica del componente, props ni desktop.
- Resto del layout (logo Lacer, búsqueda, lista de productos, barra inferior).

## Resultado

La franja superior (notch / status bar) queda totalmente cubierta por el header opaco del selector. No se ve nada del "Nueva Receta" detrás, ni al cargar ni al hacer scroll.
