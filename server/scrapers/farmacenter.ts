/**
 * Scraper para Farmacenter (www.farmacenter.com.py)
 * Método: Playwright (headless browser) porque el sitio renderiza con JavaScript
 *
 * Estructura del DOM:
 * - Contenedor: #catalogoProductos
 * - Items: .it[data-codprod]
 * - Nombre: a[title] (el atributo title del link de imagen)
 * - Precio venta: .precio.venta
 * - Precio lista: .precio.lista
 * - Descuento: .cocardas .por .int (porcentaje)
 * - URL: a.img[href]
 */

import axios from "axios";
import * as cheerio from "cheerio";
import type { ProductoScraped } from "./puntofarma";

const BASE_URL = "https://www.farmacenter.com.py";
const SEARCH_URL = `${BASE_URL}/catalogo`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type N = any;

function parsearPrecio(texto: string): number | null {
  if (!texto) return null;
  const limpio = texto
    .replace(/PYG\s*/gi, "")
    .replace(/Gs\.\s*/gi, "")
    .replace(/\./g, "")
    .replace(/,/g, "")
    .trim();
  const num = parseInt(limpio, 10);
  return isNaN(num) ? null : num;
}

/**
 * Scrapea una página de resultados de Farmacenter.
 * Farmacenter renderiza el HTML completo en el servidor (no usa SPA),
 * por lo que podemos usar axios + cheerio directamente.
 * Los datos están en el div #catalogoProductos con items .it[data-codprod].
 */
async function scrapearPagina(
  query: string,
  pagina: number = 1
): Promise<{ productos: ProductoScraped[]; hayMasPaginas: boolean }> {
  const url =
    pagina === 1
      ? `${SEARCH_URL}?q=${encodeURIComponent(query)}`
      : `${SEARCH_URL}?q=${encodeURIComponent(query)}&pag=${pagina}`;

  const response = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "es-PY,es;q=0.9,en;q=0.8",
    },
    timeout: 30000,
  });

  const $ = cheerio.load(response.data as string);
  const productos: ProductoScraped[] = [];

  // Contenedor principal de productos
  const container = $("#catalogoProductos");
  if (!container.length) {
    console.warn("[Farmacenter] No se encontró #catalogoProductos en la página");
    return { productos, hayMasPaginas: false };
  }

  // Cada item de producto
  container.find(".it[data-codprod]").each((_idx: number, el: N) => {
    const $item = $(el);
    const codprod = $item.attr("data-codprod") ?? "";

    // Nombre del producto: desde el atributo title del link de imagen o del link de nombre
    const nombre =
      $item.find("a.img").attr("title") ||
      $item.find("a.nom").text().trim() ||
      $item.find("a[title]").first().attr("title") ||
      "";

    if (!nombre || nombre.length < 3) return;

    // URL del producto
    const href = $item.find("a.img").attr("href") || $item.find("a[href*='/catalogo/']").first().attr("href") || "";
    const urlProducto = href.startsWith("http") ? href : `${BASE_URL}${href}`;

    // Precio de venta (precio con descuento aplicado)
    const precioVentaText = $item.find(".precio.venta").first().text().trim();
    const precioEfectivo = parsearPrecio(precioVentaText);

    if (!precioEfectivo || precioEfectivo <= 0) return;

    // Precio de lista (precio original sin descuento)
    const precioListaText = $item.find(".precio.lista").first().text().trim();
    const precioLista = parsearPrecio(precioListaText);
    const precioOriginal =
      precioLista && precioLista > precioEfectivo ? precioLista : null;

    // Porcentaje de descuento
    let porcentajeDescuento: number | null = null;
    const porcText = $item.find(".cocardas .por .int").first().text().trim();
    if (porcText) {
      const n = parseInt(porcText, 10);
      if (!isNaN(n) && n > 0 && n <= 90) {
        porcentajeDescuento = n;
      }
    }

    // Si no encontramos el porcentaje en .int, buscar en el texto de descuento
    if (!porcentajeDescuento) {
      $item.find("span, div").each((_i: number, node: N) => {
        const txt = $(node).text().trim();
        const matchOff = txt.match(/^(\d+)%\s*OFF$/i);
        if (matchOff) {
          porcentajeDescuento = parseInt(matchOff[1], 10);
        }
      });
    }

    productos.push({
      nombreEnFarmacia: nombre,
      urlProducto,
      precioOriginal,
      precioEfectivo,
      precioWeb: precioEfectivo,  // Farmacenter no distingue precio web de precio efectivo
      precioQr: null,              // Farmacenter no tiene precio QR
      descripcionDescuentoQr: null,
      porcentajeDescuento,
      tienePromocion: (porcentajeDescuento ?? 0) > 0,
      codigoExterno: codprod,
    });
  });

  // Verificar si hay más páginas
  const totalText = container.attr("data-totabs") ?? "0";
  const total = parseInt(totalText, 10);
  const shown = container.attr("data-tot") ?? "0";
  const shownNum = parseInt(shown, 10);
  const hayMasPaginas =
    total > shownNum * pagina ||
    $("a:contains('Ver más'), button:contains('Ver más')").length > 0;

  return { productos, hayMasPaginas };
}

export async function scrapearFarmacenter(
  query: string = "ibuprofeno"
): Promise<ProductoScraped[]> {
  // Farmacenter carga todos los productos en la primera página (hasta 56 por búsqueda).
  // No hay paginación real por URL — el botón "Ver más" usa AJAX.
  // Por eso solo scrapeamos la primera página y deduplicamos por codigoExterno.
  console.log(`[Farmacenter] Scrapeando "${query}"...`);
  
  const todos: ProductoScraped[] = [];
  const vistos = new Set<string>();

  try {
    const { productos } = await scrapearPagina(query, 1);
    
    for (const prod of productos) {
      // Deduplicar por código externo (codprod) o por nombre+precio
      const key = prod.codigoExterno || `${prod.nombreEnFarmacia}-${prod.precioEfectivo}`;
      if (!vistos.has(key)) {
        vistos.add(key);
        todos.push(prod);
      }
    }
    
    console.log(`[Farmacenter] Página 1: ${productos.length} productos (${todos.length} únicos)`);
  } catch (err) {
    console.error(`[Farmacenter] Error:`, err);
  }

  console.log(`[Farmacenter] Total: ${todos.length} productos`);
  return todos;
}
