
# Plan: Cumplimiento Legal de Cookies (RGPD/LSSI-CE)

## Resumen

Implementar un sistema completo de cumplimiento legal para cookies siguiendo la normativa española (LSSI-CE) y europea (RGPD). Incluye banner de consentimiento, gestión de preferencias y páginas legales obligatorias.

---

## Qué Se Implementará

### 1. Banner de Cookies
- Aparece en la primera visita
- Opciones: "Aceptar todas", "Rechazar", "Configurar"
- Diseño discreto pero visible
- Recuerda la elección del usuario

### 2. Páginas Legales
- **Política de Cookies**: Explica qué cookies se usan
- **Política de Privacidad**: Cómo se tratan los datos
- **Aviso Legal**: Información del responsable

### 3. Centro de Preferencias
- Modal para gestionar categorías de cookies
- Cookies necesarias (no desactivables)
- Opción para cambiar preferencias en cualquier momento

### 4. Enlaces en Footer
- Acceso a páginas legales desde toda la app

---

## Cookies Actuales de la Aplicación

| Cookie/Storage | Tipo | Propósito |
|----------------|------|-----------|
| `lacer_user_mode` | Técnica | Guardar preferencia de modo (básico/profesional) |
| `lacer_theme` | Técnica | Guardar preferencia de tema (claro/oscuro) |
| `sb-*` (Supabase) | Técnica | Sesión de autenticación |
| `sidebar:state` | Técnica | Estado del menú lateral |

**Nota**: Todas las cookies actuales son **técnicas/necesarias**, no requieren consentimiento previo pero sí información.

---

## Archivos a Crear

| Archivo | Descripción |
|---------|-------------|
| `src/components/CookieBanner.tsx` | Banner de consentimiento de cookies |
| `src/components/CookiePreferences.tsx` | Modal de configuración de preferencias |
| `src/hooks/useCookieConsent.tsx` | Hook para gestionar estado de consentimiento |
| `src/pages/CookiePolicy.tsx` | Página de política de cookies |
| `src/pages/PrivacyPolicy.tsx` | Página de política de privacidad |
| `src/pages/LegalNotice.tsx` | Página de aviso legal |
| `src/components/LegalFooter.tsx` | Footer con enlaces legales |

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/App.tsx` | Añadir CookieBanner y rutas legales |
| `src/components/HomeScreen.tsx` | Incluir LegalFooter |
| `src/pages/Index.tsx` | Incluir LegalFooter en desktop |

---

## Detalles Técnicos

### Hook de Consentimiento
```typescript
interface CookieConsent {
  necessary: boolean;    // Siempre true
  analytics: boolean;    // Para futuro uso
  marketing: boolean;    // Para futuro uso
  timestamp: string;
  version: string;
}
```

### Diseño del Banner
- Posición: parte inferior de la pantalla
- Estilo: glassmorphism acorde al diseño existente
- Colores: usa los colores secundarios de Lacer (rojo)
- Mobile-first: ocupa ancho completo en móvil

### Gestión del Estado
- Guardado en `localStorage` como `lacer_cookie_consent`
- Incluye timestamp para trazabilidad
- Versión para invalidar consentimientos antiguos si cambian las cookies

### Páginas Legales
- Diseño consistente con la app
- Navegación clara para volver
- Contenido en español adaptado a productos de salud bucodental
- Información genérica que deberá ser revisada por el equipo legal de Lacer

---

## Flujo de Usuario

```text
Usuario entra por primera vez
         ↓
   Banner de cookies aparece
         ↓
    ┌────┴────┬──────────┐
    ↓         ↓          ↓
 Aceptar   Rechazar   Configurar
    ↓         ↓          ↓
    └────┬────┴──────────┤
         ↓               ↓
  Guardar preferencia  Modal de
         ↓           preferencias
  Banner desaparece       ↓
         ↓           Guardar
  Navegación normal       ↓
                    Banner desaparece
```

---

## Consideraciones Importantes

1. **Las cookies técnicas actuales NO requieren consentimiento** pero sí deben informarse
2. El banner es **preparatorio** para cuando se añadan analytics (Google Analytics, etc.)
3. Los textos legales son **plantillas** que deben ser revisadas por el departamento legal de Lacer
4. Se incluye enlace para modificar preferencias en el footer
