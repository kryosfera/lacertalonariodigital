
# Alta de 5 productos Lacer Aligner con imágenes

## Situación actual
- La categoría **LACER ALIGNER** (id: `058c97e6-1649-46fc-b2d9-a3f6294e2eb3`) ya existe en la base de datos pero no tiene ningún producto asignado.
- Las 5 imágenes de producto han sido subidas directamente por el usuario (las 2 imágenes de bodegón son de referencia, no se usarán como imagen de producto).

## Productos a dar de alta

| Nombre | C.N. (reference) | EAN | Slug | Imagen |
|---|---|---|---|---|
| LACER ALIGNER PASTA 125ml | 222127.7 | 8430340066961 | `lacer-aligner-pasta-125ml` | `6696_Lacer_Aligner_Pasta_Dentifrica_125ml_01.png` |
| LACER ALIGNER COLUTORIO 500ml | 222128.4 | 8430340066985 | `lacer-aligner-colutorio-500ml` | `6698_Lacer_Aligner_Colutorio_500ml_01.png` |
| LACER ALIGNER ESPUMA BUCAL 50ml | 222967.9 | 8430340067241 | `lacer-aligner-espuma-bucal-50ml` | `6724_Lacer_Aligner_Espuma_50ml_01.png` |
| LACER ALIGNER SPRAY 30ml | 222932.7 | 8430340067005 | `lacer-aligner-spray-30ml` | `6700_Lacer_Aligner_Spray_30ml_01.png` |
| LACER ALIGNER TABLETAS DESINFECTANTES | 223247.1 | 8430340067432 | `lacer-aligner-tabletas-desinfectantes` | `6743_Lacer_Aligner_Tabletas_Limpiadoras_32.png` |

## Pasos de implementación

**Paso 1 — Copiar imágenes al proyecto**

Las imágenes del usuario se copian desde `user-uploads://` a `public/products/` con nombres de slug:
- `lacer-aligner-pasta-125ml.png`
- `lacer-aligner-colutorio-500ml.png`
- `lacer-aligner-espuma-bucal-50ml.png`
- `lacer-aligner-spray-30ml.png`
- `lacer-aligner-tabletas-desinfectantes.png`

**Paso 2 — Subir imágenes al bucket `product-images`**

Usando la Edge Function `sync-product-images` o directamente mediante el cliente de almacenamiento, las 5 imágenes se suben al bucket con los nombres de slug correspondientes.

**Paso 3 — Insertar los 5 productos en la base de datos**

```sql
INSERT INTO public.products (
  name, slug, category_id, reference, ean,
  thumbnail_url, main_image_url,
  is_active, is_visible, sort_order
) VALUES
(
  'LACER ALIGNER PASTA 125ml',
  'lacer-aligner-pasta-125ml',
  '058c97e6-1649-46fc-b2d9-a3f6294e2eb3',
  '222127.7', '8430340066961',
  '[bucket-url]/lacer-aligner-pasta-125ml.png',
  '[bucket-url]/lacer-aligner-pasta-125ml.png',
  true, true, 0
),
-- ... (4 productos más)
```

## Resultado final
- 5 productos nuevos en la categoría LACER ALIGNER
- Imágenes en el bucket propio (sin dependencia externa)
- Campos `reference` (C.N.) y `ean` correctamente asignados para la dispensación en farmacia con escáner
- Los productos aparecerán en el selector del talonario digital al seleccionar la categoría LACER ALIGNER
