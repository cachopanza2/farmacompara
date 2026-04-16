/*
 * FarmaCompara — Página de Detalle de Producto
 * Diseño: Clínico Moderno | Vista detallada con historial de precios
 */
import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, ExternalLink, Tag, Clock, TrendingDown, AlertCircle } from "lucide-react";
import { formatGs, formatFecha, cn } from "@/lib/utils";
import { PRODUCTOS_MOCK } from "@/lib/mockData";
import type { ProductoResumen, PrecioEnFarmacia } from "@/types";

const FARMACIA_COLORS: Record<string, string> = {
  punto_farma: "#1B3A6B",
  farmacenter: "#059669",
  biggie_farma: "#7C3AED",
  san_roque: "#DC2626",
};

export default function Producto() {
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [producto, setProducto] = useState<ProductoResumen | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const found = PRODUCTOS_MOCK.find((p) => p.id === id) ?? null;
      setProducto(found);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-[#1B3A6B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Cargando producto...</p>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h2 className="font-['Sora'] text-lg font-semibold text-gray-900 mb-2">Producto no encontrado</h2>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-[#1B3A6B] hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const preciosDisponibles = producto.precios.filter((p) => p.disponible);
  const preciosOrdenados = [...preciosDisponibles].sort((a, b) => a.precio_efectivo - b.precio_efectivo);
  const precioMax = Math.max(...preciosDisponibles.map((p) => p.precio_efectivo));
  const ahorroMax = precioMax - (producto.precio_minimo ?? precioMax);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B3A6B] py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <button
            onClick={() => navigate(-1 as any)}
            className="flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors text-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </button>
          <div>
            <h1 className="font-['Sora'] text-xl sm:text-2xl font-bold text-white leading-tight">
              {producto.nombre_normalizado}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {producto.principio_activo && (
                <span className="text-blue-200 text-sm">{producto.principio_activo}</span>
              )}
              {producto.categoria && (
                <span className="bg-white/15 text-white text-xs px-2.5 py-0.5 rounded-full">
                  {producto.categoria}
                </span>
              )}
              {producto.presentacion && (
                <span className="text-blue-300 text-xs">{producto.presentacion}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Price comparison */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-['Sora'] text-base font-semibold text-gray-900">
                  Precios por farmacia
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {preciosDisponibles.length} farmacia{preciosDisponibles.length !== 1 ? "s" : ""} con disponibilidad
                </p>
              </div>

              <div className="divide-y divide-gray-50">
                {preciosOrdenados.map((precio, idx) => (
                  <PrecioDetalle key={precio.farmacia.id} precio={precio} esMejor={idx === 0} />
                ))}
              </div>

              {/* No disponibles */}
              {producto.precios.filter((p) => !p.disponible).map((precio) => (
                <div
                  key={precio.farmacia.id}
                  className="flex items-center justify-between px-5 py-3 bg-gray-50/50 border-t border-gray-100"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    <span className="text-sm text-gray-400">{precio.farmacia.nombre}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Sin stock</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Price bar chart */}
            {preciosDisponibles.length > 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-['Sora'] text-base font-semibold text-gray-900 mb-4">
                  Comparativa visual
                </h2>
                <div className="space-y-3">
                  {preciosOrdenados.map((precio, idx) => {
                    const pct = precioMax > 0 ? (precio.precio_efectivo / precioMax) * 100 : 100;
                    const color = FARMACIA_COLORS[precio.farmacia.slug] ?? "#6B7280";
                    const esMejor = idx === 0;
                    return (
                      <div key={precio.farmacia.id} className="flex items-center gap-3">
                        <div className="w-28 shrink-0 text-sm text-gray-600 truncate">{precio.farmacia.nombre}</div>
                        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{ width: `${pct}%`, backgroundColor: esMejor ? "#10B981" : color }}
                          />
                        </div>
                        <div className={cn("text-sm font-semibold shrink-0 w-32 text-right price-tag", esMejor ? "text-[#10B981]" : "text-gray-700")}>
                          {formatGs(precio.precio_efectivo)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Best price card */}
            {producto.precio_minimo && (
              <div className="bg-gradient-to-br from-[#1B3A6B] to-[#162f58] rounded-2xl p-5 text-white">
                <div className="text-xs font-medium text-blue-200 uppercase tracking-wider mb-2">Mejor precio</div>
                <div className="price-tag text-3xl text-[#10B981] mb-1">
                  {formatGs(producto.precio_minimo)}
                </div>
                <div className="text-sm text-blue-200 mb-4">en {producto.farmacia_precio_minimo}</div>
                {ahorroMax > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-white/10 rounded-lg px-3 py-2">
                    <TrendingDown className="h-3.5 w-3.5" />
                    Ahorrás {formatGs(ahorroMax)} vs. el más caro
                  </div>
                )}
              </div>
            )}

            {/* Info card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-['Sora'] text-sm font-semibold text-gray-900 mb-3">Información</h3>
              <dl className="space-y-2 text-sm">
                {producto.principio_activo && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Principio activo</dt>
                    <dd className="font-medium text-gray-900">{producto.principio_activo}</dd>
                  </div>
                )}
                {producto.presentacion && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Presentación</dt>
                    <dd className="font-medium text-gray-900">{producto.presentacion}</dd>
                  </div>
                )}
                {producto.categoria && (
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Categoría</dt>
                    <dd className="font-medium text-gray-900">{producto.categoria}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-gray-500">Farmacias</dt>
                  <dd className="font-medium text-gray-900">{preciosDisponibles.length} disponibles</dd>
                </div>
              </dl>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs text-amber-700 leading-relaxed">
                Los precios son referenciales y se actualizan diariamente. Verificá el precio final en el sitio de cada farmacia antes de comprar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrecioDetalle({ precio, esMejor }: { precio: PrecioEnFarmacia; esMejor: boolean }) {
  const color = FARMACIA_COLORS[precio.farmacia.slug] ?? "#6B7280";
  return (
    <div className={cn("flex items-center justify-between gap-4 px-5 py-4", esMejor && "bg-emerald-50/40")}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{precio.farmacia.nombre}</span>
            {esMejor && <span className="badge-best">★ Mejor precio</span>}
            {precio.tiene_promocion && (
              <span className="badge-promo">
                <Tag className="h-2.5 w-2.5" />
                {precio.porcentaje_descuento ? `−${precio.porcentaje_descuento}%` : "Promo"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
            <Clock className="h-3 w-3" />
            Actualizado: {formatFecha(precio.fecha_scraping)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className={cn("price-tag text-lg", esMejor ? "text-[#10B981]" : "text-gray-900")}>
            {formatGs(precio.precio_efectivo)}
          </div>
          {precio.tiene_promocion && precio.precio_actual && (
            <div className="text-xs text-gray-400 line-through">{formatGs(precio.precio_actual)}</div>
          )}
        </div>
        <a
          href={precio.url_producto}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-xl bg-[#1B3A6B] px-4 py-2 text-sm font-medium text-white hover:bg-[#162f58] transition-colors"
        >
          Ir a la farmacia
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
