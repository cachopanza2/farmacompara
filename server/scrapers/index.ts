/**
 * Orquestador de scraping para FarmaCompara
 * Coordina el scraping de todas las farmacias y persiste los datos en la BD
 */

import { eq, and, gte } from "drizzle-orm";
import { getDb } from "../db";
import { farmacias, productos, precios, scrapingLogs } from "../../drizzle/schema";
import { scrapearPuntoFarma, type ProductoScraped } from "./puntofarma";
import { scrapearFarmacenter } from "./farmacenter";

export interface ResultadoScraping {
  farmacia: string;
  productosEncontrados: number;
  productosGuardados: number;
  errores: number;
  duracionMs: number;
}

/**
 * Normaliza el nombre de un producto para comparación
 * Ej: "IBUPROFENO 400MG CJ X 10 COMP" → "ibuprofeno 400mg"
 */
function normalizarNombre(nombre: string): string {
  return nombre
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[^\w\s]/g, "")
    .trim()
    .substring(0, 100);
}

/**
 * Extrae el principio activo del nombre del producto
 */
function extraerPrincipioActivo(nombre: string): string {
  const nombreLower = nombre.toLowerCase();
  if (nombreLower.includes("ibuprofeno")) return "Ibuprofeno";
  if (nombreLower.includes("paracetamol")) return "Paracetamol";
  if (nombreLower.includes("amoxicilina")) return "Amoxicilina";
  return "Ibuprofeno"; // default para MVP
}

/**
 * Guarda los productos scrapeados de una farmacia en la base de datos
 * @param query - El término de búsqueda usado para el scraping (ej: "ibuprofeno")
 */
async function guardarProductos(
  farmaciaId: number,
  productosScraped: ProductoScraped[],
  query: string = "ibuprofeno"
): Promise<{ guardados: number; errores: number }> {
  const db = await getDb();
  if (!db) throw new Error("Base de datos no disponible");

  let guardados = 0;
  let errores = 0;

  for (const prod of productosScraped) {
    try {
      const nombreNorm = normalizarNombre(prod.nombreEnFarmacia);
      // Usar el query de búsqueda como principio activo base, y complementar con extracción del nombre
      const principioActivoDelNombre = extraerPrincipioActivo(prod.nombreEnFarmacia);
      // Si el nombre contiene el query, usarlo; sino usar el query directamente (capitalizado)
      const queryCapitalizado = query.charAt(0).toUpperCase() + query.slice(1).toLowerCase();
      const principioActivo = principioActivoDelNombre !== "Ibuprofeno" 
        ? principioActivoDelNombre 
        : queryCapitalizado;

      // Buscar o crear el producto normalizado
      const productosExistentes = await db
        .select()
        .from(productos)
        .where(eq(productos.nombreNormalizado, nombreNorm))
        .limit(1);

      let productoId: number;

      if (productosExistentes.length > 0) {
        productoId = productosExistentes[0].id;
      } else {
        const inserted = await db.insert(productos).values({
          nombreNormalizado: nombreNorm,
          principioActivo,
          presentacion: prod.nombreEnFarmacia.substring(0, 150),
          categoria: "Medicamentos",
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        productoId = Number((inserted as any)[0]?.insertId ?? 0);
      }

      // Insertar el precio del día con los tres niveles de precio
      await db.insert(precios).values({
        productoId,
        farmaciaId,
        nombreEnFarmacia: prod.nombreEnFarmacia.substring(0, 300),
        urlProducto: prod.urlProducto.substring(0, 500),
        precioOriginal: prod.precioOriginal,
        precioEfectivo: prod.precioEfectivo,   // El precio más bajo disponible
        precioWeb: prod.precioWeb ?? prod.precioEfectivo, // Precio web con descuento general
        precioQr: prod.precioQr,               // Precio con Itaú QR Débito
        descripcionDescuentoQr: prod.descripcionDescuentoQr?.substring(0, 100) ?? null,
        porcentajeDescuento: prod.porcentajeDescuento,
        tienePromocion: prod.tienePromocion,
        disponible: true,
        fechaScraping: new Date(),
      });

      guardados++;
    } catch (err) {
      console.error(`Error guardando producto "${prod.nombreEnFarmacia}":`, err);
      errores++;
    }
  }

  return { guardados, errores };
}

/**
 * Ejecuta el scraping completo de una farmacia
 */
async function scrapearFarmacia(
  farmaciaId: number,
  farmaciaSlug: string,
  query: string
): Promise<ResultadoScraping> {
  const db = await getDb();
  if (!db) throw new Error("Base de datos no disponible");

  const inicio = Date.now();

  // Crear log de inicio
  const logResult = await db.insert(scrapingLogs).values({
    farmaciaId,
    estado: "en_progreso",
    productosEncontrados: 0,
    productosActualizados: 0,
    errores: 0,
    iniciadoEn: new Date(),
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logId = Number((logResult as any)[0]?.insertId ?? 0);

  try {
    // Ejecutar el scraper correspondiente
    let productosScraped: ProductoScraped[] = [];

    if (farmaciaSlug === "puntofarma") {
      productosScraped = await scrapearPuntoFarma(query);
    } else if (farmaciaSlug === "farmacenter") {
      productosScraped = await scrapearFarmacenter(query);
    } else {
      throw new Error(`Scraper no implementado para: ${farmaciaSlug}`);
    }

    // Guardar en base de datos (pasamos el query para asignarlo como principio activo)
    const { guardados, errores } = await guardarProductos(farmaciaId, productosScraped, query);

    // Actualizar log con éxito
    await db
      .update(scrapingLogs)
      .set({
        estado: "exitoso",
        productosEncontrados: productosScraped.length,
        productosActualizados: guardados,
        errores,
        finalizadoEn: new Date(),
      })
      .where(eq(scrapingLogs.id, logId));

    const duracionMs = Date.now() - inicio;
    return {
      farmacia: farmaciaSlug,
      productosEncontrados: productosScraped.length,
      productosGuardados: guardados,
      errores,
      duracionMs,
    };
  } catch (err) {
    const mensaje = err instanceof Error ? err.message : String(err);

    await db
      .update(scrapingLogs)
      .set({
        estado: "error",
        mensajeError: mensaje.substring(0, 1000),
        finalizadoEn: new Date(),
      })
      .where(eq(scrapingLogs.id, logId));

    throw err;
  }
}

/**
 * Función principal: ejecuta el scraping de todas las farmacias activas
 */
export async function ejecutarScrapingCompleto(
  query: string = "ibuprofeno"
): Promise<ResultadoScraping[]> {
  const db = await getDb();
  if (!db) throw new Error("Base de datos no disponible");

  console.log(`[Scraping] Iniciando scraping completo para "${query}"...`);

  // Obtener farmacias activas
  const farmaciasActivas = await db
    .select()
    .from(farmacias)
    .where(eq(farmacias.activa, true));

  if (farmaciasActivas.length === 0) {
    console.log("[Scraping] No hay farmacias activas configuradas");
    return [];
  }

  const resultados: ResultadoScraping[] = [];

  for (const farmacia of farmaciasActivas) {
    console.log(`[Scraping] Procesando ${farmacia.nombre}...`);
    try {
      const resultado = await scrapearFarmacia(farmacia.id, farmacia.slug, query);
      resultados.push(resultado);
      console.log(
        `[Scraping] ${farmacia.nombre}: ${resultado.productosGuardados} productos guardados`
      );
    } catch (err) {
      console.error(`[Scraping] Error en ${farmacia.nombre}:`, err);
      resultados.push({
        farmacia: farmacia.slug,
        productosEncontrados: 0,
        productosGuardados: 0,
        errores: 1,
        duracionMs: 0,
      });
    }

    // Pausa entre farmacias
    await new Promise((r) => setTimeout(r, 2000));
  }

  console.log("[Scraping] Scraping completo finalizado");
  return resultados;
}

/**
 * Inicializa las farmacias en la base de datos si no existen
 */
export async function inicializarFarmacias(): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const farmaciasData = [
    {
      nombre: "Punto Farma",
      slug: "puntofarma",
      urlBase: "https://www.puntofarma.com.py",
      urlBusqueda: "https://www.puntofarma.com.py/buscar?s={query}",
      color: "#EE0068",
      activa: true,
    },
    {
      nombre: "Farmacenter",
      slug: "farmacenter",
      urlBase: "https://www.farmacenter.com.py",
      urlBusqueda: "https://www.farmacenter.com.py/catalogo?q={query}",
      color: "#00A651",
      activa: true,
    },
  ];

  for (const f of farmaciasData) {
    const existente = await db
      .select()
      .from(farmacias)
      .where(eq(farmacias.slug, f.slug))
      .limit(1);

    if (existente.length === 0) {
      await db.insert(farmacias).values(f);
      console.log(`[Init] Farmacia "${f.nombre}" creada`);
    }
  }
}
