

## Asegurar que los videos aparecen en las recetas para los pacientes

### Problema detectado

He revisado todo el flujo de recetas y hay **dos problemas** por los que los videos no aparecen:

1. **Recetas guardadas en base de datos (usuarios profesionales):** El codigo de `RecipeCreator.tsx` SI incluye `video_urls` al guardar nuevas recetas (esto funciona correctamente). Sin embargo, las recetas creadas antes de esta funcionalidad no tienen videos almacenados.

2. **Recetas temporales / URLs cortas (usuarios basicos):** Las funciones de codificacion en `recipeUtils.ts` NO incluyen `video_urls` en la interfaz `Product` ni en las funciones `encodeRecipeData` / `decodeRecipeData`. Esto significa que al compartir recetas via URL corta, los videos se pierden completamente.

### Cambios necesarios

**1. `src/lib/recipeUtils.ts` - Incluir video_urls en el modelo de datos**

- Anadir `video_urls?: string[] | null` a la interfaz `Product`
- Actualizar `encodeRecipeData` para incluir `video_urls` en los datos codificados
- Actualizar `decodeRecipeData` para recuperar `video_urls` de los datos decodificados

**2. `src/pages/ShortRecipe.tsx` - Pasar video_urls al redirigir**

- Incluir `video_urls` en el objeto `minimalData` que se codifica al redirigir desde URLs cortas a la pagina de receta

**3. `src/pages/Recipe.tsx` - Asegurar decodificacion de video_urls**

- Verificar que al decodificar datos temporales (parametro `d`), se recuperen tambien los `video_urls` del producto

### Detalles tecnicos

Los cambios son minimos y quirurgicos:

- En `recipeUtils.ts`: anadir el campo `v` (video_urls) al formato compacto usado para codificar/decodificar
- En `ShortRecipe.tsx`: mapear `video_urls` al campo compacto `v` en la redireccion
- En `Recipe.tsx`: leer el campo `video_urls` desde los datos decodificados (el renderizado de videos ya funciona correctamente)
- El flujo de recetas profesionales (guardadas en BD) ya funciona para recetas nuevas, no requiere cambios

