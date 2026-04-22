

## Objetivo
Añadir la funcionalidad "¿Olvidaste tu contraseña?" en la pantalla `/auth` para que cualquier usuario (incluido Enrique) pueda restablecer su contraseña por email.

## Cómo funcionará

### 1. Enlace en el formulario de Login
Debajo del campo "Contraseña" en la pestaña "Iniciar sesión" añadiré un enlace discreto **"¿Olvidaste tu contraseña?"** alineado a la derecha.

### 2. Diálogo de recuperación
Al hacer clic, se abre un `Dialog` minimalista (estilo Apple, coherente con el resto de la app) con:
- Título: "Recuperar contraseña"
- Descripción breve explicando que se enviará un email con un enlace.
- Campo email (con validación zod, prerellenado si ya escribió uno en login).
- Botón "Enviar enlace de recuperación" + botón cancelar.

Llama a `supabase.auth.resetPasswordForEmail(email, { redirectTo: \`${window.location.origin}/auth?mode=reset\` })`.

Mostrará toast de éxito ("Si el email existe, recibirás un enlace en breve") sin revelar si el email está registrado (buena práctica de seguridad).

### 3. Pantalla de nueva contraseña
Cuando el usuario hace clic en el enlace del email, Supabase lo devuelve a `/auth` con una sesión de recuperación activa. Detectaré el evento `PASSWORD_RECOVERY` de `onAuthStateChange` y mostraré una vista alternativa dentro de `Auth.tsx` con:
- Campo "Nueva contraseña" + "Confirmar contraseña" (validación zod, mín. 6 caracteres, deben coincidir).
- Botón "Actualizar contraseña" → llama a `supabase.auth.updateUser({ password })`.
- Al éxito: toast + redirección a `/`.

### 4. Configuración de email
Las plantillas de auth ya las gestiona Supabase por defecto, así que **el flujo funciona inmediatamente** sin más setup. El email de recuperación llegará desde el remitente por defecto de Supabase.

> Más adelante, si quieres que los emails de recuperación lleven el branding Lacer (logo, colores, dominio propio), podemos configurar plantillas auth personalizadas con dominio propio. Lo dejo como mejora opcional posterior.

## Archivos a modificar
- `src/pages/Auth.tsx` — añadir enlace, diálogo de recuperación, pantalla de nueva contraseña, listener de `PASSWORD_RECOVERY`.

No requiere cambios en backend, migraciones ni Edge Functions.

