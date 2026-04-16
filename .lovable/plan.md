

# Simplificar flujo de entrada + mejoras UX

## Cambios

### 1. Eliminar pantalla de selección de perfil inicial
En `useUserMode.tsx`, cuando no hay modo guardado en `localStorage`, en lugar de mostrar `showProfileSelector = true`, establecer directamente `userMode = 'basic'`. El usuario nuevo entra directo a la home con el banner de "¿Eres profesional?".

### 2. Eliminar componente ProfileSelector
Ya no se necesita `ProfileSelector.tsx` ni su uso en `Index.tsx` (líneas 89-91).

### 3. Mejorar banner "¿Eres profesional?" en HomeScreenBento
- Añadir animación de pulso/glow sutil al banner para darle protagonismo
- Ajustar espaciado del layout para que en tablet/portátil (768px+) todo quepa sin scroll: reducir padding del hero, comprimir gaps
- Cambiar el `<Link to="/auth">` por `<Link to="/auth?tab=signup">` para abrir directamente la pestaña de registro

### 4. Auth.tsx: abrir en tab "signup" cuando viene del banner
- Leer `?tab=signup` de la URL y establecer `activeTab` inicial a `'signup'` si está presente

### 5. Renombrar campo "Clínica" a "Clínica / Profesional"
- En `Auth.tsx`, cambiar el label de "Clínica" a "Clínica / Profesional" y el placeholder a "Nombre de clínica o profesional"

### 6. Post-registro: activar modo profesional automáticamente
Ya funciona: en `useUserMode.tsx`, cuando `user` existe se establece `professional` automáticamente. No requiere cambios.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/hooks/useUserMode.tsx` | Default a `'basic'` en vez de mostrar selector |
| `src/pages/Index.tsx` | Eliminar import y uso de `ProfileSelector` |
| `src/components/home/HomeScreenBento.tsx` | Animación banner + link a `/auth?tab=signup` + ajuste espaciado |
| `src/pages/Auth.tsx` | Leer query param `tab`, renombrar campo clínica |
| `src/components/ProfileSelector.tsx` | Eliminar archivo |

