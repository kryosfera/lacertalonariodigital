

## Limpiar la cabecera de la variante Photo

La imagen del bodegon ya incluye el logo Lacer, por lo que el logo y titulo superpuestos son redundantes. Se eliminaran para dejar la imagen como unico elemento hero.

### Cambios en `src/components/home/HomeScreenPhoto.tsx`

1. **Eliminar el import de `lacerLogo`** (linea 4) -- ya no se usa.

2. **Eliminar el bloque Logo + Titulo** (lineas 70-84): el `div` con el logo, "Talonario Digital" y el subtitulo "Recetas digitales para profesionales".

3. **Eliminar la linea decorativa roja** (linea 87): el separador `h-0.5 bg-secondary/20` que estaba entre el titulo y la imagen.

4. **Ajustar el padding superior** del contenedor hero: cambiar `pt-12 md:pt-14` a `pt-0` para que la imagen empiece desde arriba, ya que no hay cabecera de texto.

5. **Eliminar el padding horizontal de la imagen** (`px-2 md:px-6`) para que ocupe todo el ancho, dando un aspecto mas limpio e inmersivo.

El resultado sera que la seccion hero muestra unicamente la imagen del bodegon a ancho completo, seguida directamente por los botones de accion.

