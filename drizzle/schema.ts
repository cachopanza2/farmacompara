import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

// ── Tabla de usuarios (requerida por el template) ──────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ── Farmacias ──────────────────────────────────────────────────────────────
export const farmacias = mysqlTable("farmacias", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 50 }).notNull().unique(),
  urlBase: varchar("url_base", { length: 255 }).notNull(),
  urlBusqueda: varchar("url_busqueda", { length: 255 }).notNull(),
  color: varchar("color", { length: 20 }).default("#1B3A6B").notNull(),
  activa: boolean("activa").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Farmacia = typeof farmacias.$inferSelect;

// ── Productos normalizados ─────────────────────────────────────────────────
export const productos = mysqlTable(
  "productos",
  {
    id: int("id").autoincrement().primaryKey(),
    nombreNormalizado: varchar("nombre_normalizado", { length: 300 }).notNull(),
    principioActivo: varchar("principio_activo", { length: 150 }),
    presentacion: varchar("presentacion", { length: 150 }),
    categoria: varchar("categoria", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [index("idx_nombre").on(t.nombreNormalizado)]
);

export type Producto = typeof productos.$inferSelect;

// ── Precios por farmacia (snapshot diario) ─────────────────────────────────
export const precios = mysqlTable(
  "precios",
  {
    id: int("id").autoincrement().primaryKey(),
    productoId: int("producto_id")
      .notNull()
      .references(() => productos.id),
    farmaciaId: int("farmacia_id")
      .notNull()
      .references(() => farmacias.id),
    nombreEnFarmacia: varchar("nombre_en_farmacia", { length: 300 }).notNull(),
    urlProducto: varchar("url_producto", { length: 500 }).notNull(),
    precioOriginal: int("precio_original"),      // Precio de lista (sin descuento)
    precioEfectivo: int("precio_efectivo").notNull(), // Precio web (con descuento general)
    precioWeb: int("precio_web"),                  // Precio exclusivo web (alias explícito)
    precioQr: int("precio_qr"),                    // Precio con tarjeta Itaú QR Débito
    descripcionDescuentoQr: varchar("descripcion_descuento_qr", { length: 100 }), // Ej: "Itaú QR Débito"
    porcentajeDescuento: int("porcentaje_descuento"),
    tienePromocion: boolean("tiene_promocion").default(false).notNull(),
    disponible: boolean("disponible").default(true).notNull(),
    fechaScraping: timestamp("fecha_scraping").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("idx_producto_farmacia").on(t.productoId, t.farmaciaId),
    index("idx_fecha_scraping").on(t.fechaScraping),
    index("idx_farmacia").on(t.farmaciaId),
  ]
);

export type Precio = typeof precios.$inferSelect;
export type InsertPrecio = typeof precios.$inferInsert;

// ── Log de scraping ────────────────────────────────────────────────────────
export const scrapingLogs = mysqlTable("scraping_logs", {
  id: int("id").autoincrement().primaryKey(),
  farmaciaId: int("farmacia_id")
    .notNull()
    .references(() => farmacias.id),
  estado: mysqlEnum("estado", ["exitoso", "error", "en_progreso", "pendiente"])
    .default("pendiente")
    .notNull(),
  productosEncontrados: int("productos_encontrados").default(0).notNull(),
  productosActualizados: int("productos_actualizados").default(0).notNull(),
  errores: int("errores").default(0).notNull(),
  mensajeError: text("mensaje_error"),
  iniciadoEn: timestamp("iniciado_en").defaultNow().notNull(),
  finalizadoEn: timestamp("finalizado_en"),
});

export type ScrapingLog = typeof scrapingLogs.$inferSelect;
export type InsertScrapingLog = typeof scrapingLogs.$inferInsert;