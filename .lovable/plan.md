## Problema

En iOS, al abrir la PWA instalada en pantalla de inicio, el contenido aparece pegado a la barra de estado (hora, notch, wifi, batería) porque:

1. `index.html` declara `apple-mobile-web-app-status-bar-style="black-translucent"`, lo que hace la barra de estado **transparente** y permite que la web pinte por debajo de ella.
2. Solo el wrapper de `Index.tsx` aplica `pt-safe` (`env(safe-area-inset-top)`) — sin separación visual extra, el primer bloque (Home Bento, títulos) queda visualmente pegado al notch.
3. Otras pantallas full-screen (`Recipe.tsx`, `ShortRecipe.tsx`, páginas legales, `CookieBanner` flotante, headers `sticky top-0` de Admin/Privacy/Cookie/Legal) no tienen `pt-safe`, por lo que también se mezclan con la status bar.

## Solución

### 1. Cambiar el estilo de la status bar de iOS

En `index.html`, sustituir:
```html
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```
por:
```html
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
```

Con `default`, iOS reserva el espacio de la status bar y la pinta con el color del `theme-color` (#DC2626 ya configurado), de modo que la app **no** se renderiza debajo del notch. Esto resuelve el 90% del problema sin tocar JS.

Mantener `viewport-fit=cover` (necesario para que `env(safe-area-inset-*)` siga funcionando en orientaciones landscape).

### 2. Reforzar `pt-safe` con un mínimo razonable

En `src/index.css`, ampliar la utilidad `pt-safe` para garantizar un colchón mínimo aunque el inset reportado sea 0 (algunos navegadores en escritorio o Android lo devuelven como 0):

```css
.pt-safe {
  padding-top: max(env(safe-area-inset-top, 0px), 12px);
}
```

Y añadir variantes útiles:
```css
.mt-safe { margin-top: env(safe-area-inset-top, 0px); }
.min-h-screen-safe { min-height: calc(100vh - env(safe-area-inset-top, 0px)); }
```

### 3. Aplicar `pt-safe` a las pantallas que faltan

Añadir `pt-safe` (o aplicarlo al wrapper raíz) a:

- `src/pages/Recipe.tsx` — los tres returns (`min-h-screen ... p-4`)
- `src/pages/ShortRecipe.tsx` — los dos returns
- `src/pages/Admin.tsx` — el header sticky o el wrapper
- `src/pages/PrivacyPolicy.tsx`, `CookiePolicy.tsx`, `LegalNotice.tsx` — al header sticky
- `src/pages/NotFound.tsx` — wrapper

### 4. Headers sticky en móvil

Para los headers `sticky top-0` (Admin, páginas legales), añadir `pt-safe` al propio header **además** del wrapper, para que su fondo se extienda visualmente bajo la status bar y no quede una franja blanca incongruente cuando el usuario hace scroll.

### 5. Banner de cookies

Revisar `CookieBanner.tsx`: si está fijo en la parte superior añadir `pt-safe`; si va abajo (lo más probable), asegurar `pb-safe` con `env(safe-area-inset-bottom)` (ya existe la utilidad).

## Archivos a modificar

- `index.html` — cambiar `status-bar-style` a `default`
- `src/index.css` — reforzar `.pt-safe`, añadir `.mt-safe`
- `src/pages/Index.tsx` — verificar que el header desktop también respeta safe area en tablets
- `src/pages/Recipe.tsx`, `ShortRecipe.tsx`, `Admin.tsx`, `PrivacyPolicy.tsx`, `CookiePolicy.tsx`, `LegalNotice.tsx`, `NotFound.tsx` — añadir `pt-safe`
- `src/components/CookieBanner.tsx` — verificar posición y aplicar safe area correspondiente

## Resultado esperado

Al abrir la PWA instalada en iPhone:
- La barra de estado (hora, señal, batería) queda sobre un fondo rojo Lacer (`theme-color #DC2626`) en pantallas con header rojo, o respeta el espacio en blanco con margen suficiente en el resto.
- El contenido de Home, Recetas, Pacientes, Recipe pública, etc. nunca se solapa con el notch o Dynamic Island.
- En orientación horizontal (landscape) los insets laterales también se respetan donde aplica.
