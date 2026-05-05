# Plan: Reparar emails de confirmación y mejorar UX de registro

## Problema
- `email_send_log` está vacío → el `auth-email-hook` no está activo, Supabase usa SMTP por defecto y golpea el rate-limit 429.
- Hay usuarios sin confirmar (ej. `info@salvadodental.com`) que nunca recibieron el correo.
- En `Auth.tsx` el usuario solo ve un toast tras registrarse → no sabe el siguiente paso ni puede reenviar.

## Cambios

### 1. Reactivar el hook de emails de autenticación
- Re-scaffold de las plantillas auth (overwrite) con dominio existente `notify.inginium-ksf.com`.
- Re-aplicar branding Lacer (rojo #E31937, fondo blanco) a las 6 plantillas.
- Redeploy de `auth-email-hook` para forzar a Supabase a enrutar por nuestra cola pgmq.

### 2. Edge function `resend-confirmation`
- Pública (`verify_jwt = false`), valida email con Zod.
- Usa `auth.admin.generateLink({ type: 'signup' })` y dispara el hook → cae en cola.
- Devuelve siempre 200 genérico (anti-enumeration).

### 3. Recuperar usuarios bloqueados
- Para cada usuario con `email_confirmed_at IS NULL` reciente, invocar `resend-confirmation`.

### 4. UX en `src/pages/Auth.tsx`
- Tras signup OK: mostrar pantalla "Revisa tu email" con:
  - Email destino, instrucciones (revisar spam, dominio `notify.inginium-ksf.com`).
  - Botón "Reenviar correo" con cooldown 60s.
  - Botón "Cambiar email" (vuelve al form).
- En tab Login: link "¿No recibiste el email de confirmación?" que abre modal con input + reenvío.

### 5. Verificación
- Consultar `email_send_log` y confirmar transición `pending → sent`.
- Probar registro nuevo end-to-end.

## Archivos
- `supabase/functions/_shared/email-templates/*.tsx` (rebrand)
- `supabase/functions/auth-email-hook/index.ts` (regenerado)
- `supabase/functions/resend-confirmation/index.ts` (nuevo)
- `supabase/config.toml` (entry de la nueva función)
- `src/pages/Auth.tsx` (nuevo flujo UX)
