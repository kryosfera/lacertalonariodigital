## Objetivo

Adaptar la pantalla **Nueva Receta** (mobile) al diseño propuesto en la captura: header centrado con logo Lacer + título "Nueva Receta", botón grande con borde rojo para añadir productos, card de productos seleccionados con badge rojo y botón "Limpiar", textarea de notas en gris claro, campo paciente con check verde, y bloque de envío con botón verde grande de WhatsApp + 3 botones outline rojos (Email / PDF / Print). Se mantiene la `BottomNavigation` y todo el desktop intacto.

## Archivo a modificar

`src/components/RecipeCreator.tsx` — únicamente el bloque de retorno mobile (líneas ~583–921). Lógica, estados, dialogs y desktop se mantienen.

## Cambios visuales (mobile)

### 1. Header centrado nuevo
Insertar al inicio del contenedor (antes del "Quick Actions Bar"):

```text
        [ Logo Lacer ]
        Nueva Receta
```

- Bloque centrado con `pt-3 pb-4`.
- Logo Lacer (`@/assets/lacer-logo.png`) `h-10 w-auto mx-auto`.
- Título `Nueva Receta`: `text-xl font-bold text-center mt-2`.
- Solo visible en mobile (`md:hidden`).

### 2. Botón "Añadir Productos" rediseñado
Mantener el botón pero con estilo de la maqueta:
- Borde sólido rojo (`border-2 border-secondary/60`), no dashed.
- `rounded-2xl h-14`, fondo transparente.
- Icono `Plus` + texto **"Productos"** (tipografía bold, sin "Añadir").
- Hover suave: `hover:bg-secondary/5`.

### 3. Card de productos seleccionados
Refinar la card actual al estilo Apple:
- `rounded-2xl border border-border/40 shadow-sm`.
- Header interno: badge rojo circular grande con número (`w-7 h-7 rounded-full bg-secondary text-white`), nombre del primer producto (o "X productos" si hay varios) en `font-semibold`, y botón **Limpiar** a la derecha (`bg-muted rounded-full px-3 h-7 text-xs`).
- Grid de miniaturas más limpio (sin bordes duros, fondo blanco, `rounded-xl`).

### 4. Notas
Textarea con look iOS: `bg-muted/60 border-0 rounded-2xl p-4 text-sm placeholder:text-muted-foreground/70`, sin borde visible.

### 5. Campo paciente (modo Pro)
Card pill con icono usuario izquierda, nombre, y check verde a la derecha cuando hay paciente seleccionado:
- Contenedor `rounded-2xl border border-border/40 bg-background h-14 px-4`.
- Icono `User` izquierda, input sin borde interno.
- `Check` verde (`text-green-500`) a la derecha cuando `selectedPatient` o `patientName` existe.

### 6. Bloque de envío
Reorganizar las acciones:

```text
[  💬  Enviar por WhatsApp        [1 uds]  ]   ← verde grande, rounded-2xl, h-14

[ ✉ Email ]  [ ⬇ PDF ]  [ 🖨 Print ]          ← outline rojos, h-12, rounded-xl
```

- WhatsApp: `bg-[#25D366] hover:bg-[#1FAD54] rounded-2xl h-14 font-semibold`, badge "N uds" en pill blanca translúcida.
- Email / PDF / Print: los 3 con `flex-1`, `variant="outline"`, borde rojo sutil (`border-secondary/40 text-secondary hover:bg-secondary/5`), `rounded-xl h-12`, icono + texto. Print pasa de icon-only a botón con texto "Print" igual que los otros (3 botones equivalentes como en la maqueta).

### 7. Espaciado vertical
- Reducir gaps generales a `space-y-4` entre bloques principales para look aireado.
- Padding inferior `pb-28` para que el último botón no quede pegado a la `BottomNavigation`.

## Lo que NO se toca

- `BottomNavigation.tsx`.
- Bloque desktop (`md:` y superiores) del `RecipeCreator`.
- Lógica de estados, handlers (`handleSendWhatsApp`, `handleSendEmail`, `handleDownloadPDF`, `handlePrint`), dialogs (`Dialog`, `Drawer`), templates y patient autocomplete.
- `CategorySelector` y `ProductSelector` (ya rediseñados).

## Detalles técnicos

- Importar `lacerIcon from "@/assets/lacer-logo.png"` (ya se usa en otras pantallas).
- Mantener todos los estados existentes; solo cambia el JSX de presentación mobile.
- Conservar animaciones `framer-motion` actuales en la lista de productos.
- El header centrado solo aparece en mobile (`md:hidden`); desktop conserva su layout actual.
- Mantener el dropdown custom de pacientes (líneas 805–831) funcional bajo el nuevo input.

## Resultado esperado

Pantalla Nueva Receta con look Apple-minimal coincidente con la maqueta: logo Lacer + "Nueva Receta" centrados arriba, botón rojo grande "Productos", card limpia de productos con badge rojo, notas en gris suave, paciente con check verde, WhatsApp verde grande y trío Email/PDF/Print en outline rojo — todo respirando bien y sin solaparse con la `BottomNavigation`.
