/*
 * FarmaCompara — Página de Búsqueda
 * Diseño: Clínico Moderno | Buscador con resultados en tiempo real
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import SearchBox from "@/components/ui/SearchBox";
import ResultadoCard from "@/components/ui/ResultadoCard";
import FiltrosBar from "@/components/ui/FiltrosBar";
import { buscarEnMock, BUSQUEDAS_POPULARES, CATEGORIAS } from "@/lib/mockData";
import type { ProductoResumen, OrdenBusqueda } from "@/types";
import { cn } from "@/lib/utils";

export default function Buscar() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<ProductoResumen[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [orden, setOrden] = useState<OrdenBusqueda>("precio");
  const [soloPromocion, setSoloPromocion] = useState(false);
  const [farmaciaId, setFarmaciaId] = useState<number | undefined>();

  function handleSearch(q: string) {
    setQuery(q);
    setHasSearched(true);
    const results = buscarEnMock(q);
    setResultados(results);
  }

  const resultadosFiltrados = resultados
    .filter((p) => !soloPromocion || p.precios.some((pr) => pr.tiene_promocion && pr.disponible))
    .filter((p) => !farmaciaId || p.precios.some((pr) => pr.farmacia.id === farmaciaId && pr.disponible))
    .sort((a, b) => {
      if (orden === "precio") return (a.precio_minimo ?? Infinity) - (b.precio_minimo ?? Infinity);
      if (orden === "nombre") return a.nombre_normalizado.localeCompare(b.nombre_normalizado);
      return (a.farmacia_precio_minimo ?? "").localeCompare(b.farmacia_precio_minimo ?? "");
    });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B3A6B] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-white mb-6">
            Buscar medicamento
          </h1>
          <div className="max-w-2xl">
            <SearchBox
              size="lg"
              placeholder="Nombre del medicamento o principio activo..."
              autoFocus
              onSearch={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {!hasSearched ? (
          <div>
            {/* Popular searches */}
            <div className="mb-8">
              <h2 className="font-['Sora'] text-base font-semibold text-gray-900 mb-4">
                Búsquedas populares
              </h2>
              <div className="flex flex-wrap gap-2">
                {BUSQUEDAS_POPULARES.map((term) => (
                  <button
                    key={term}
                    onClick={() => handleSearch(term)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-[#1B3A6B] hover:text-[#1B3A6B] hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <Search className="h-3.5 w-3.5 text-gray-400" />
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="font-['Sora'] text-base font-semibold text-gray-900 mb-4">
                Por categoría
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {CATEGORIAS.filter((c) => c !== "Todos").map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleSearch(cat)}
                    className="bg-white border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:border-[#1B3A6B] hover:text-[#1B3A6B] hover:bg-blue-50 transition-colors shadow-sm text-left"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Results header */}
            <div className="mb-5">
              <h2 className="font-['Sora'] text-xl font-bold text-gray-900">
                Resultados para <span className="text-[#1B3A6B]">"{query}"</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {resultados.length} resultado{resultados.length !== 1 ? "s" : ""} encontrado{resultados.length !== 1 ? "s" : ""}
              </p>
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
              <div className="text-center py-16">
                <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-gray-500">No se encontraron resultados para "{query}"</p>
              </div>
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
          </div>
        )}
      </div>
    </div>
  );
}
