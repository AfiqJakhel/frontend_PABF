"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { api, API_BASE_URL } from "@/lib/apiClient";

interface GedungData {
  id: number;
  nama_gedung: string;
}

interface SummaryItem {
  nim: string;
  nama: string;
  gedung: string;
  kamar: string;
  hadir: number;
  terlambat: number;
  alfa: number;
  izin: number;
  sakit: number;
  total: number;
  persentase: number;
}

export default function FasilitatorRekapPage() {
  const now = new Date();
  const [filterBulan, setFilterBulan] = useState(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  );
  const [filterSesi, setFilterSesi] = useState<string>("all");
  const [filterKategori, setFilterKategori] = useState<string>("all"); // 'all' | 'baik' | 'cukup' | 'kurang'
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [gedung, setGedung] = useState<GedungData | null>(null);
  const [summaryList, setSummaryList] = useState<SummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [tahun, bulan] = filterBulan.split("-").map(Number);
  const tanggalMulai = `${filterBulan}-01`;
  const tanggalSelesai = `${filterBulan}-${String(new Date(tahun, bulan, 0).getDate()).padStart(2, "0")}`;

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRekap = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Info gedung binaan
      const resGedung = await api.get<{ success: boolean; data: GedungData }>("/api/fasil/gedung-saya");
      if (resGedung?.data) {
        setGedung(resGedung.data);
      }

      // 2. Data rekapitulasi seluruh mahasiswa di gedung binaan
      const params = new URLSearchParams({
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
        summary: "true",
      });
      if (filterSesi && filterSesi !== "all") {
        params.append("sesi", filterSesi);
      }

      const resRekap = await api.get<{
        success: boolean;
        data: {
          gedung_id: number;
          nama_gedung: string;
          summary: SummaryItem[];
          total_mahasiswa: number;
        };
      }>(`/api/fasil/presensi/rekap?${params.toString()}`);

      if (resRekap?.data?.summary) {
        setSummaryList(resRekap.data.summary);
      }
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal memuat rekap presensi.");
    } finally {
      setLoading(false);
    }
  }, [tanggalMulai, tanggalSelesai, filterSesi]);

  useEffect(() => {
    fetchRekap();
  }, [fetchRekap]);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
      const params = new URLSearchParams({
        tanggal_mulai: tanggalMulai,
        tanggal_selesai: tanggalSelesai,
      });
      if (filterSesi && filterSesi !== "all") {
        params.append("sesi", filterSesi);
      }

      const url = `${API_BASE_URL}/api/fasil/presensi/export?${params.toString()}`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal mengunduh file ekspor dari server.");
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      const safeGedung = gedung?.nama_gedung ? gedung.nama_gedung.replace(/\s+/g, "_").toLowerCase() : "gedung";
      a.download = `rekap_presensi_${safeGedung}_${tanggalMulai}_${tanggalSelesai}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("success", "File rekapitulasi berhasil diunduh.");
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal mengekspor data.");
    } finally {
      setExporting(false);
    }
  };

  // Client-side filtering (Search + Kategori Kehadiran)
  const filtered = useMemo(() => {
    return summaryList.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          item.nama.toLowerCase().includes(q) ||
          item.nim.toLowerCase().includes(q) ||
          (item.kamar && item.kamar.toLowerCase().includes(q));
        if (!match) return false;
      }

      // 2. Filter Kategori Performa
      if (filterKategori === "baik" && item.persentase < 85) return false;
      if (filterKategori === "cukup" && (item.persentase < 75 || item.persentase >= 85)) return false;
      if (filterKategori === "kurang" && item.persentase >= 75) return false;

      return true;
    });
  }, [summaryList, searchQuery, filterKategori]);

  const formatTanggalRange = () => {
    try {
      const d1 = new Date(tanggalMulai);
      const d2 = new Date(tanggalSelesai);
      const opt: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
      return `${new Intl.DateTimeFormat("id-ID", opt).format(d1)} — ${new Intl.DateTimeFormat("id-ID", opt).format(d2)}`;
    } catch {
      return `${tanggalMulai} — ${tanggalSelesai}`;
    }
  };

  const getBulanNama = () => {
    try {
      const d = new Date(tahun, bulan - 1, 1);
      return d.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    } catch {
      return filterBulan;
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-16 w-full">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          className={`fixed top-4 right-4 z-50 px-4 py-3 border text-xs sm:text-sm font-semibold rounded-xl shadow-lg transition-all animate-in fade-in ${
            notification.type === "success"
              ? "bg-[#ecfdf5] text-[#166534] border-[#a7f3d0]"
              : "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* ── Page Header (Clean, Rounded, NVIDIA Accent) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
              Rekap & Laporan Kehadiran
            </h1>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-xs sm:text-sm text-[#64748b] flex-wrap">
            <span className="font-semibold text-[#0f172a]">
              {gedung?.nama_gedung || "Gedung Binaan"}
            </span>
            <span>•</span>
            <span className="text-[#334155] font-medium">
              Periode {getBulanNama()} ({formatTanggalRange()})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRekap}
            disabled={loading}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#f8fafc] text-[#0f172a] border border-[#d0d7de] font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Segarkan Data Rekap"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={loading ? "animate-spin" : ""}
            >
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
            </svg>
            Refresh
          </button>

          {/* Primary Action Button (DESIGN.md: exactly 1 solid green button per screen) */}
          <button
            type="button"
            disabled={exporting || summaryList.length === 0}
            onClick={handleExportCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#76b900] hover:bg-[#68a500] text-black font-bold text-xs sm:text-sm rounded-lg shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {exporting ? "Mengunduh..." : "Unduh Rekap CSV"}
          </button>
        </div>
      </div>

      {/* ── Filter & Search Toolbar (Smooth Rounded-xl) ── */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Periode Bulan */}
          <div className="flex items-center gap-2">
            <label htmlFor="periode-bulan-input" className="text-xs font-semibold text-[#64748b] whitespace-nowrap">
              Bulan:
            </label>
            <input
              id="periode-bulan-input"
              type="month"
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="h-9 px-3 bg-white border border-[#d0d7de] focus:border-[#76b900] rounded-lg text-xs font-medium text-[#0f172a] outline-none transition-colors"
            />
          </div>

          {/* Sesi Presensi */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-sesi-select" className="text-xs font-semibold text-[#64748b] whitespace-nowrap">
              Sesi:
            </label>
            <select
              id="filter-sesi-select"
              value={filterSesi}
              onChange={(e) => setFilterSesi(e.target.value)}
              className="h-9 px-3 bg-white border border-[#d0d7de] focus:border-[#76b900] rounded-lg text-xs font-medium text-[#0f172a] outline-none cursor-pointer transition-colors"
            >
              <option value="all">Semua Sesi</option>
              <option value="subuh">Pagi (Subuh)</option>
              <option value="malam">Malam</option>
              <option value="kegiatan">Kegiatan Khusus</option>
            </select>
          </div>

          {/* Filter Kategori Performa */}
          <div className="flex items-center gap-2">
            <label htmlFor="filter-kategori-select" className="text-xs font-semibold text-[#64748b] whitespace-nowrap">
              Status Disiplin:
            </label>
            <select
              id="filter-kategori-select"
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="h-9 px-3 bg-white border border-[#d0d7de] focus:border-[#76b900] rounded-lg text-xs font-medium text-[#0f172a] outline-none cursor-pointer transition-colors"
            >
              <option value="all">Semua Mahasiswa</option>
              <option value="baik">Sangat Baik (≥85%)</option>
              <option value="cukup">Cukup (75% - 84%)</option>
              <option value="kurang">Perlu Pembinaan (&lt;75%)</option>
            </select>
          </div>
        </div>

        {/* Right Search Bar */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder="Cari nama, NIM, atau kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-8 pr-7 bg-white border border-[#d0d7de] focus:border-[#76b900] rounded-lg text-xs text-[#0f172a] placeholder:text-[#94a3b8] outline-none transition-colors"
            />
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#94a3b8]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#94a3b8] hover:text-[#0f172a] text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <span className="text-xs text-[#64748b] px-2.5 py-1.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-full whitespace-nowrap font-medium">
            <strong>{filtered.length}</strong> mahasiswa
          </span>
        </div>
      </div>

      {/* ── Table Section: Clean, Rounded & High-Density Data Grid ── */}
      <div className="w-full flex-1">
        {loading ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-12 text-center shadow-xs">
            <div className="w-6 h-6 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs sm:text-sm text-[#64748b] font-medium">
              Memuat rekap kehadiran {gedung?.nama_gedung || ""}...
            </p>
          </div>
        ) : summaryList.length === 0 ? (
          /* Empty State jika belum ada mahasiswa di gedung ini */
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-12 text-center shadow-xs">
            <p className="text-sm font-semibold text-[#0f172a]">Belum Ada Mahasiswa Terdaftar</p>
            <p className="text-xs text-[#64748b] mt-1">
              Tidak ada data mahasiswa pada gedung binaan Anda.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          /* Empty filter match */
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-12 text-center shadow-xs">
            <p className="text-sm font-semibold text-[#0f172a]">Hasil Pencarian Tidak Ditemukan</p>
            <p className="text-xs text-[#64748b] mt-1">
              Tidak ada mahasiswa yang cocok dengan kriteria &quot;{searchQuery}&quot; atau filter disiplin terpilih.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterKategori("all");
              }}
              className="mt-3 text-xs text-[#166534] font-semibold underline cursor-pointer"
            >
              Reset Filter & Pencarian
            </button>
          </div>
        ) : (
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#f8fafc] text-[#0f172a] border-b border-[#e2e8f0] font-semibold text-xs tracking-wide">
                  <tr>
                    <th className="px-5 py-3.5 w-12 text-center text-[#64748b]">No</th>
                    <th className="px-5 py-3.5">Mahasiswa</th>
                    <th className="px-5 py-3.5">Kamar</th>
                    <th className="px-5 py-3.5 text-center">Hadir</th>
                    <th className="px-5 py-3.5 text-center">Terlambat</th>
                    <th className="px-5 py-3.5 text-center">Izin / Sakit</th>
                    <th className="px-5 py-3.5 text-center">Alfa</th>
                    <th className="px-5 py-3.5 text-center">Total Sesi</th>
                    <th className="px-5 py-3.5 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9] bg-white">
                  {filtered.map((item, idx) => (
                    <tr
                      key={item.nim}
                      className="hover:bg-[#f8fafc] transition-colors"
                    >
                      {/* Nomor Urut */}
                      <td className="px-5 py-3.5 text-center font-mono text-[#94a3b8]">
                        {idx + 1}
                      </td>

                      {/* Mahasiswa Info */}
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-[#0f172a] block">
                          {item.nama}
                        </span>
                        <span className="text-[11px] font-mono text-[#64748b]">{item.nim}</span>
                      </td>

                      {/* Nomor Kamar */}
                      <td className="px-5 py-3.5 text-[#334155] font-medium">
                        Kamar {item.kamar || "-"}
                      </td>

                      {/* Hadir */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono font-semibold text-[#166534] bg-[#f0fdf4] px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                          {item.hadir}
                        </span>
                      </td>

                      {/* Terlambat */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono font-semibold text-[#b45309] bg-[#fffbeb] px-2.5 py-0.5 rounded-full border border-[#fde68a]">
                          {item.terlambat}
                        </span>
                      </td>

                      {/* Izin / Sakit */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono font-semibold text-[#1d4ed8] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
                          {item.izin + item.sakit}
                        </span>
                      </td>

                      {/* Alfa */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="font-mono font-semibold text-[#be123c] bg-[#fff1f2] px-2.5 py-0.5 rounded-full border border-[#fecdd3]">
                          {item.alfa}
                        </span>
                      </td>

                      {/* Total Sesi */}
                      <td className="px-5 py-3.5 text-center font-mono font-medium text-[#475569]">
                        {item.total}
                      </td>

                      {/* Persentase Kehadiran Badge */}
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            item.persentase >= 85
                              ? "bg-[#ecfdf5] text-[#166534] border-[#a7f3d0]"
                              : item.persentase >= 75
                              ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
                              : "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]"
                          }`}
                        >
                          {item.persentase}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer Summary */}
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between text-xs text-[#64748b] gap-2">
              <div>
                Menampilkan <strong>{filtered.length}</strong> mahasiswa pada {gedung?.nama_gedung || "Gedung Asrama"}
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#166534]" /> Sangat Baik (≥85%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#b45309]" /> Cukup (75-84%)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#be123c]" /> Pembinaan (&lt;75%)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
