
# Plan: Rediseño de la Barra de Acciones en "Nueva Receta"

## Problema Identificado

Actualmente en móvil:
- La barra de acciones fija (`WhatsApp, Email, PDF, Imprimir`) se posiciona en `bottom-0` pero entra en conflicto con la navegación inferior (`BottomNavigation` con `z-40` y `h-[72px]`)
- El contenido (`pb-20`) no deja espacio suficiente para ambas barras (navegación + acciones = ~140px necesarios)
- Resultado: los botones de acción quedan ocultos o parcialmente tapados

## Opciones de Diseño Propuestas

### Opción A: Barra de Acciones Integrada en el Contenido (Recomendada)
**Enfoque estilo Marketplace/E-commerce moderno**

```text
┌─────────────────────────────┐
│ + Productos      [🎤]       │ <- Añadir + Voz
├─────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │
│ │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │    │ <- Grid productos
│ └───┘ └───┘ └───┘ └───┘    │
├─────────────────────────────┤
│ Notas (opcional)...         │
├─────────────────────────────┤
│ 📱 Paciente...              │
├─────────────────────────────┤
│ ┌──────────────────────────┐│
│ │  ENVIAR RECETA (3 uds)   ││ <- Botón principal
│ └──────────────────────────┘│
│ WhatsApp | Email | PDF | 🖨 │ <- Opciones secundarias
├─────────────────────────────┤
│  🏠    ✂️    [+]   🕐   👤  │ <- Bottom Nav
└─────────────────────────────┘
```

**Ventajas:**
- Los botones quedan DENTRO del scroll, nunca ocultos
- Flujo natural: productos → notas → paciente → enviar
- Compatible con cualquier altura de pantalla

---

### Opción B: Bottom Sheet Expandible
**Estilo iOS/Google Maps**

```text
┌─────────────────────────────┐
│ + Productos      [🎤]       │
├─────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │
│ │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │    │
│ └───┘ └───┘ └───┘ └───┘    │
│                             │
│ Notas | Paciente (inline)   │
├═════════════════════════════┤ <- Drag handle
│ 📦 3 productos              │
│ [Enviar por WhatsApp →    ] │ <- Acción primaria grande
│                             │
│ 📧 Email    📄 PDF    🖨    │ <- Secundarias
├─────────────────────────────┤
│  🏠    ✂️    [+]   🕐   👤  │
└─────────────────────────────┘
```

**Ventajas:**
- Patrón familiar de apps como Uber, Maps
- El usuario puede arrastrar para ver más opciones
- Mantiene el foco en la acción principal

---

### Opción C: FAB (Floating Action Button) con Menú
**Estilo Material Design**

```text
┌─────────────────────────────┐
│ + Productos      [🎤]       │
├─────────────────────────────┤
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐    │
│ │ 📷 │ │ 📷 │ │ 📷 │ │ 📷 │    │
│ └───┘ └───┘ └───┘ └───┘    │
│                             │
│                        ┌───┐│
│ Notas...               │📤 ││ <- FAB flotante
│ Paciente...            └───┘│
│                             │
├─────────────────────────────┤
│  🏠    ✂️    [+]   🕐   👤  │
└─────────────────────────────┘

// Al pulsar FAB:
                         ┌────────┐
                         │ WhatsApp│
                         │ Email   │
                         │ PDF     │
                         │ Imprimir│
                         └────────┘
```

**Ventajas:**
- Mínimo espacio ocupado
- Interacción clara con una acción
- Muy usado en Material Design

---

### Opción D: Stepper/Wizard
**Flujo paso a paso**

```text
Paso 1: Productos   Paso 2: Detalles   Paso 3: Enviar
   ●─────────────────────○───────────────────○

┌─────────────────────────────┐
│ [Continuar con 3 productos] │ <- Un solo botón por paso
├─────────────────────────────┤
│  🏠    ✂️    [+]   🕐   👤  │
└─────────────────────────────┘
```

**Ventajas:**
- Reduce carga cognitiva (una cosa a la vez)
- Siempre hay UN botón claro
- Funciona bien en pantallas pequeñas

---

## Valoración sobre "Receta Simple" 

Tras analizar el uso actual:
- La funcionalidad de templates/plantillas ocupa espacio pero puede ser valiosa para usuarios frecuentes
- **Recomendación**: Mover plantillas a un icono en la barra superior (junto a dictado de voz) para liberar espacio vertical

## Mi Recomendación

**Opción A (Barra Integrada)** es la más práctica porque:
1. No requiere cambios de arquitectura complejos
2. Sigue el flujo natural de un carrito de compras
3. Los botones siempre están visibles sin conflictos de z-index
4. Funciona igual en todas las alturas de pantalla

**Cambios técnicos necesarios:**
1. Eliminar `fixed bottom-0` de la barra de acciones
2. Añadir la barra como parte del flujo normal del contenido
3. Ajustar padding bottom para solo compensar la navegación (pb-20)
4. Hacer el botón principal más prominente (WhatsApp full-width)
5. Opciones secundarias (Email, PDF, Imprimir) como iconos inline debajo

---

## Pregunta para ti

Te presento tres diseños alternativos para la zona de acciones en móvil. ¿Cuál prefieres?

- **A) Botones integrados en el contenido** (scroll hasta verlos, estilo carrito de compra)
- **B) Bottom Sheet expandible** (arrastrar para ver opciones)
- **C) FAB flotante con menú** (botón circular que despliega opciones)
- **D) Wizard paso a paso** (primero productos, luego datos, finalmente envío)
