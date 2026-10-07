"use client";

import { useCallback, useState } from "react";

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export const DEFAULT_MAX_ACCURACY_METERS = 50;

export function useGeolocation(maxAllowedAccuracy: number = DEFAULT_MAX_ACCURACY_METERS) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const isSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

  const requestLocation = useCallback(
    (): Promise<LocationData | null> => {
      return new Promise((resolve) => {
        if (!isSupported) {
          const errMsg = "Perangkat/browser Anda tidak mendukung fitur geolokasi GPS.";
          setGeoError(errMsg);
          resolve(null);
          return;
        }

        setIsLocating(true);
        setGeoError(null);

        const options: PositionOptions = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const locData: LocationData = {
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
              timestamp: pos.timestamp,
            };

            setLocation(locData);
            setIsLocating(false);
            setGeoError(null);

            resolve(locData);
          },
          (err) => {
            setIsLocating(false);
            let message = "Gagal mendapatkan lokasi GPS.";
            switch (err.code) {
              case err.PERMISSION_DENIED:
                message = "Izin lokasi ditolak. Harap izinkan akses lokasi (GPS) pada browser/perangkat Anda.";
                break;
              case err.POSITION_UNAVAILABLE:
                message = "Sinyal lokasi tidak tersedia. Pastikan GPS/Location sudah aktif di perangkat Anda.";
                break;
              case err.TIMEOUT:
                message = "Waktu pencarian GPS habis. Silakan coba lagi beberapa saat lagi.";
                break;
            }
            setGeoError(message);
            resolve(null);
          },
          options
        );
      });
    },
    [isSupported, maxAllowedAccuracy]
  );

  const isAccuracySufficient = location ? location.accuracy <= maxAllowedAccuracy : false;

  return {
    location,
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    accuracy: location?.accuracy ?? null,
    isLocating,
    geoError,
    isSupported,
    isAccuracySufficient,
    requestLocation,
    clearError: () => setGeoError(null),
  };
}
