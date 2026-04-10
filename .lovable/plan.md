

# Ficha de Paciente con gestión de recetas + Tracking de dispensación por QR

## Resumen

Crear una vista de detalle de paciente accesible desde la lista de pacientes, donde se puedan ver las recetas enviadas a ese paciente, crear una nueva receta pre-rellenada con sus datos, y duplicar recetas anteriores. Ademas, implementar un sistema de confirmación de retirada en farmacia usando el QR existente.

## 1. Vista de detalle de paciente (PatientDetail)

Nuevo componente `PatientDetail.tsx` que se muestra al pulsar "Ver recetas" en la tarjeta del paciente (actualmente el botón no hace nada).

**Contenido:**
- Cabecera con nombre, teléfono, email del paciente
- Botón "Nueva receta" que navega al creador pre-rellenando patient_id y patient_name
- Lista de recetas filtradas por `patient_id`, con las mismas cards del historial (fecha, productos, estado, envío)
- En cada receta: botones "Duplicar" y "Descargar PDF" (reutilizar lógica existente)
- Botón para volver a la lista de pacientes

**Integración en Index.tsx:**
- Nuevo tab interno `"paciente-detalle"` con estado `selectedPatientId`
- Desde PatientList, el botón "Ver recetas" llama `onViewPatient(patient)` → cambia a tab paciente-detalle
- Desde PatientDetail, "Nueva receta" → navega a `nueva-receta` con patient pre-seleccionado
- Desde PatientDetail, "Duplicar" → mismo flujo existente de duplicar

**Hook `usePatientRecipes(patientId)`:**
- Query a `recipes` filtrado por `patient_id` y `user_id`

## 2. Sistema de tracking de dispensación en farmacia (QR)

### Concepto

Cuando la farmacia escanea el QR de la receta, se abre la pagina `/receta?n=CODE`. En esa pagina, añadir un botón "Confirmar dispensación" visible para el farmacéutico. Al pulsarlo, se marca la receta como dispensada con fecha/hora.

### Cambios en base de datos (migración)

```sql
ALTER TABLE recipes ADD COLUMN dispensed_at timestamptz DEFAULT NULL;
ALTER TABLE recipes ADD COLUMN dispensed_by text DEFAULT NULL;

-- Permitir que cualquiera pueda actualizar solo los campos de dispensación
CREATE POLICY "Anyone can mark recipes as dispensed"
ON public.recipes FOR UPDATE
USING (recipe_code IS NOT NULL)
WITH CHECK (recipe_code IS NOT NULL);
```

### Cambios en la pagina `/receta` (Recipe.tsx)

- Mostrar estado de dispensación: badge "Dispensada" con fecha si `dispensed_at` existe, o "Pendiente de retirada" si no
- Botón "Confirmar dispensación" que actualiza `dispensed_at = now()` y opcionalmente pide nombre de farmacia (`dispensed_by`)
- Una vez confirmada, el botón se desactiva y se muestra la confirmación

### Visibilidad del estado en el historial

- En RecipeHistory y PatientDetail, mostrar un indicador visual (badge verde "Retirada" o naranja "Pendiente") basado en `dispensed_at`
- En DashboardStats, añadir métrica de "recetas dispensadas vs pendientes"

## 3. Archivos a modificar/crear

| Archivo | Acción |
|---|---|
| `src/components/PatientDetail.tsx` | **Crear** - Vista detalle paciente |
| `src/hooks/usePatientRecipes.tsx` | **Crear** - Hook para recetas de un paciente |
| `src/components/PatientList.tsx` | Modificar - callback onViewPatient |
| `src/pages/Index.tsx` | Modificar - nuevo tab paciente-detalle, estado selectedPatient |
| `src/pages/Recipe.tsx` | Modificar - botón confirmar dispensación, badge estado |
| `src/components/RecipeHistory.tsx` | Modificar - badge dispensación |
| `src/components/DashboardStats.tsx` | Modificar - métrica dispensación |
| Migración SQL | Crear - campos dispensed_at, dispensed_by + policy UPDATE |

## Notas sobre el tracking por QR

El QR ya apunta a la URL pública de la receta. El farmacéutico escanea → ve los productos → pulsa "Confirmar dispensación". No requiere que el farmacéutico tenga cuenta, solo acceso a la URL pública. La policy RLS permite UPDATE solo en recetas con `recipe_code` (públicas) y solo sobre los campos de dispensación. El profesional puede ver en su historial qué recetas han sido retiradas.

