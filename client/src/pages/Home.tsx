import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Search, TrendingDown, RefreshCw, ShieldCheck, ChevronRight, Pill } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const BUSQUEDAS_POPULARES = [
  "Ibuprofeno",
  "Paracetamol",
  "Amoxicilina",
  "Omeprazol",
  "Metformina",
  "Losartán",
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Buscá tu medicamento",
    desc: "Ingresá el nombre del medicamento o principio activo.",
    icon: <Search className="h-5 w-5" />,
  },
  {
    step: "2",
    title: "Comparamos los precios",
    desc: "Mostramos precios actualizados de todas las farmacias.",
    icon: <TrendingDown className="h-5 w-5" />,
  },
  {
    step: "3",
    title: "Elegís dónde comprar",
    desc: "Vas directo al sitio de la farmacia con el mejor precio.",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
];

function formatGuaranies(n: number): string {
  return "Gs. " + n.toLocaleString("es-PY");
}

export default function Home() {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");

  const { data: farmaciasData } = trpc.farmacias.listar.useQuery();
  const { data: estadoData } = trpc.scraping.estado.useQuery();

  function handleSearch(q?: string) {
    const term = q ?? query;
    if (term.trim().length < 2) return;
    navigate(`/resultados?q=${encodeURIComponent(term.trim())}`);
  }

  const totalProductos = estadoData?.totalProductos ?? 0;
  const ultimaActualizacion = estadoData?.stats?.ultimaActualizacion;

  return (
    <div className="min-h-screen bg-white font-['DM_Sans']">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1B3A6B] flex items-center justify-center">
              <Pill className="h-4 w-4 text-white" />
            </div>
            <span className="font-['Sora'] font-bold text-[#1B3A6B] text-lg">
              Farma<span className="text-[#10B981]">Compara</span>
            </span>
          </a>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-gray-600">
            <a href="/resultados?q=ibuprofeno" className="hover:text-[#1B3A6B] transition-colors">
              Buscar
            </a>
            <a href="/admin" className="hover:text-[#1B3A6B] transition-colors">
              Estado
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden py-16 sm:py-24"
        style={{ background: "linear-gradient(135deg, #1B3A6B 0%, #162f58 60%, #0e1a35 100%)" }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {ultimaActualizacion && (
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-xs text-blue-100 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              Precios actualizados:{" "}
              {new Date(ultimaActualizacion).toLocaleDateString("es-PY", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          )}

          <h1 className="font-['Sora'] text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Encontrá el precio más bajo
            <span className="block text-[#10B981] mt-1">en farmacias de Paraguay</span>
          </h1>

          <p className="text-blue-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Comparamos precios reales de Punto Farma, Farmacenter y más. Ahorrá en cada compra.
          </p>

          {/* Buscador principal */}
          <div className="mx-auto max-w-2xl">
            <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl">
              <div className="flex-1 flex items-center gap-2 px-3">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Buscá un medicamento o principio activo..."
                  className="border-0 shadow-none focus-visible:ring-0 text-gray-800 placeholder:text-gray-400 text-base"
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                className="bg-[#1B3A6B] hover:bg-[#162f58] text-white rounded-xl px-6 py-2 font-semibold"
              >
                Buscar
              </Button>
            </div>
          </div>

          {/* Búsquedas populares */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-blue-300 self-center">Populares:</span>
            {BUSQUEDAS_POPULARES.map((term) => (
              <button
                key={term}
                onClick={() => handleSearch(term)}
                className="rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs text-blue-100 hover:bg-white/20 hover:text-white transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { value: String(farmaciasData?.length ?? "2") + "+", label: "Farmacias" },
              {
                value: totalProductos > 0 ? totalProductos.toLocaleString() + "+" : "En vivo",
                label: "Precios indexados",
              },
              { value: "Diario", label: "Actualización" },
              { value: "Gratis", label: "Sin registro" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-4"
              >
                <div className="font-['Sora'] text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Farmacias disponibles ── */}
      {farmaciasData && farmaciasData.length > 0 && (
        <section className="bg-white border-b border-gray-100 py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-medium text-gray-500">
                Comparamos precios en{" "}
                <span className="text-[#1B3A6B] font-semibold">
                  {farmaciasData.length} farmacias
                </span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {farmaciasData.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors"
                  >
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{f.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Cómo funciona ── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              ¿Cómo funciona?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              En tres pasos simples encontrás el mejor precio para tu medicamento.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map((item, idx) => (
              <div key={item.step} className="relative">
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#1B3A6B]/30 to-transparent z-10 -translate-x-6" />
                )}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center h-full">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#1B3A6B]/10 text-[#1B3A6B] mb-4">
                    {item.icon}
                  </div>
                  <div className="font-['Sora'] text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
                    Paso {item.step}
                  </div>
                  <h3 className="font-['Sora'] text-base font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Por qué usar FarmaCompara
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <TrendingDown className="h-6 w-6 text-[#10B981]" />,
                bg: "bg-emerald-50",
                title: "Precio mínimo garantizado",
                desc: "Identificamos automáticamente el precio más bajo entre todas las farmacias.",
              },
              {
                icon: <RefreshCw className="h-6 w-6 text-[#1B3A6B]" />,
                bg: "bg-blue-50",
                title: "Actualización diaria",
                desc: "Los precios se actualizan todos los días de forma automática.",
              },
              {
                icon: <ShieldCheck className="h-6 w-6 text-purple-600" />,
                bg: "bg-purple-50",
                title: "Datos verificados",
                desc: "Obtenemos los precios directamente desde los sitios oficiales.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className={`mb-4 inline-flex rounded-xl ${f.bg} p-3`}>{f.icon}</div>
                <h3 className="font-['Sora'] text-base font-semibold text-gray-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 bg-[#1B3A6B]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-white mb-4">
            Empezá a ahorrar ahora
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Buscá cualquier medicamento y encontrá el mejor precio al instante.
          </p>
          <div className="flex gap-2 bg-white rounded-2xl p-2 shadow-2xl max-w-xl mx-auto">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-5 w-5 text-gray-400 shrink-0" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Buscá un medicamento..."
                className="border-0 shadow-none focus-visible:ring-0 text-gray-800 placeholder:text-gray-400"
              />
            </div>
            <Button
              onClick={() => handleSearch()}
              className="bg-[#1B3A6B] hover:bg-[#162f58] text-white rounded-xl px-6"
            >
              Buscar
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="h-6 w-6 rounded-md bg-[#1B3A6B] flex items-center justify-center">
              <Pill className="h-3 w-3 text-white" />
            </div>
            <span className="font-['Sora'] font-bold text-white text-sm">
              Farma<span className="text-[#10B981]">Compara</span>
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Comparador de precios farmacéuticos de Paraguay. Los precios son referenciales y pueden
            variar. Verificá siempre en la farmacia.
          </p>
        </div>
      </footer>
    </div>
  );
}
