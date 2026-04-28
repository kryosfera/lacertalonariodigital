## Problema detectado

En la captura el header muestra "Modo Profesional" y la home renderiza widgets de pro (Historial, Pacientes, Dashboard, contadores Este mes/Recetas/Pacientes) pese a no haber iniciado sesión. Esos contadores siempre serán 0 sin usuario, así que la pantalla no tiene sentido.

### Causa raíz

En `src/hooks/useUserMode.tsx`, una vez que el usuario marcó alguna vez "profesional" en `localStorage` (clave `lacer_user_mode`), al cerrar sesión el hook **mantiene** ese valor y vuelve a poner `userMode = 'professional'`. El modo profesional debería requerir sesión activa.

Concretamente:
- Si `user` existe → fuerza `professional` (correcto).
- Si `user` no existe → lee `localStorage`. Si quedó `'professional'` de una sesión anterior, sigue mostrando todo el UI de pro sin datos.

Además `useHomeStats` está habilitado solo con `user`, por eso los KPIs siempre quedan en 0 → confirma el bug visual.

## Plan de cambios

**Archivo: `src/hooks/useUserMode.tsx`**

1. Cuando NO hay `user` (sesión cerrada), forzar `userMode = 'basic'` ignorando lo que haya en `localStorage`. Limpiar la clave para no arrastrar el estado entre sesiones.
2. Mantener el comportamiento actual cuando sí hay `user`: modo `professional` automático.
3. Resultado: al desloguearse o entrar como invitado, la home siempre muestra el Modo Rápido (sin Historial/Pacientes/Dashboard ni la franja de stats), y aparece el banner "¿Eres profesional?".

**Archivo: `src/pages/Index.tsx`** (verificación, sin cambios funcionales esperados)

- El header ya lee `isProfessional` desde `userMode`, así que al corregir el hook el subtítulo "Modo Profesional" pasará correctamente a "Modo Rápido" sin sesión.

## Resultado esperado

- Sin login → siempre Modo Rápido: solo "Nueva Receta" + "Recomendaciones" + banner CTA de registro. Sin contadores en 0 confusos. Sin pestañas Pro en el header.
- Con login → Modo Profesional con stats reales (igual que hoy).
- Cerrar sesión desde Profesional → vuelve automáticamente a Rápido.
