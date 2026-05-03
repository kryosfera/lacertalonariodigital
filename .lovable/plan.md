## Objetivo

Reemplazar el tutorial actual (basado en steps con icono y navegación entre tabs) por un nuevo onboarding de **8 pasos** con las imágenes y textos exactos que has subido. Al terminar, el usuario aterriza en Inicio. Se mostrará automáticamente la primera vez, y desde Inicio habrá un botón para relanzarlo cuando quiera.

## Pasos del tutorial (orden y contenido)

1. **Crea recetas digitales** — "Genera recetas digitales completas y personalizadas con facilidad desde tu dispositivo." (`step1.png`)
2. **Guías y recomendaciones** — "Accede a guías clínicas y vídeos formativos para tus pacientes." (`step2.png`)
3. **Historial Completo** — "Accede y organiza todo el historial de recetas y pacientes en un solo lugar." (`step3.png`)
4. **Pacientes** — "Organiza y accede fácilmente a tus pacientes y sus últimas recetas." (`step4.png`)
5. **Dashboard** — "Visualiza tus métricas clave y el estado de tus recetas en un solo lugar." (`step5.png`)
6. **Perfil** — "Personaliza tus recetas con el logo y la información de contacto de tu clínica." (`step6.png`)
7. **Envío instantáneo** — "Envía la receta digital al instante a tus pacientes a través de WhatsApp, email o SMS." (`step7.png`)
8. **Enhorabuena** — "Ya puedes empezar a usar el Talonario digital." CTA "Comenzar ahora" (`step8.png`)

## Implementación técnica

**Imágenes**
- Copiar `user-uploads://step1.png` … `step8.png` a `src/assets/onboarding/` e importarlas como módulos ES6.

**`src/components/OnboardingTour.tsx` (rediseño completo)**
- Eliminar la lógica basada en `iconMap`, `tab` navigation y `onNavigate`.
- Nueva estructura: modal centrado (mobile y desktop) con:
  - Imagen grande arriba (aspect ratio ~1:1, fondo rosado integrado en la propia imagen).
  - Título en negro bold (`text-2xl`), descripción en `text-muted-foreground`.
  - Dots de progreso (rojo Lacer activo, rojo claro inactivo, dot activo más ancho tipo "pill").
  - Botones: "Anterior" (ghost rojo con flecha) a la izquierda y "Siguiente" (rojo pill) a la derecha. En el paso 1 sin "Anterior". En el paso 8, un único botón ancho "Comenzar ahora".
  - "Paso X de 8" debajo.
  - Botón X arriba a la derecha para saltar.
- Animaciones framer-motion mantienen el patrón actual (fade + scale).

**`src/hooks/useOnboardingTour.ts` (simplificado)**
- Reemplazar `BASIC_STEPS` y `PRO_STEPS` por un único array `STEPS` de 8 elementos con `{ id, image, title, description }` (sin `tab` ni `icon`).
- Una sola key en localStorage: `onboarding_v2_done` (renombrada para forzar la primera vez con el nuevo tour, ignorando estados antiguos).
- Eliminar la dependencia de `userMode` en la firma (queda igual o se ignora).
- Mantener: `isActive, currentStep, step, totalSteps, startTour, nextStep, prevStep, skipTour`.

**`src/pages/Index.tsx`**
- Quitar `onNavigate={setActiveTab}` del `OnboardingTour` (ya no cambia de pestaña).
- `handleTourNext` y `handleTourSkip` siguen llevando a `home` al terminar (ya lo hacen).
- Pasar `tour.startTour` a `HomeScreenBento` como prop `onLaunchTour`.

**`src/components/home/HomeScreenBento.tsx`**
- Añadir prop opcional `onLaunchTour?: () => void`.
- Añadir un botón discreto "Ver tutorial" (icono `PlayCircle` o `Sparkles` + texto) en la zona inferior del Bento (por encima del `LegalFooter`), estilo pill outline con borde `border-primary/30` y texto `text-primary`.

## Criterios de aceptación

- Primera visita: el tour se lanza automáticamente con los 8 pasos exactos y aterriza en Inicio al finalizar o saltar.
- Las imágenes subidas se ven completas dentro de la card del modal.
- Desde Inicio, un botón "Ver tutorial" relanza el tour en cualquier momento.
- Los usuarios que ya completaron el tour anterior verán el nuevo una vez (key renombrada).

## Archivos a modificar

- `src/hooks/useOnboardingTour.ts`
- `src/components/OnboardingTour.tsx`
- `src/pages/Index.tsx`
- `src/components/home/HomeScreenBento.tsx`
- `src/assets/onboarding/step1.png` … `step8.png` (nuevos)
