"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import "@/app/izin.css";
import { izinService } from "@/services/izinService";
import { IzinItem } from "@/types/izin";
import { useAuth } from "@/hooks/useAuth";
import IzinStatusBadge from "@/components/izin/IzinStatusBadge";
import RejectReasonDialog from "@/components/izin/RejectReasonDialog";
import DetailIzinModal from "@/components/izin/DetailIzinModal";
import { LoadingState, EmptyState, ErrorState } from "@/components/izin/StateViews";

function formatTanggalIndo(tglStr?: string | null) {
  if (!tglStr) return "-";
  try {
    const d = new Date(tglStr);
    if (isNaN(d.getTime())) return tglStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return tglStr;
  }
}

function hitungDurasiHari(mulaiStr?: string | null, selesaiStr?: string | null) {
  if (!mulaiStr) return "";
  if (!selesaiStr || mulaiStr === selesaiStr) return "1 Hari";
  try {
    const d1 = new Date(mulaiStr);
    const d2 = new Date(selesaiStr);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} Hari`;
  } catch {
    return "";
  }
}

export default function FasilitatorIzinPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [izinList, setIzinList] = useState<IzinItem[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [statusTab, setStatusTab] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterJenis, setFilterJenis] = useState<string>("all"); // 'all' | 'full' | 'half'
  const [filterLampiran, setFilterLampiran] = useState<string>("all"); // 'all' | 'with_doc' | 'no_doc'
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // State Modal Detail & Review Action
  const [detailItem, setDetailItem] = useState<IzinItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [rejectDialogItem, setRejectDialogItem] = useState<IzinItem | null>(null);

  const fetchDaftarIzin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await izinService.getIzinReview({
        status: statusTab,
        page: currentPage,
        per_page: 50,
      });
      setIzinList(data.items || []);
      setTotalItems(data.total || (data.items ? data.items.length : 0));
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat daftar perizinan.");
    } finally {
      setIsLoading(false);
    }
  }, [statusTab, currentPage]);

  useEffect(() => {
    fetchDaftarIzin();
  }, [fetchDaftarIzin]);

  // Reset page when tab changes
  const handleTabChange = (tab: string) => {
    setStatusTab(tab);
    setCurrentPage(1);
  };

  // Client-side search and filtering
  const filteredList = useMemo(() => {
    return izinList.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nama = (item.nama_pemohon || "").toLowerCase();
        const nim = (item.nim_pemohon || "").toLowerCase();
        const gedung = (item.nama_gedung || "").toLowerCase();
        const kamar = (item.nomor_kamar || "").toLowerCase();
        const alasan = (item.keterangan || item.alasan || "").toLowerCase();

        const matchSearch =
          nama.includes(query) ||
          nim.includes(query) ||
          gedung.includes(query) ||
          kamar.includes(query) ||
          alasan.includes(query);

        if (!matchSearch) return false;
      }

      // 2. Filter Jenis Izin
      if (filterJenis !== "all") {
        if (item.jenis !== filterJenis) return false;
      }

      // 3. Filter Lampiran Dokumen
      if (filterLampiran === "with_doc" && !item.has_dokumen) return false;
      if (filterLampiran === "no_doc" && item.has_dokumen) return false;

      return true;
    });
  }, [izinList, searchQuery, filterJenis, filterLampiran]);

  const handleApprove = async (id: number) => {
    if (!window.confirm("Setujui pengajuan izin ini?")) return;

    setActionLoadingId(id);
    try {
      await izinService.reviewIzin(id, { aksi: "approve" });
      if (detailItem && detailItem.id === id) {
        setDetailItem(null);
      }
      fetchDaftarIzin();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyetujui izin.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenRejectDialog = (item: IzinItem) => {
    setRejectDialogItem(item);
  };

  const handleConfirmReject = async (catatan: string) => {
    if (!rejectDialogItem) return;

    setActionLoadingId(rejectDialogItem.id);
    try {
      await izinService.reviewIzin(rejectDialogItem.id, {
        aksi: "reject",
        catatan,
      });
      setRejectDialogItem(null);
      if (detailItem && detailItem.id === rejectDialogItem.id) {
        setDetailItem(null);
      }
      fetchDaftarIzin();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menolak izin.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="izin-root flex flex-col gap-6 w-full pb-16">
      {/* ── Page Header (1 Halaman Penuh, Modern & Rounded) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
              Peninjauan Perizinan Asrama
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#64748b] mt-1">
            {isAdmin
              ? "Mode Administrator: Peninjauan seluruh pengajuan izin gedung asrama (Read-Only)."
              : "Verifikasi, telaah berkas lampiran, dan berikan persetujuan perizinan mahasiswa binaan Anda."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdmin && (
            <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-[#f1f5f9] border border-[#cbd5e1] rounded-full text-[#475569]">
              Mode Read-Only (Admin)
            </span>
          )}
          <button
            type="button"
            onClick={fetchDaftarIzin}
            className="izin-btn-outline text-xs h-9 px-3.5 rounded-lg flex items-center gap-1.5"
            title="Muat Ulang Data"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={isLoading ? "animate-spin" : ""}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* ── Status Tabs Bar ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-2.5 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {[
            { key: "pending", label: "Perlu Review" },
            { key: "approved", label: "Disetujui" },
            { key: "rejected", label: "Ditolak" },
            { key: "cancelled", label: "Dibatalkan" },
            { key: "all", label: "Semua Izin" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`izin-tab ${
                statusTab === tab.key ? "izin-tab-active" : "izin-tab-inactive"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* View mode switcher */}
        <div className="hidden sm:flex items-center gap-1 border-l border-[#e2e8f0] pl-2.5">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === "table"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-[#64748b] hover:bg-[#f1f5f9]"
            }`}
            title="Tampilan Tabel (Rekomendasi untuk banyak data)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" />
            </svg>
            Tabel
          </button>
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`p-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              viewMode === "grid"
                ? "bg-[#0f172a] text-white shadow-xs"
                : "text-[#64748b] hover:bg-[#f1f5f9]"
            }`}
            title="Tampilan Kartu"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
            </svg>
            Kartu
          </button>
        </div>
      </div>

      {/* ── Main Content: Hanya tampilkan tabel & filter jika ada data ── */}
      <div className="w-full flex-1">
        {isLoading ? (
          <LoadingState message="Memuat daftar pengajuan perizinan asrama..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchDaftarIzin} />
        ) : izinList.length === 0 ? (
          /* Jika tidak ada data sama sekali di status ini: hapus tabel & tampilkan pesan ringkas */
          <div className="py-16 text-center text-sm text-[#64748b]">
            Tidak ada pengajuan izin dengan status &apos;{statusTab}&apos; di gedung tanggung jawab Anda.
          </div>
        ) : (
          /* Jika ada data: berikan toolbar filter dan tabel perizinan */
          <div className="flex flex-col gap-4">
            {/* ── Search & Filter Controls (Toolbar) ── */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-xs">
              {/* Search bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama mahasiswa, NIM, kamar, atau alasan..."
                  className="izin-input pl-9 text-xs sm:text-sm h-10 rounded-lg"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#94a3b8]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#94a3b8] hover:text-[#0f172a] text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Dropdowns */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Filter Jenis */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#64748b] whitespace-nowrap">Jenis:</span>
                  <select
                    value={filterJenis}
                    onChange={(e) => setFilterJenis(e.target.value)}
                    className="izin-select text-xs h-10 py-1 px-3 w-auto rounded-lg"
                  >
                    <option value="all">Semua Jenis</option>
                    <option value="full">Full Day</option>
                    <option value="half">Half Day</option>
                  </select>
                </div>

                {/* Filter Lampiran */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#64748b] whitespace-nowrap">Lampiran:</span>
                  <select
                    value={filterLampiran}
                    onChange={(e) => setFilterLampiran(e.target.value)}
                    className="izin-select text-xs h-10 py-1 px-3 w-auto rounded-lg"
                  >
                    <option value="all">Semua</option>
                    <option value="with_doc">Ada Berkas</option>
                    <option value="no_doc">Tanpa Berkas</option>
                  </select>
                </div>

                {/* Results count pill */}
                <div className="text-xs text-[#64748b] px-3 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-full whitespace-nowrap font-medium">
                  Total: <strong>{filteredList.length}</strong> data
                </div>
              </div>
            </div>

            {/* Jika hasil filter kosong */}
            {filteredList.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#64748b]">
                Tidak ditemukan pengajuan izin yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterJenis("all");
                    setFilterLampiran("all");
                  }}
                  className="block mx-auto mt-2 text-xs text-[#166534] font-semibold underline cursor-pointer"
                >
                  Reset Pencarian & Filter
                </button>
              </div>
            ) : viewMode === "table" ? (
              /* ── Table View: 1 Halaman Full, Dense, Rounded & Clean ── */
              <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0] font-semibold text-xs tracking-wide">
                  <tr>
                    <th className="px-5 py-3.5">Mahasiswa</th>
                    <th className="px-5 py-3.5">Gedung / Kamar</th>
                    <th className="px-5 py-3.5">Jenis Izin</th>
                    <th className="px-5 py-3.5">Periode Tanggal</th>
                    <th className="px-5 py-3.5">Alasan / Keterangan</th>
                    <th className="px-5 py-3.5 text-center">Lampiran</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] bg-white">
                  {filteredList.map((item) => {
                    const durasi = hitungDurasiHari(item.tanggal_mulai, item.tanggal_selesai);
                    const isPending = item.status === "pending";
                    const isActionLoading = actionLoadingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#f8fafc] transition-colors group cursor-pointer"
                        onClick={() => setDetailItem(item)}
                      >
                        {/* Mahasiswa Info */}
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-[#0f172a] group-hover:text-[#166534] block">
                            {item.nama_pemohon || "Mahasiswa"}
                          </span>
                          <span className="font-mono text-[#64748b] text-[11px]">
                            {item.nim_pemohon || "-"}
                          </span>
                        </td>

                        {/* Gedung & Kamar */}
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-[#0f172a] block">
                            {item.nama_gedung || "Gedung Asrama"}
                          </span>
                          <span className="text-[#64748b] text-[11px]">
                            Kamar {item.nomor_kamar || "-"}
                          </span>
                        </td>

                        {/* Jenis Izin */}
                        <td className="px-5 py-3.5">
                          <span className="inline-block px-2.5 py-0.5 text-[11px] font-medium rounded-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#334155]">
                            {item.jenis === "half"
                              ? `Half Day (${item.sesi?.nama || "Sesi"})`
                              : "Full Day"}
                          </span>
                        </td>

                        {/* Periode Tanggal */}
                        <td className="px-5 py-3.5">
                          <span className="font-medium text-[#0f172a] block">
                            {formatTanggalIndo(item.tanggal_mulai)}
                          </span>
                          {item.tanggal_selesai && item.tanggal_selesai !== item.tanggal_mulai && (
                            <span className="text-[#64748b] block text-[11px]">
                              s.d. {formatTanggalIndo(item.tanggal_selesai)} ({durasi})
                            </span>
                          )}
                        </td>

                        {/* Alasan (Truncated for clean density) */}
                        <td className="px-5 py-3.5 max-w-xs">
                          <p
                            className="text-[#475569] truncate line-clamp-1"
                            title={item.keterangan || item.alasan}
                          >
                            {item.keterangan || item.alasan}
                          </p>
                        </td>

                        {/* Lampiran Dokumen */}
                        <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          {item.has_dokumen ? (
                            <button
                              type="button"
                              onClick={() => setDetailItem(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-[#166534] bg-[#ecfdf5] border border-[#a7f3d0] rounded-full hover:bg-[#dcfce7] transition-colors"
                              title="Ada dokumen bukti - Klik untuk melihat"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                              </svg>
                              Ada ({item.dokumen?.length || 1})
                            </button>
                          ) : (
                            <span className="text-[#cbd5e1] text-xs">-</span>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-3.5">
                          <IzinStatusBadge status={item.status} />
                        </td>

                        {/* Aksi Peninjauan */}
                        <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1.5">
                            {/* Tombol Utama: Lihat Detail */}
                            <button
                              type="button"
                              onClick={() => setDetailItem(item)}
                              className="px-3 py-1.5 text-xs font-semibold border border-[#d0d7de] hover:border-[#0f172a] hover:bg-[#f8fafc] text-[#0f172a] bg-white rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                              title="Lihat seluruh detail perizinan"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              Detail
                            </button>

                            {/* Quick Review Buttons jika pending dan bukan admin */}
                            {!isAdmin && isPending && (
                              <>
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleOpenRejectDialog(item)}
                                  className="px-2.5 py-1.5 text-xs font-semibold border border-[#fecdd3] hover:bg-[#fff1f2] text-[#be123c] bg-white rounded-lg transition-colors cursor-pointer"
                                  title="Tolak izin ini"
                                >
                                  Tolak
                                </button>
                                <button
                                  type="button"
                                  disabled={isActionLoading}
                                  onClick={() => handleApprove(item.id)}
                                  className="px-3 py-1.5 text-xs font-semibold bg-[#76b900] hover:bg-[#68a500] text-black rounded-lg transition-colors cursor-pointer shadow-xs"
                                  title="Setujui izin ini"
                                >
                                  {isActionLoading ? "..." : "Setujui"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="p-3.5 border-t border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between text-xs text-[#64748b] gap-2">
              <div>
                Menampilkan <strong>{filteredList.length}</strong> dari <strong>{totalItems}</strong> pengajuan izin
              </div>
              <div className="text-[11px] text-[#94a3b8]">
                💡 Tip: Klik pada baris mana pun untuk membuka jendela detail perizinan.
              </div>
            </div>
          </div>
        ) : (
          /* ── Grid View: Tampilan Kartu Halus & Rounded ── */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((item) => {
              const durasi = hitungDurasiHari(item.tanggal_mulai, item.tanggal_selesai);
              const isPending = item.status === "pending";
              const isActionLoading = actionLoadingId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white border border-[#e2e8f0] rounded-xl p-5 flex flex-col justify-between gap-3.5 shadow-xs hover:border-[#76b900] hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setDetailItem(item)}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-[#f1f5f9] pb-3">
                      <div>
                        <h3 className="font-semibold text-[#0f172a] text-sm hover:text-[#166534]">
                          {item.nama_pemohon || "Mahasiswa"}
                        </h3>
                        <p className="text-xs text-[#64748b] mt-0.5">
                          {item.nim_pemohon || "-"} • {item.nama_gedung || "Gedung"} ({item.nomor_kamar || "-"})
                        </p>
                      </div>
                      <IzinStatusBadge status={item.status} />
                    </div>

                    {/* Metadata */}
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">Jenis Izin:</span>
                        <span className="font-semibold text-[#0f172a]">
                          {item.jenis === "half" ? `Half Day (${item.sesi?.nama || ""})` : "Full Day"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748b]">Rentang Tanggal:</span>
                        <span className="font-medium text-[#0f172a]">
                          {formatTanggalIndo(item.tanggal_mulai)}
                          {item.tanggal_selesai !== item.tanggal_mulai && ` s.d. ${formatTanggalIndo(item.tanggal_selesai)}`}
                        </span>
                      </div>
                      {durasi && (
                        <div className="flex items-center justify-between">
                          <span className="text-[#64748b]">Durasi:</span>
                          <span className="font-semibold text-[#166534]">{durasi}</span>
                        </div>
                      )}

                      <div className="mt-2.5">
                        <span className="text-[#64748b] block mb-1">Alasan:</span>
                        <p className="p-2.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs text-[#334155] line-clamp-2 leading-relaxed">
                          {item.keterangan || item.alasan}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div
                    className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div>
                      {item.has_dokumen ? (
                        <span className="text-[11px] font-semibold text-[#166534] bg-[#ecfdf5] px-2 py-0.5 rounded-full border border-[#a7f3d0] flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          Ada Lampiran
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#94a3b8]">Tanpa lampiran</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDetailItem(item)}
                        className="px-3 py-1.5 text-xs font-semibold border border-[#d0d7de] hover:border-[#0f172a] bg-white rounded-lg"
                      >
                        Detail
                      </button>

                      {!isAdmin && isPending && (
                        <>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleOpenRejectDialog(item)}
                            className="px-2.5 py-1.5 text-xs font-semibold border border-[#fecdd3] hover:bg-[#fff1f2] text-[#be123c] rounded-lg"
                          >
                            Tolak
                          </button>
                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleApprove(item.id)}
                            className="px-3 py-1.5 text-xs font-semibold bg-[#76b900] hover:bg-[#68a500] text-black rounded-lg shadow-xs"
                          >
                            Setujui
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
          </div>
        )}
      </div>

      {/* ── Dialog Alasan Penolakan ── */}
      <RejectReasonDialog
        isOpen={!!rejectDialogItem}
        onClose={() => setRejectDialogItem(null)}
        onSubmit={handleConfirmReject}
        isLoading={actionLoadingId === rejectDialogItem?.id}
      />

      {/* ── Modal Detail Perizinan Lengkap ── */}
      <DetailIzinModal
        item={detailItem}
        isOpen={!!detailItem}
        onClose={() => setDetailItem(null)}
        onApprove={handleApprove}
        onReject={handleOpenRejectDialog}
        isAdmin={isAdmin}
        actionLoadingId={actionLoadingId}
      />
    </div>
  );
}
