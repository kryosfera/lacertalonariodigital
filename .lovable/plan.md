# Plan: usar logo "petalo" Lacer sin fondo blanco en el FAB

## Cambio
El logo actual (`lacer-logo.png`) es solo el wordmark rojo, por eso necesitaba un círculo blanco detrás para verse. El usuario aporta el logo completo con el "petalo" rojo de fondo, que ya es autosuficiente.

## Archivos
- **Nuevo asset**: copiar `user-uploads://lacer-logo-color.png` → `src/assets/lacer-logo-petal.png` (ya copiado).
- **`src/components/BottomNavigation.tsx`**:
  - Cambiar import a `lacer-logo-petal.png`.
  - Quitar el círculo blanco (`bg-white`, `border-2`, `border-secondary`) del contenedor del FAB central.
  - Sustituirlo por una sombra roja difusa (`drop-shadow` con `hsl(var(--secondary)/0.35)`) para que el petalo flote sobre la barra y se siga distinguiendo en claro/oscuro.
  - Aumentar el tamaño del logo a `w-14 h-14` (ocupa todo el espacio del FAB) ya que su forma triangular orgánica funciona como botón en sí mismo.
  - Conservar el `scale-110` cuando está activo y `active:scale-95` al pulsar.

## Resultado
Botón central con la forma reconocible del petalo Lacer flotando sobre la barra, sin marco blanco artificial, manteniendo legibilidad y peso visual en ambos modos.
