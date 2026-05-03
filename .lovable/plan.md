# Añadir paso de "Incidencias" al tour de onboarding

Insertar un nuevo paso entre el paso de **Envío instantáneo** y el de **Enhorabuena** explicando cómo reportar incidencias desde el perfil.

## Cambios

### `src/hooks/useOnboardingTour.ts`
Añadir un nuevo objeto al array `STEPS` justo antes del paso `fin`:

```ts
{
  id: "incidencias",
  image: step6, // reutiliza imagen existente (perfil) hasta tener una propia
  title: "Reporta incidencias",
  description: "Si encuentras algún problema o tienes una sugerencia, envíanos una incidencia desde tu perfil. Te responderemos lo antes posible.",
},
```

El total de pasos pasará de 8 a 9. El componente `OnboardingTour` ya usa `totalSteps` dinámico, por lo que dots y contador "Paso X de Y" se actualizan solos.

## Notas
- Se reutiliza `step6.png` (imagen del perfil) por ser donde se accede a las incidencias. Si prefieres una imagen específica para este paso, súbela como `step9.png` y la importamos en su lugar.

¿Quieres que use `step6.png` reutilizada o prefieres subir una imagen nueva para el paso de incidencias?
