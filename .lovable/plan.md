
# Fix: Degradado Glass oculto por capas opacas

## Problema raiz

El degradado rojo del estilo Glass usa `position: fixed` con `z-index: -10`, lo que lo coloca **detras** de estas capas opacas:

```text
Capa visual (de arriba a abajo):
  [header]         z-50, bg-card/80 (semi-transparente, OK)
  [main content]   bg-background (OPACO - tapa el degradado)
  [root div]       bg-background (OPACO - tapa el degradado)
  [body]           bg-background (OPACO - tapa el degradado)
  [gradient]       z: -10 (NUNCA se ve)
```

El degradado queda enterrado bajo 3 capas opacas. Se ve brevemente en el primer frame antes de que React monte el DOM completo.

## Solucion

Hacer que el root `div` y `main` sean **transparentes** cuando el estilo Glass esta activo, para que el fondo fijo se vea a traves de ellos.

### Archivo: `src/pages/Index.tsx`

1. Pasar la informacion de que estamos en modo "glass" al layout:
   - Cuando `homeStyle === 'glass'` y `activeTab === 'home'`, el div raiz usara `bg-transparent` en lugar de `bg-background`
   - El `header` ya es semi-transparente (`bg-card/80`), asi que no necesita cambios

2. Cambio concreto en la linea 177:
   - De: `className="min-h-screen bg-background pt-safe"`
   - A: `className={cn("min-h-screen pt-safe", isGlassHome ? "bg-transparent" : "bg-background")}`
   - Donde `isGlassHome = homeStyle === 'glass' && activeTab === 'home'`

### Archivo: `src/components/home/HomeScreenGlass.tsx`

3. Mantener el fondo `fixed inset-0` pero subir su z-index a `z-0` en lugar de `-z-10`, y asegurar que el contenido tenga `z-10` relativo para quedar por encima de los orbes animados.

## Resultado esperado

El degradado rojo animado sera visible en todo momento ocupando toda la pantalla, con las tarjetas glass flotando por encima. Al navegar a otra seccion (recetas, pacientes, etc.), el fondo volvera a ser opaco normal.
