/*
 * FarmaCompara — Página de Farmacias
 * Diseño: Clínico Moderno | Listado de farmacias disponibles
 */
import { ExternalLink, CheckCircle2, Clock, Package } from "lucide-react";
import { FARMACIAS_MOCK, STATUS_MOCK } from "@/lib/mockData";
import { formatFecha } from "@/lib/utils";

export default function Farmacias() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B3A6B] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <h1 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-white mb-2">
            Farmacias disponibles
          </h1>
          <p className="text-blue-200">
            Estas son las farmacias cuyos precios comparamos en FarmaCompara.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="grid gap-5 sm:grid-cols-2">
          {FARMACIAS_MOCK.map((farmacia) => {
            const status = STATUS_MOCK.find(
              (s) => s.farmacia.toLowerCase().replace(" ", "_") === farmacia.slug
            );
            return (
              <div
                key={farmacia.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 pharmacy-card"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-['Sora'] font-bold text-sm"
                      style={{ backgroundColor: farmacia.color }}
                    >
                      {farmacia.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-['Sora'] font-semibold text-gray-900">{farmacia.nombre}</h3>
                      <span className="text-xs text-gray-400 font-mono">{farmacia.slug}</span>
                    </div>
                  </div>
                  {status && (
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        status.estado === "exitoso"
                          ? "bg-emerald-50 text-emerald-700"
                          : status.estado === "pendiente"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {status.estado === "exitoso" ? "Activa" : status.estado === "pendiente" ? "Pendiente" : "Error"}
                    </span>
                  )}
                </div>

                {/* Stats */}
                {status && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Package className="h-3 w-3" />
                        Productos
                      </div>
                      <div className="font-['Sora'] font-semibold text-gray-900">
                        {status.productos_indexados.toLocaleString("es-PY")}
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                        <Clock className="h-3 w-3" />
                        Última actualización
                      </div>
                      <div className="text-xs font-medium text-gray-700">
                        {status.ultimo_scraping ? formatFecha(status.ultimo_scraping) : "Pendiente"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                    Precios en tiempo real
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="h-3 w-3 text-[#10B981]" />
                    Actualización diaria
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add more pharmacies CTA */}
        <div className="mt-8 bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 rounded-2xl p-6 text-center">
          <h3 className="font-['Sora'] font-semibold text-gray-900 mb-2">
            ¿Falta tu farmacia?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Estamos trabajando para agregar más farmacias. Si querés que agreguemos una, contactanos.
          </p>
          <button className="px-5 py-2.5 rounded-xl bg-[#1B3A6B] text-white text-sm font-medium hover:bg-[#162f58] transition-colors">
            Sugerir farmacia
          </button>
        </div>
      </div>
    </div>
  );
}
