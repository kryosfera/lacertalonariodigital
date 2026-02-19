
# Plan: Descargar imágenes al bucket y actualizar productos

## Objetivo
Tener todas las imágenes de producto alojadas en el bucket propio `product-images`, sin depender de URLs externas de `lacertalonariodigital.com`. Así podrás cerrar la web de referencia sin perder ninguna imagen.

## Estado actual
- 20 productos activos **sin imagen** en la base de datos
- Los productos que ya tienen imagen usan URLs del bucket propio (`wvqqoigrslatxnbykcji.supabase.co/storage/v1/object/public/product-images/...`)
- Hay 8 imágenes ya en `public/products/` (formato CN numérico)

## Estrategia

Para cada uno de los 20 productos sin imagen:
1. Descargar la imagen desde `lacertalonariodigital.com/archivos/` usando la herramienta de fetch
2. Subirla al bucket `product-images` con un nombre descriptivo (usando el slug del producto)
3. Actualizar `thumbnail_url` y `main_image_url` en la base de datos con la URL pública del bucket

Para **CEPILLO LACER NATUR** (no aparece en la web de referencia): se marcará como `is_visible = false` para ocultarlo de la app.

## Mapa completo: 19 productos → imagen a descargar

| Producto | Archivo origen (referencia) | Nombre en bucket |
|---|---|---|
| CEPILLO GINGILACER CABEZAL PEQUEÑO | `1685605cdlcabezalpequenogingilacer_v2-p.jpg` | `cepillo-gingilacer-cabezal-pequeno.jpg` |
| CEPILLO LACER MEDIO CABEZAL PEQUEÑO | `1685582cdlcabezalpequenomedio_v2-p.jpg` | `cepillo-lacer-medio-cabezal-pequeno.jpg` |
| CERA ORTOLACER | `1639455-cera-ortolacer-7-barras-p.jpg` | `cera-ortolacer.jpg` |
| CLORHEXIDINA COLUTORIO 0,2% | `5418_clorhexidina_lacer_colutorio_02_500ml-600x600.png` | `clorhexidina-colutorio-02.png` |
| CLORHEXIDINA GEL DENTÍFRICO BIOAD 50ml | `3546058-clorhexidina-lacer-gel-bioadhesivo-50ml-p.jpg` | `clorhexidina-gel-dentifico-bioad-50ml.jpg` |
| CLORHEXIDINA SPRAY | `2477421-clorhexidina-lacer-spray-40-ml-p.jpg` | `clorhexidina-spray.jpg` |
| LACER COLUTORIO | `2057654_colutorio-lacer-500-ml-p.jpg` | `lacer-colutorio.jpg` |
| LACER GEL DENTÍFRICO | `1748669-gel-dental-lacer-125-ml-p.jpg` | `lacer-gel-dentifrico.jpg` |
| LACER PASTA DENTRÍFICA | `3918473-pasta-dentifrica-lacer-125-ml-p.jpg` | `lacer-pasta-dentifrica.jpg` |
| LACER HIDRO ADVANCED BLANCO | `2126190lacerhidroadvancedblanco-p.jpg` | `lacer-hidro-advanced-blanco.jpg` |
| LACER HIDRO ADVANCED NEGRO | `2126190lacerhidroadvancednegro-p.jpg` | `lacer-hidro-advanced-negro.jpg` |
| LACER HIDRO PORTATIL INALAMBRICO | `2126206lacerhidroportatilinalambrico-p.jpg` | `lacer-hidro-portatil-inalambrico.jpg` |
| PACK RECAMBIOS HIDRO ADVANCED BLANCO | `2126220packrecambioslacerhidroadvancedblanco-p.jpg` | `pack-recambios-lacer-hidro-advanced-blanco.jpg` |
| PACK RECAMBIOS HIDRO NEGRO | `2126220packrecambioslacerhidronegro-p.jpg` | `pack-recambios-lacer-hidro-negro.jpg` |
| LACER INTERDENTAL ANGULAR CONICO | `1505255_cil_angular-conico-p.jpg` | `lacer-interdental-angular-conico.jpg` |
| LACER MUCOREPAIR COLUTORIO | `mucorepair-600x600.png` | `lacer-mucorepair-colutorio.png` |
| LACERBLANC PAINT ON | `1625724-lacerblanc-pincel-blanqueador-p.jpg` | `lacerblanc-paint-on.jpg` |
| LACERBLANC WHITE FLASH | `1932488-lacerblanc-white-flash-p.jpg` | `lacerblanc-white-flash.jpg` |
| SENSILACER PASTA | `sensilacerpasta125mlref2083554-p.png` | `sensilacer-pasta.png` |

## Pasos de implementación

**Paso 1:** Descargar cada imagen de la web de referencia y guardarla en `public/products/` con el nombre del slug del producto (igual que el patrón de los 8 archivos ya existentes).

**Paso 2:** Subir cada imagen al bucket `product-images` mediante la Edge Function `sync-product-images` o actualizando directamente la base de datos con las nuevas URLs del bucket propio.

**Paso 3:** Ejecutar SQL para actualizar `thumbnail_url` y `main_image_url` en los 19 productos, y `is_visible = false` en CEPILLO LACER NATUR.

## Resultado final
- Bucket `product-images`: 19 imágenes nuevas añadidas, todas con nombre igual al slug del producto
- Base de datos: 19 productos actualizados con URLs del bucket propio
- CEPILLO LACER NATUR: ocultado de la app
- Independencia total de la web de referencia
