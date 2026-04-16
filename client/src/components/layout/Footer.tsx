/*
 * FarmaCompara — Footer
 * Diseño: Clínico Moderno | Fondo azul oscuro | DM Sans
 */
import { Link } from "wouter";
import { Pill, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0e1a35] text-blue-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
                <Pill className="h-4 w-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-['Sora'] text-base font-bold text-white">FarmaCompara</span>
            </div>
            <p className="text-sm text-blue-300 leading-relaxed max-w-xs">
              Comparador de precios farmacéuticos para Paraguay. Encontrá el precio más bajo en las principales farmacias online del país.
            </p>
            <p className="mt-3 text-xs text-blue-400">
              Los precios son referenciales. Verificá en cada farmacia antes de comprar.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-['Sora'] text-sm font-semibold text-white mb-3">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/buscar" className="hover:text-white transition-colors">Buscar medicamento</Link></li>
              <li><Link href="/farmacias" className="hover:text-white transition-colors">Farmacias</Link></li>
              <li><Link href="/admin" className="hover:text-white transition-colors">Estado del sistema</Link></li>
            </ul>
          </div>

          {/* Farmacias */}
          <div>
            <h4 className="font-['Sora'] text-sm font-semibold text-white mb-3">Farmacias</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-blue-300">Punto Farma</li>
              <li className="text-blue-300">Farmacenter</li>
              <li className="text-blue-300">Biggie Farma</li>
              <li className="text-blue-300">San Roque</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-400">
          <p>© 2026 FarmaCompara Paraguay. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <Heart className="h-3 w-3 text-red-400 fill-red-400" /> en Paraguay
          </p>
        </div>
      </div>
    </footer>
  );
}
