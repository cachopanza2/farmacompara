/**
 * Scraper de Punto Farma Paraguay
 * Método: Next.js RSC payload (React Server Components)
 * URL: https://www.puntofarma.com.py/buscar?s={query}
 *
 * El sitio usa Next.js App Router con RSC. Al hacer GET con el header RSC:1
 * devuelve un payload de texto con líneas "hex:JSON" que contienen los datos
 * de productos con precios reales.
 */

import axios from "axios";

export interface ProductoScraped {
  nombreEnFarmacia: string;
  urlProducto: string;
  precioOriginal: number | null;
  precioEfectivo: number;
  precioQr: number | null;
  porcentajeDescuento: number | null;
  tienePromocion: boolean;
  codigoExterno: string;
}

const BASE_URL = "https://www.puntofarma.com.py";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/x-component",
  RSC: "1",
  "Next-Router-State-Tree":
    "%5B%22%22%2C%7B%22children%22%3A%5B%22(guest)%22%2C%7B%22children%22%3A%5B%22buscar%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%5D%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
  "Next-Url": "/buscar",
};

interface RscProducto {
  codigo: number;
  descripcion: string;
  precio: number;
  precioConDescuento: string | null;
  descuento: number | null;
}

/**
 * Parsea el RSC payload de Next.js para extraer objetos JSON de productos.
 * El formato es líneas con "hex:JSON" donde cada línea es un fragmento de datos.
 */
function parseRscPayload(payload: string): RscProducto[] {
  const products: RscProducto[] = [];
  const seen = new Set<number>();

  const lines = payload.split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const jsonStr = line.substring(colonIdx + 1).trim();
    if (!jsonStr.startsWith("{")) continue;

    try {
      const data = JSON.parse(jsonStr);

      // Identificar objetos de producto: tienen "codigo" numérico, "descripcion" y "precio"
      if (
        typeof data.codigo === "number" &&
        typeof data.descripcion === "string" &&
        typeof data.precio === "number" &&
        data.precio > 0 &&
        !seen.has(data.codigo)
      ) {
        seen.add(data.codigo);
        products.push({
          codigo: data.codigo,
          descripcion: data.descripcion,
          precio: data.precio,
          precioConDescuento: data.precioConDescuento ?? null,
          descuento: data.descuento ?? null,
        });
      }
    } catch {
      // Ignorar líneas que no son JSON válido
    }
  }

  return products;
}

/**
 * Scrapea los productos de ibuprofeno de Punto Farma usando el RSC payload.
 * Soporta paginación automática hasta obtener todos los resultados.
 */
export async function scrapearPuntoFarma(
  query: string = "ibuprofeno",
  maxPages: number = 5
): Promise<ProductoScraped[]> {
  const allProducts: ProductoScraped[] = [];
  const seen = new Set<number>();

  for (let page = 1; page <= maxPages; page++) {
    try {
      const url =
        page === 1
          ? `${BASE_URL}/buscar?s=${encodeURIComponent(query)}`
          : `${BASE_URL}/buscar?s=${encodeURIComponent(query)}&page=${page}`;

      console.log(`[PuntoFarma] Scrapeando página ${page}: ${url}`);

      const resp = await axios.get(url, {
        headers: HEADERS,
        timeout: 30000,
        responseType: "text",
      });

      const payload = resp.data as string;
      const products = parseRscPayload(payload);

      console.log(`[PuntoFarma] Página ${page}: ${products.length} productos`);

      if (products.length === 0) break;

      let newCount = 0;
      for (const p of products) {
        if (!seen.has(p.codigo)) {
          seen.add(p.codigo);

          // Precio efectivo: usar precioConDescuento si existe, sino precio normal
          const precioEfectivo = p.precioConDescuento
            ? Math.round(Number(p.precioConDescuento))
            : p.precio;

          // Precio original: si hay descuento, el precio original es el mayor
          const precioOriginal =
            p.precioConDescuento && Number(p.precioConDescuento) < p.precio
              ? p.precio
              : null;

          // URL del producto
          const slugPart = p.descripcion
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .substring(0, 60);

          allProducts.push({
            nombreEnFarmacia: p.descripcion,
            urlProducto: `${BASE_URL}/producto/${p.codigo}/${slugPart}`,
            precioOriginal,
            precioEfectivo,
            precioQr: null, // El precio QR es adicional, no lo usamos como precio principal
            porcentajeDescuento: p.descuento,
            tienePromocion: (p.descuento ?? 0) > 0,
            codigoExterno: String(p.codigo),
          });
          newCount++;
        }
      }

      if (newCount === 0) break;

      // Pausa entre páginas
      if (page < maxPages) {
        await new Promise((r) => setTimeout(r, 1500));
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error(`[PuntoFarma] Error en página ${page}: ${msg}`);
      break;
    }
  }

  console.log(`[PuntoFarma] Total productos scrapeados: ${allProducts.length}`);
  return allProducts;
}
