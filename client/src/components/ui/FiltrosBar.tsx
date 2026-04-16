/*
 * FarmaCompara — FiltrosBar
 * Diseño: Clínico Moderno | Barra de filtros horizontal
 */
import { SlidersHorizontal, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORIAS, FARMACIAS_MOCK } from "@/lib/mockData";
import type { OrdenBusqueda } from "@/types";

interface FiltrosBarProps {
  orden: OrdenBusqueda;
  onOrdenChange: (orden: OrdenBusqueda) => void;
  soloPromocion: boolean;
  onPromocionChange: (val: boolean) => void;
  farmaciaId?: number;
  onFarmaciaChange: (id?: number) => void;
  categoria?: string;
  onCategoriaChange: (cat?: string) => void;
  total?: number;
}

const ORDEN_OPTIONS: { value: OrdenBusqueda; label: string }[] = [
  { value: "precio", label: "Menor precio" },
  { value: "nombre", label: "Nombre A-Z" },
  { value: "farmacia", label: "Por farmacia" },
];

export default function FiltrosBar({
  orden,
  onOrdenChange,
  soloPromocion,
  onPromocionChange,
  farmaciaId,
  onFarmaciaChange,
  categoria,
  onCategoriaChange,
  total,
}: FiltrosBarProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Icon + label */}
        <div className="flex items-center gap-1.5 text-sm font-medium text-gray-600 shrink-0">
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </div>

        <div className="h-4 w-px bg-gray-200 shrink-0 hidden sm:block" />

        {/* Ordenar */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 shrink-0">Ordenar:</span>
          <div className="flex gap-1">
            {ORDEN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onOrdenChange(opt.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                  orden === opt.value
                    ? "bg-[#1B3A6B] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-4 w-px bg-gray-200 shrink-0 hidden sm:block" />

        {/* Farmacia filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 shrink-0">Farmacia:</span>
          <select
            value={farmaciaId ?? ""}
            onChange={(e) => onFarmaciaChange(e.target.value ? Number(e.target.value) : undefined)}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700 bg-white focus:outline-none focus:border-[#1B3A6B] transition-colors"
          >
            <option value="">Todas</option>
            {FARMACIAS_MOCK.map((f) => (
              <option key={f.id} value={f.id}>{f.nombre}</option>
            ))}
          </select>
        </div>

        {/* Solo promociones */}
        <button
          onClick={() => onPromocionChange(!soloPromocion)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors",
            soloPromocion
              ? "bg-orange-100 text-orange-700 border border-orange-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Tag className="h-3 w-3" />
          Solo promociones
        </button>

        {/* Total results */}
        {total !== undefined && (
          <div className="ml-auto text-xs text-gray-400">
            {total} resultado{total !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </div>
  );
}
