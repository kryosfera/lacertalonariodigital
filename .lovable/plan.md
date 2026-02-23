

## Personalizar recetas profesionales con logo, datos de clinica y firma

### Objetivo
Cuando un profesional envia una receta, esta debe incluir automaticamente los datos de su perfil: logo de la clinica, nombre del profesional, nombre de la clinica, direccion, numero de colegiado y firma digital. Esto aplica tanto a la **pagina web de la receta** (lo que ve el paciente al abrir el enlace) como al **PDF generado**.

### Estrategia
En lugar de duplicar los datos del perfil dentro de cada receta en la base de datos, la receta ya tiene `user_id`. Al cargar una receta desde la base de datos, haremos un **JOIN con la tabla `profiles`** para obtener los datos del profesional. Asi cualquier cambio en el perfil se refleja automaticamente en todas las recetas.

### Cambios necesarios

**1. Base de datos: Permitir lectura publica de perfiles (migracion SQL)**
- Anadir una politica RLS SELECT en `profiles` que permita leer el perfil cuando se accede a traves de una receta publica (o simplemente permitir SELECT publico de los campos no sensibles, ya que los datos de clinica son informacion comercial publica).

**2. Pagina de receta (`src/pages/Recipe.tsx`)**
- Al cargar una receta de la base de datos, hacer una segunda consulta a `profiles` usando el `user_id` de la receta.
- Mostrar en la cabecera:
  - Logo de la clinica (si existe) en lugar del logo generico de Lacer, o junto a el
  - Nombre del profesional y numero de colegiado
  - Nombre y direccion de la clinica
- Mostrar al final de la receta:
  - Firma digital del profesional (si existe)

**3. PDF (`src/lib/recipeUtils.ts`)**
- Ampliar la interfaz `RecipeData` para incluir datos opcionales del perfil (logo_url, clinic_name, clinic_address, professional_name, registration_number, signature_url).
- En `generateRecipePDF`: si hay logo de clinica, mostrarlo en el header junto al logo Lacer. Anadir los datos del profesional bajo la info del paciente. Anadir la firma al pie del documento.

**4. RecipeCreator (`src/components/RecipeCreator.tsx`)**
- Importar `useProfile` y pasar los datos del perfil a `getRecipeData()` para que el PDF incluya la info profesional.
- Los datos del perfil se pasan como campos opcionales en el objeto `RecipeData`.

### Detalles tecnicos

```text
Flujo de datos:

RecipeCreator (profesional)
  |-- useProfile() --> obtiene logo, firma, datos clinica
  |-- getRecipeData() --> incluye profileData
  |-- generateRecipePDF(data) --> PDF con logo clinica + firma
  |-- saveRecipeToDb() --> guarda con user_id (ya existente)

Recipe.tsx (paciente abre enlace)
  |-- fetch recipe by code --> obtiene user_id
  |-- fetch profile by user_id --> obtiene logo, firma, datos
  |-- Renderiza cabecera con logo clinica + datos
  |-- Renderiza firma al final
```

**Migracion SQL necesaria:**
- Politica RLS en `profiles` para permitir SELECT publico (los datos de clinica son informacion comercial, no sensible).

**Archivos a modificar:**
1. Nueva migracion SQL (politica RLS en profiles para lectura publica)
2. `src/pages/Recipe.tsx` - Cargar y mostrar perfil del profesional
3. `src/lib/recipeUtils.ts` - Ampliar RecipeData y PDF con datos de perfil
4. `src/components/RecipeCreator.tsx` - Inyectar datos de perfil en recipeData

