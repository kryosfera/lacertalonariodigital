

## Simplificar la transicion profesional a modo rapido

### Problema
El boton "Cambiar a modo rapido" no cierra sesion, pero el sistema fuerza automaticamente el modo profesional si el usuario esta autenticado (linea 30 de `useUserMode.tsx`). Esto hace que el boton sea inutil: al recargar la pagina o navegar, vuelve a modo profesional.

### Solucion
Eliminar el boton "Cambiar a modo rapido" del perfil y dejar unicamente el boton "Cerrar sesion", que ya ejecuta `switchToBasic()` + `signOut()`. Asi el flujo es claro:

- **Cerrar sesion** = cierra sesion + vuelve a pantalla de inicio en modo rapido
- Para volver a profesional, el usuario inicia sesion de nuevo

### Cambios

**1. `src/components/ProfilePage.tsx`**
- Eliminar el boton "Cambiar a modo rapido" (lineas ~127-132)
- Mantener unicamente el boton "Cerrar sesion" que ya hace `switchToBasic()` + `signOut()`

Es un cambio minimo de una sola linea/bloque eliminado.
