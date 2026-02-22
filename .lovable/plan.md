

## Gestionar videos desde el panel de administracion de productos

Actualmente el dialogo de edicion de productos (`ProductDialog.tsx`) no incluye ningun campo para gestionar los videos asociados. Se anadira un campo para que puedas agregar, ver y eliminar URLs de video directamente desde `/admin`.

### Cambios

**1. ProductDialog.tsx - Anadir campo de videos**

- Anadir `video_urls` al schema de validacion (array de strings)
- Anadir `video_urls` a los valores por defecto del formulario
- Incluir `video_urls` en el payload que se envia a la base de datos
- Anadir una seccion en el formulario con:
  - Lista de URLs de video actuales con boton para eliminar cada una
  - Input para anadir nueva URL de video con boton "Anadir"
  - Preview visual del enlace de Vimeo anadido

**2. Interfaz del campo de videos**

- Se mostrara debajo de la descripcion del producto
- Cada URL aparecera como un chip/badge con un boton X para eliminarla
- Un input con boton "+" permitira pegar una nueva URL de Vimeo
- Se extraera automaticamente la URL limpia si el usuario pega un iframe completo de Vimeo (extrayendo el src del iframe)

### Detalles tecnicos

- El campo `video_urls` ya existe en la tabla `products` como `text[]`
- Se usara `useState` local para gestionar el array de URLs dentro del formulario
- Se sincronizara con react-hook-form mediante `form.setValue('video_urls', ...)`
- Se parseara automaticamente HTML de iframes pegados para extraer solo la URL del player de Vimeo

