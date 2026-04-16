/*
 * FarmaCompara — Home Page
 * Diseño: Clínico Moderno | Hero con fondo azul + buscador prominente
 * Secciones: Hero, Farmacias, Cómo funciona, Estadísticas, Búsquedas populares
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { TrendingDown, RefreshCw, ShieldCheck, Search, ArrowRight, Star } from "lucide-react";
import SearchBox from "@/components/ui/SearchBox";
import { BUSQUEDAS_POPULARES, FARMACIAS_MOCK } from "@/lib/mockData";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663101264601/F8uqB5z7ScZq8Y4RcoVTsa/hero-bg-QsMCFZX9JX2oHJCM2JmeNQ.webp";

const STATS = [
  { value: "4+", label: "Farmacias comparadas" },
  { value: "5.000+", label: "Medicamentos indexados" },
  { value: "Diario", label: "Actualización de precios" },
  { value: "Gratis", label: "Sin costo, sin registro" },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Buscá tu medicamento",
    desc: "Ingresá el nombre del medicamento o principio activo en el buscador.",
    icon: <Search className="h-6 w-6" />,
  },
  {
    step: "2",
    title: "Comparamos los precios",
    desc: "Mostramos los precios actualizados de todas las farmacias disponibles.",
    icon: <TrendingDown className="h-6 w-6" />,
  },
  {
    step: "3",
    title: "Elegís dónde comprar",
    desc: "Vas directo al sitio de la farmacia con el mejor precio para vos.",
    icon: <Star className="h-6 w-6" />,
  },
];

export default function Home() {
  const [, navigate] = useLocation();

  function handleSearch(query: string) {
    navigate(`/resultados?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ── */}
      <section
        className="relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1B3A6B 0%, #162f58 60%, #0e1a35 100%)`,
        }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-100 mb-6 animate-fade-in-up">
              <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
              Precios actualizados hoy a las 02:00 AM
            </div>

            {/* Headline */}
            <h1 className="font-['Sora'] text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight mb-4 animate-fade-in-up stagger-1">
              Encontrá el precio más bajo
              <span className="block text-[#10B981] mt-1">en farmacias de Paraguay</span>
            </h1>

            <p className="text-blue-200 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-2">
              Comparamos precios en tiempo real de Punto Farma, Farmacenter, Biggie Farma y más.
              Ahorrá en cada compra sin esfuerzo.
            </p>

            {/* Search Box */}
            <div className="mx-auto max-w-2xl animate-fade-in-up stagger-3">
              <SearchBox
                size="lg"
                placeholder="Buscá un medicamento o principio activo..."
                autoFocus
                onSearch={handleSearch}
              />
            </div>

            {/* Popular searches */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 animate-fade-in-up stagger-4">
              <span className="text-xs text-blue-300 self-center">Populares:</span>
              {BUSQUEDAS_POPULARES.slice(0, 6).map((term) => (
                <button
                  key={term}
                  onClick={() => handleSearch(term)}
                  className="rounded-full border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-1 text-xs text-blue-100 hover:bg-white/20 hover:text-white transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Stats bar */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up stagger-5">
            {STATS.map((stat) => (
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
      <section className="bg-white border-b border-gray-100 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm font-medium text-gray-500">
              Comparamos precios en <span className="text-[#1B3A6B] font-semibold">{FARMACIAS_MOCK.length} farmacias</span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {FARMACIAS_MOCK.map((farmacia) => (
                <div
                  key={farmacia.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: farmacia.color }} />
                  <span className="text-sm font-medium text-gray-700">{farmacia.nombre}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
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
                {/* Connector line */}
                {idx < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-[#1B3A6B]/30 to-transparent z-10 -translate-x-6" />
                )}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center h-full">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-[#1B3A6B]/10 text-[#1B3A6B] mb-4">
                    {item.icon}
                  </div>
                  <div className="font-['Sora'] text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
                    Paso {item.step}
                  </div>
                  <h3 className="font-['Sora'] text-base font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Por qué usar FarmaCompara
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={<TrendingDown className="h-6 w-6 text-[#10B981]" />}
              title="Precio mínimo garantizado"
              desc="Identificamos automáticamente el precio más bajo entre todas las farmacias disponibles."
              color="emerald"
            />
            <FeatureCard
              icon={<RefreshCw className="h-6 w-6 text-[#1B3A6B]" />}
              title="Actualización diaria"
              desc="Los precios y promociones se actualizan todos los días a las 2 AM de forma automática."
              color="blue"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-6 w-6 text-purple-600" />}
              title="Datos verificados"
              desc="Obtenemos los precios directamente desde los sitios oficiales de cada farmacia."
              color="purple"
            />
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-16 bg-[#1B3A6B]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <h2 className="font-['Sora'] text-2xl sm:text-3xl font-bold text-white mb-4">
            Empezá a ahorrar ahora
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Buscá cualquier medicamento y encontrá el mejor precio al instante.
          </p>
          <div className="mx-auto max-w-xl">
            <SearchBox
              size="lg"
              placeholder="Buscá un medicamento..."
              onSearch={handleSearch}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  color: "emerald" | "blue" | "purple";
}) {
  const bgMap = {
    emerald: "bg-emerald-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
  };
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className={`mb-4 inline-flex rounded-xl ${bgMap[color]} p-3`}>{icon}</div>
      <h3 className="font-['Sora'] text-base font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
