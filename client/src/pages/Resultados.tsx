import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import {
  Search,
  ExternalLink,
  TrendingDown,
  ChevronLeft,
  Pill,
  AlertCircle,
  Loader2,
  Tag,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OrdenarPor = "precio_asc" | "precio_desc" | "farmacia" | "descuento";

function formatGs(n: number): string {
  return "Gs. " + n.toLocaleString("es-PY");
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "hace menos de 1 hora";
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days > 1 ? "s" : ""}`;
}

export default function Resultados() {
  const [, navigate] = useLocation();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const queryParam = params.get("q") ?? "";

  const [inputQuery, setInputQuery] = useState(queryParam);
  const [ordenarPor, setOrdenarPor] = useState<OrdenarPor>("precio_asc");
  const [soloPromocion, setSoloPromocion] = useState(false);

  const { data, isLoading, error } = trpc.busqueda.buscarMedicamento.useQuery(
    { query: queryParam, ordenarPor, soloPromocion, limite: 50 },
    { enabled: queryParam.length >= 2 }
  );

  function handleSearch() {
    if (inputQuery.trim().length < 2) return;
    navigate(`/resultados?q=${encodeURIComponent(inputQuery.trim())}`);
  }

  const resultados = data?.resultados ?? [];
  const precioMinimo =
    resultados.length > 0 ? Math.min(...resultados.map((r) => r.precioEfectivo)) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-['DM_Sans']">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-[#1B3A6B] flex items-center justify-center">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <span className="font-['Sora'] font-bold text-[#1B3A6B] text-lg hidden sm:block">
              Farma<span className="text-[#10B981]">Compara</span>
            </span>
          </a>
          <div className="flex-1 flex gap-2">
            <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <Input
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscar medicamento..."
                className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-sm p-0 h-auto"
              />
            </div>
            <Button
              onClick={handleSearch}
              size="sm"
              className="bg-[#1B3A6B] hover:bg-[#162f58] text-white rounded-xl"
            >
              Buscar
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button
            onClick={() => navigate("/")}
            className="hover:text-[#1B3A6B] flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Inicio
          </button>
          <span>/</span>
          <span className="text-gray-800 font-medium">"{queryParam}"</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-['Sora'] text-xl sm:text-2xl font-bold text-gray-900">
              Resultados para "{queryParam}"
            </h1>
            {data && (
              <p className="text-sm text-gray-500 mt-1">
                {data.total} resultado{data.total !== 1 ? "s" : ""}
                {data.ultimaActualizacion && (
                  <span className="ml-2 text-gray-400">
                    · Actualizado {timeAgo(data.ultimaActualizacion)}
                  </span>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setSoloPromocion(!soloPromocion)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                soloPromocion
                  ? "bg-[#10B981] text-white border-[#10B981]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
              }`}
            >
              <Tag className="h-3.5 w-3.5" />
              Solo ofertas
            </button>
            <Select value={ordenarPor} onValueChange={(v) => setOrdenarPor(v as OrdenarPor)}>
              <SelectTrigger className="w-44 h-9 text-sm bg-white border-gray-200">
                <ArrowUpDown className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="precio_asc">Menor precio</SelectItem>
                <SelectItem value="precio_desc">Mayor precio</SelectItem>
                <SelectItem value="descuento">Mayor descuento</SelectItem>
                <SelectItem value="farmacia">Por farmacia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-[#1B3A6B]" />
            <p className="text-gray-500">Buscando precios en farmacias...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <p className="text-gray-600 font-medium">Error al buscar precios</p>
            <p className="text-sm text-gray-400">{error.message}</p>
          </div>
        )}

        {!isLoading && !error && resultados.length === 0 && queryParam.length >= 2 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-gray-700 font-semibold text-lg">
                Sin resultados para "{queryParam}"
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Los precios aún no han sido actualizados. Ejecutá el scraping desde el panel de
                administración.
              </p>
            </div>
          </div>
        )}

        {!isLoading && resultados.length > 0 && (
          <>
            {precioMinimo !== null && (
              <div className="bg-gradient-to-r from-[#10B981]/10 to-emerald-50 border border-[#10B981]/30 rounded-2xl p-4 mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#10B981] flex items-center justify-center shrink-0">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Precio más bajo encontrado</p>
                  <p className="text-xl font-bold text-[#10B981]">{formatGs(precioMinimo)}</p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resultados.map((r) => {
                const esMenorPrecio = r.precioEfectivo === precioMinimo;
                const ahorro =
                  r.precioOriginal && r.precioOriginal > r.precioEfectivo
                    ? r.precioOriginal - r.precioEfectivo
                    : null;

                return (
                  <div
                    key={r.precioId}
                    className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                      esMenorPrecio
                        ? "border-[#10B981] ring-1 ring-[#10B981]/30"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="h-1.5 w-full" style={{ backgroundColor: r.farmaciaColor }} />
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {esMenorPrecio && (
                            <Badge className="bg-[#10B981] text-white text-xs px-2 py-0.5">
                              Mejor precio
                            </Badge>
                          )}
                          {r.tienePromocion && r.porcentajeDescuento && (
                            <Badge
                              variant="outline"
                              className="border-orange-300 text-orange-600 text-xs px-2 py-0.5"
                            >
                              -{r.porcentajeDescuento}% OFF
                            </Badge>
                          )}
                        </div>
                        <div
                          className="text-xs font-semibold px-2 py-1 rounded-lg text-white shrink-0"
                          style={{ backgroundColor: r.farmaciaColor }}
                        >
                          {r.farmaciaNombre}
                        </div>
                      </div>

                      <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-3 line-clamp-2">
                        {r.nombreEnFarmacia}
                      </h3>

                      <div className="mb-3">
                        {r.precioOriginal && r.precioOriginal > r.precioEfectivo && (
                          <p className="text-xs text-gray-400 line-through">
                            {formatGs(r.precioOriginal)}
                          </p>
                        )}
                        <p className="text-2xl font-bold text-gray-900">
                          {formatGs(r.precioEfectivo)}
                        </p>
                        {r.precioQr && r.precioQr < r.precioEfectivo && (
                          <p className="text-xs text-blue-600 font-medium mt-0.5">
                            {formatGs(r.precioQr)} con QR/débito
                          </p>
                        )}
                        {ahorro && (
                          <p className="text-xs text-[#10B981] font-medium mt-0.5">
                            Ahorrás {formatGs(ahorro)}
                          </p>
                        )}
                      </div>

                      <a
                        href={r.urlProducto}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity text-white"
                        style={{ backgroundColor: r.farmaciaColor }}
                      >
                        Ver en {r.farmaciaNombre}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <p className="text-xs text-gray-400 text-center mt-2">
                        {timeAgo(r.fechaScraping)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
