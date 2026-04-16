import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatea un número en Guaraníes: 25000 → "Gs. 25.000" */
export function formatGs(valor: number): string {
  return `Gs. ${Math.round(valor).toLocaleString("es-PY")}`;
}

/** Fecha legible */
export function formatFecha(iso: string): string {
  return new Date(iso).toLocaleString("es-PY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Calcula el porcentaje de ahorro */
export function calcularAhorro(precioOriginal: number, precioFinal: number): number {
  if (!precioOriginal || precioOriginal <= precioFinal) return 0;
  return Math.round(((precioOriginal - precioFinal) / precioOriginal) * 100);
}
