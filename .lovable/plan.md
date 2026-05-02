## Cambiar logo del FAB central

De los 3 logos adjuntos, el mejor para el botón central circular es **`logo-lacer.png`**: solo el pétalo Lacer, sin texto "Italfarmaco Group", con fondo transparente real (no cuadrícula blanca como el actual `lacer-logo.png`).

### Pasos

1. Copiar `user-uploads://logo-lacer.png` → `src/assets/lacer-logo-clean.png`.
2. En `src/components/BottomNavigation.tsx`:
   - Cambiar el import a `lacer-logo-clean.png`.
   - Mantener el círculo blanco actual con sombra roja sutil.
   - El pétalo rojo encajará limpiamente dentro del círculo, sin bordes blancos visibles ni cuadrícula de fondo.

### Por qué este logo
- `Lacer-1.png`: tiene mucho padding blanco alrededor → el pétalo se vería pequeño dentro del círculo.
- `logo-lacer-italfarmaco-group.png`: incluye texto "ITALFARMACO GROUP" debajo → ilegible en 48px.
- `logo-lacer.png` (elegido): pétalo recortado al borde con transparencia → ocupa el círculo de forma óptima.
