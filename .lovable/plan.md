## Problema

En el desplegable de búsqueda de paciente del modo Profesional, al pulsar "Crear paciente «...»" se guarda el paciente solo con el nombre. El teléfono no se persiste porque el campo `patientPhone` que aparece más abajo (en la sección de envío) todavía está vacío en ese momento. Resultado: pacientes creados sin teléfono, sin posibilidad de enviarles la receta por WhatsApp después.

## Solución

Convertir la fila "Crear paciente «X»" en un mini-formulario inline dentro del propio desplegable, que pide **nombre (ya escrito) + teléfono (obligatorio)** antes de guardar. El email queda fuera (lo pediremos solo si el dentista decide enviar por email).

## Cambios en `src/components/RecipeCreator.tsx`

### 1. Nuevo estado local

- `inlineCreateMode: boolean` — controla si la fila "Crear paciente" se ha expandido a formulario.
- `inlinePhone: string` — teléfono temporal del nuevo paciente.

Se resetean al cerrar el dropdown, al limpiar el paciente o tras crear.

### 2. Render del dropdown (líneas 859‑883)

Cuando `trimmedPatientName.length > 0 && !exactMatchExists`:

- **Estado colapsado** (`!inlineCreateMode`): botón actual "+ Crear paciente «X»". Al pulsarlo, en lugar de llamar a `handleCreatePatientInline` directamente, hace `setInlineCreateMode(true)` y enfoca el input de teléfono.
- **Estado expandido** (`inlineCreateMode`): se sustituye por un bloque con:
  - Cabecera: "Nuevo paciente: «X»".
  - `Input` de teléfono (`type="tel"`, `inputMode="tel"`, autoFocus, placeholder "Teléfono móvil"). `onMouseDown`/`onClick` con `e.stopPropagation()` para que el `onBlur` del input padre no cierre el dropdown.
  - Dos botones: "Cancelar" (vuelve a colapsado) y "Guardar" (deshabilitado si `inlinePhone.trim().length < 6` o `createPatient.isPending`).
  - Mensaje sutil "El teléfono es necesario para enviar la receta por WhatsApp."

Para evitar que el `onBlur` del input de búsqueda (línea 805) cierre el dropdown mientras el usuario teclea el teléfono, el contenedor del dropdown captura `onMouseDown` con `preventDefault` y, además, se mantiene abierto explícitamente cuando `inlineCreateMode === true` (añadir esa condición al `setTimeout` del onBlur o gate del render).

### 3. Handler `handleCreatePatientInline`

Se modifica para recibir/usar `inlinePhone`:

```ts
const phone = inlinePhone.trim();
const newPatient = await createPatient.mutateAsync({
  name: trimmedPatientName,
  phone: phone || undefined,
});
setPatientPhone(phone);     // sincroniza con el campo de envío
handleSelectPatient(newPatient);
setInlineCreateMode(false);
setInlinePhone("");
```

Validación previa: si `phone.length < 6`, no continuar (botón ya deshabilitado, defensa en profundidad).

### 4. Limpieza al deseleccionar

En el botón de limpiar (línea 815‑821) y en `handleSelectPatient`, resetear también `inlineCreateMode` e `inlinePhone`.

## Lo que NO cambia

- Esquema de BD (`patients` ya tiene `phone` opcional).
- Hook `useCreatePatient`.
- Flujo del modo Quick.
- Edición posterior de pacientes (sigue en `/patients`).

## Archivo a modificar

- `src/components/RecipeCreator.tsx`
