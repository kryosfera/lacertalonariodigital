

## Corregir pantalla en blanco tras enviar receta por Email/WhatsApp/PDF

### Problema raiz

La funcion `sendViaEmail` en `src/lib/recipeUtils.ts` utiliza `window.location.href` para abrir el enlace `mailto:`, lo que **navega la pagina actual fuera de la SPA**. En modo PWA esto es especialmente problematico porque al volver, la app pierde su estado y muestra una pantalla en blanco.

Ademas, los handlers de envio no tienen proteccion robusta contra errores asincronos no capturados que puedan dejar la app en un estado inconsistente.

### Cambios necesarios

**1. `src/lib/recipeUtils.ts` - Corregir `sendViaEmail`**

- Reemplazar `window.location.href = mailto:...` por un enlace temporal `<a>` con el atributo `target="_blank"` (igual que hace `downloadPDF`), evitando que la pagina actual navegue fuera de la SPA
- Esto mantiene la app intacta mientras el sistema operativo abre el cliente de correo

**2. `src/components/RecipeCreator.tsx` - Proteger handlers de envio**

- Envolver los handlers `handleSendWhatsApp`, `handleSendEmail`, `handleDownloadPDF` y `handlePrint` con `try/catch` mas robustos
- Asegurar que `setIsSending(false)` y `setShowSendDialog(false)` siempre se ejecuten en el bloque `finally`, incluso si hay errores inesperados
- Anadir `resetForm()` tambien para usuarios basicos tras enviar exitosamente, para que puedan crear nuevas recetas inmediatamente

### Detalle tecnico

Cambio principal en `sendViaEmail`:

```text
// ANTES (navega fuera de la SPA):
window.location.href = url;

// DESPUES (abre en nueva ventana/pestaña sin afectar la SPA):
const link = document.createElement("a");
link.href = url;
link.target = "_blank";
link.rel = "noopener noreferrer";
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
```

Este patron es el mismo que ya se usa en `downloadPDF` y funciona correctamente en PWA, Safari iOS y navegadores de escritorio.

