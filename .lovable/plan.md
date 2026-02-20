
# Añadir botón "Volver" en la pantalla de inicio de sesión

## Problema
Cuando el usuario pulsa "Modo Profesional" en el selector de perfil, se le redirige a `/auth`. Una vez allí, no hay forma de volver atrás si decide no registrarse ni iniciar sesión.

## Solución
Añadir un botón/enlace "Volver" en la parte superior de la pantalla de Auth (`src/pages/Auth.tsx`) que navegue de vuelta a `/` (la pantalla de inicio).

## Cambios

### `src/pages/Auth.tsx`
- Importar el icono `ArrowLeft` de `lucide-react`
- Añadir un botón con flecha en la esquina superior izquierda de la pantalla, fuera de la Card, que haga `navigate('/')`
- Además, limpiar el `localStorage` del modo de usuario al volver, para que el selector de perfil vuelva a aparecer (si el usuario no completó el registro)

El botón se posiciona de forma absoluta o fija en la parte superior de la pantalla para que sea siempre accesible, con un estilo discreto tipo `ghost`.
