
# Corregir solapamiento con la barra de estado en modo webapp (PWA) en iPhone

## Problema
En modo webapp/PWA en iPhone 16 Pro, el contenido de la app se extiende por debajo de la barra de estado (hora, batería, etc.) porque:
1. El `index.html` tiene `viewport-fit=cover`, lo que permite que la app ocupe toda la pantalla incluyendo la zona del notch/Dynamic Island
2. No hay ningún `padding-top` con `safe-area-inset-top` para respetar esa zona segura
3. En el navegador normal no pasa porque el propio navegador gestiona esa zona

## Solución

Añadir soporte para las safe areas de iOS en los puntos clave del layout.

### Cambio 1 — `src/index.css`
Añadir una utilidad CSS para el padding superior seguro:
```css
.pt-safe {
  padding-top: env(safe-area-inset-top, 0);
}
```

### Cambio 2 — `src/pages/Index.tsx` (contenedor principal)
Añadir `pt-safe` al `div` principal (`min-h-screen bg-background`) para que en modo standalone el contenido empiece debajo de la barra de estado.

### Cambio 3 — Pantallas fullscreen (CategorySelector, etc.)
Los elementos con `fixed inset-0` también necesitan `pt-safe` para que su contenido no se solape con la barra de estado en modo PWA.

Archivos afectados:
- `src/index.css` — nueva utilidad `.pt-safe-top`
- `src/pages/Index.tsx` — añadir clase al contenedor raíz
- `src/components/CategorySelector.tsx` — añadir padding seguro a las vistas fullscreen (móvil y escritorio)

## Resultado
En modo webapp/PWA, el contenido comenzara justo debajo de la barra de estado del iPhone, sin solaparse con la hora ni la Dynamic Island. En el navegador normal no cambia nada (el `env()` devuelve 0).
