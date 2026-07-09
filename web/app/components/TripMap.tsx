"use client";

import { useEffect, useState } from "react";
import { office } from "@/lib/mock";
import { Route } from "./icons";

// Clé injectée au build (NEXT_PUBLIC_…). Absente en démo → carte simulée.
// Pour brancher la vraie carte : ajouter NEXT_PUBLIC_GOOGLE_MAPS_API_KEY dans .env.local
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function TripMap({
  destination,
  label,
  travelMin,
  distanceKm,
  waypoints,
  useGeo = false,
  height = 132,
}: {
  destination: string;
  label: string;
  travelMin: number;
  distanceKm: number;
  waypoints?: string[];
  useGeo?: boolean;
  height?: number;
}) {
  // Origine = position actuelle si autorisée (uniquement quand la vraie carte est active), sinon le bureau.
  const [origin, setOrigin] = useState(`${office.name}, ${office.city}`);
  useEffect(() => {
    if (!MAPS_KEY || !useGeo || typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setOrigin(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => {},
      { timeout: 4000 }
    );
  }, [useGeo]);

  if (MAPS_KEY) {
    const params = new URLSearchParams({ key: MAPS_KEY, origin, destination, mode: "driving" });
    if (waypoints?.length) params.set("waypoints", waypoints.join("|"));
    return (
      <div className="overflow-hidden rounded-lg border border-line" style={{ height }}>
        <iframe
          title={`Trajet vers ${label}`}
          width="100%"
          height={height}
          style={{ border: 0, display: "block" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/directions?${params.toString()}`}
        />
      </div>
    );
  }

  // Fallback : carte stylisée (même rendu, on branche Google Maps ensuite).
  return (
    <div className="relative overflow-hidden rounded-lg border border-line" style={{ height }}>
      <svg viewBox="0 0 320 132" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-label={`Trajet vers ${label}`}>
        <rect width="320" height="132" fill="#e9edf1" />
        <rect x="18" y="70" width="70" height="46" rx="6" fill="#d9ebe0" />
        <path d="M-5 40 C 60 55, 90 20, 160 38 S 280 60, 330 44 L 330 60 C 280 76, 200 42, 150 56 S 60 74, -5 58 Z" fill="#cfe0ee" opacity="0.8" />
        <g stroke="#dfe4ea" strokeLinecap="round" fill="none">
          <line x1="0" y1="96" x2="320" y2="78" strokeWidth="7" />
          <line x1="40" y1="132" x2="120" y2="0" strokeWidth="5" />
          <line x1="150" y1="132" x2="220" y2="0" strokeWidth="5" />
          <line x1="0" y1="30" x2="320" y2="22" strokeWidth="4" />
        </g>
        <path d="M56 104 C 120 96, 150 70, 244 40" fill="none" stroke="#0c6b52" strokeWidth="2.6" strokeDasharray="2 5" strokeLinecap="round" />
        <circle cx="56" cy="104" r="6.5" fill="#14161b" stroke="#fff" strokeWidth="2.5" />
        <g transform="translate(244 40)">
          <path d="M0 4 C -9 4 -13 -4 -8 -11 C -5 -15 5 -15 8 -11 C 13 -4 9 4 0 4 Z M0 -14 a4 4 0 0 1 0 8 a4 4 0 0 1 0 -8 Z" transform="translate(0 6) scale(1.2)" fill="#0c6b52" stroke="#fff" strokeWidth="1.5" />
        </g>
      </svg>

      <span className="absolute bottom-2 left-2 rounded bg-surface/90 px-1.5 py-0.5 text-[10px] font-medium text-stone shadow-sm backdrop-blur">
        Ta position
      </span>
      <span className="absolute right-2 top-2 rounded bg-pine px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">{label}</span>
      <div className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-md bg-surface/95 px-2 py-1 text-[11px] font-medium text-ink shadow-sm backdrop-blur">
        <Route width={13} height={13} className="text-pine" />
        {travelMin} min
        <span className="text-faint">· {String(distanceKm).replace(".", ",")} km</span>
      </div>
      <span className="absolute left-2 top-2 rounded bg-ink/70 px-1.5 py-0.5 text-[9px] font-medium text-paper">Carte simulée</span>
    </div>
  );
}
