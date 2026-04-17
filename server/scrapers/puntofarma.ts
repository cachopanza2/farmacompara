/**
 * Scraper de Punto Farma Paraguay
 * Método: Next.js RSC payload (React Server Components)
 * URL: https://www.puntofarma.com.py/buscar?s={query}
 *
 * Estructura de precios por producto:
 * 1. precioOriginal  → campo "precio" del objeto producto (precio de lista)
 * 2. precioEfectivo  → precio * (1 - descuento/100) = precio web con descuento general
 * 3. precioQr        → objeto separado con "precioConDescuento" y "productoCodigo"
 *                      (Itaú QR Débito, ~20% adicional sobre el precio web)
 */

import axios from "axios";

export interface ProductoScraped {
  nombreEnFarmacia: string;
  urlProducto: string;
  precioOriginal: number | null;   // Precio de lista (sin descuento)
  precioEfectivo: number;          // Precio web (con descuento general, ej: -18%)
  precioWeb: number | null;        // Alias explícito del precio web
  precioQr: number | null;         // Precio con Itaú QR Débito
  descripcionDescuentoQr: string | null; // Ej: "Itaú QR Débito"
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
  precio: number;         // Precio de lista
  descuento: number | null; // Porcentaje de descuento web (ej: 18)
  fotoPrincipal: string | null;
}

interface RscDescuentoForma {
  productoCodigo: number;
  precioConDescuento: string; // Precio QR como string
  descripcion: string;        // Ej: "Itau QR Debito"
  advertencia: string;        // Ej: "Exclusivo con Tarjeta de Débito Itaú QR"
}

/**
 * Parsea el RSC payload de Next.js para extraer:
 * - Objetos de productos (con precio de lista y descuento web)
 * - Objetos de descuentos por forma de pago (precio QR Itaú)
 */
function parseRscPayload(payload: string): {
  products: Map<number, RscProducto>;
  qrPrices: Map<number, RscDescuentoForma>;
} {
  const products = new Map<number, RscProducto>();
  const qrPrices = new Map<number, RscDescuentoForma>();

  const lines = payload.split("\n");
  for (const line of lines) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const jsonStr = line.substring(colonIdx + 1).trim();
    if (!jsonStr.startsWith("{")) continue;

    try {
      const data = JSON.parse(jsonStr);

      // Objeto de producto: tiene "codigo" numérico, "descripcion" y "precio"
      if (
        typeof data.codigo === "number" &&
        typeof data.descripcion === "string" &&
        typeof data.precio === "number" &&
        data.precio > 0 &&
        !products.has(data.codigo)
      ) {
        products.set(data.codigo, {
          codigo: data.codigo,
          descripcion: data.descripcion,
          precio: data.precio,
          descuento: typeof data.descuento === "number" ? data.descuento : null,
          fotoPrincipal: data.fotoPrincipal ?? null,
        });
      }

      // Objeto de descuento por forma de pago (QR Itaú):
      // tiene "precioConDescuento" (string), "productoCodigo" y "descripcion"
      if (
        typeof data.precioConDescuento === "string" &&
        typeof data.productoCodigo === "number" &&
        typeof data.descripcion === "string" &&
        !qrPrices.has(data.productoCodigo)
      ) {
        qrPrices.set(data.productoCodigo, {
          productoCodigo: data.productoCodigo,
          precioConDescuento: data.precioConDescuento,
          descripcion: data.descripcion,
          advertencia: data.advertencia ?? "",
        });
      }
    } catch {
      // Ignorar líneas que no son JSON válido
    }
  }

  return { products, qrPrices };
}

/**
 * Scrapea los productos de Punto Farma usando el RSC payload.
 * Captura tres niveles de precio por producto:
 * 1. Precio de lista (campo "precio")
 * 2. Precio web con descuento general (precio × (1 - descuento/100))
 * 3. Precio con Itaú QR Débito (objeto separado "precioConDescuento")
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
      const { products, qrPrices } = parseRscPayload(payload);

      console.log(
        `[PuntoFarma] Página ${page}: ${products.size} productos, ${qrPrices.size} precios QR`
      );

      if (products.size === 0) break;

      let newCount = 0;
      for (const [codigo, p] of Array.from(products.entries())) {
        if (!seen.has(codigo)) {
          seen.add(codigo);

          // ── Precio de lista (sin descuento) ──────────────────────────────
          const precioOriginal = p.precio;

          // ── Precio web (con descuento general) ───────────────────────────
          // Ej: precio=9555, descuento=18 → precioWeb = 9555 × 0.82 = 7835
          const precioWeb =
            p.descuento && p.descuento > 0
              ? Math.round(p.precio * (1 - p.descuento / 100))
              : p.precio;

          // ── Precio QR Itaú Débito ─────────────────────────────────────────
          const qrInfo = qrPrices.get(codigo);
          const precioQr = qrInfo
            ? Math.round(Number(qrInfo.precioConDescuento))
            : null;
          const descripcionQr = qrInfo
            ? qrInfo.descripcion.replace(/\u00c3\u00ba/g, "ú").replace(/\u00c3\u00a9/g, "é")
            : null;

          // ── Precio efectivo = precio web (con descuento general) ─────────
          // precioEfectivo es el precio web exclusivo para compras en línea
          // precioQr es el precio adicional con tarjeta Itaú QR (aún más bajo)
          const precioEfectivo = precioWeb;

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
            urlProducto: `${BASE_URL}/producto/${codigo}/${slugPart}`,
            precioOriginal,
            precioEfectivo,
            precioWeb,
            precioQr,
            descripcionDescuentoQr: descripcionQr,
            porcentajeDescuento: p.descuento,
            tienePromocion: (p.descuento ?? 0) > 0,
            codigoExterno: String(codigo),
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
