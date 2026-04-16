/*
 * FarmaCompara — Página de Resultados
 * Diseño: Clínico Moderno | Lista de resultados con filtros
 */
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, SearchX, Loader2 } from "lucide-react";
import SearchBox from "@/components/ui/SearchBox";
import ResultadoCard from "@/components/ui/ResultadoCard";
import FiltrosBar from "@/components/ui/FiltrosBar";
import { buscarEnMock } from "@/lib/mockData";
import type { ProductoResumen, OrdenBusqueda } from "@/types";

export default function Resultados() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const queryParam = params.get("q") ?? "";

  const [query, setQuery] = useState(queryParam);
  const [isLoading, setIsLoading] = useState(true);
  const [resultados, setResultados] = useState<ProductoResumen[]>([]);
  const [orden, setOrden] = useState<OrdenBusqueda>("precio");
  const [soloPromocion, setSoloPromocion] = useState(false);
  const [farmaciaId, setFarmaciaId] = useState<number | undefined>();

  // Simulate API call
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const results = buscarEnMock(queryParam);
      setResultados(results);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [queryParam]);

  // Filter and sort
  const resultadosFiltrados = useMemo(() => {
    let filtered = [...resultados];

    if (soloPromocion) {
      filtered = filtered.filter((p) =>
        p.precios.some((pr) => pr.tiene_promocion && pr.disponible)
      );
    }

    if (farmaciaId) {
      filtered = filtered.filter((p) =>
        p.precios.some((pr) => pr.farmacia.id === farmaciaId && pr.disponible)
      );
    }

    switch (orden) {
      case "precio":
        filtered.sort((a, b) => (a.precio_minimo ?? Infinity) - (b.precio_minimo ?? Infinity));
        break;
      case "nombre":
        filtered.sort((a, b) => a.nombre_normalizado.localeCompare(b.nombre_normalizado));
        break;
      case "farmacia":
        filtered.sort((a, b) =>
          (a.farmacia_precio_minimo ?? "").localeCompare(b.farmacia_precio_minimo ?? "")
        );
        break;
    }

    return filtered;
  }, [resultados, orden, soloPromocion, farmaciaId]);

  function handleNewSearch(newQuery: string) {
    navigate(`/resultados?q=${encodeURIComponent(newQuery)}`);
    setQuery(newQuery);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search header */}
      <div className="bg-[#1B3A6B] py-6">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-blue-200 hover:text-white transition-colors text-sm mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>
          <div className="max-w-2xl">
            <SearchBox
              size="lg"
              defaultValue={queryParam}
              placeholder="Buscá otro medicamento..."
              onSearch={handleNewSearch}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 text-[#1B3A6B] animate-spin" />
            <p className="text-gray-500">Buscando precios...</p>
          </div>
        ) : (
          <>
            {/* Results header */}
            <div className="mb-5">
              <h1 className="font-['Sora'] text-xl font-bold text-gray-900">
                {queryParam ? (
                  <>
                    Resultados para{" "}
                    <span className="text-[#1B3A6B]">"{queryParam}"</span>
                  </>
                ) : (
                  "Todos los medicamentos"
                )}
              </h1>
              {resultados.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {resultados.length} medicamento{resultados.length !== 1 ? "s" : ""} encontrado{resultados.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {resultados.length > 0 && (
              <div className="mb-5">
                <FiltrosBar
                  orden={orden}
                  onOrdenChange={setOrden}
                  soloPromocion={soloPromocion}
                  onPromocionChange={setSoloPromocion}
                  farmaciaId={farmaciaId}
                  onFarmaciaChange={setFarmaciaId}
                  total={resultadosFiltrados.length}
                  onCategoriaChange={() => {}}
                />
              </div>
            )}

            {resultadosFiltrados.length === 0 ? (
              <EmptyState query={queryParam} />
            ) : (
              <div className="space-y-4">
                {resultadosFiltrados.map((producto, idx) => (
                  <div
                    key={producto.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${idx * 80}ms`, opacity: 0, animationFillMode: "forwards" }}
                  >
                    <ResultadoCard producto={producto} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  const [, navigate] = useLocation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
        <SearchX className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="font-['Sora'] text-lg font-semibold text-gray-900 mb-2">
        No encontramos resultados
      </h3>
      <p className="text-gray-500 text-sm max-w-sm mb-6">
        No hay medicamentos que coincidan con{" "}
        <span className="font-medium">"{query}"</span>. Probá con otro nombre o principio activo.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {["Ibuprofeno", "Paracetamol", "Omeprazol"].map((term) => (
          <button
            key={term}
            onClick={() => navigate(`/resultados?q=${encodeURIComponent(term)}`)}
            className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:border-[#1B3A6B] hover:text-[#1B3A6B] transition-colors"
          >
            {term}
          </button>
        ))}
      </div>
    </div>
  );
}
