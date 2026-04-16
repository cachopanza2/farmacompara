/*
 * FarmaCompara — ResultadoCard
 * Diseño: Clínico Moderno | Tarjeta de producto con comparación de precios
 */
import { ExternalLink, Tag, Clock, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { formatGs, formatFecha, cn } from "@/lib/utils";
import type { ProductoResumen, PrecioEnFarmacia } from "@/types";

const FARMACIA_COLORS: Record<string, string> = {
  punto_farma: "#1B3A6B",
  farmacenter: "#059669",
  biggie_farma: "#7C3AED",
  san_roque: "#DC2626",
};

export default function ResultadoCard({ producto }: { producto: ProductoResumen }) {
  const [expanded, setExpanded] = useState(false);
  const preciosDisponibles = producto.precios.filter((p) => p.disponible);
  const precioMinimo = producto.precio_minimo;
  const precioMax = Math.max(...preciosDisponibles.map((p) => p.precio_efectivo));
  const ahorroMax = precioMax - (precioMinimo ?? precioMax);

  return (
    <article className="pharmacy-card rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header del producto */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href={`/producto/${producto.id}`}
              className="font-['Sora'] text-base font-semibold text-gray-900 hover:text-[#1B3A6B] transition-colors line-clamp-2"
            >
              {producto.nombre_normalizado}
            </Link>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {producto.principio_activo && (
                <span className="text-xs text-gray-500">{producto.principio_activo}</span>
              )}
              {producto.categoria && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#1B3A6B]">
                  {producto.categoria}
                </span>
              )}
              {producto.presentacion && (
                <span className="text-xs text-gray-400">{producto.presentacion}</span>
              )}
            </div>
          </div>

          {/* Precio mínimo destacado */}
          {precioMinimo && (
            <div className="shrink-0 text-right">
              <div className="text-xs text-gray-500 mb-0.5">Mejor precio</div>
              <div className="price-tag text-xl text-[#10B981]">
                {formatGs(precioMinimo)}
              </div>
              {producto.farmacia_precio_minimo && (
                <div className="text-xs text-gray-400 mt-0.5">{producto.farmacia_precio_minimo}</div>
              )}
            </div>
          )}
        </div>

        {/* Ahorro máximo */}
        {ahorroMax > 0 && (
          <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-1.5 w-fit">
            <TrendingDown className="h-3.5 w-3.5" />
            <span className="font-medium">Ahorrás hasta {formatGs(ahorroMax)} comparando farmacias</span>
          </div>
        )}
      </div>

      {/* Barra de precios visual */}
      {preciosDisponibles.length > 1 && (
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-gray-500">Comparativa de precios</span>
          </div>
          <div className="space-y-1.5">
            {preciosDisponibles
              .sort((a, b) => a.precio_efectivo - b.precio_efectivo)
              .map((precio, idx) => {
                const pct = precioMax > 0 ? (precio.precio_efectivo / precioMax) * 100 : 100;
                const color = FARMACIA_COLORS[precio.farmacia.slug] ?? "#6B7280";
                const esMejor = idx === 0;
                return (
                  <div key={precio.farmacia.id} className="flex items-center gap-2">
                    <div className="w-24 shrink-0 text-xs text-gray-600 truncate">{precio.farmacia.nombre}</div>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: esMejor ? "#10B981" : color }}
                      />
                    </div>
                    <div className={cn("text-xs font-semibold shrink-0 w-28 text-right", esMejor ? "text-[#10B981]" : "text-gray-700")}>
                      {formatGs(precio.precio_efectivo)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Lista de precios por farmacia */}
      <div>
        {(expanded ? preciosDisponibles : preciosDisponibles.slice(0, 2))
          .sort((a, b) => a.precio_efectivo - b.precio_efectivo)
          .map((precio, idx) => (
            <PrecioRow key={precio.farmacia.id} precio={precio} esMejor={idx === 0} />
          ))}

        {preciosDisponibles.length > 2 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-[#1B3A6B] hover:bg-blue-50 transition-colors border-t border-gray-100"
          >
            {expanded ? (
              <>Ver menos <ChevronUp className="h-3.5 w-3.5" /></>
            ) : (
              <>Ver {preciosDisponibles.length - 2} farmacia{preciosDisponibles.length - 2 > 1 ? "s" : ""} más <ChevronDown className="h-3.5 w-3.5" /></>
            )}
          </button>
        )}
      </div>
    </article>
  );
}

function PrecioRow({ precio, esMejor }: { precio: PrecioEnFarmacia; esMejor: boolean }) {
  const color = FARMACIA_COLORS[precio.farmacia.slug] ?? "#6B7280";
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-50 last:border-0",
        esMejor && "bg-emerald-50/40"
      )}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Farmacia color dot */}
        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-medium text-gray-800 truncate">{precio.farmacia.nombre}</span>
            {esMejor && <span className="badge-best">★ Mejor precio</span>}
            {precio.tiene_promocion && (
              <span className="badge-promo">
                <Tag className="h-2.5 w-2.5" />
                {precio.porcentaje_descuento ? `−${precio.porcentaje_descuento}%` : "Promo"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
            <Clock className="h-3 w-3" />
            {formatFecha(precio.fecha_scraping)}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className={cn("price-tag text-base", esMejor ? "text-[#10B981]" : "text-gray-900")}>
            {formatGs(precio.precio_efectivo)}
          </div>
          {precio.tiene_promocion && precio.precio_actual && (
            <div className="text-xs text-gray-400 line-through">
              {formatGs(precio.precio_actual)}
            </div>
          )}
        </div>
        <a
          href={precio.url_producto}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 rounded-lg bg-[#1B3A6B] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#162f58] transition-colors"
        >
          Ir
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
