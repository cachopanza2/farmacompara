# FarmaCompara — TODO

## MVP Real (v1.0)

- [x] Diseño frontend: Clínico Moderno (azul #1B3A6B + verde #10B981, fuentes Sora + DM Sans)
- [x] Página Home con buscador prominente, búsquedas populares y stats en vivo
- [x] Página Resultados conectada a la API real con filtros (orden, solo ofertas)
- [x] Página Admin con panel de scraping manual y historial de logs
- [x] Schema de base de datos: farmacias, productos, precios, scrapingLogs
- [x] Scraper real de Punto Farma (RSC payload de Next.js App Router, paginación hasta 5 páginas)
- [x] Scraper real de Farmacenter (axios + cheerio, primera página estática)
- [x] Orquestador de scraping con persistencia en base de datos
- [x] API tRPC: buscarMedicamento (LOWER() case-insensitive), historialPrecios, farmacias.listar, scraping.ejecutar, scraping.estado, scraping.limpiarDuplicados
- [x] Cron job automático: scraping diario a las 02:00 AM (hora Paraguay)
- [x] Tests de vitest: 6 tests pasando (auth + scraping + búsqueda)
- [x] Inicialización automática de farmacias al arrancar el servidor
- [x] Deduplicación de productos en scraper de Farmacenter
- [x] Búsqueda case-insensitive con LOWER() en MySQL
- [x] 61 precios reales en BD: 49 de Punto Farma + 12 de Farmacenter
- [x] Precio más bajo encontrado: Gs. 7.461 (FINIDOL 400 MG en Farmacenter)

## Próximas iteraciones

- [ ] Agregar más farmacias: Biggie Farma, Farma Express, Farma Líder
- [ ] Página de historial de precios con gráfico de línea (Recharts)
- [ ] Búsqueda por principio activo (no solo nombre comercial)
- [ ] Paginación en resultados (scroll infinito o paginación clásica)
- [ ] Alertas de precio: notificar cuando un medicamento baja de precio
- [ ] Exportar resultados a CSV/PDF
- [ ] SEO: sitemap, meta tags, Open Graph
- [ ] Métricas de uso: cuántas búsquedas, medicamentos más buscados

## Precios por tarjeta / canal (v1.1)
- [x] Investigar estructura HTML de precios por tarjeta en página de detalle de Punto Farma
- [x] Actualizar schema BD: agregar columnas precioWeb y precioQr a tabla precios
- [x] Actualizar scraper Punto Farma para capturar precio regular, precio web y precio Itaú QR
- [x] Actualizar API buscarMedicamento para devolver los tres niveles de precio
- [x] Actualizar cards de resultados para mostrar los tres precios con etiquetas visuales
- [x] Re-ejecutar scraping y verificar datos reales con tres niveles de precio
- [x] 39 de 61 productos con precio QR Itaú Débito capturado

## Scraping automático diario (v1.2)
- [x] Actualizar cron job del servidor: 7:00 AM hora Paraguay (UTC-4 → 11:00 UTC)
- [x] Agregar notificación al owner (título + resumen) tras cada scraping automático
- [x] Programar tarea de respaldo en Manus Scheduler (7:05 AM Paraguay) como failsafe
- [x] Verificar que el cron se ejecuta correctamente y loguea en la BD
