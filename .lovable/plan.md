

## 4 Variantes de Home + Pantalla de Seleccion de Estilo

### Resumen
Crear 4 versiones distintas de la pantalla de inicio con estilos modernos diferenciados. Tras la pantalla de carga (splash), se mostrara una pantalla intermedia donde el cliente puede elegir su estilo preferido. Tambien se cambiara "Post-Cirugia" por "Recomendaciones" en todas las variantes.

---

### Las 4 variantes

1. **Bento (actual)** - Hero rojo Lacer con logo grande, botones tipo card con chevron, animacion de revelado desde arriba. El estilo actual ya implementado.

2. **Minimal** - Ultra-minimalista tipo Apple: fondo limpio, logo centrado sin fondo rojo, tipografia grande tracking-tight, botones pill (rounded-full) con bordes finos, mucho espacio negativo.

3. **Glass** - Estilo glassmorphism/iOS: fondo con gradiente rojo sutil, tarjetas translucidas con backdrop-blur, bordes difuminados, efecto frosted glass en los botones de accion.

4. **Bold** - Estilo "brutalista moderno": logo enorme ocupando gran parte de la pantalla, tipografia extra bold, botones grandes tipo bloque con sombras duras, colores solidos sin gradientes.

---

### Flujo de la app

```text
Splash Screen --> Style Picker --> Home (variante elegida)
                     |
                     v
              (se guarda en localStorage)
```

La eleccion se persiste en `localStorage` para que no vuelva a aparecer. Un boton discreto en el footer de la home permitira cambiar el estilo en cualquier momento.

---

### Cambios tecnicos

**1. Nuevo componente `src/components/home/HomeScreenMinimal.tsx`**
- Layout centrado vertical, logo sin contenedor rojo
- Botones rounded-full con outline fino
- Tipografia SF-style grande

**2. Nuevo componente `src/components/home/HomeScreenGlass.tsx`**
- Fondo con gradiente rojo suave
- Cards con `bg-white/10 backdrop-blur-xl border border-white/20`
- Logo en contenedor glassmorphism

**3. Nuevo componente `src/components/home/HomeScreenBold.tsx`**
- Logo Lacer muy grande (w-32 h-32)
- Tipografia extra bold, sin subtitulos
- Botones tipo bloque con sombras `shadow-[4px_4px_0]`

**4. Nuevo componente `src/components/home/StylePicker.tsx`**
- Pantalla a pantalla completa con 4 previsualizaciones en grid 2x2
- Cada opcion muestra una miniatura del estilo con titulo
- Al elegir, guarda en `localStorage('home-style')` y navega a la home
- Animaciones de entrada con framer-motion

**5. Modificar `src/components/home/HomeScreenBento.tsx`**
- Cambiar "Post-Cirugia" por "Recomendaciones" en el boton secundario

**6. Modificar `src/components/home/HomeScreenCentered.tsx`**
- Cambiar "Post-Cirugia" por "Recomendaciones"

**7. Modificar `src/components/HomeScreen.tsx`**
- Cambiar "Post-Cirugia" por "Recomendaciones"

**8. Actualizar `src/components/home/index.ts`**
- Exportar los 4 componentes nuevos + StylePicker

**9. Modificar `src/App.tsx`**
- Anadir estado `showStylePicker` que se activa tras el splash si no hay estilo guardado en localStorage
- Flujo: splash -> style picker (si primera vez) -> app normal

**10. Modificar `src/pages/Index.tsx`**
- Leer `localStorage('home-style')` para determinar que variante renderizar
- Eliminar el toggle de variantes del header desktop (ya no necesario)
- Anadir boton discreto "Cambiar estilo" en el footer de la home
- Mapear las 4 variantes: bento, minimal, glass, bold

