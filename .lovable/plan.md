

# Unificar botones con el degradado rojo del Hero

## Problema

Los botones de acción principales (login, registro, cookies, selectores) usan `bg-secondary hover:bg-secondary/90` — un rojo plano que al hacer hover simplemente baja la opacidad. El usuario quiere que todos los botones CTA usen el mismo degradado rojo definido en el Hero:

```
linear-gradient(160deg, hsl(0 72% 51%) 0%, hsl(0 72% 38%) 100%)
```

## Cambios

### 1. Crear una clase CSS reutilizable para el degradado

En `src/index.css`, añadir una clase utilitaria `.btn-gradient-red` que aplique el degradado del hero con un hover más intenso (sin azules).

### 2. Aplicar el degradado en los siguientes archivos

| Archivo | Botón afectado |
|---------|---------------|
| `src/pages/Auth.tsx` | "Iniciar sesión" y "Crear cuenta" |
| `src/components/CookieBanner.tsx` | "Aceptar todas" |
| `src/components/CookiePreferences.tsx` | "Guardar preferencias" |
| `src/components/CategorySelector.tsx` | Botón de confirmar selección |
| `src/components/ProductSelector.tsx` | Botón de confirmar productos |

Cada botón pasará de `bg-secondary hover:bg-secondary/90` a usar el degradado inline style (como ya se hace en el botón "Nueva Receta" del Bento), manteniendo `text-white` y un hover que oscurece ligeramente el degradado.

### 3. Actualizar el variant "secondary" del Button component

En `src/components/ui/button.tsx`, cambiar el variant `secondary` para que no interfiera cuando se sobreescribe con clases inline.

## Resultado

Todos los botones de acción principal tendrán el mismo degradado rojo corporativo del hero, sin transiciones a azul ni colores inconsistentes.

