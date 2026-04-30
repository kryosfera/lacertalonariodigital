# Problema

En la captura de WhatsApp el enlace enviado es `lacertalonariodigital.lovable.app/receta?d=JTdCJTIyc...` (cadena base64 enorme). Al abrirlo aparece "Receta no encontrada" porque WhatsApp suele cortar / partir URLs largas y la decodificación base64 falla.

## Causa raíz

En `RecipeCreator.tsx → generateRecipeUrlWithFallback` el flujo es:

1. Si es profesional → guardar en BD y usar `/receta?n=CODE` (URL corta, ideal).
2. Crear short URL → `/r/CODE`.
3. **Fallback base64** → `/receta?d=<cadena enorme>`.

En **Modo Básico** (sin login) se salta el paso 1 y, además, la RLS de `short_urls` exige `auth.uid() IS NOT NULL`, por lo que el paso 2 también falla. Resultado: siempre cae al fallback base64 que WhatsApp rompe.

# Solución

Permitir que **cualquier usuario** (incluso anónimo) pueda crear `short_urls`, para que el enlace sea siempre corto y válido del tipo `lacertalonariodigital.lovable.app/r/AbC123`.

## Cambios

### 1. Base de datos (migración)

Reemplazar la política INSERT de `short_urls` para permitir creaciones anónimas:

```sql
DROP POLICY "Authenticated users can create short URLs" ON public.short_urls;

CREATE POLICY "Anyone can create short URLs"
  ON public.short_urls FOR INSERT
  WITH CHECK (true);
```

Riesgos / mitigación:
- La tabla ya tiene expiración a 30 días y se limpia con `cleanup_expired_short_urls`.
- El `code` se genera server-side (`generate_short_code()`), no es manipulable.
- Solo guarda datos de receta no sensibles (productos + nombre paciente + notas), igual que ya hace el flujo profesional cuando se comparte una receta pública.

### 2. `src/lib/recipeUtils.ts → createShortUrl`

Hacerla funcional sin sesión:
- Si hay sesión → usar `Authorization: Bearer <accessToken>` (como ahora).
- Si no hay sesión → usar `Authorization: Bearer <anon key>` (igual que el resto de llamadas anónimas del proyecto).
- Quitar el `return null` cuando falta sesión.

### 3. `src/components/RecipeCreator.tsx`

Sin cambios de lógica: el flujo de fallback ya prefiere short URL antes que base64; al desbloquear `createShortUrl` para anónimos, los usuarios en Modo Básico recibirán siempre `/r/CODE`.

# Resultado esperado

El mensaje de WhatsApp pasará de:

```
Consulta la receta en:
https://lacertalonariodigital.lovable.app/receta?d=JTdCJTIycCUyMiUz... (200+ chars)
```

A:

```
Consulta la receta en:
https://lacertalonariodigital.lovable.app/r/Ab3xK9
```

Enlace corto, copiable y que WhatsApp no parte. Funciona tanto en Modo Básico como Profesional.

¿Apruebas?