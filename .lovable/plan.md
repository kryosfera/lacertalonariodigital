## Objetivo

Reemplazar las 8 imágenes actuales del onboarding por las nuevas que has subido, **recortando los textos/títulos** que vienen incluidos en cada imagen para que solo quede la ilustración limpia dentro de la card del tutorial.

## Mapeo imagen → paso

| Paso | Título actual | Imagen nueva | Recorte necesario |
|------|---------------|--------------|-------------------|
| 1 | Crea recetas digitales | `paso8.png` (tablet con receta) | Recortar texto inferior "Asset 1: Digital Prescription…" |
| 2 | Guías y recomendaciones | `paso7.png` (PDF + vídeo) | Recortar texto inferior "Asset 2…" |
| 3 | Historial Completo | `paso6.png` (carpetas) | Recortar título superior "Lacer Digital App Illustrations" y caption "History List" |
| 4 | Pacientes | `paso5.png` (ficha paciente) | Sin recorte (limpia) |
| 5 | Dashboard | `paso2.png` (gráficas) | Sin recorte (limpia) |
| 6 | Perfil | `paso1.png` (grid de iconos rojos) | Sin recorte (limpia) |
| 7 | Envío instantáneo | `paso4.png` (WhatsApp/Email/PDF) | Recortar título superior "Asset 7: Multi-channel Delivery Illustration" |
| 8 | Enhorabuena | `psao3.png` (dentista pulgar arriba) | Sin recorte (limpia) |

## Implementación técnica

1. **Copiar uploads a `/tmp/`** los 8 PNGs.
2. **Recortar con ImageMagick** (`nix run nixpkgs#imagemagick`) los que tienen texto, dejando solo la zona de la ilustración. Para cada imagen con texto:
   - Inspeccionar dimensiones y detectar la franja blanca con texto.
   - Aplicar `magick input.png -crop WxH+X+Y +repage output.png`.
   - Para los que la ilustración no es centrada-cuadrada, añadir padding blanco con `-gravity center -background white -extent SxS` para conseguir un cuadrado limpio (la card del tour usa `aspect-square`).
3. **QA visual**: abrir cada PNG resultante para verificar que no queda texto residual y que la ilustración está bien encuadrada.
4. **Sobrescribir** los archivos en `src/assets/onboarding/step1.png` … `step8.png` con los recortes finales (mantiene los imports existentes en `useOnboardingTour.ts`, no hay que tocar código).

## Archivos a modificar

- `src/assets/onboarding/step1.png` … `step8.png` (sobrescritos con las nuevas ilustraciones recortadas)
- No se modifica código (`useOnboardingTour.ts` y `OnboardingTour.tsx` ya importan estas rutas).

## Criterios de aceptación

- Las 8 imágenes del tour muestran solo la ilustración (sin "Asset N:", sin "Lacer Digital App Illustrations", sin captions).
- Cada imagen encaja bien en la card cuadrada del modal sin quedar excesivamente pequeña ni cortada.
- El orden y los textos de los pasos se mantienen exactamente igual.
