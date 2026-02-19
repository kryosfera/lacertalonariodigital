
# Comparativa completa: productos de la app vs web de referencia

He analizado todas las categorías de la web `lacertalonariodigital.com/es/marcas` y las he comparado con los 87 productos activos de la base de datos. El resultado es el siguiente:

---

## Estado actual: lo que está BIEN

Estas categorías están perfectamente sincronizadas (mismos productos, mismo nombre):

- GingiLacer: GINGILACER PASTA, GINGILACER COLUTORIO - OK
- Clorhexidina Lacer: 5 productos - OK
- Fluor Lacer: 3 productos - OK
- SensiLacer: 4 productos (Pasta, Gel Dental, Colutorio, Gel Bioadhesivo) - OK
- XeroLacer: 4 productos (Pasta, Colutorio, Spray, Gel Tópico) - OK
- LacerBlanc: 6 productos - OK
- Lacer Natur: 3 productos - OK
- LacerPro: 2 productos - OK
- LacerFresh: 3 productos - OK
- LacerOros: 2 productos - OK
- OrtoLacer: 3 productos - OK
- AftaLacer: 3 productos - OK
- Lacer Cepillos Dentales: 13 cepillos + Limpiador Lingual - OK
- Lacer Interdentales: 9 modelos - OK
- Lacer Cinta Hilo y Seda: 4 productos - OK
- Lacer Hidro: Coincide en productos principales (aunque con nombres distintos, ver abajo)

---

## Diferencias encontradas

### 1. Productos FALTANTES en la app (existen en la web, no en nuestra BD)

**Categoría LACER MUCOREPAIR** — falta 1 producto:
- La web tiene: `GEL TOPICO MUCOREPAIR` + `LACER MUCOREPAIR COLUTORIO`
- Nuestra app tiene: solo `LACER MUCOREPAIR GEL TOPICO` (el colutorio no está)
- **Accion: insertar `LACER MUCOREPAIR COLUTORIO`**

**Categoría LACER JUNIOR** — la web tiene 4 productos:
- `GEL LACER JUNIOR FRESA` - OK en nuestra app
- `GEL LACER JUNIOR MENTA` - OK en nuestra app
- `CEPILLO ELECTRICO` - OK en nuestra app (como `CEPILLO ELECTRICO JUNIOR`)
- `RECAMBIOS CEPILLO ELECTRICO` - OK en nuestra app (como `RECAMBIOS CEPILLO ELECTRICO JUNIOR`)

Hay un problema adicional: `GEL LACER INFANTIL` está asignado a la categoría LACER JUNIOR en nuestra app, pero en la web pertenece a la categoría **LACER INFANTIL**. Hay que reasignarlo.

**Categoría LACER INFANTIL** — la web tiene 1 producto:
- `GEL LACER INFANTIL` — existe en nuestra BD pero está asignado a LACER JUNIOR (error de categoría)
- **Accion: reasignar a categoría LACER INFANTIL**

**Categoría LACER EFFICARE** — la web tiene 3 productos:
- `LACER EFFICARE` (cepillo eléctrico adulto) - existe en la BD pero sin categoría asignada
- `RECAMBIOS LACER EFFICARE` - existe en la BD pero sin categoría asignada
- `RECAMBIOS ENCÍAS` / `RECAMBIOS ENCÍAS LACER EFFICARE` - existe en la BD pero sin categoría asignada
- **Accion: asignar los 3 productos a la categoría LACER EFFICARE**

**Categoría LACER PICKS INTERDENTAL** — la web tiene 1 producto:
- `SOFT PICKS 30 UDS` — existe en la BD pero está en categoría LACER INTERDENTALES (`LACER SOFT PICKS 30 UDS` y `SOFT PICKS 30 UDS` - parece duplicado)
- **Accion: reasignar `SOFT PICKS 30 UDS` a categoría LACER PICKS INTERDENTAL y eliminar el duplicado `LACER SOFT PICKS 30 UDS`**

**Categoría LACER HIDRO** — la web tiene 5 productos con nombres distintos:
- Web: `LACER HIDRO ADVANCED BLANCO` → App: `IRRIGADOR BUCAL ADVANCED BLANCO`
- Web: `LACER HIDRO ADVANCED NEGRO` → App: `IRRIGADOR BUCAL ADVANCED NEGRO`
- Web: `LACER HIDRO PORTATIL INALAMBRICO` → App: `IRRIGADOR BUCAL PORTATIL INALAMBRICO`
- Web: `PACK RECAMBIOS LACER HIDRO ADVANCED BLANCO` → App: `PACK RECAMBIOS LACER HIDRO ADVANCED BLANCO` (OK)
- Web: `PACK RECAMBIOS LACER HIDRO NEGRO` → App: `PACK RECAMBIOS LACER HIDRO NEGRO` (OK)
- Nuestra app tiene 2 extras no en la web: `IRRIGADOR LACER HIDRO` y `RECAMBIOS IRRIGADOR LACER HIDRO` (pueden mantenerse si son válidos)
- **Accion: renombrar los 3 productos de Hidro para que coincidan con la web**

### 2. Categoría LACER ALIGNER

La web de referencia NO muestra la categoría `LACER ALIGNER` en `/es/marcas`. Es posible que sea una sección separada (tipo médico/profesional) o que se haya añadido internamente. Se deja como está por ahora — no hay acción requerida.

---

## Plan de implementación (SQL puro, sin cambios de código)

### Paso 1: Insertar LACER MUCOREPAIR COLUTORIO

```sql
INSERT INTO public.products (name, slug, category_id, is_active, is_visible, sort_order)
SELECT 'LACER MUCOREPAIR COLUTORIO', 'lacer-mucorepair-colutorio', id, true, true, 1
FROM public.categories WHERE slug = 'lacer-mucorepair';
```

### Paso 2: Reasignar GEL LACER INFANTIL a categoría LACER INFANTIL

```sql
UPDATE public.products
SET category_id = (SELECT id FROM categories WHERE slug = 'lacer-infantil')
WHERE slug = 'gel-lacer-infantil';
```

### Paso 3: Asignar los 3 productos de LACER EFFICARE a su categoría

```sql
UPDATE public.products
SET category_id = (SELECT id FROM categories WHERE slug = 'lacer-efficare')
WHERE slug IN ('lacer-efficare', 'recambios-lacer-efficare', 'recambios-encias-lacer-efficare');
```

### Paso 4: Reasignar SOFT PICKS 30 UDS a LACER PICKS INTERDENTAL y eliminar el duplicado

```sql
-- Eliminar el duplicado
DELETE FROM public.products WHERE slug = 'lacer-soft-picks-30-uds';

-- Reasignar el original
UPDATE public.products
SET category_id = (SELECT id FROM categories WHERE slug = 'lacer-picks-interdental')
WHERE slug = 'soft-picks-30-uds';
```

### Paso 5: Renombrar productos LACER HIDRO para coincidir con la web

```sql
UPDATE public.products SET name = 'LACER HIDRO ADVANCED BLANCO' WHERE slug = 'irrigador-bucal-advanced-blanco';
UPDATE public.products SET name = 'LACER HIDRO ADVANCED NEGRO' WHERE slug = 'irrigador-bucal-advanced-negro';
UPDATE public.products SET name = 'LACER HIDRO PORTATIL INALAMBRICO' WHERE slug = 'irrigador-bucal-portatil-inalambrico';
```

---

## Resumen de cambios

| Tipo | Descripción |
|---|---|
| INSERT | 1 producto nuevo: LACER MUCOREPAIR COLUTORIO |
| UPDATE categoría | GEL LACER INFANTIL → de LACER JUNIOR a LACER INFANTIL |
| UPDATE categoría | 3 productos de LACER EFFICARE → asignados a su categoría |
| UPDATE categoría | SOFT PICKS 30 UDS → de LACER INTERDENTALES a LACER PICKS INTERDENTAL |
| DELETE | LACER SOFT PICKS 30 UDS (duplicado) |
| UPDATE nombre | 3 productos LACER HIDRO renombrados para coincidir con la web |

No se requieren cambios de código — solo operaciones en la base de datos.
