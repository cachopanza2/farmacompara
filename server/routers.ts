import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { eq, desc, like, and, gte, sql, or } from "drizzle-orm";
import { getDb } from "./db";
import { farmacias, productos, precios, scrapingLogs } from "../drizzle/schema";
import { ejecutarScrapingCompleto, inicializarFarmacias } from "./scrapers/index";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ── Farmacias ──────────────────────────────────────────────────────────────
  farmacias: router({
    listar: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(farmacias).where(eq(farmacias.activa, true));
    }),
  }),

  // ── Búsqueda de precios ────────────────────────────────────────────────────
  busqueda: router({
    buscarMedicamento: publicProcedure
      .input(
        z.object({
          query: z.string().min(2).max(100),
          soloPromocion: z.boolean().optional().default(false),
          ordenarPor: z
            .enum(["precio_asc", "precio_desc", "farmacia", "descuento"])
            .optional()
            .default("precio_asc"),
          limite: z.number().min(1).max(100).optional().default(50),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return { resultados: [], total: 0, ultimaActualizacion: null };

        const ultimoScraping = await db
          .select({ fecha: sql<Date>`MAX(${precios.fechaScraping})` })
          .from(precios);

        const fechaUltimo = ultimoScraping[0]?.fecha;
        if (!fechaUltimo) return { resultados: [], total: 0, ultimaActualizacion: null };

        const fechaLimite = new Date(fechaUltimo);
        fechaLimite.setHours(fechaLimite.getHours() - 48);

        // La búsqueda es flexible: busca en el nombre de la farmacia, nombre normalizado del producto
        // y en el principio activo. Usamos LOWER() explícitamente para garantizar case-insensitive.
        const queryLower = input.query.toLowerCase();
        const resultados = await db
          .select({
            precioId: precios.id,
            nombreEnFarmacia: precios.nombreEnFarmacia,
            urlProducto: precios.urlProducto,
            precioOriginal: precios.precioOriginal,
            precioEfectivo: precios.precioEfectivo,
            precioQr: precios.precioQr,
            porcentajeDescuento: precios.porcentajeDescuento,
            tienePromocion: precios.tienePromocion,
            fechaScraping: precios.fechaScraping,
            farmaciaId: farmacias.id,
            farmaciaNombre: farmacias.nombre,
            farmaciaSlug: farmacias.slug,
            farmaciaColor: farmacias.color,
            farmaciaUrlBase: farmacias.urlBase,
            productoId: productos.id,
            productoNombre: productos.nombreNormalizado,
            principioActivo: productos.principioActivo,
          })
          .from(precios)
          .innerJoin(farmacias, eq(precios.farmaciaId, farmacias.id))
          .innerJoin(productos, eq(precios.productoId, productos.id))
          .where(
            and(
              // Usar LOWER() explícitamente para búsqueda case-insensitive en todas las columnas
              sql`(
                LOWER(${precios.nombreEnFarmacia}) LIKE ${`%${queryLower}%`}
                OR LOWER(${productos.nombreNormalizado}) LIKE ${`%${queryLower}%`}
                OR LOWER(${productos.principioActivo}) LIKE ${`%${queryLower}%`}
              )`,
              eq(precios.disponible, true),
              gte(precios.fechaScraping, fechaLimite),
              input.soloPromocion ? eq(precios.tienePromocion, true) : undefined
            )
          )
          .orderBy(
            input.ordenarPor === "precio_asc"
              ? precios.precioEfectivo
              : input.ordenarPor === "precio_desc"
              ? desc(precios.precioEfectivo)
              : input.ordenarPor === "descuento"
              ? desc(precios.porcentajeDescuento)
              : farmacias.nombre
          )
          .limit(input.limite);

        return { resultados, total: resultados.length, ultimaActualizacion: fechaUltimo };
      }),

    historialPrecios: publicProcedure
      .input(
        z.object({
          productoId: z.number(),
          dias: z.number().min(1).max(90).optional().default(30),
        })
      )
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];

        const fechaLimite = new Date();
        fechaLimite.setDate(fechaLimite.getDate() - input.dias);

        return db
          .select({
            fecha: precios.fechaScraping,
            precioEfectivo: precios.precioEfectivo,
            precioOriginal: precios.precioOriginal,
            farmaciaNombre: farmacias.nombre,
            farmaciaColor: farmacias.color,
          })
          .from(precios)
          .innerJoin(farmacias, eq(precios.farmaciaId, farmacias.id))
          .where(
            and(
              eq(precios.productoId, input.productoId),
              gte(precios.fechaScraping, fechaLimite)
            )
          )
          .orderBy(precios.fechaScraping);
      }),
  }),

  // ── Scraping ───────────────────────────────────────────────────────────────
  scraping: router({
    ejecutar: publicProcedure
      .input(
        z.object({
          query: z.string().min(2).max(100).optional().default("ibuprofeno"),
          secretKey: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const SCRAPING_KEY = process.env.SCRAPING_SECRET_KEY ?? "farmacompara-scraping-2024";
        if (input.secretKey !== SCRAPING_KEY) {
          throw new Error("Clave de scraping inválida");
        }
        await inicializarFarmacias();
        const resultados = await ejecutarScrapingCompleto(input.query);
        return { success: true, resultados };
      }),

    ejecutarInterno: publicProcedure.mutation(async () => {
      await inicializarFarmacias();
      const resultados = await ejecutarScrapingCompleto("ibuprofeno");
      return { success: true, resultados };
    }),

    limpiarDuplicados: publicProcedure
      .input(z.object({ secretKey: z.string().optional() }))
      .mutation(async ({ input }) => {
        const SCRAPING_KEY = process.env.SCRAPING_SECRET_KEY ?? "farmacompara-scraping-2024";
        if (input.secretKey !== SCRAPING_KEY) throw new Error("Clave inválida");
        const db = await getDb();
        if (!db) throw new Error("BD no disponible");
        // Eliminar duplicados: mantener solo el más reciente por (productoId, farmaciaId, fecha)
        const resultado = await db.execute(
          sql`DELETE p1 FROM precios p1
              INNER JOIN precios p2
              WHERE p1.id < p2.id
              AND p1.producto_id = p2.producto_id
              AND p1.farmacia_id = p2.farmacia_id
              AND DATE(p1.fecha_scraping) = DATE(p2.fecha_scraping)`
        );
        return { success: true, eliminados: resultado };
      }),

    estado: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { logs: [], stats: null, totalProductos: 0, farmacias: [] };

      const logs = await db
        .select({
          id: scrapingLogs.id,
          estado: scrapingLogs.estado,
          productosEncontrados: scrapingLogs.productosEncontrados,
          productosActualizados: scrapingLogs.productosActualizados,
          errores: scrapingLogs.errores,
          mensajeError: scrapingLogs.mensajeError,
          iniciadoEn: scrapingLogs.iniciadoEn,
          finalizadoEn: scrapingLogs.finalizadoEn,
          farmaciaNombre: farmacias.nombre,
          farmaciaSlug: farmacias.slug,
        })
        .from(scrapingLogs)
        .innerJoin(farmacias, eq(scrapingLogs.farmaciaId, farmacias.id))
        .orderBy(desc(scrapingLogs.iniciadoEn))
        .limit(20);

      const stats = await db
        .select({
          totalPrecios: sql<number>`COUNT(*)`,
          ultimaActualizacion: sql<Date>`MAX(${precios.fechaScraping})`,
        })
        .from(precios);

      const totalProductos = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(productos);

      const farmaciasActivas = await db
        .select()
        .from(farmacias)
        .where(eq(farmacias.activa, true));

      return {
        logs,
        stats: stats[0] ?? null,
        totalProductos: totalProductos[0]?.count ?? 0,
        farmacias: farmaciasActivas,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
