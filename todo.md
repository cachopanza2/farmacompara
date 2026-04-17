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
