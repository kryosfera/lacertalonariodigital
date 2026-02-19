
# Sincronización de categorías con la web de referencia

## Situación actual

Comparando la web `lacertalonariodigital.com/es/marcas` con nuestra base de datos:

**Faltan 4 categorías en la app:**
- Lacer Infantil (slug: `lacer-infantil`, imagen: `lacer-infantil.png`)
- Lacer Efficare (slug: `lacer-efficare`, imagen: `lacer-efficare.png`)
- Lacer Picks Interdental (slug: `lacer-picks-interdental`, imagen: `lacer-picks-interdental.png`)
- Lacer Cinta, Hilo y Seda (slug: `lacer-cinta-hilo-y-seda`, imagen: `lacer-cintas-hilo-seda.png`)

**1 categoría con nombre diferente:**
- Tenemos `LACER SEDA DENTAL` — la web lo llama `Lacer Cinta, Hilo y Seda`. Se puede renombrar o dejar la existente y añadir la nueva por separado (decisión pendiente — ver pregunta abajo).

**2 categorías que están en nuestra app pero NO en la web de referencia:**
- `CEPILLO ELECTRICO` (sin imagen)
- `LACER SEDA DENTAL` (si se renombra a Lacer Cinta, Hilo y Seda)

## Plan de implementación

### Paso 1: Migración SQL — insertar las 4 categorías faltantes

Se insertarán con `sort_order` altos para que aparezcan al final, y con sus imágenes ya disponibles en la web de referencia. Las imágenes de las categorías nuevas se descargarán desde la web de Lacer y se subirán al bucket `category-images`.

```sql
INSERT INTO public.categories (name, slug, sort_order, image_url) VALUES
  ('LACER INFANTIL', 'lacer-infantil', 20, NULL),
  ('LACER EFFICARE', 'lacer-efficare', 21, NULL),
  ('LACER PICKS INTERDENTAL', 'lacer-picks-interdental', 22, NULL),
  ('LACER CINTA HILO Y SEDA', 'lacer-cinta-hilo-y-seda', 23, NULL);
```

### Paso 2: Descargar y subir imágenes desde la web de Lacer

Las imágenes están disponibles en URLs públicas de la web:
- `https://lacertalonariodigital.com/archivos/lacer-infantil.png`
- `https://lacertalonariodigital.com/archivos/lacer-efficare.png`
- `https://lacertalonariodigital.com/archivos/lacer-picks-interdental.png`
- `https://lacertalonariodigital.com/archivos/lacer-cintas-hilo-seda.png`

Se descargarán y subirán al bucket `category-images`, luego se actualizará `image_url` en la tabla.

### Paso 3: Renombrar LACER SEDA DENTAL (opcional)

Propongo renombrar `LACER SEDA DENTAL` a `LACER CINTA HILO Y SEDA` para que coincida con la web de referencia, y actualizar su `slug` a `lacer-cinta-hilo-y-seda`. Esto evita tener dos categorías similares.

```sql
UPDATE public.categories 
SET name = 'LACER CINTA HILO Y SEDA', 
    slug = 'lacer-cinta-hilo-y-seda'
WHERE slug = 'lacer-seda-dental';
```

### Paso 4: Verificar productos sin categoría

Revisar si hay productos que deberían pertenecer a las nuevas categorías pero están sin asignar.

## Pregunta pendiente

Sobre `LACER SEDA DENTAL` vs `LACER CINTA HILO Y SEDA`: ¿prefieres renombrar la categoría existente o mantenerlas separadas? Si tienes productos ya asignados a `LACER SEDA DENTAL`, renombrarla es lo más limpio.

## Resultado final

La app tendrá exactamente las mismas categorías que la web de referencia, con sus logos correspondientes y nombres unificados.

## Archivos/recursos afectados

| Acción | Detalle |
|---|---|
| Migración SQL | INSERT de 4 nuevas categorías + UPDATE de nombre en LACER SEDA DENTAL |
| Storage | Subir 4 imágenes nuevas al bucket category-images |
| Base de datos | UPDATE image_url de las 4 nuevas categorías |
