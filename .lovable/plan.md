

# Fix: Acortar URLs en mensajes de WhatsApp

## Problema

Cuando se envía una receta por WhatsApp, la URL generada es extremadamente larga porque usa codificación base64 (`/receta?d=JTdCJTIycCUy...`). Esto ocurre porque `createShortUrl` falla (requiere autenticación) y cae al fallback base64.

El flujo profesional (`isProfessional`) debería generar URLs cortas tipo `/receta?n=ABC123` vía `saveRecipeToDb`, pero si falla o si el usuario está en modo basico, se genera la URL larga.

## Solucion

Aplicar un **doble fallback** en todos los flujos de envío: siempre intentar primero el short URL de base de datos, y solo si falla usar base64. Ademas, en el flujo profesional, si `saveRecipeToDb` falla, también intentar `createShortUrl` antes de caer a base64.

### Cambios en `src/components/RecipeCreator.tsx`

En las 4 funciones de envío (WhatsApp, Email, PDF, Print), unificar la lógica de generación de URL:

```text
1. Si isProfessional → saveRecipeToDb → /receta?n=CODE (corta)
2. Si falla o no es profesional → createShortUrl → /r/XXXXXX (corta)
3. Si falla → generateTemporaryRecipeUrl → /receta?d=... (larga, ultimo recurso)
```

Esto garantiza que los usuarios autenticados siempre obtengan URLs cortas, y solo se use base64 como ultimo recurso para usuarios no autenticados.

### Cambio en `src/lib/recipeUtils.ts`

Tambien añadir un fallback en el flujo profesional: si `saveRecipeToDb` devuelve un `recipeCode`, usar la URL corta. Si no, intentar `createShortUrl` antes de rendirse.

## Resultado esperado

Los mensajes de WhatsApp mostraran URLs cortas tipo:
- `lacertalonariodigital.lovable.app/receta?n=ABC123` (profesional)
- `lacertalonariodigital.lovable.app/r/x7k9m2` (short URL)

En vez de la URL base64 de cientos de caracteres.

