# Ideas de Diseño — FarmaCompara Paraguay

## Contexto
Comparador de precios farmacéuticos para Paraguay. Inspirado en SingleCare.com.
Público: usuarios que buscan ahorrar en medicamentos. Tono: confiable, claro, accesible.

---

<response>
<probability>0.07</probability>
<idea>

**Enfoque A — Clínico Moderno ("Farmacia del Futuro")**

- **Design Movement**: Swiss International Typographic Style + Healthcare Digital
- **Core Principles**: Claridad extrema, jerarquía tipográfica fuerte, datos como protagonistas, confianza institucional
- **Color Philosophy**: Azul profundo (#1B3A6B) como color primario institucional + verde esmeralda (#10B981) para precios/ahorro. Fondo blanco puro. Transmite confianza médica sin frialdad.
- **Layout Paradigm**: Columna central dominante con sidebar de filtros fijo. Hero asimétrico con buscador a la izquierda y estadísticas flotantes a la derecha.
- **Signature Elements**: Líneas divisoras de 1px en azul claro, badges de "Mejor precio" en verde, tarjetas con borde izquierdo de color por farmacia.
- **Interaction Philosophy**: Micro-animaciones sutiles en hover de tarjetas. Buscador con autocompletado animado. Transiciones de página fluidas.
- **Animation**: Fade-in escalonado de tarjetas de resultados. Contador animado de ahorro. Buscador con expansión suave.
- **Typography System**: `Sora` (display, bold) para títulos + `DM Sans` (body, regular/medium) para contenido. Jerarquía clara: 48px hero → 24px sección → 16px body.

</idea>
</response>

<response>
<probability>0.08</probability>
<idea>

**Enfoque B — Cálido y Accesible ("Tu Farmacia de Barrio, Digital")**

- **Design Movement**: Humanist UI + Warm Minimalism
- **Core Principles**: Accesibilidad visual, calidez sin perder profesionalismo, datos legibles para todos los públicos
- **Color Philosophy**: Verde salud (#2D6A4F) como primario + amarillo cálido (#F4A261) para CTAs y destacados. Fondo crema (#FAFAF7). Evoca naturaleza y bienestar.
- **Layout Paradigm**: Grid de 12 columnas con secciones que rompen el patrón. Hero con fondo de ola suave. Cards con sombras suaves y bordes redondeados generosos.
- **Signature Elements**: Iconografía de píldoras/cápsulas como decoración sutil, gradientes suaves de verde a blanco, etiquetas de descuento en forma de cinta.
- **Interaction Philosophy**: Hover states con elevación de tarjeta. Filtros como chips seleccionables. Búsqueda con sugerencias animadas.
- **Animation**: Entrada de hero con slide-up. Cards con spring animation al cargar. Precio mínimo con efecto de "destello" al aparecer.
- **Typography System**: `Nunito` (display, extrabold) para títulos + `Source Sans 3` (body) para contenido. Redondeado y amigable.

</idea>
</response>

<response>
<probability>0.06</probability>
<idea>

**Enfoque C — Directo y Utilitario ("Compará, Ahorrá")**

- **Design Movement**: Utilitarian Data-First Design + Editorial
- **Core Principles**: Datos primero, fricción cero, densidad informativa inteligente, velocidad percibida
- **Color Philosophy**: Azul eléctrico (#2563EB) como primario + rojo coral (#EF4444) para alertas de precio alto + verde (#16A34A) para mejor precio. Fondo gris muy claro (#F8FAFC). Energético y directo.
- **Layout Paradigm**: Buscador ocupa el 60% del viewport inicial. Resultados en lista densa con comparación visual inline. Sin hero decorativo, el producto ES el contenido.
- **Signature Elements**: Barras de comparación de precio horizontal, badges numéricos de ahorro en porcentaje, indicadores de stock en tiempo real.
- **Interaction Philosophy**: Resultados instantáneos mientras se escribe. Ordenamiento por columnas con un click. Comparación de hasta 3 productos lado a lado.
- **Animation**: Resultados que aparecen con stagger de 50ms. Barras de precio que se animan al cargar. Transición de búsqueda a resultados sin cambio de página.
- **Typography System**: `Space Grotesk` (display) + `IBM Plex Sans` (body). Técnico pero legible. Monospace para precios.

</idea>
</response>

---

## Decisión Final: **Enfoque A — Clínico Moderno**

Razón: Mejor equilibrio entre confianza institucional (importante para salud) y modernidad. 
La paleta azul/verde es reconocida en el sector salud. La tipografía Sora + DM Sans 
aporta distinción sin perder legibilidad. El layout asimétrico evita el "AI slop" 
de layouts centrados genéricos.
