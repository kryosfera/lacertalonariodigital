
# Usar el nuevo logo "Talonario Digital / Bocas Sanas" en categorías, PDF y WhatsApp

## Qué cambia y dónde

El logo subido (`lacer-logo-bocas_sanas-2.jpg`) reemplaza o complementa los logos actuales en tres sitios:

### 1. Pantalla de categorías (escritorio) — `CategorySelector.tsx`
El header de escritorio actualmente carga el logo desde una URL externa de `lacer.es`. Se reemplaza por el nuevo logo importado como asset local.

### 2. Cabecera del PDF — `recipeUtils.ts`
El PDF actualmente dibuja solo el texto "LACER" en blanco sobre fondo rojo. Se añade el logo como imagen incrustada en el PDF. Para ello hay que:
- Guardar el logo también en `public/` con un nombre accesible vía URL absoluta
- En `generateRecipePDF`, hacer un `fetch` del logo, convertirlo a base64, y añadirlo con `doc.addImage()`
- El fondo rojo se mantiene; el logo va encima alineado a la izquierda, el texto "TALONARIO DIGITAL" a la derecha, el QR en la esquina

### 3. Imagen de previsualización en WhatsApp (og:image) — `index.html`
WhatsApp usa el `og:image` del HTML para mostrar una miniatura cuando se comparte un enlace. El logo se guarda en `public/` y se referencia en la meta tag.

## Archivos afectados

| Archivo | Cambio |
|---|---|
| `src/assets/lacer-logo-bocas_sanas.jpg` | Nuevo asset (copiado desde user-uploads) |
| `public/lacer-logo-bocas_sanas.jpg` | Copia en public para og:image y PDF fetch |
| `src/components/CategorySelector.tsx` | Reemplazar URL externa del logo en header desktop por import local |
| `src/lib/recipeUtils.ts` | Añadir logo como imagen en la cabecera del PDF |
| `index.html` | Actualizar `og:image` y `twitter:image` al nuevo logo |

## Detalles técnicos

### CategorySelector.tsx (línea ~247)
```tsx
// Antes:
<img src="https://www.lacer.es/themes/custom/flavor/logo.svg" alt="Lacer" className="h-8 brightness-0 invert" />

// Después:
import lacerLogoBocasSanas from "@/assets/lacer-logo-bocas_sanas.jpg";
// ...
<img src={lacerLogoBocasSanas} alt="Lacer Talonario Digital" className="h-10 object-contain" />
```

### recipeUtils.ts — cabecera del PDF
```typescript
// Fetch del logo y conversión a base64
const logoResponse = await fetch(window.location.origin + '/lacer-logo-bocas_sanas.jpg');
const logoBlob = await logoResponse.blob();
const logoDataUrl = await new Promise<string>((resolve) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result as string);
  reader.readAsDataURL(logoBlob);
});
// Cabecera blanca en lugar de fondo rojo entero
doc.setFillColor(255, 255, 255);
doc.rect(0, 0, pageWidth, 40, "F");
// Logo: alto del header = 40mm, logo ocupa ~30mm de alto centrado
doc.addImage(logoDataUrl, 'JPEG', 10, 5, 80, 30);
```

### index.html
```html
<meta property="og:image" content="/lacer-logo-bocas_sanas.jpg" />
<meta name="twitter:image" content="/lacer-logo-bocas_sanas.jpg" />
```

## Resultado esperado

- **Categorías escritorio**: el header muestra el logo oficial "Talonario Digital · Bocas Sanas" en lugar del logo anterior de lacer.es
- **PDF**: la cabecera lleva el logo visual en lugar del texto "LACER" simple; más profesional y reconocible
- **WhatsApp/redes**: al compartir el enlace de la receta, la miniatura de previsualización muestra el logo oficial
