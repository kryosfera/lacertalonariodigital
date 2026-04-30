## Problema

En la pantalla de selección de productos (móvil), los botones **Otra categoría** y **Continuar** aparecen flotando con un hueco grande debajo, en lugar de pegados al borde inferior de la pantalla.

**Causa**: el selector se renderiza como overlay a pantalla completa (`fixed inset-0 z-50`) por encima de todo, incluida la `BottomNavigation`. Pero la barra de botones está fijada en `bottom-[72px]` reservando espacio para una navbar que **no está visible** detrás del overlay. Resultado: 72px de hueco vacío bajo los botones.

## Solución

En `src/components/ProductSelector.tsx` (bloque mobile, líneas ~190-225):

1. **Fijar la barra al borde inferior real**: cambiar `bottom-[72px]` por `bottom-0`.
2. **Respetar safe area iOS**: añadir `pb-[max(12px,env(safe-area-inset-bottom))]` para que en iPhones con notch/home indicator los botones no queden pegados al borde físico.
3. **Ajustar el padding inferior del listado de productos**: cambiar `pb-[170px]` por algo menor (`pb-[110px]`) ya que ahora la barra ocupa menos espacio vertical (sin los 72px extra).

```tsx
{/* Listado */}
<div className="flex-1 overflow-auto bg-muted/40 px-4 pt-3 pb-[110px]">

{/* Barra de acción pegada al fondo */}
<div className="fixed left-0 right-0 bottom-0 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur-md border-t border-border/30">
  <div className="flex gap-3">
    <Button variant="outline" ...>Otra categoría</Button>
    <Button ...>Continuar (N)</Button>
  </div>
</div>
```

## Lo que NO se toca

- Lógica del componente ni props.
- Versión desktop.
- `BottomNavigation` (sigue oculta detrás del overlay, que es el comportamiento correcto: el selector es modal a pantalla completa).
- Header, búsqueda y grid de productos.

## Resultado

Los botones **Otra categoría** y **Continuar (N)** quedan fijados al borde inferior de la pantalla, respetando la safe area de iOS, sin hueco vacío debajo.
