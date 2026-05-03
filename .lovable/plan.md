## Contexto

- **Categorías**: el panel admin (`CategoriesAdmin.tsx`) **ya** permite subir/sustituir/eliminar la imagen (sube al bucket `category-images` con el slug como nombre). No requiere cambios.
- **Productos**: el `ProductDialog.tsx` **no** tiene aún UI para gestionar imagen — solo se pueden sincronizar masivamente vía la función Sync.

## Objetivo

Añadir en el diálogo de edición/creación de producto la capacidad de subir, sustituir y eliminar la `thumbnail_url` (imagen principal del producto), igual que ya existe para categorías.

## Cambios

**`src/components/admin/ProductDialog.tsx`**

1. Estado nuevo:
   - `pendingThumbnailUrl: string | null` — URL actual o recién subida.
   - `isUploadingImage: boolean`.
   - `fileInputRef` para `<input type="file" hidden>`.

2. En el `useEffect` que carga `fullProduct`, inicializar `pendingThumbnailUrl` con `fullProduct.thumbnail_url`. Resetear a `null` al crear nuevo.

3. Handler `handleImageFileChange`:
   - Requiere que exista `ean` o `reference` en el formulario (preferir EAN, fallback CN/reference). Si no, toast de error.
   - Nombre de fichero: `{ean || reference}.{ext}` en bucket `product-images`.
   - `remove` previo + `upload` con `upsert: true`.
   - Obtener public URL + cache-bust `?t=Date.now()`.
   - Guardar en `pendingThumbnailUrl`.

4. Handler `handleRemoveImage` → setea `null`.

5. UI: nueva sección "Imagen del producto" antes de los switches activo/visible, replicando el patrón visual de `CategoriesAdmin` (preview 24h, botón X para eliminar, botón "Subir imagen", placeholder con borde dashed).

6. En el `payload` de la mutación incluir `thumbnail_url: pendingThumbnailUrl`.

7. Deshabilitar botón "Guardar" mientras `isUploadingImage`.

## Notas

- El bucket `product-images` ya es público y la sincronización masiva (`sync-product-images`) seguirá funcionando: usamos la misma convención de nombres (EAN o CN como nombre de archivo).
- No se tocan migraciones ni RLS — `thumbnail_url` ya existe en la tabla `products` y los admins ya tienen permiso de UPDATE vía RLS.
- No se modifica `CategoriesAdmin.tsx` (ya tiene la funcionalidad).
