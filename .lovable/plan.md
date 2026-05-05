## Problema detectado

El formulario de registro pide email, contraseña, **clínica, localidad y provincia**, pero estos 3 últimos campos se pierden silenciosamente cuando el usuario se registra.

**Causa técnica:** tras `signUp()`, el código intenta guardar el perfil con `auth.getSession()`. Pero como la confirmación por email está activada, no hay sesión hasta que el usuario hace click en el enlace del correo. Resultado: `userId` es `undefined`, el `upsert` no se ejecuta y el usuario queda en `auth.users` sin fila en `profiles`. Por eso `mdental.santcugat@gmail.com` aparece sin datos de clínica.

## Solución

Mover la creación del perfil al **backend**, usando los metadatos que el usuario envía en el registro. Así no depende de que exista sesión.

### Cambios

1. **`src/pages/Auth.tsx` — `handleSignup`**
   - Pasar `clinic_name`, `locality`, `province` dentro de `options.data` en `supabase.auth.signUp()` (van a `raw_user_meta_data`).
   - Eliminar el bloque `getSession() + upsert profiles` (ya no hace falta, lo hace el trigger).
   - Adaptar el mensaje al usuario: si no hay sesión tras `signUp`, mostrar "Revisa tu email para confirmar la cuenta" en vez de redirigir.

2. **`src/hooks/useAuth.tsx` — `signUp`**
   - Aceptar un parámetro opcional `metadata` y pasarlo como `options.data` al `signUp` de Supabase.

3. **Migración de BD — actualizar trigger `handle_new_user`**
   - El trigger ya existe (creado en el mensaje anterior, inserta una fila vacía en `profiles`).
   - Modificarlo para leer `NEW.raw_user_meta_data` y rellenar `clinic_name`, `locality` y `province` cuando vengan informados.

4. **Backfill del usuario existente**
   - `mdental.santcugat@gmail.com` perdió los datos del formulario y no hay forma de recuperarlos. Quedará con perfil vacío hasta que entre y los rellene desde su pantalla de "Mi clínica". No requiere acción.

### Detalles técnicos del trigger

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, clinic_name, locality, province)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data->>'clinic_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'locality', ''),
    NULLIF(NEW.raw_user_meta_data->>'province', '')
  )
  ON CONFLICT (user_id) DO UPDATE
    SET clinic_name = COALESCE(EXCLUDED.clinic_name, profiles.clinic_name),
        locality    = COALESCE(EXCLUDED.locality,    profiles.locality),
        province    = COALESCE(EXCLUDED.province,    profiles.province);
  RETURN NEW;
END;
$$;
```

Nota: requiere índice/constraint UNIQUE en `profiles.user_id` (verificar y añadir si no existe).

## Resultado esperado

A partir de la aplicación:
- Cualquier nuevo registro guardará automáticamente clínica/localidad/provincia, incluso antes de confirmar el email.
- El admin verá al usuario con sus datos completos desde el primer momento.
- No se vuelve a depender de que el cliente cree la fila en `profiles`.
