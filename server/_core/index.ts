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

// ── Cron: scraping diario a las 02:00 AM (Paraguay, GMT-4 = UTC-4) ──────────
function programarScrapingDiario() {
  const MEDICAMENTOS_INICIALES = ["ibuprofeno", "paracetamol", "amoxicilina", "omeprazol"];

  function calcularMsHastaProximas2AM(): number {
    const ahora = new Date();
    // Paraguay es UTC-4
    const ahoraParaguay = new Date(ahora.getTime() - 4 * 60 * 60 * 1000);
    const proximas2AM = new Date(ahoraParaguay);
    proximas2AM.setHours(2, 0, 0, 0);
    if (proximas2AM <= ahoraParaguay) {
      proximas2AM.setDate(proximas2AM.getDate() + 1);
    }
    return proximas2AM.getTime() - ahoraParaguay.getTime();
  }

  async function ejecutarScraping() {
    console.log("[Cron] Iniciando scraping diario automático...");
    try {
      await inicializarFarmacias();
      for (const med of MEDICAMENTOS_INICIALES) {
        console.log(`[Cron] Scrapeando: ${med}`);
        await ejecutarScrapingCompleto(med);
        await new Promise(r => setTimeout(r, 3000));
      }
      console.log("[Cron] Scraping diario completado.");
    } catch (err) {
      console.error("[Cron] Error en scraping diario:", err);
    }
    // Programar el siguiente
    setTimeout(ejecutarScraping, calcularMsHastaProximas2AM());
  }

  const msHasta2AM = calcularMsHastaProximas2AM();
  const horas = Math.floor(msHasta2AM / 3600000);
  const minutos = Math.floor((msHasta2AM % 3600000) / 60000);
  console.log(`[Cron] Próximo scraping en ${horas}h ${minutos}min (02:00 AM Paraguay)`);
  setTimeout(ejecutarScraping, msHasta2AM);
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
