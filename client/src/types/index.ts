export interface Farmacia {
  id: number;
  nombre: string;
  slug: string;
  logo_url: string | null;
  color?: string; // Color de marca para UI
}

export interface PrecioEnFarmacia {
  farmacia: Farmacia;
  precio_actual: number;
  precio_anterior: number | null;
  precio_promocional: number | null;
  porcentaje_descuento: number | null;
  precio_efectivo: number;
  tiene_promocion: boolean;
  url_producto: string;
  imagen_url: string | null;
  disponible: boolean;
  fecha_scraping: string;
}

export interface ProductoResumen {
  id: number;
  nombre_normalizado: string;
  principio_activo: string | null;
  presentacion: string | null;
  categoria: string | null;
  precios: PrecioEnFarmacia[];
  precio_minimo: number | null;
  farmacia_precio_minimo: string | null;
  ahorro_maximo: number | null;
}

export interface HistorialPrecio {
  farmacia_id: number;
  precio: number;
  precio_promocional: number | null;
  fecha: string;
}

export interface ProductoDetalle extends ProductoResumen {
  historial: HistorialPrecio[];
}

export interface BusquedaResponse {
  total: number;
  page: number;
  page_size: number;
  resultados: ProductoResumen[];
}

export interface StatusScraping {
  farmacia: string;
  ultimo_scraping: string | null;
  productos_indexados: number;
  estado: string;
  errores: number;
}

export type OrdenBusqueda = "precio" | "nombre" | "farmacia";

// Mock data types for MVP demo
export interface MockProducto extends ProductoResumen {}
