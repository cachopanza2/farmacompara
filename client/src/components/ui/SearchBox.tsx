/*
 * FarmaCompara — SearchBox
 * Diseño: Clínico Moderno | Buscador principal con sugerencias
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Search, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { BUSQUEDAS_POPULARES, buscarEnMock } from "@/lib/mockData";
import type { ProductoResumen } from "@/types";

interface SearchBoxProps {
  size?: "md" | "lg";
  placeholder?: string;
  autoFocus?: boolean;
  defaultValue?: string;
  onSearch?: (query: string) => void;
}

export default function SearchBox({
  size = "md",
  placeholder = "Buscá un medicamento o principio activo...",
  autoFocus = false,
  defaultValue = "",
  onSearch,
}: SearchBoxProps) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ProductoResumen[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update suggestions as user types
  useEffect(() => {
    if (query.length >= 2) {
      const results = buscarEnMock(query).slice(0, 5);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [query]);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        navigate(`/resultados?q=${encodeURIComponent(query.trim())}`);
      }
    }, 300);
  }

  function handleSuggestionClick(nombre: string) {
    setQuery(nombre);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(nombre);
    } else {
      navigate(`/resultados?q=${encodeURIComponent(nombre)}`);
    }
  }

  function handleClear() {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative flex w-full search-glow rounded-xl overflow-hidden shadow-md">
        {/* Search icon */}
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10">
          <Search
            className={cn(
              "text-gray-400",
              size === "lg" ? "h-5 w-5" : "h-4 w-4"
            )}
          />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            "w-full border border-gray-200 bg-white text-gray-900 outline-none transition",
            "focus:border-[#1B3A6B] focus:ring-0",
            "pl-11 pr-10",
            size === "lg" ? "py-4 text-base" : "py-3 text-sm"
          )}
          style={{ borderRadius: 0 }}
        />

        {/* Clear button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-[88px] flex items-center pr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className={cn(
            "shrink-0 flex items-center gap-2 bg-[#1B3A6B] px-5 font-semibold text-white transition",
            "hover:bg-[#162f58] disabled:opacity-50 disabled:cursor-not-allowed",
            size === "lg" ? "text-base" : "text-sm"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Buscar"
          )}
        </button>
      </form>

      {/* Autocomplete suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          {suggestions.map((producto) => (
            <button
              key={producto.id}
              type="button"
              onClick={() => handleSuggestionClick(producto.nombre_normalizado)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div>
                <div className="text-sm font-medium text-gray-900">{producto.nombre_normalizado}</div>
                {producto.principio_activo && (
                  <div className="text-xs text-gray-500">{producto.principio_activo}</div>
                )}
              </div>
              {producto.precio_minimo && (
                <div className="text-sm font-semibold text-[#10B981] shrink-0 ml-4">
                  desde Gs. {Math.round(producto.precio_minimo).toLocaleString("es-PY")}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
