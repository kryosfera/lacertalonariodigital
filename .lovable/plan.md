

# Tarjetón A5 promocional — Talonario Digital (PDF)

## Concepto

Crear un tarjetón A5 de 2 caras (similar al adjunto) pero actualizado para la versión actual de la app, enfocado en la simplicidad de uso. Se generará como PDF descargable listo para imprenta.

## Cara 1 — Portada

- Logo Lacer + "TALONARIO DIGITAL" (mismo estilo del original)
- Mensaje principal: **"Tu recetario digital en 3 simples pasos"**
- Tres iconos grandes con texto mínimo:
  1. **Selecciona** — "Elige los productos por categoría"
  2. **Personaliza** — "Añade comentarios y datos del paciente"
  3. **Envía** — "WhatsApp, Email o PDF al instante"
- QR code apuntando a `lacertalonariodigital.lovable.app`
- URL debajo: `www.lacertalonariodigital.lovable.app`
- Franja roja inferior (como el original)

## Cara 2 — Instrucciones rápidas

- Título: **"SIN DESCARGA. SIN REGISTRO. SIN COMPLICACIONES."**
- Sección "Modo Rápido" (3 pasos con bullets rojos, estilo del original pero simplificado):
  1. Entra en la web
  2. Selecciona productos y envía
  3. Tu paciente recibe la receta al instante
- Sección "Modo Profesional" (para quien quiera más):
  - Gestión de pacientes
  - Historial y duplicación de recetas
  - Firma digital y logo de tu clínica
  - Seguimiento de dispensación en farmacia
- Nota al pie: "Regístrate gratis para acceder al modo profesional"
- Código de referencia en esquina inferior

## Diseño

- Paleta: Rojo Lacer (#E30613), blanco, gris oscuro (#333333)
- Logo Lacer embebido desde `src/assets/lacer-logo.png` y `lacer-logo-bocas_sanas.jpg`
- Formato A5 (148×210mm)
- Generado con Python (reportlab) o Node.js, exportado como PDF a `/mnt/documents/`

## Implementación

1. Copiar los assets de logo al filesystem temporal
2. Generar el PDF con reportlab (Python) — 2 páginas A5
3. QA visual: convertir a imagen e inspeccionar ambas caras
4. Entregar como artifact descargable

