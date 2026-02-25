
# Diagnostico y correccion del selector de pacientes

## Problema detectado

Tras investigar la base de datos y el codigo, he encontrado lo siguiente:

- Tu usuario tiene **1 paciente** ("Joaquin") en la base de datos -- este se creo el 19 de febrero.
- Si has creado un paciente nuevo **hace un momento**, es posible que se haya creado con un usuario diferente (por ejemplo, si tienes otra sesion abierta). He encontrado otro paciente "Joaquin Fernandez" pero pertenece a un `user_id` distinto al tuyo actual.

Ademas, hay **dos problemas tecnicos** que pueden causar que los pacientes no aparezcan en el selector:

### 1. Cache de React Query demasiado largo
El hook `usePatients` tiene un `staleTime` de 2 minutos. Si creas un paciente y luego vas al creador de recetas, la lista de pacientes puede seguir mostrando datos antiguos.

### 2. El selector de pacientes no se abre automaticamente
El autocomplete de pacientes requiere que el usuario escriba en el campo de nombre para que aparezcan sugerencias. Si no se escribe nada, muestra solo los primeros 5, pero el popover puede no abrirse correctamente.

## Cambios propuestos

### Archivo: `src/hooks/usePatients.tsx`
- Reducir el `staleTime` de 2 minutos a 30 segundos para que los pacientes recien creados aparezcan mas rapido al navegar al creador de recetas.

### Archivo: `src/components/RecipeCreator.tsx`
- Asegurar que el popover de pacientes se abra al hacer focus en el campo de nombre del paciente (evento `onFocus`), mostrando la lista incluso cuando el campo esta vacio.
- Invalidar la cache de pacientes al montar el componente RecipeCreator para garantizar datos frescos.

### Verificacion de la base de datos
- Confirmar que la vista `patients_with_stats` es accesible correctamente via la API REST (actualmente funciona, pero sin `security_invoker` -- la seguridad se aplica via filtro `user_id` en el codigo).

## Secuencia de implementacion
1. Reducir staleTime en `usePatients`
2. Mejorar la interaccion del popover de pacientes en `RecipeCreator`
3. Verificar el flujo completo: crear paciente, ir a receta, seleccionarlo
