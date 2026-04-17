import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("busqueda.buscarMedicamento", () => {
  it("rechaza queries menores a 2 caracteres", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.busqueda.buscarMedicamento({ query: "a", soloPromocion: false, ordenarPor: "precio_asc", limite: 10 })
    ).rejects.toThrow();
  });

  it("acepta query válida y retorna estructura correcta", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.busqueda.buscarMedicamento({
      query: "ibuprofeno",
      soloPromocion: false,
      ordenarPor: "precio_asc",
      limite: 10,
    });
    expect(result).toHaveProperty("resultados");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.resultados)).toBe(true);
  });
});

describe("scraping.estado", () => {
  it("retorna estructura correcta del estado del sistema", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.scraping.estado();
    expect(result).toHaveProperty("logs");
    expect(result).toHaveProperty("farmacias");
    expect(result).toHaveProperty("totalProductos");
    expect(Array.isArray(result.logs)).toBe(true);
    expect(Array.isArray(result.farmacias)).toBe(true);
  });
});

describe("scraping.ejecutar", () => {
  it("rechaza clave de scraping inválida", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    await expect(
      caller.scraping.ejecutar({ query: "ibuprofeno", secretKey: "clave-incorrecta" })
    ).rejects.toThrow("Clave de scraping inválida");
  });
});

describe("farmacias.listar", () => {
  it("retorna un array de farmacias", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.farmacias.listar();
    expect(Array.isArray(result)).toBe(true);
  });
});
