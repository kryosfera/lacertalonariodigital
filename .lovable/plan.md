# Rediseño Pantalla Recomendaciones

Adaptar `src/components/SurgeryRecommendations.tsx` al nuevo diseño visual minimalista tipo Apple con identidad Lacer.

## Cambios visuales clave

**Header (mobile):**
- Logo Lacer rojo centrado en la parte superior (como en screen-2)
- Título "Recomendaciones" en tipografía bold MUY grande (text-4xl/5xl), alineado a la izquierda
- Subtítulo "Material para tus pacientes" debajo en gris
- Eliminar el icono cuadrado rojo actual junto al título

**Filtros (pills):**
- Estilo "outline" redondeado con borde fino
- Pill activo: borde rojo Lacer + texto rojo + fondo blanco (no relleno rojo sólido)
- Pills inactivos: borde gris claro, texto gris, fondo blanco
- Sin iconos dentro de los pills (solo texto: Todos / PDF / Vídeo / Enlace)
- Mayor padding horizontal y tamaño más generoso

**Tarjetas (Bento style):**
- Una tarjeta por fila en mobile (grid-cols-1), no dos
- Imagen grande arriba ocupando todo el ancho de la tarjeta (aspect ratio ~16/10)
- Badge "PDF/Vídeo/Enlace" arriba a la derecha sobre la imagen, fondo blanco translúcido con texto oscuro (no negro/40)
- Eliminar el icono pequeño rojo flotante en la esquina inferior izquierda de la imagen
- Para vídeos: mantener botón play circular blanco grande centrado
- Bordes redondeados grandes (rounded-3xl), sombra suave
- Padding interno generoso (p-5/p-6)
- Título en bold grande (text-xl), descripción en gris claro debajo
- **CTA "Ver" como botón rojo Lacer pill grande** (no outline) con icono play/external a la izquierda
- Botón compartir como **círculo outline rojo** separado a la derecha (no junto al Ver)
- Layout de acciones: `[ ▶ Ver  pill ancho ] ............... [ ⚇ ]`

**Desktop (md+):**
- Mantener grid de 2-3 columnas pero con el mismo estilo de tarjeta grande
- Header alineado a la izquierda con logo a la izquierda también

## Detalles técnicos

- Archivo único a editar: `src/components/SurgeryRecommendations.tsx`
- Usar logo Lacer existente (buscar en `src/assets/` o `public/`) — si no existe, dejar TODO con placeholder
- Colores via tokens: `text-primary`, `border-primary`, `bg-primary` (rojo Lacer ya configurado)
- Animaciones: mantener fade-in + scale on hover
- WhatsApp dialog y video modal: sin cambios funcionales
- Responsive: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`

## Fuera de alcance

- No tocar el badge "Premium" del mockup (no existe en datos actuales)
- No cambiar lógica de compartir, filtrado o fetching
- No tocar bottom navigation (ya coincide con el diseño)
