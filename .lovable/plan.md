
# Dos mejoras en el panel de Categorías

## Objetivo
1. Subir el logo de Lacer Aligner al bucket `category-images` y asociarlo a la categoría correspondiente en la base de datos.
2. Añadir un campo de upload de imagen directo en el formulario de edición/creación de categorías, para que en el futuro el admin pueda asignar fotos sin salir del formulario.

---

## Cambio 1: Logo de Lacer Aligner

El logo subido (`user-uploads://2026_LacerAligner_logo-02.png`) se copiará a `public/category-images/lacer-aligner.png` y también se subirá al bucket `category-images` de Supabase Storage. Luego se actualizará la `image_url` de la categoría "Lacer Aligner" (o "lacer-aligner") directamente.

El flujo real:
- Copiar la imagen a `public/category-images/` para que esté disponible como asset estático.
- Al guardar en el bucket `category-images` con nombre `lacer-aligner.png`, la Edge Function `sync-category-images` ya existente puede hacer el match por slug automáticamente.
- Alternativamente (más inmediato): actualizar el campo `image_url` de la categoría directamente desde el formulario de admin con el upload integrado.

---

## Cambio 2: Upload de imagen en el formulario de categorías

### Qué se añade en `CategoriesAdmin.tsx`

- El tipo `Category` se amplía con `image_url: string | null`.
- El formulario en el diálogo incluye una nueva sección de imagen con:
  - Vista previa de la imagen actual (si existe).
  - Botón "Subir imagen" con `<input type="file" accept="image/*">`.
  - Al seleccionar un archivo, se sube al bucket `category-images` con nombre `{slug}.{ext}` usando `supabase.storage.from('category-images').upload()`.
  - Se obtiene la URL pública y se guarda en `categories.image_url`.
  - Botón "Eliminar imagen" para limpiar el campo.
- La tabla de categorías muestra una columna de miniatura de imagen.

### Flujo de subida

```
1. Admin abre diálogo "Editar/Nueva Categoría"
2. Selecciona archivo de imagen
3. Se sube a bucket category-images con nombre {slug}.png/.jpg
4. Se obtiene publicUrl y se guarda en el campo image_url
5. Al guardar la categoría, image_url se incluye en el payload de upsert
```

### Consideraciones de storage

- El bucket `category-images` ya existe y es público.
- No se requieren cambios de RLS en storage (admins ya pueden gestionar desde server-side via service role en Edge Functions). Sin embargo, para upload desde el cliente necesitamos una política RLS en `storage.objects`. Se añadirá una migración SQL:

```sql
-- Permitir a admins subir/actualizar/borrar en category-images
CREATE POLICY "Admins can upload category images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'category-images' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can update category images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'category-images' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can delete category images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'category-images' AND
  public.has_role(auth.uid(), 'admin'::public.app_role)
);
```

---

## Archivos a modificar/crear

| Archivo | Cambio |
|---|---|
| `supabase/migrations/XXXXXX_category_image_upload_rls.sql` | Políticas RLS en storage.objects para admins en bucket category-images |
| `src/components/admin/CategoriesAdmin.tsx` | Añadir campo de upload, miniatura en tabla, lógica de subida a storage |
| `public/category-images/lacer-aligner.png` | Copia local del logo subido |

---

## Resultado final

- El formulario de categorías tendrá un selector de imagen con previsualización.
- Al guardar, la imagen se sube a storage y la URL se guarda en la base de datos.
- La tabla de categorías mostrará miniaturas.
- El logo de Lacer Aligner quedará asociado a su categoría de inmediato.
