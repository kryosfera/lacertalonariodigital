

# Verificación y mejora de funcionalidades Pro + Hero personalizado

## Estado actual de funcionalidades Pro

| Funcionalidad | Estado | Notas |
|---|---|---|
| Crear pacientes | Completa | CRUD completo en PatientList |
| Ver historial | Completa | Paginación, filtros, descarga PDF |
| Guardar templates | Completa | Guardar, cargar y eliminar plantillas |
| Duplicar recetas | **Falta** | No hay botón de duplicar/reutilizar en historial |
| Visualizar datos | Completa | DashboardStats con métricas en tiempo real |
| Hero con logo clínica | **Falta** | Siempre muestra logo Lacer genérico |

## Plan de implementación

### 1. Añadir botón "Duplicar receta" en RecipeHistory

En cada tarjeta del historial, junto al botón PDF, añadir un botón "Duplicar" que:
- Copie los productos y notas de la receta seleccionada
- Navegue a "nueva-receta" con esos datos pre-cargados
- Requiere pasar un callback `onDuplicate(recipe)` desde `Index.tsx`

**Archivos:** `RecipeHistory.tsx`, `Index.tsx`, `RecipeCreator.tsx`

### 2. Personalizar Hero para usuarios Pro autenticados

En `HomeScreenBento.tsx`:
- Recibir datos de perfil como prop (logo_url, clinic_name, professional_name)
- Cuando el usuario es Pro y tiene perfil:
  - Mostrar el logo de la clínica (si existe) en lugar del logo Lacer genérico, o ambos lado a lado
  - Reemplazar "Talonario Digital" por el nombre de la clínica
  - Añadir subtítulo "Dr./Dra. [nombre profesional]"
- Si no tiene perfil completado, mantener el diseño genérico actual

**Archivos:** `HomeScreenBento.tsx`, `Index.tsx` (pasar profileData como prop)

### Detalle técnico

**Duplicar receta:**
- `RecipeHistory` recibe `onDuplicate?: (recipe: Recipe) => void`
- `Index.tsx` define handler que setea estado `duplicateRecipe` y cambia a tab "nueva-receta"
- `RecipeCreator` recibe prop `initialRecipe?` y lo carga en `useEffect`

**Hero personalizado:**
- `HomeScreenBento` recibe `profile?: { logo_url, clinic_name, professional_name } | null`
- Renderizado condicional: si `profile?.clinic_name` existe, mostrar nombre de clínica como título principal y "Talonario Digital" como subtítulo más pequeño
- Si `profile?.logo_url` existe, mostrar logo clínica en el cuadrado blanco (manteniendo Lacer como badge pequeño debajo)

