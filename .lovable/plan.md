## Objetivo

Que los vídeos Vimeo de los productos en la receta (`/r/:code` y `/recipe/:id`) empiecen a cargar y a reproducirse lo antes posible, reduciendo el tiempo hasta que el paciente pueda darle al play.

## Diagnóstico actual

En `src/pages/Recipe.tsx` (líneas 351‑380) cada vídeo se renderiza con un `<iframe>` directo a `player.vimeo.com`. Sin optimización, el iframe:

- Espera al render para empezar la conexión TCP/TLS con Vimeo (~300‑800 ms extra en 4G).
- Carga el reproductor JS completo aunque el usuario aún no haya hecho scroll.
- No usa hints del navegador para precalentar la conexión.

Solo hay 3 vídeos en el catálogo (memoria `product-video-catalog`), por lo que el coste de precargar es bajo.

## Cambios propuestos

### 1. Resource hints en `index.html`

Añadir en `<head>`, antes del `<script>` principal, hints para que el navegador resuelva DNS y abra TLS con Vimeo desde el primer byte:

```html
<link rel="preconnect" href="https://player.vimeo.com" crossorigin>
<link rel="preconnect" href="https://i.vimeocdn.com" crossorigin>
<link rel="preconnect" href="https://f.vimeocdn.com" crossorigin>
<link rel="dns-prefetch" href="https://player.vimeo.com">
```

Impacto: ahorra ~200‑500 ms en la primera petición del iframe sin coste perceptible.

### 2. Parámetros de iframe optimizados

En `src/pages/Recipe.tsx`, ajustar el `src` del iframe del vídeo de producto para:

- Añadir `dnt=1` (no rastreo, payload más ligero).
- Añadir `transparent=0` (un repaint menos).
- Forzar `preload` mediante `loading="eager"` en el primer vídeo visible y `loading="lazy"` en los siguientes (en la práctica solo hay 1 vídeo por receta normalmente, pero es seguro).
- Añadir `fetchpriority="high"` al primer iframe.

### 3. Precarga selectiva con `<link rel="preload">` dinámico

Cuando la receta cargue y detectemos que algún producto tiene `video_urls`, inyectar dinámicamente desde React (en el `useEffect` que carga la receta en `Recipe.tsx` y `ShortRecipe.tsx`) un `<link rel="preload" as="document" href="<vimeo_url>">` por cada vídeo único. Eso fuerza al navegador a empezar a descargar el HTML del player en paralelo con el resto del render.

```tsx
useEffect(() => {
  const urls = new Set(products.flatMap(p => p.video_urls ?? []));
  const links: HTMLLinkElement[] = [];
  urls.forEach(u => {
    const l = document.createElement('link');
    l.rel = 'preload';
    l.as = 'document';
    l.href = u;
    document.head.appendChild(l);
    links.push(l);
  });
  return () => links.forEach(l => l.remove());
}, [products]);
```

### 4. Render del iframe sin esperar layout

Actualmente el iframe está envuelto en un contenedor con padding-bottom 56.25%. Mantenemos esa estructura (necesaria para aspect ratio) pero quitamos cualquier render condicional adicional para que el iframe entre en el árbol lo antes posible (revisar que no esté detrás de un `Suspense`, `lazy`, o un toggle "ver más"). Tras revisar el código, ya se renderiza directamente; no hace falta cambio adicional aquí.

### 5. Aplicar lo mismo en `ProductDetailDialog.tsx`

Los vídeos también aparecen en el diálogo de detalle de producto (`src/components/ProductDetailDialog.tsx`, línea 96+). Aplicar los mismos parámetros de iframe optimizados para coherencia.

## Archivos a modificar

- `index.html` — añadir preconnect/dns-prefetch a Vimeo.
- `src/pages/Recipe.tsx` — parámetros de iframe + preload dinámico en `useEffect`.
- `src/pages/ShortRecipe.tsx` — preload dinámico en `useEffect`.
- `src/components/ProductDetailDialog.tsx` — parámetros de iframe coherentes.

## Lo que NO cambiamos

- Seguimos usando el iframe estándar de Vimeo (no añadimos el SDK `@vimeo/player`, que añadiría peso).
- No cambiamos el comportamiento de autoplay (sigue desactivado para que el paciente decida).
- No tocamos el modal de Recomendaciones de cirugía (ya carga solo bajo demanda).
