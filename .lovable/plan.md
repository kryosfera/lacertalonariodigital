## Rediseño del diálogo "Enviar por WhatsApp"

Adaptar el `Dialog` actual en `src/components/RecipeCreator.tsx` (líneas ~928-1041) al diseño de la imagen de referencia: card blanca con esquinas más redondeadas, mayor jerarquía tipográfica, control de cantidad lateral compacto y CTA rojo prominente con sombra suave.

### Cambios visuales

1. **Contenedor del diálogo**
   - `DialogContent`: aumentar radio (`rounded-3xl`), padding más generoso (`p-6`), sombra más marcada y eliminar la línea divisoria por defecto.
   - Mantener `max-w-md` y scroll interno.

2. **Encabezado**
   - Título en `text-2xl font-bold` (más grande que el actual `text-lg`).
   - Descripción en `text-base text-muted-foreground` con más aire debajo.
   - El botón cerrar (X) se mantiene en su posición top-right (ya viene del DialogContent).

3. **Resumen de la receta**
   - Etiqueta "RESUMEN DE LA RECETA" en `text-xs uppercase tracking-wider text-muted-foreground`.
   - Cada producto dentro de una **card blanca con borde sutil** (`border border-border/60 rounded-2xl p-3`) en lugar del fondo `bg-muted/50` actual.
   - Thumbnail más grande (`w-14 h-14`), nombre en 2 líneas si hace falta (`font-semibold text-base`), C.N. debajo en `text-sm text-muted-foreground`.
   - **Selector de cantidad como `<Select>`** compacto a la derecha (en lugar de los botones +/−), mostrando "1 ▾", "2 ▾", etc. (1-10). Esto coincide con la imagen.

4. **Campo teléfono**
   - Label "Teléfono (opcional)" en `text-base font-semibold text-foreground`.
   - Input más alto (`h-12 rounded-xl`) con placeholder `+34 600 000 000`.
   - Texto de ayuda debajo: "Si no introduces un número, se abrirá WhatsApp para que lo selecciones" en `text-sm text-muted-foreground`.

5. **CTA principal**
   - Botón rojo full-width (`h-14 rounded-2xl bg-primary`) con icono `Send` y texto `Enviar receta (N productos)` en `text-base font-semibold`.
   - Añadir sombra suave roja: `shadow-[0_8px_24px_-8px_hsl(var(--primary)/0.5)]` para el efecto "glow" de la imagen.

6. **Espaciado general**
   - `space-y-5` entre secciones (vs `space-y-4` actual) para que respire más.

### Notas técnicas

- Solo se modifica el bloque del `Dialog` de envío en `RecipeCreator.tsx`. La lógica (`handleSendWhatsApp`, `updateQuantity`, estados) se mantiene intacta.
- Cambiar los botones +/− por `<Select>` requiere usar el componente `Select` de `@/components/ui/select` (ya está en el proyecto). El valor se sigue enlazando a `updateQuantity(product.id, Number(value))`.
- Mantener compatibilidad con el modo Email: solo se rediseña el contenedor y el resumen; el bloque de Email reutiliza los mismos estilos del input/label.
- Respetar dark mode: usar tokens semánticos (`bg-card`, `border-border`, `text-foreground`) en lugar de blancos hardcodeados.

### Archivos a modificar

- `src/components/RecipeCreator.tsx` — bloque líneas ~928-1041.
