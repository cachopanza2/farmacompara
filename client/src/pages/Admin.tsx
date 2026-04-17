import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Pill,
  Database,
  Activity,
  Play,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function formatNum(n: number): string {
  return n.toLocaleString("es-PY");
}

function formatDuracion(inicio: Date, fin?: Date | null): string {
  if (!fin) return "En progreso...";
  const ms = new Date(fin).getTime() - new Date(inicio).getTime();
  const seg = Math.floor(ms / 1000);
  if (seg < 60) return `${seg}s`;
  return `${Math.floor(seg / 60)}m ${seg % 60}s`;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)} dias`;
}

const ESTADO_CONFIG = {
  exitoso: { label: "Exitoso", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
  error: { label: "Error", icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  en_progreso: { label: "En progreso", icon: Loader2, color: "text-blue-600", bg: "bg-blue-50" },
  pendiente: { label: "Pendiente", icon: Clock, color: "text-gray-500", bg: "bg-gray-50" },
};

export default function Admin() {
  const [secretKey, setSecretKey] = useState("farmacompara-scraping-2024");
  const [queryManual, setQueryManual] = useState("ibuprofeno");

  const { data, isLoading, refetch } = trpc.scraping.estado.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const ejecutarMutation = trpc.scraping.ejecutar.useMutation({
    onSuccess: (result) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const total = result.resultados.reduce((a: number, r: any) => a + r.productosGuardados, 0);
      toast.success(`Scraping completado: ${total} productos guardados`);
      refetch();
    },
    onError: (err) => {
      toast.error(`Error: ${err.message}`);
    },
  });

  const logs = data?.logs ?? [];
  const farmacias = data?.farmacias ?? [];
  const stats = data?.stats;
  const totalProductos = data?.totalProductos ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 font-['DM_Sans']">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1B3A6B] flex items-center justify-center">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <span className="font-['Sora'] font-bold text-[#1B3A6B] text-lg">
              Farma<span className="text-[#10B981]">Compara</span>
            </span>
          </a>
          <Badge variant="outline" className="text-xs text-gray-500">Panel de administracion</Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-['Sora'] text-2xl font-bold text-gray-900 mb-1">Estado del sistema</h1>
          <p className="text-gray-500 text-sm">Monitoreo del scraping de precios y base de datos.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Database, label: "Precios indexados", value: stats?.totalPrecios ? formatNum(Number(stats.totalPrecios)) : "0", color: "text-[#1B3A6B]", bg: "bg-blue-50" },
            { icon: Pill, label: "Productos unicos", value: formatNum(Number(totalProductos)), color: "text-purple-600", bg: "bg-purple-50" },
            { icon: Activity, label: "Farmacias activas", value: String(farmacias.length), color: "text-[#10B981]", bg: "bg-emerald-50" },
            { icon: Clock, label: "Ultima actualizacion", value: stats?.ultimaActualizacion ? timeAgo(stats.ultimaActualizacion) : "Nunca", color: "text-orange-600", bg: "bg-orange-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
              <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="font-['Sora'] text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="h-4 w-4 text-[#1B3A6B]" />
              Scraping manual
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Medicamento</label>
                <Input value={queryManual} onChange={(e) => setQueryManual(e.target.value)} placeholder="ibuprofeno" className="text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Clave de acceso</label>
                <Input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} placeholder="Clave secreta" className="text-sm" />
              </div>
              <Button onClick={() => ejecutarMutation.mutate({ query: queryManual, secretKey })} disabled={ejecutarMutation.isPending} className="w-full bg-[#1B3A6B] hover:bg-[#162f58] text-white">
                {ejecutarMutation.isPending ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scrapeando...</>) : (<><RefreshCw className="h-4 w-4 mr-2" />Iniciar scraping</>)}
              </Button>
              {ejecutarMutation.isPending && (
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                  <p className="font-medium mb-1">En progreso...</p>
                  <p>Puede tardar 2-5 minutos.</p>
                </div>
              )}
              {ejecutarMutation.isSuccess && (
                <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700">
                  <p className="font-medium mb-1">Completado</p>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {ejecutarMutation.data?.resultados.map((r: any) => (
                    <p key={r.farmacia}>{r.farmacia}: {r.productosGuardados} guardados</p>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Farmacias</h3>
              {farmacias.length === 0 && <p className="text-xs text-gray-400 italic">Sin farmacias. Ejecuta el scraping primero.</p>}
              {farmacias.map((f) => (
                <div key={f.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50 mb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="text-sm font-medium text-gray-700">{f.nombre}</span>
                  </div>
                  <Badge variant="outline" className={f.activa ? "border-green-300 text-green-600 text-xs" : "border-gray-300 text-gray-400 text-xs"}>
                    {f.activa ? "Activa" : "Inactiva"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-['Sora'] text-base font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#1B3A6B]" />
                Historial de scraping
              </h2>
              <button onClick={() => refetch()} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />Actualizar
              </button>
            </div>
            {isLoading && <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>}
            {!isLoading && logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <AlertCircle className="h-8 w-8 text-gray-300" />
                <p className="text-sm text-gray-400 text-center">Sin registros aun.<br/>Ejecuta el scraping manual para comenzar.</p>
              </div>
            )}
            {!isLoading && logs.length > 0 && (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {logs.map((log) => {
                  const cfg = ESTADO_CONFIG[log.estado as keyof typeof ESTADO_CONFIG];
                  const Icon = cfg.icon;
                  return (
                    <div key={log.id} className={`rounded-xl border p-3 ${cfg.bg} border-transparent`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${cfg.color} ${log.estado === "en_progreso" ? "animate-spin" : ""}`} />
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{log.farmaciaNombre}</p>
                            <p className="text-xs text-gray-500">{timeAgo(log.iniciadoEn)} · {formatDuracion(log.iniciadoEn, log.finalizadoEn)}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={`${cfg.color} border-current text-xs`}>{cfg.label}</Badge>
                      </div>
                      {log.estado === "exitoso" && (
                        <div className="mt-2 flex gap-4 text-xs text-gray-600">
                          <span><strong>{log.productosEncontrados}</strong> encontrados</span>
                          <span><strong>{log.productosActualizados}</strong> guardados</span>
                          {log.errores > 0 && <span className="text-red-500"><strong>{log.errores}</strong> errores</span>}
                        </div>
                      )}
                      {log.estado === "error" && log.mensajeError && (
                        <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg p-2 font-mono">{log.mensajeError.substring(0, 200)}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
