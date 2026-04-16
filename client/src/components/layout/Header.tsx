/*
 * FarmaCompara — Header
 * Diseño: Clínico Moderno | Azul profundo #1B3A6B | Sora font
 * Navbar fija con logo, navegación y CTA
 */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Pill, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Buscar", href: "/buscar" },
  { label: "Farmacias", href: "/farmacias" },
  { label: "Estado", href: "/admin" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#1B3A6B] shadow-lg">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]">
              <Pill className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-['Sora'] text-base font-700 text-white tracking-tight">
                FarmaCompara
              </span>
              <span className="text-[10px] font-medium text-blue-200 tracking-wide uppercase">
                Paraguay
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  location === link.href
                    ? "bg-white/15 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs text-blue-200 bg-white/10 px-2.5 py-1 rounded-full">
              Precios actualizados hoy
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md text-blue-100 hover:bg-white/10 transition-colors"
            aria-label="Abrir menú"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#162f58]">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  location === link.href
                    ? "bg-white/15 text-white"
                    : "text-blue-100 hover:bg-white/10 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className="text-xs text-blue-300">Precios actualizados hoy a las 02:00 AM</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
