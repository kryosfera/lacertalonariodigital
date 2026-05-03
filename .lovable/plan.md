## Objetivo
Completar los datos faltantes del producto `LACER COLUTORIO` en la base de datos.

## Cambios
1. UPDATE en la tabla `products` donde `name = 'LACER COLUTORIO'`:
   - `reference` → `205765.4`
   - `ean` → `8470002057654`

2. Tras la actualización, ejecutar la sincronización de imágenes (Sync Productos) para asociar automáticamente la miniatura desde el bucket `product-images` si existe un fichero con CN/EAN coincidentes.

## Verificación
Consulta posterior para confirmar que el producto ya tiene EAN, CN, está activo y visible.

## Pendientes (no incluidos en este plan, requieren tu decisión)
- Categoría `LACER NATUR` con sus 3 productos ocultos.
- `IRRIGADOR LACER HIDRO` y recambios (inactivos).
