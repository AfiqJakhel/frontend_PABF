"use client";

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { areaAbsensiService } from "@/services/areaAbsensiService";
import type { AreaAbsensi, BuatAreaPayload, UpdateAreaPayload } from "@/types/areaAbsensi";

// Dynamic import with SSR disabled for Leaflet map component
const AreaMapEditor = dynamic(() => import("@/components/map/AreaMapEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-[460px] w-full flex items-center justify-center bg-[#f8fafc] rounded-xl border border-[#e2e8f0]">
      <div className="flex flex-col items-center gap-2 text-[#6f7a6e] text-sm">
        <div className="w-6 h-6 border-2 border-[#00652c] border-t-transparent rounded-full animate-spin" />
        <span>Memuat Peta Interaktif Geofencing…</span>
      </div>
    </div>
  ),
});

export default function AreaAbsensiPage() {
  const [areas, setAreas] = useState<AreaAbsensi[]>([]);
  const [namaGedung, setNamaGedung] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form & Editing state
  const [editingArea, setEditingArea] = useState<AreaAbsensi | null>(null);
  const [nama, setNama] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [currentCoords, setCurrentCoords] = useState<number[][][]>([]);
  const [mapInitialCoords, setMapInitialCoords] = useState<number[][][] | null>(null);
  const [mapKey, setMapKey] = useState(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Fetch building-scoped areas from backend
  const loadAreas = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await areaAbsensiService.getPolygonFasil();
      if (res?.success && res.data) {
        setNamaGedung(res.data.nama_gedung);
        setAreas(res.data.areas);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat daftar area absensi gedung.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAreas();
  }, [loadAreas]);

  // Select area from list to edit
  const handleSelectArea = (area: AreaAbsensi) => {
    setEditingArea(area);
    setNama(area.nama);
    setDeskripsi(area.deskripsi || "");
    setIsActive(area.is_active);
    setCurrentCoords(area.coordinates || []);
    setMapInitialCoords(area.coordinates || null);
    setMapKey((k) => k + 1);
    setFeedback(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStartCreate = () => {
    setEditingArea(null);
    setNama(namaGedung ? `Area Presensi ${namaGedung}` : "");
    setDeskripsi("");
    setIsActive(true);
    setCurrentCoords([]);
    setMapInitialCoords(null);
    setMapKey((k) => k + 1);
    setFeedback(null);
  };

  const handleCancelForm = () => {
    handleStartCreate();
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!nama.trim()) {
      setFeedback({ type: "error", message: "Nama area wajib diisi." });
      return;
    }

    const ring = currentCoords?.[0] || [];
    if (ring.length < 4) {
      setFeedback({
        type: "error",
        message: "Polygon wajib memiliki minimal 3 titik sudut koordinat pada peta.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingArea) {
        const payload: UpdateAreaPayload = {
          nama: nama.trim(),
          deskripsi: deskripsi.trim() || undefined,
          coordinates: currentCoords,
          is_active: isActive,
        };
        const res = await areaAbsensiService.updatePolygonFasil(editingArea.id, payload);
        if (res.success) {
          setFeedback({ type: "success", message: `Area "${nama}" berhasil diperbarui untuk ${namaGedung}.` });
          handleCancelForm();
          loadAreas();
        }
      } else {
        const payload: BuatAreaPayload = {
          nama: nama.trim(),
          deskripsi: deskripsi.trim() || undefined,
          coordinates: currentCoords,
          is_active: isActive,
        };
        const res = await areaAbsensiService.buatPolygonFasil(payload);
        if (res.success) {
          setFeedback({ type: "success", message: `Area baru "${nama}" berhasil disimpan untuk ${namaGedung}.` });
          handleCancelForm();
          loadAreas();
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan polygon area absensi.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle active/inactive
  const handleToggle = async (area: AreaAbsensi) => {
    try {
      const res = await areaAbsensiService.toggleActivePolygonFasil(area.id);
      if (res.success) {
        setFeedback({
          type: "success",
          message: `Status area "${area.nama}" diubah menjadi ${
            res.data?.is_active ? "Aktif" : "Nonaktif"
          }.`,
        });
        loadAreas();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengubah status area.";
      setFeedback({ type: "error", message: msg });
    }
  };

  // Delete area
  const handleDelete = async (id: number) => {
    try {
      const res = await areaAbsensiService.hapusPolygonFasil(id);
      if (res.success) {
        setFeedback({ type: "success", message: `Area absensi berhasil dihapus dari ${namaGedung}.` });
        setDeleteConfirmId(null);
        if (editingArea?.id === id) {
          handleCancelForm();
        }
        loadAreas();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghapus area absensi.";
      setFeedback({ type: "error", message: msg });
    }
  };

  // Points count calculation
  const ringPoints = currentCoords?.[0] || [];
  const uniquePointsCount = ringPoints.length > 0 ? Math.max(0, ringPoints.length - 1) : 0;
  const isPolygonValid = uniquePointsCount >= 3;

  return (
    <div className="flex flex-col gap-8 pb-16 w-full">
      {/* ── Page Header: Editorial & Clean ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
        <div>
          <h1 className="ui-page-title">
            Pengaturan Area Presensi
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-[#6f7a6e] flex-wrap">
            <span className="font-semibold text-[#131b2e]">
              {namaGedung || "Gedung Binaan"}
            </span>
            <span>•</span>
            <span className="text-[#00652c] font-medium">
              Area Geofencing Mahasiswa
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleStartCreate}
          className="ui-btn-secondary text-xs sm:text-sm self-start md:self-auto"
        >
          Reset / Area Baru
        </button>
      </div>

      {/* ── Feedback Banner ── */}
      {feedback && (
        <div
          role="alert"
          className={`flex items-center justify-between p-4 rounded-lg border text-sm font-medium ${
            feedback.type === "success"
              ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
              : "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-sm font-bold ml-4 cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Map is the Dominant Element (Full-Width, Uncramped) ── */}
      <div className="flex flex-col gap-4">
        <div className="w-full bg-white rounded-xl border border-[#e2e8f0] overflow-hidden shadow-xs">
          <AreaMapEditor
            key={mapKey}
            initialCoordinates={mapInitialCoords}
            onChangeCoordinates={setCurrentCoords}
            existingAreas={areas}
            height="500px"
          />
        </div>

        {/* ── Action & Properties Panel directly below Map ── */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#e2e8f0] p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e2e8f0]">
            <div>
              <h2 className="text-base font-bold text-[#131b2e]">
                {editingArea ? `Edit: ${editingArea.nama}` : "Detail Polygon Area"}
              </h2>
              <span className="text-xs text-[#6f7a6e]">
                {editingArea
                  ? "Sesuaikan titik sudut pada peta di atas, lalu simpan perubahan."
                  : "Klik pada peta di atas untuk menambahkan titik sudut polygon (minimal 3 titik)."}
              </span>
            </div>

            {/* Coordinates Validation Indicator */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-[#6f7a6e]">Status Titik:</span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                  isPolygonValid
                    ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
                    : "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
                }`}
              >
                {uniquePointsCount} Titik {isPolygonValid ? "(Valid)" : "(Minimal 3)"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="area-name-input" className="block text-xs font-semibold text-[#131b2e] mb-1">
                Nama Area <span className="text-[#be123c]">*</span>
              </label>
              <input
                id="area-name-input"
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder={`Contoh: Area Presensi ${namaGedung || "Gedung"}`}
                className="w-full h-10 px-3.5 bg-white border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                required
              />
            </div>

            <div>
              <label htmlFor="area-desc-input" className="block text-xs font-semibold text-[#131b2e] mb-1">
                Deskripsi
              </label>
              <input
                id="area-desc-input"
                type="text"
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                placeholder="Catatan batas jangkauan (opsional)"
                className="w-full h-10 px-3.5 bg-white border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {/* Active Toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-[#d0d7de] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00652c]" />
              </label>
              <span className="text-xs sm:text-sm font-medium text-[#131b2e]">
                Area presensi {isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>

            {/* Submit & Cancel Buttons */}
            <div className="flex items-center gap-2.5">
              {(editingArea || uniquePointsCount > 0 || nama) && (
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="ui-btn-secondary text-xs sm:text-sm"
                >
                  Batal
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isPolygonValid || !nama.trim()}
                className="ui-btn-primary text-xs sm:text-sm disabled:opacity-40"
              >
                {isSubmitting
                  ? "Menyimpan…"
                  : editingArea
                  ? "Perbarui Area"
                  : "Simpan Area"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── Table of Existing Polygon Areas ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="ui-section-title">
            Daftar Area Polygon Terdaftar
          </h2>
          <span className="text-xs font-medium text-[#6f7a6e]">
            {areas.length} area terdaftar
          </span>
        </div>

        <div className="bg-white rounded-lg border border-[#e2e8f0] overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#6f7a6e]">Memuat data polygon…</div>
          ) : areas.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#6f7a6e]">
              Belum ada area polygon yang terdaftar untuk {namaGedung}. Silakan buat menggunakan peta di atas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-[#f8fafc] text-[#131b2e] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3.5 px-5">Nama Area</th>
                    <th className="py-3.5 px-5">Deskripsi</th>
                    <th className="py-3.5 px-5">Titik Sudut</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5">Dibuat Pada</th>
                    <th className="py-3.5 px-5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {areas.map((area) => {
                    const isSelected = area.id === editingArea?.id;
                    const ring = area.coordinates?.[0] || [];
                    const pointCount = ring.length > 0 ? Math.max(0, ring.length - 1) : 0;

                    return (
                      <tr
                        key={area.id}
                        className={`hover:bg-[#f8fafc] transition-colors ${
                          isSelected ? "bg-[#ecfdf5]" : ""
                        }`}
                      >
                        <td className="py-3.5 px-5 font-semibold text-[#131b2e]">
                          {area.nama}
                        </td>
                        <td className="py-3.5 px-5 text-[#6f7a6e] max-w-xs truncate">
                          {area.deskripsi || "—"}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs text-[#3f493f]">
                          {pointCount} titik
                        </td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                              area.is_active
                                ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
                                : "bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1]"
                            }`}
                          >
                            {area.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-xs text-[#6f7a6e]">
                          {area.created_at
                            ? new Date(area.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggle(area)}
                              className="px-2.5 py-1 text-xs font-medium border border-[#d0d7de] hover:border-[#131b2e] text-[#131b2e] bg-white rounded-md transition-colors cursor-pointer"
                            >
                              {area.is_active ? "Nonaktifkan" : "Aktifkan"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSelectArea(area)}
                              className="px-2.5 py-1 text-xs font-medium border border-[#00652c] text-[#00652c] bg-white hover:bg-[#ecfdf5] rounded-md transition-colors cursor-pointer"
                            >
                              Edit
                            </button>

                            {deleteConfirmId === area.id ? (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleDelete(area.id)}
                                  className="px-2.5 py-1 text-xs font-semibold bg-[#be123c] text-white rounded-md cursor-pointer"
                                >
                                  Ya
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-2.5 py-1 text-xs font-medium border border-[#d0d7de] text-[#6f7a6e] bg-white rounded-md cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(area.id)}
                                className="px-2.5 py-1 text-xs font-medium border border-[#fecdd3] hover:bg-[#fff1f2] text-[#be123c] bg-white rounded-md transition-colors cursor-pointer"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
