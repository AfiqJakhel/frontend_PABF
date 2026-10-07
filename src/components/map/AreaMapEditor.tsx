"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { AreaAbsensi } from "@/types/areaAbsensi";

interface LatLngPoint {
  lat: number;
  lng: number;
}

interface AreaMapEditorProps {
  initialCoordinates?: number[][][] | null;
  onChangeCoordinates: (coords: number[][][]) => void;
  existingAreas?: AreaAbsensi[];
  height?: string;
  readOnly?: boolean;
}

// Default center: Universitas Andalas (UNAND) Limau Manis, Padang
const DEFAULT_CENTER: [number, number] = [-0.9147, 100.4583];
const DEFAULT_ZOOM = 16;

export default function AreaMapEditor({
  initialCoordinates,
  onChangeCoordinates,
  existingAreas = [],
  height = "460px",
  readOnly = false,
}: AreaMapEditorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const polygonLayerRef = useRef<L.Polygon | null>(null);
  const polylineLayerRef = useRef<L.Polyline | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const existingAreasGroupRef = useRef<L.LayerGroup | null>(null);

  const [points, setPoints] = useState<LatLngPoint[]>([]);

  // Parse initial coordinates if provided
  useEffect(() => {
    if (initialCoordinates && initialCoordinates.length > 0 && initialCoordinates[0].length >= 3) {
      const ring = initialCoordinates[0];
      // Exclude last duplicate point if it closes the loop
      const isClosed =
        ring.length > 1 &&
        ring[0][0] === ring[ring.length - 1][0] &&
        ring[0][1] === ring[ring.length - 1][1];
      const editableRing = isClosed ? ring.slice(0, ring.length - 1) : ring;

      const loadedPoints: LatLngPoint[] = editableRing.map(([lon, lat]) => ({
        lat,
        lng: lon,
      }));
      setPoints(loadedPoints);
    } else {
      setPoints([]);
    }
  }, [initialCoordinates]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix marker icons
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    existingAreasGroupRef.current = L.layerGroup().addTo(map);
    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    // Click handler on map to add vertex
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (readOnly) return;
      setPoints((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [readOnly]);

  // Render existing saved areas as background polygons
  useEffect(() => {
    const existingGroup = existingAreasGroupRef.current;
    if (!existingGroup) return;

    existingGroup.clearLayers();

    existingAreas.forEach((area) => {
      if (!area.coordinates || area.coordinates.length === 0 || !area.coordinates[0]) return;
      const ring = area.coordinates[0];
      const latlngs: [number, number][] = ring.map(([lon, lat]) => [lat, lon]);

      const poly = L.polygon(latlngs, {
        color: area.is_active ? "#15803d" : "#94a3b8",
        fillColor: area.is_active ? "#22c55e" : "#cbd5e1",
        fillOpacity: area.is_active ? 0.2 : 0.12,
        weight: 2,
        dashArray: area.is_active ? undefined : "4, 4",
      });

      poly.bindTooltip(
        `<strong>${area.nama}</strong><br/>Status: ${area.is_active ? "Aktif" : "Nonaktif"}`,
        { permanent: false, direction: "center" }
      );

      existingGroup.addLayer(poly);
    });
  }, [existingAreas]);

  // Update Polygon & Markers whenever points change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    if (markersGroupRef.current) {
      markersGroupRef.current.clearLayers();
    }

    // Remove previous polygon / polyline
    if (polygonLayerRef.current) {
      map.removeLayer(polygonLayerRef.current);
      polygonLayerRef.current = null;
    }
    if (polylineLayerRef.current) {
      map.removeLayer(polylineLayerRef.current);
      polylineLayerRef.current = null;
    }

    if (points.length === 0) {
      return;
    }

    // Draw markers for each vertex
    points.forEach((pt, index) => {
      const markerHtml = `
        <div style="
          width: 22px;
          height: 22px;
          background: #dc2626;
          border: 2px solid #ffffff;
          border-radius: 50%;
          color: #ffffff;
          font-size: 10px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.35);
          cursor: ${readOnly ? "default" : "pointer"};
        ">
          ${index + 1}
        </div>
      `;

      const customIcon = L.divIcon({
        className: "custom-vertex-marker",
        html: markerHtml,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([pt.lat, pt.lng], {
        icon: customIcon,
        draggable: !readOnly,
      });

      // Handle marker drag
      marker.on("dragend", (e: L.DragEndEvent) => {
        const newPos = (e.target as L.Marker).getLatLng();
        setPoints((prev) => {
          const updated = [...prev];
          updated[index] = { lat: newPos.lat, lng: newPos.lng };
          return updated;
        });
      });

      markersGroupRef.current?.addLayer(marker);
    });

    // Draw polygon if at least 3 points, polyline if 2
    if (points.length >= 3) {
      const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
      const poly = L.polygon(latlngs, {
        color: "#dc2626",
        weight: 3,
        fillColor: "#ef4444",
        fillOpacity: 0.25,
      }).addTo(map);

      polygonLayerRef.current = poly;
    } else if (points.length === 2) {
      const latlngs = points.map((p) => [p.lat, p.lng] as [number, number]);
      const polyline = L.polyline(latlngs, {
        color: "#dc2626",
        weight: 2,
        dashArray: "4, 6",
      }).addTo(map);

      polylineLayerRef.current = polyline;
    }
  }, [points, readOnly]);

  // Sync with parent via onChangeCoordinates
  useEffect(() => {
    if (points.length >= 3) {
      // Build GeoJSON Polygon format: [[[lon, lat], [lon, lat], ... [lon, lat]]]
      const ring = points.map((p) => [p.lng, p.lat]);
      // Ensure closed loop
      ring.push([points[0].lng, points[0].lat]);
      onChangeCoordinates([ring]);
    } else {
      onChangeCoordinates([]);
    }
  }, [points, onChangeCoordinates]);

  const handleUndo = () => {
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPoints([]);
  };

  const handleCenterUnand = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  };

  const handleLocateMe = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Browser tidak mendukung geolokasi.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 17);
          L.circleMarker([latitude, longitude], {
            radius: 8,
            color: "#2563eb",
            fillColor: "#60a5fa",
            fillOpacity: 0.8,
            weight: 3,
          })
            .bindPopup("Posisi GPS Anda")
            .addTo(mapInstanceRef.current)
            .openPopup();
        }
      },
      (err) => alert("Gagal mendapatkan lokasi: " + err.message),
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="flex flex-col w-full rounded-xl overflow-hidden border border-[#e2e8f0] bg-white shadow-xs">
      {/* Top Map Toolbar */}
      {!readOnly && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3.5 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[#131b2e] flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${points.length >= 3 ? "bg-[#15803d]" : "bg-[#b45309]"}`} />
              Titik: {points.length} {points.length >= 3 ? "(Siap Disimpan)" : "(Perlu min 3 titik)"}
            </span>
            <span className="text-[#94a3b8] hidden md:inline">|</span>
            <span className="text-[#6f7a6e] hidden md:inline">
              Klik pada peta untuk menambah titik sudut polygon
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={handleUndo}
              disabled={points.length === 0}
              className="min-h-[34px] px-3 py-1 rounded-md bg-white border border-[#d0d7de] text-[#131b2e] hover:bg-[#f1f5f9] disabled:opacity-40 transition-colors font-medium cursor-pointer"
              title="Hapus titik terakhir"
            >
              Hapus Titik
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={points.length === 0}
              className="min-h-[34px] px-3 py-1 rounded-md bg-white border border-[#fecdd3] text-[#be123c] hover:bg-[#fff1f2] disabled:opacity-40 transition-colors font-medium cursor-pointer"
              title="Hapus semua titik"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleLocateMe}
              className="min-h-[34px] px-3 py-1 rounded-md bg-white border border-[#d0d7de] text-[#131b2e] hover:bg-[#f1f5f9] transition-colors font-medium cursor-pointer"
              title="Pusatkan ke lokasi GPS Anda"
            >
              Lokasi Saya
            </button>
            <button
              type="button"
              onClick={handleCenterUnand}
              className="min-h-[34px] px-3 py-1 rounded-md bg-white border border-[#d0d7de] text-[#131b2e] hover:bg-[#f1f5f9] transition-colors font-medium cursor-pointer"
              title="Pusatkan peta ke Kampus UNAND"
            >
              Pusat Kampus
            </button>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full z-0 relative focus:outline-none"
      />
    </div>
  );
}
