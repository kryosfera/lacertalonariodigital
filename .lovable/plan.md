

# Guía de uso interactiva para dentistas + Presentación descargable

## Resumen

Crear un sistema dual de onboarding: (1) un tour interactivo integrado en la app que guía al dentista paso a paso la primera vez que accede, segmentado por modo (rápido vs profesional), y (2) una presentación PPTX descargable para formaciones presenciales o envío por email.

---

## Parte 1: Tour interactivo in-app

### Concepto

Un sistema de "spotlight tour" que resalta cada sección de la app con un overlay oscuro, un tooltip explicativo animado y un botón "Siguiente". Se activa automáticamente la primera vez que el usuario entra (controlado por `localStorage`) y se puede relanzar desde el perfil.

### Flujo para Modo Rápido (3 pasos)

| Paso | Elemento destacado | Mensaje |
|------|-------------------|---------|
| 1 | Botón "Nueva Receta" | "Crea tu primera receta seleccionando productos por categoría" |
| 2 | Sección "Recomendaciones" | "Accede a guías y vídeos post-cirugía para tus pacientes" |
| 3 | Botón "Enviar" (dentro del creador) | "Envía la receta por WhatsApp, email o descarga en PDF" |

### Flujo para Modo Profesional (8 pasos)

| Paso | Elemento destacado | Mensaje |
|------|-------------------|---------|
| 1 | Hero personalizado | "Tu clínica aparece aquí con tu logo y nombre" |
| 2 | Dashboard | "Visualiza estadísticas de recetas y pacientes" |
| 3 | Nueva Receta | "Crea recetas con autocompletado de pacientes" |
| 4 | Recomendaciones | "Guías post-cirugía con vídeos y PDFs" |
| 5 | Historial | "Consulta recetas enviadas y su estado de dispensación" |
| 6 | Pacientes | "Gestiona tu base de datos y ve recetas por paciente" |
| 7 | QR / Dispensación | "La farmacia escanea el QR para confirmar la retirada" |
| 8 | Perfil | "Configura tu clínica, firma digital y logo" |

### Implementación técnica

**Nuevo componente `OnboardingTour.tsx`:**
- Overlay semi-transparente con "spotlight" (recorte CSS) sobre el elemento activo
- Tooltip con título, descripción e ilustración/icono
- Botones "Siguiente", "Anterior", "Saltar"
- Indicador de progreso (dots o barra)
- Animaciones con Framer Motion (fade, slide)

**Hook `useOnboardingTour.ts`:**
- Controla el estado del tour (paso actual, visible/oculto)
- Persiste en `localStorage` si ya se completó (`onboarding_basic_done`, `onboarding_pro_done`)
- Expone `startTour()` para relanzar desde perfil

**Integración:**
- Se monta en `Index.tsx` después del primer render
- Navega automáticamente entre tabs para mostrar cada sección
- El tour del modo profesional solo se activa tras el primer login

### Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/components/OnboardingTour.tsx` | Crear - componente principal del tour |
| `src/hooks/useOnboardingTour.ts` | Crear - lógica y persistencia |
| `src/pages/Index.tsx` | Modificar - montar el tour |
| `src/components/ProfilePage.tsx` | Modificar - botón "Repetir tutorial" |

---

## Parte 2: Presentación descargable (PPTX)

### Estructura de la presentación (12 slides)

| Slide | Contenido |
|-------|-----------|
| 1 | Portada — Logo Lacer + "Talonario Digital: Guía de uso" |
| 2 | ¿Qué es? — Descripción general de la app |
| 3 | Modos de uso — Rápido vs Profesional (comparativa visual) |
| 4 | Crear una receta — Paso a paso con capturas |
| 5 | Categorías y productos — Selección visual |
| 6 | Envío de recetas — WhatsApp, Email, PDF, QR |
| 7 | Recomendaciones post-cirugía — Vídeos y PDFs |
| 8 | Gestión de pacientes (Pro) — CRUD y ficha detallada |
| 9 | Historial y duplicación (Pro) — Reutilización eficiente |
| 10 | Dispensación en farmacia — Flujo QR para el farmacéutico |
| 11 | Perfil y personalización (Pro) — Logo, firma, datos clínica |
| 12 | Cierre — CTA "Empieza ahora" + QR a la app |

### Diseño

- Paleta de colores Lacer (rojo corporativo + blanco + gris)
- Iconografía consistente con la app (Lucide icons)
- Tipografía limpia y profesional
- Cada slide con un visual principal (mockup/screenshot) y texto mínimo

### Implementación

- Script Node.js con `pptxgenjs` generando el archivo
- Se almacena en `/mnt/documents/` como descargable
- Opcionalmente, se puede enlazar desde la app (botón en perfil o en el onboarding)

---

## Orden de implementación

1. **Tour interactivo in-app** (componente + hook + integración)
2. **Presentación PPTX** (script de generación + QA visual)

