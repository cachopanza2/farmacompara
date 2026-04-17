import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ejecutarScrapingCompleto, inicializarFarmacias } from "../scrapers/index";
import { notifyOwner } from "./notification";

// ── Cron: scraping diario a las 07:00 AM (Paraguay, UTC-4 = 11:00 UTC) ─────
const MEDICAMENTOS_INICIALES = ["ibuprofeno", "paracetamol", "amoxicilina", "omeprazol"];

function calcularMsHastaProximas7AM(): number {
  const ahora = new Date();
  // Paraguay es UTC-4: restamos 4h para obtener la hora local
  const ahoraParaguay = new Date(ahora.getTime() - 4 * 60 * 60 * 1000);
  const proximas7AM = new Date(ahoraParaguay);
  proximas7AM.setHours(7, 0, 0, 0);
  if (proximas7AM <= ahoraParaguay) {
    proximas7AM.setDate(proximas7AM.getDate() + 1);
  }
  return proximas7AM.getTime() - ahoraParaguay.getTime();
}

function programarScrapingDiario() {
  async function ejecutarScraping() {
    const inicio = new Date();
    console.log(`[Cron] ===== Scraping diario automático iniciado: ${inicio.toISOString()} =====`);
    const resumen: string[] = [];
    let totalProductos = 0;
    let errores = 0;

    try {
      await inicializarFarmacias();
      for (const med of MEDICAMENTOS_INICIALES) {
        console.log(`[Cron] Scrapeando: ${med}`);
        try {
          const resultados = await ejecutarScrapingCompleto(med);
          const count = resultados.reduce((sum, r) => sum + r.productosGuardados, 0);
          totalProductos += count;
          resumen.push(`✅ ${med}: ${count} productos`);
        } catch (err) {
          errores++;
          resumen.push(`❌ ${med}: error - ${err instanceof Error ? err.message : String(err)}`);
          console.error(`[Cron] Error scrapeando ${med}:`, err);
        }
        // Pausa entre medicamentos para no sobrecargar los sitios
        await new Promise(r => setTimeout(r, 5000));
      }

      const duracionSeg = Math.round((Date.now() - inicio.getTime()) / 1000);
      const fechaParaguay = new Date(inicio.getTime() - 4 * 60 * 60 * 1000);
      const fechaStr = fechaParaguay.toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const horaStr = fechaParaguay.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' });

      const notifTitle = `FarmaCompara — Actualización diaria ${fechaStr}`;
      const notifContent = [
        `Scraping automático completado a las ${horaStr} (hora Paraguay).`,
        ``,
        `**Resumen:**`,
        ...resumen,
        ``,
        `**Total:** ${totalProductos} precios actualizados en ${duracionSeg}s`,
        errores > 0 ? `⚠️ ${errores} medicamento(s) con error.` : `Sin errores.`,
      ].join('\n');

      console.log(`[Cron] ===== Completado: ${totalProductos} productos, ${duracionSeg}s =====`);

      // Notificar al owner
      try {
        await notifyOwner({ title: notifTitle, content: notifContent });
        console.log('[Cron] Notificación enviada al owner.');
      } catch (notifErr) {
        console.warn('[Cron] No se pudo enviar notificación:', notifErr);
      }
    } catch (err) {
      console.error('[Cron] Error crítico en scraping diario:', err);
    }

    // Programar el siguiente ciclo
    const msHastaSiguiente = calcularMsHastaProximas7AM();
    const horas = Math.floor(msHastaSiguiente / 3600000);
    const minutos = Math.floor((msHastaSiguiente % 3600000) / 60000);
    console.log(`[Cron] Próximo scraping en ${horas}h ${minutos}min (07:00 AM Paraguay)`);
    setTimeout(ejecutarScraping, msHastaSiguiente);
  }

  const msHasta7AM = calcularMsHastaProximas7AM();
  const horas = Math.floor(msHasta7AM / 3600000);
  const minutos = Math.floor((msHasta7AM % 3600000) / 60000);
  console.log(`[Cron] Próximo scraping en ${horas}h ${minutos}min (07:00 AM Paraguay)`);
  setTimeout(ejecutarScraping, msHasta7AM);
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Inicializar farmacias y programar scraping diario
    inicializarFarmacias()
      .then(() => programarScrapingDiario())
      .catch(err => console.error("[Init] Error al inicializar farmacias:", err));
  });
}

startServer().catch(console.error);
