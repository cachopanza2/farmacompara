/*
 * FarmaCompara — Página de Admin / Estado del Sistema
 * Diseño: Clínico Moderno | Dashboard de estado del scraping
 */
import { CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, Database } from "lucide-react";
import { STATUS_MOCK, FARMACIAS_MOCK } from "@/lib/mockData";
import { formatFecha, cn } from "@/lib/utils";

const TOTAL_PRODUCTOS = STATUS_MOCK.reduce((acc, s) => acc + s.productos_indexados, 0);
const FARMACIAS_ACTIVAS = STATUS_MOCK.filter((s) => s.estado === "exitoso").length;

export default function Admin() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1B3A6B] py-10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-white mb-1">
                Estado del sistema
              </h1>
              <p className="text-blue-200 text-sm">
                Monitoreo del scraping y estado de las fuentes de datos
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-sm text-white font-medium">Sistema operativo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <SummaryCard
            icon={<Database className="h-5 w-5 text-[#1B3A6B]" />}
            value={TOTAL_PRODUCTOS.toLocaleString("es-PY")}
            label="Productos indexados"
            color="blue"
          />
          <SummaryCard
            icon={<CheckCircle2 className="h-5 w-5 text-[#10B981]" />}
            value={`${FARMACIAS_ACTIVAS}/${FARMACIAS_MOCK.length}`}
            label="Farmacias activas"
            color="green"
          />
          <SummaryCard
            icon={<RefreshCw className="h-5 w-5 text-purple-600" />}
            value="02:00 AM"
            label="Próxima actualización"
            color="purple"
          />
          <SummaryCard
            icon={<Clock className="h-5 w-5 text-amber-600" />}
            value="Hoy"
            label="Último scraping"
            color="amber"
          />
        </div>

        {/* Status table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-['Sora'] text-base font-semibold text-gray-900">
              Estado por farmacia
            </h2>
          </div>

          <div className="divide-y divide-gray-50">
            {STATUS_MOCK.map((status) => {
              const farmacia = FARMACIAS_MOCK.find(
                (f) => f.nombre === status.farmacia
              );
              return (
                <div key={status.farmacia} className="flex items-center gap-4 px-5 py-4">
                  {/* Farmacia */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: farmacia?.color ?? "#6B7280" }}
                    >
                      {status.farmacia.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{status.farmacia}</div>
                      <div className="text-xs text-gray-400">
                        {status.ultimo_scraping
                          ? formatFecha(status.ultimo_scraping)
                          : "Sin datos aún"}
                      </div>
                    </div>
                  </div>

                  {/* Productos */}
                  <div className="hidden sm:block text-right">
                    <div className="font-['Sora'] font-semibold text-gray-900 text-sm">
                      {status.productos_indexados.toLocaleString("es-PY")}
                    </div>
                    <div className="text-xs text-gray-400">productos</div>
                  </div>

                  {/* Errores */}
                  {status.errores > 0 && (
                    <div className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="h-3 w-3" />
                      {status.errores} error{status.errores > 1 ? "es" : ""}
                    </div>
                  )}

                  {/* Estado */}
                  <StatusBadge estado={status.estado} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule info */}
        <div className="mt-6 bg-[#1B3A6B]/5 border border-[#1B3A6B]/10 rounded-2xl p-5">
          <h3 className="font-['Sora'] font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-[#1B3A6B]" />
            Programación del scraping
          </h3>
          <p className="text-sm text-gray-600">
            El scraper se ejecuta automáticamente todos los días a las <strong>02:00 AM</strong> (hora Paraguay, GMT-4). 
            Los precios se actualizan de forma incremental, detectando cambios y registrando el historial.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: "blue" | "green" | "purple" | "amber";
}) {
  const bgMap = {
    blue: "bg-blue-50",
    green: "bg-emerald-50",
    purple: "bg-purple-50",
    amber: "bg-amber-50",
  };
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className={`inline-flex rounded-xl ${bgMap[color]} p-2 mb-3`}>{icon}</div>
      <div className="font-['Sora'] text-xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  if (estado === "exitoso") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Exitoso
      </div>
    );
  }
  if (estado === "pendiente") {
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
        <Clock className="h-3.5 w-3.5" />
        Pendiente
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
      <XCircle className="h-3.5 w-3.5" />
      Error
    </div>
  );
}
