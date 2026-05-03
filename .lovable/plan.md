## Objetivo

En modo Profesional, cuando el dentista escribe un nombre de paciente que no existe (o no tiene pacientes guardados todavía), poder crear el paciente desde el mismo desplegable de búsqueda, sin salir del flujo de creación de receta.

## Estado actual

`src/components/RecipeCreator.tsx` ya tiene:

- Input de búsqueda de paciente (línea 770‑836) con dropdown personalizado.
- Hook `usePatients()` para listar y `useCreatePatient` disponible en `src/hooks/usePatients.tsx`.
- Estados `patientName`, `patientPhone`, `patientEmail`, `selectedPatient`.

Si el texto escrito no coincide con ningún paciente, el dropdown simplemente no muestra nada — no hay forma de guardar.

## Cambios

### 1. Importar `useCreatePatient` e icono `UserPlus`

En `src/components/RecipeCreator.tsx`:

- Añadir `UserPlus` al import de `lucide-react`.
- Importar `useCreatePatient` desde `@/hooks/usePatients`.
- Instanciarlo: `const createPatient = useCreatePatient();`

### 2. Mostrar opción "Crear paciente" en el dropdown

Modificar el dropdown del paciente (líneas 808‑834) para que **siempre** se renderice cuando esté abierto y haya texto escrito que no corresponde exactamente a un paciente existente. La lista mostrará:

- Los pacientes coincidentes (igual que ahora).
- Una fila final "+ Crear paciente «<texto escrito>»" cuando `patientName.trim()` no coincida exactamente con ningún `patient.name` (case-insensitive).

Si no hay pacientes guardados todavía y el campo está vacío, mostrar un mensaje sutil "Aún no tienes pacientes — escribe un nombre para crear el primero."

### 3. Handler `handleCreatePatientInline`

Nueva función que:

1. Llama a `createPatient.mutateAsync({ name: patientName.trim(), phone: patientPhone || undefined, email: patientEmail || undefined })`.
2. Al resolver, hace `handleSelectPatient(newPatient)` para marcarlo como seleccionado.
3. Cierra el dropdown.
4. Si falla, ya `useCreatePatient` muestra toast de error.

Se ejecuta en `onMouseDown` del nuevo item (igual patrón que las filas existentes para evitar conflicto con `onBlur` del input).

### 4. UX detalle

- Botón visualmente diferenciado: borde superior, texto en color `secondary`/primary, icono `UserPlus`.
- Mientras `createPatient.isPending`, mostrar spinner pequeño y texto "Creando…", y deshabilitar el botón.
- Tras crear, `selectedPatient` queda fijo (con check verde ya existente), y el teléfono/email actuales se quedan asociados al paciente recién creado (útil porque pueden haberse rellenado luego en la pantalla de envío; si se introducen después podemos hacer un `useUpdatePatient` opcional — fuera de este alcance).

### 5. Sin cambios de schema

La tabla `patients` ya soporta `name` + `phone`/`email` opcionales con RLS por `user_id`. No hace falta migración.

## Archivo a modificar

- `src/components/RecipeCreator.tsx` — imports, hook, render del dropdown y handler.

## Lo que NO cambia

- Flujo de envío (WhatsApp/Email) y persistencia de la receta.
- Pantalla `/patients` (gestión completa de pacientes).
- Modo Quick (no profesional) sigue sin selector de pacientes.
