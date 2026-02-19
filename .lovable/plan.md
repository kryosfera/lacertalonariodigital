
# Corrección: WhatsApp no abre en iPhone (iOS popup blocker)

## Causa raíz

En iOS (Safari y PWA), el navegador bloquea `window.open()` cuando se llama después de cualquier operación `await`. Safari considera que el contexto de "gesto de usuario" se pierde en cuanto hay una promesa de por medio.

El flujo actual en `handleSendWhatsApp`:
```
1. Usuario pulsa "Enviar" -> gesto de usuario OK
2. await saveRecipeToDb() o await createShortUrl() <- aquí se pierde el contexto
3. sendViaWhatsApp() -> window.open() <- iOS lo bloquea silenciosamente
```

## Solución: abrir la ventana antes del await

La técnica correcta en iOS es:
1. Abrir la ventana INMEDIATAMENTE al click del usuario (sin await)
2. Luego hacer las operaciones async
3. Actualizar la URL de la ventana ya abierta con `window.location.href`

Si no hay teléfono introducido, usar `window.location.href` directamente en lugar de `window.open`.

## Cambios técnicos

### Archivo: `src/lib/recipeUtils.ts`

Modificar `sendViaWhatsApp` para aceptar una ventana ya abierta o para hacer redirect directo:

```typescript
export const sendViaWhatsApp = (
  data: RecipeData, 
  phoneNumber?: string, 
  recipeUrl?: string,
  targetWindow?: Window | null  // ventana pre-abierta en iOS
): void => {
  const message = generateWhatsAppMessage(data, recipeUrl);
  const encodedMessage = encodeURIComponent(message);
  
  let url = `https://wa.me/`;
  if (phoneNumber) {
    const cleanPhone = phoneNumber.replace(/\D/g, "");
    url += cleanPhone;
  }
  url += `?text=${encodedMessage}`;
  
  if (targetWindow) {
    // Redirigir la ventana pre-abierta (funciona en iOS)
    targetWindow.location.href = url;
  } else {
    window.open(url, "_blank");
  }
};
```

### Archivo: `src/components/RecipeCreator.tsx`

Modificar `handleSendWhatsApp` para abrir la ventana inmediatamente:

```typescript
const handleSendWhatsApp = async () => {
  if (selectedProducts.size === 0) {
    toast.error("Selecciona al menos un producto");
    return;
  }
  
  setIsSending(true);
  const recipeData = getRecipeData();
  const phone = patientPhone;
  
  // CRITICO: Abrir ventana ANTES de cualquier await (requisito iOS Safari)
  // Si hay teléfono, pre-abrimos en about:blank y luego redirigimos
  // Si no hay teléfono, usaremos window.location.href directamente
  const preOpenedWindow = phone 
    ? window.open("about:blank", "_blank") 
    : null;
  
  let recipeUrl: string | undefined;
  
  try {
    if (isProfessional) {
      const recipeCode = await saveRecipeToDb('whatsapp');
      if (recipeCode) recipeUrl = generateRecipeUrl(recipeCode);
      toast.success("Receta guardada en historial");
      resetForm();
    } else {
      const shortCode = await createShortUrl(recipeData);
      if (shortCode) recipeUrl = generateShortRecipeUrl(shortCode);
    }
    
    sendViaWhatsApp(recipeData, phone, recipeUrl, preOpenedWindow);
    toast.success("Abriendo WhatsApp...");
  } catch (error) {
    // Si falla, cerrar la ventana pre-abierta
    if (preOpenedWindow) preOpenedWindow.close();
    toast.error("Error al generar el enlace");
  } finally {
    setIsSending(false);
    setShowSendDialog(false);
  }
};
```

## Por qué funciona esto

- `window.open("about:blank", "_blank")` se llama sincrónicamente desde el click del usuario → iOS lo permite
- Las operaciones `await` ocurren después, pero la ventana ya está abierta
- Cuando terminamos, redirigimos esa ventana ya abierta a la URL de WhatsApp
- Esto no activa el bloqueador de popups de iOS/Safari

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/lib/recipeUtils.ts` | Añadir parámetro `targetWindow` a `sendViaWhatsApp` |
| `src/components/RecipeCreator.tsx` | Pre-abrir ventana antes del `await` en `handleSendWhatsApp` |
