"use client";

import React from "react";
import { DEFAULT_MAX_ACCURACY_METERS } from "@/hooks/useGeolocation";

interface LocationStatusProps {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  isLocating: boolean;
  geoError: string | null;
  onRequestLocation: () => void;
  maxAccuracy?: number;
  isValidatingGeofence?: boolean;
  insideGeofence?: boolean | null;
  geofenceAreaName?: string | null;
  gedungNama?: string | null;
  className?: string;
}

export default function LocationStatus({
  latitude,
  longitude,
  accuracy,
  isLocating,
  geoError,
  onRequestLocation,
  maxAccuracy = DEFAULT_MAX_ACCURACY_METERS,
  isValidatingGeofence = false,
  insideGeofence = null,
  geofenceAreaName = null,
  gedungNama = null,
  className = "",
}: LocationStatusProps) {
  const hasCoordinates = latitude !== null && longitude !== null;
  const isAccurate = accuracy !== null ? accuracy <= maxAccuracy : false;

  // Tentukan styling status berdasarkan kombinasi geofence dan error
  const cardBorderBg = geoError
    ? "border-rose-200 bg-rose-50/70"
    : hasCoordinates
    ? insideGeofence === true
      ? "border-emerald-200 bg-emerald-50/70"
      : insideGeofence === false
      ? "border-amber-200 bg-amber-50/70"
      : isAccurate
      ? "border-emerald-200 bg-emerald-50/60"
      : "border-stone-200 bg-stone-50/80"
    : "border-stone-200 bg-stone-50/80";

  const iconBgText = geoError
    ? "bg-rose-100 text-rose-600"
    : hasCoordinates
    ? insideGeofence === true
      ? "bg-emerald-100 text-emerald-700"
      : insideGeofence === false
      ? "bg-amber-100 text-amber-700"
      : isAccurate
      ? "bg-emerald-100 text-emerald-700"
      : "bg-amber-100 text-amber-700"
    : "bg-stone-200 text-stone-600";

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${cardBorderBg} ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBgText}`}>
            {isLocating || isValidatingGeofence ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : insideGeofence === true ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            )}
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Validasi Geofencing Area Presensi
            </h4>
            <p className="text-sm font-bold text-stone-900 leading-snug">
              {isLocating
                ? "Mencari sinyal GPS perangkat..."
                : isValidatingGeofence
                ? "Memverifikasi batas polygon..."
                : geoError
                ? "Lokasi Belum Terverifikasi"
                : hasCoordinates
                ? insideGeofence === true
                  ? `✓ Lokasi Valid di Area: ${geofenceAreaName || gedungNama || "Gedung Asrama"}`
                  : insideGeofence === false
                  ? "Di Luar Area Presensi Geofence"
                  : isAccurate
                  ? "Sinyal GPS Akurat"
                  : "Sinyal GPS Terdeteksi"
                : "GPS Belum Dideteksi"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRequestLocation}
          disabled={isLocating || isValidatingGeofence}
          className="self-start sm:self-auto shrink-0 px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-stone-700 text-xs font-semibold hover:bg-stone-50 active:scale-95 transition-all flex items-center gap-1.5 shadow-2xs disabled:opacity-60 cursor-pointer"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className={isLocating || isValidatingGeofence ? "animate-spin" : ""}
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          {isLocating || isValidatingGeofence ? "Memproses..." : hasCoordinates ? "Perbarui Lokasi" : "Ambil Lokasi"}
        </button>
      </div>

      {/* Coordinate & Accuracy details */}
      {hasCoordinates && (
        <div className="mt-3.5 pt-3 border-t border-black/5 flex flex-wrap items-center gap-2 text-xs">
          {accuracy !== null && (
            <div
              className={`px-2.5 py-1 rounded-lg font-semibold border flex items-center gap-1.5 text-[11px] shadow-2xs ${
                accuracy <= maxAccuracy
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : accuracy <= 120
                  ? "bg-amber-100 text-amber-900 border-amber-300"
                  : "bg-rose-100 text-rose-900 border-rose-300"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  accuracy <= maxAccuracy
                    ? "bg-emerald-600 animate-pulse"
                    : accuracy <= 120
                    ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
              />
              Akurasi Sinyal: ±{Math.round(accuracy)}m{" "}
              {accuracy <= maxAccuracy
                ? "(Presisi Tinggi)"
                : accuracy <= 120
                ? "(Presisi Sedang)"
                : "(Akurasi Kurang Presisi)"}
            </div>
          )}

          {insideGeofence !== null && (
            <div
              className={`px-2.5 py-1 rounded-lg font-semibold border flex items-center gap-1.5 text-[11px] shadow-2xs ${
                insideGeofence
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-amber-100 text-amber-900 border-amber-300"
              }`}
            >
              <span>{insideGeofence ? "📍 Dalam Polygon" : "⚠️ Di Luar Polygon"}</span>
            </div>
          )}
        </div>
      )}

      {/* Error message alert */}
      {geoError && (
        <div className="mt-3 text-xs text-rose-700 bg-rose-100/80 p-3 rounded-xl border border-rose-200/80 flex items-start gap-2.5">
          <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="leading-relaxed">{geoError}</span>
        </div>
      )}
    </div>
  );
}
