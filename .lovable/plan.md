

# Cambios estéticos en Home + Registro con datos de clínica

## Cambios

### 1. Unificar color rojo del botón "Nueva Receta" con el Hero
En `HomeScreenBento.tsx`, el botón usa `bg-secondary` mientras el hero usa `hsl(0 72% 51%)`. Cambiar el botón "Nueva Receta" para usar el mismo gradiente rojo del hero en lugar de `bg-secondary`, asegurando coherencia visual.

### 2. Maximizar el CTA "¿Eres profesional?"
Transformar el enlace discreto actual (texto pequeño gris, `text-xs text-muted-foreground/70`) en un banner llamativo:
- Card con borde rojo y fondo degradado sutil
- Icono Sparkles más grande
- Texto principal en negrita: "¿Eres profesional?"
- Subtítulo: "Regístrate gratis y activa gestión de pacientes, historial y más"
- Botón CTA visible "Activar cuenta profesional"

### 3. Añadir campos Localidad, Clínica y Provincia al registro
- **Migración SQL**: Añadir columnas `locality` y `province` a la tabla `profiles` (ya tiene `clinic_name`)
- **Formulario de registro** (`Auth.tsx`): Crear un schema separado para signup que incluya `email`, `password`, `clinic_name`, `locality` y `province`
- **Post-registro**: Tras el `signUp` exitoso, insertar/actualizar el perfil con los datos adicionales usando `supabase.from('profiles').upsert()`

### Archivos a modificar/crear

| Archivo | Cambio |
|---------|--------|
| `src/components/home/HomeScreenBento.tsx` | Color botón receta + CTA profesional prominente |
| `src/pages/Auth.tsx` | Campos extra en tab de registro (clínica, localidad, provincia) |
| Migración SQL | `ALTER TABLE profiles ADD COLUMN locality text, ADD COLUMN province text` |

