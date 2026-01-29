
# Plan: Optimizar Flujo de Nueva Receta para Usuarios Basicos

## Objetivo
Simplificar el flujo de "Nueva Receta" para usuarios en modo basico, mostrando directamente la pantalla de seleccion de categorias como primer paso y permitiendo acceso rapido a plantillas guardadas.

## Cambios Propuestos

### 1. Modificar CategorySelector para incluir Plantillas
**Archivo:** `src/components/CategorySelector.tsx`

- Agregar una seccion de "Plantillas Rapidas" en la parte superior del selector de categorias
- Mostrar un boton de acceso a plantillas si existen plantillas guardadas (para usuarios que cambiaron de modo profesional a basico o plantillas publicas futuras)
- El boton mostrara un icono de carpeta con el texto "Cargar Plantilla"

### 2. Simplificar RecipeCreator para Modo Basico
**Archivo:** `src/components/RecipeCreator.tsx`

- Ocultar los campos de "Paciente" y "Fecha" cuando el usuario esta en modo basico
- Estos campos solo se mostraran para usuarios profesionales
- Mantener el campo de "Notas adicionales" visible para ambos modos
- Simplificar la vista del card de receta para usuarios basicos

### 3. Ajustar el flujo de navegacion
**Archivo:** `src/pages/Index.tsx`

- Para usuarios basicos, cuando navegan a "nueva-receta" o "seleccionar-categoria", ir directamente al CategorySelector
- El RecipeCreator se mostrara solo cuando el usuario tenga productos seleccionados y cierre el CategorySelector

## Diagrama del Nuevo Flujo (Modo Basico)

```text
+-------------------+
|       HOME        |
|  (Nueva Receta)   |
+---------+---------+
          |
          v
+-------------------+
|   CATEGORIAS      |
| [Cargar Plantilla]|
| [Categoria 1]     |
| [Categoria 2]     |
+---------+---------+
          |
          v
+-------------------+
|    PRODUCTOS      |
| (Seleccionar)     |
+---------+---------+
          |
          v
+-------------------+
|     RESUMEN       |
| - Productos       |
| - Notas           |
| [Enviar]          |
+-------------------+
```

## Detalles Tecnicos

### Cambios en CategorySelector.tsx
1. Agregar prop opcional `templates` para recibir plantillas disponibles
2. Agregar prop `onLoadTemplate` para callback cuando se selecciona una plantilla
3. Mostrar boton de plantillas en el header si hay plantillas disponibles
4. Implementar un dialog o dropdown para seleccionar plantillas

### Cambios en RecipeCreator.tsx
1. Envolver la seccion de datos del paciente en condicional `{isProfessional && (...)}`
2. Ocultar el campo de fecha para usuarios basicos
3. Pasar las plantillas al CategorySelector
4. Manejar la carga de plantillas desde CategorySelector

### Cambios en Index.tsx (minimos)
- El flujo actual ya funciona correctamente con `startWithCategories`
- No se requieren cambios significativos

## Beneficios
- Flujo mas rapido para usuarios basicos (menos pasos)
- Interfaz mas limpia sin campos innecesarios
- Acceso directo a plantillas desde el inicio del proceso
- Mantiene toda la funcionalidad para usuarios profesionales
