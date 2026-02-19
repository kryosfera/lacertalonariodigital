
# Añadir nombre del producto en la cuadrícula del selector

## Objetivo
Mostrar el nombre del producto debajo de cada imagen en la cuadrícula del `ProductSelector`, tanto en móvil como en escritorio, sin sacrificar el tamaño de la imagen.

## Problema actual
Los botones de producto son cuadrados (`aspect-square`) y solo muestran la imagen. Si no hay imagen, aparece el nombre, pero si hay imagen, el nombre está totalmente oculto. El dentista debe recordar qué imagen corresponde a qué producto.

## Solución propuesta

Cambiar la estructura de cada tarjeta de producto de cuadrado puro a **rectángulo vertical** (imagen arriba + nombre abajo), manteniendo la imagen lo más grande posible.

### Layout de cada tarjeta (ambas versiones):

```text
┌─────────────────┐
│                 │
│    [IMAGEN]     │  ← ~70-75% del alto de la tarjeta
│                 │
├─────────────────┤
│  Nombre prod.   │  ← ~25-30% restante, texto pequeño, truncado a 2 líneas
└─────────────────┘
```

## Cambios técnicos — solo en `src/components/ProductSelector.tsx`

### Versión móvil
- Cambiar el botón de `flex items-center justify-center` + `aspect-square` a `flex flex-col` con altura fija proporcional (o `aspect-[3/4]`).
- Imagen ocupa la parte superior: `flex-1 w-full object-contain`.
- Nombre debajo: texto `text-[10px]` centrado, `line-clamp-2`, con fondo blanco semitransparente o separado visualmente.
- La cuadrícula puede pasar de 3 cols a 2 cols en móvil cuando hay pocos productos para que el nombre sea más legible.

### Versión escritorio
- Quitar `aspect-square` del botón y usar `flex flex-col` con `aspect-[3/4]` (más vertical).
- Imagen: `flex-1 w-full object-contain p-2`.
- Nombre debajo: `text-xs font-medium text-center line-clamp-2 px-2 pb-2 text-foreground`.
- La cuadrícula de escritorio reduce de `xl:grid-cols-8` a `xl:grid-cols-6` (más tarjetas más anchas = nombre más legible).

## Resultado visual esperado

- **Móvil**: cada tarjeta muestra imagen en ~70% superior y nombre en ~30% inferior, 2-3 columnas según cantidad de productos.
- **Escritorio**: tarjetas verticales con imagen grande y nombre visible en la parte inferior, cuadrícula menos densa pero más identificable.
- El indicador de selección (check circular) y el comportamiento de selección no cambian.
- No hay cambios en la lógica ni en la base de datos.

## Archivos a modificar
- `src/components/ProductSelector.tsx` — únicamente la estructura HTML/CSS de los botones de producto (móvil y escritorio).
