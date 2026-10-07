"use client";

import { useState, useEffect, useCallback } from "react";
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

      // 2. Data rekapitulasi kehadiran (scoped otomatis di backend)
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

  const filtered = summaryList.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.nama.toLowerCase().includes(q) || item.nim.toLowerCase().includes(q);
  });

  // Calculate aggregated figures for clean editorial summary
  const totalHadir = summaryList.reduce((acc, item) => acc + item.hadir, 0);
  const totalTerlambat = summaryList.reduce((acc, item) => acc + item.terlambat, 0);
  const totalTidakHadir = summaryList.reduce((acc, item) => acc + item.alfa, 0);
  const totalIzinSakit = summaryList.reduce((acc, item) => acc + item.izin + item.sakit, 0);

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

  return (
    <div className="flex flex-col gap-8 pb-16 w-full">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          className={`fixed top-4 right-4 z-50 px-4 py-3 border text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
              : "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header: Editorial & Clean */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
        <div>
          <h1 className="ui-page-title">
            Rekap & Laporan Kehadiran
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-[#6f7a6e] flex-wrap">
            <span className="font-semibold text-[#131b2e]">
              {gedung?.nama_gedung || "Gedung Binaan"}
            </span>
            <span>•</span>
            <span className="text-[#3f493f]">
              {formatTanggalRange()}
            </span>
          </div>
        </div>

        <button
          type="button"
          disabled={exporting}
          onClick={handleExportCSV}
          className="ui-btn-primary text-xs sm:text-sm disabled:opacity-50 self-start md:self-auto"
        >
          {exporting ? "Mengunduh..." : "Unduh Rekap CSV"}
        </button>
      </div>

      {/* Filter Row: Clean & Functional */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 py-2">
        <div>
          <label htmlFor="periode-bulan-input" className="text-xs font-semibold text-[#6f7a6e] block mb-1">
            Periode Bulan
          </label>
          <input
            id="periode-bulan-input"
            type="month"
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
            className="h-10 px-3 bg-white border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-xs sm:text-sm font-medium text-[#131b2e] outline-none"
          />
        </div>

        <div>
          <label htmlFor="filter-sesi-select" className="text-xs font-semibold text-[#6f7a6e] block mb-1">
            Sesi Presensi
          </label>
          <select
            id="filter-sesi-select"
            value={filterSesi}
            onChange={(e) => setFilterSesi(e.target.value)}
            className="h-10 px-3 bg-white border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-xs sm:text-sm font-medium text-[#131b2e] outline-none cursor-pointer"
          >
            <option value="all">Semua Sesi</option>
            <option value="subuh">Subuh</option>
            <option value="malam">Malam</option>
            <option value="kegiatan">Kegiatan Khusus</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px] max-w-sm">
          <label htmlFor="search-mahasiswa-rekap" className="text-xs font-semibold text-[#6f7a6e] block mb-1">
            Cari Mahasiswa
          </label>
          <input
            id="search-mahasiswa-rekap"
            type="text"
            placeholder="Ketik nama atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-3.5 bg-white border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-xs sm:text-sm text-[#131b2e] placeholder:text-[#6f7a6e] outline-none"
          />
        </div>
      </div>

      {/* Subtle Horizontal Divider */}
      <div className="border-b border-[#e2e8f0]" />

      {/* Editorial Ringkasan Section */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#6f7a6e] mb-3">
          Ringkasan Kehadiran Periode Ini
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-2">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#6f7a6e]">Hadir</span>
            <span className="ui-kpi-value text-[#15803d] mt-1">
              {loading ? "..." : totalHadir}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#6f7a6e]">Terlambat</span>
            <span className="ui-kpi-value text-[#b45309] mt-1">
              {loading ? "..." : totalTerlambat}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#6f7a6e]">Tidak Hadir (Alfa)</span>
            <span className="ui-kpi-value text-[#be123c] mt-1">
              {loading ? "..." : totalTidakHadir}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-medium text-[#6f7a6e]">Izin / Sakit</span>
            <span className="ui-kpi-value text-[#0369a1] mt-1">
              {loading ? "..." : totalIzinSakit}
            </span>
          </div>
        </div>
      </div>

      {/* Subtle Horizontal Divider */}
      <div className="border-b border-[#e2e8f0]" />

      {/* Table Section: Clean & Readable */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="ui-section-title">
            Tabel Kehadiran
          </h2>
          <span className="text-xs font-medium text-[#6f7a6e]">
            {filtered.length} mahasiswa
          </span>
        </div>

        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm text-[#6f7a6e]">
              Memuat rekap kehadiran {gedung?.nama_gedung || ""}...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-[#6f7a6e]">
              Tidak ada data presensi pada rentang tanggal ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f8fafc] text-[#131b2e] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Mahasiswa</th>
                    <th className="px-5 py-3.5">Kamar</th>
                    <th className="px-5 py-3.5 text-center">Hadir</th>
                    <th className="px-5 py-3.5 text-center">Terlambat</th>
                    <th className="px-5 py-3.5 text-center">Izin / Sakit</th>
                    <th className="px-5 py-3.5 text-center">Alfa</th>
                    <th className="px-5 py-3.5 text-right">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filtered.map((item) => (
                    <tr key={item.nim} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-[#131b2e] block">{item.nama}</span>
                        <span className="text-xs font-mono text-[#6f7a6e]">{item.nim}</span>
                      </td>
                      <td className="px-5 py-3.5 text-[#3f493f]">
                        Kamar {item.kamar || "-"}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-medium text-[#15803d]">
                        {item.hadir}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-medium text-[#b45309]">
                        {item.terlambat}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-medium text-[#0369a1]">
                        {item.izin + item.sakit}
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-medium text-[#be123c]">
                        {item.alfa}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
                            item.persentase >= 85
                              ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
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
          )}
        </div>
      </div>
    </div>
  );
}
