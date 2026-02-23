

## Fix: Auto-cerrar ventana WhatsApp y mostrar "RECETA ENVIADA" automaticamente

### Problema

Cuando se envia por WhatsApp, se pre-abre una ventana `about:blank` (necesaria para evitar el popup blocker de iOS). Despues de redirigirla a WhatsApp, el mecanismo actual usa `visibilitychange` para cerrarla cuando el usuario vuelve a la app. Pero este evento no siempre se dispara (especialmente en escritorio o cuando el navegador no pierde el foco), asi que la ventana queda abierta y bloquea la vista del bottom sheet de exito.

### Solucion

Reemplazar el enfoque de `visibilitychange` por un cierre directo con temporizador justo despues de enviar, combinado con `visibilitychange` como respaldo:

1. **Cerrar la ventana con timeout inmediato** (1-2 segundos despues del envio), sin depender de ningun evento del navegador
2. **Mantener `visibilitychange` como respaldo** por si el timeout no funciona en algun caso edge
3. **Mostrar el success drawer inmediatamente**, ya que `showSuccess()` se llama justo despues del envio

### Cambios tecnicos

**Archivo: `src/components/RecipeCreator.tsx`**

En `handleSendWhatsApp`, despues de llamar a `sendViaWhatsApp()`, anadir cierre directo con timeout:

```text
sendViaWhatsApp(recipeData, phone, recipeUrl, preOpenedWindow);

// Cerrar la ventana pre-abierta tras un breve retraso
// (suficiente para que el navegador procese la redireccion a wa.me)
if (preOpenedWindow) {
  setTimeout(() => {
    try { preOpenedWindow.close(); } catch {}
    setPreOpenedWindowRef(null);
  }, 1500);
}

showSuccess("WhatsApp");
```

Mantener el `useEffect` de `visibilitychange` (lineas 83-96) como mecanismo de respaldo, pero el cierre principal sera el timeout directo.

Esto garantiza que la ventana se cierre en todos los casos y el bottom sheet de exito sea visible inmediatamente.

