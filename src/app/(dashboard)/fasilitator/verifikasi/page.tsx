"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { api, API_BASE_URL } from "@/lib/apiClient";

interface PresensiVerifikasiItem {
  id: number | null;
  user_id: number;
  nim: string;
  nama_mahasiswa: string;
  gedung: string;
  kamar: string;
  sesi: string;
  tanggal: string;
  waktu: string | null;
  status: string; // 'hadir' | 'terlambat' | 'alfa' | 'izin' | 'sakit' | 'belum_absen'
  foto_wajah?: string | null;
  foto_url?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  area_absensi_id?: number | null;
  area_nama?: string | null;
  location_valid: boolean;
  keterangan?: string | null;
  has_record?: boolean;
}

interface ApiResponseVerifikasi {
  gedung_id: number;
  nama_gedung: string;
  tanggal: string;
  sesi: string;
  server_time: string;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  is_active: boolean;
  is_ended: boolean;
  counts?: {
    all: number;
    belum_absen: number;
    hadir: number;
    alfa: number;
    terlambat: number;
    izin: number;
    sakit: number;
    luar_zona: number;
    dalam_zona: number;
  };
  items: PresensiVerifikasiItem[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

const STATUS_STYLES: Record<string, string> = {
  hadir: "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]",
  terlambat: "bg-[#fffbeb] text-[#b45309] border-[#fde68a]",
  alfa: "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]",
  izin: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
  sakit: "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]",
  belum_absen: "bg-[#f8fafc] text-[#64748b] border-[#cbd5e1]",
};

function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const labelMap: Record<string, string> = {
    hadir: "Hadir",
    terlambat: "Terlambat",
    alfa: "Alfa",
    izin: "Izin",
    sakit: "Sakit",
    belum_absen: "Belum Absen",
  };
  const label = labelMap[key] || key;
  return (
    <span
      className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-md border ${
        STATUS_STYLES[key] ?? "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]"
      }`}
    >
      {label}
    </span>
  );
}

function formatTime(waktu: string | null) {
  if (!waktu) return "-";
  const d = new Date(waktu);
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB`;
}

function formatDate(tanggal: string | null) {
  if (!tanggal) return "-";
  const d = new Date(tanggal);
  if (Number.isNaN(d.getTime())) return tanggal;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function getTodayLocal(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function formatLongDate(tanggal: string) {
  const d = new Date(`${tanggal}T00:00:00`);
  if (Number.isNaN(d.getTime())) return tanggal;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

function formatClockOnly(isoString: string | null) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function FasilitatorVerifikasiPage() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSesi, setFilterSesi] = useState<string>("subuh");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeDate, setActiveDate] = useState<string>(getTodayLocal);
  const [namaGedung, setNamaGedung] = useState<string>("");

  const [attendances, setAttendances] = useState<PresensiVerifikasiItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [sessionMeta, setSessionMeta] = useState<{
    waktu_mulai: string | null;
    waktu_selesai: string | null;
    is_active: boolean;
    is_ended: boolean;
    counts?: Record<string, number>;
  }>({
    waktu_mulai: null,
    waktu_selesai: null,
    is_active: false,
    is_ended: false,
  });

  const requestSeq = useRef(0);
  const activeDateRef = useRef(activeDate);

  // Modal & menu states
  const [detailItem, setDetailItem] = useState<PresensiVerifikasiItem | null>(null);
  const [rejectItem, setRejectItem] = useState<PresensiVerifikasiItem | null>(null);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [openMenuUserId, setOpenMenuUserId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the row action menu on outside click or Escape
  useEffect(() => {
    if (openMenuUserId === null) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuUserId(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenuUserId(null);
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [openMenuUserId]);

  // Backend scopes by logged-in facilitator's building and today's date; the client only picks sesi.
  const fetchVerifikasi = useCallback(async () => {
    const seq = ++requestSeq.current;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus && filterStatus !== "all") {
        params.append("status", filterStatus);
      }
      params.append("sesi", filterSesi);
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      params.append("per_page", "50");

      const res = await api.get<{ success: boolean; data: ApiResponseVerifikasi }>(
        `/api/fasil/presensi/verifikasi?${params.toString()}`
      );
      if (seq !== requestSeq.current) return; // stale response

      if (res.success && res.data) {
        setAttendances(res.data.items || []);
        setTotalCount(res.data.total || 0);
        if (res.data.nama_gedung) setNamaGedung(res.data.nama_gedung);
        setSessionMeta({
          waktu_mulai: res.data.waktu_mulai,
          waktu_selesai: res.data.waktu_selesai,
          is_active: res.data.is_active,
          is_ended: res.data.is_ended,
          counts: res.data.counts,
        });
      } else {
        setAttendances([]);
        setTotalCount(0);
      }
    } catch (err: unknown) {
      if (seq !== requestSeq.current) return;
      const msg = err instanceof Error ? err.message : "Gagal memuat daftar verifikasi presensi.";
      setAttendances([]);
      setTotalCount(0);
      setNotification({ type: "error", message: msg });
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, [filterStatus, filterSesi, searchQuery]);

  // Refetch on mount, tab/filter change, and day change (activeDate)
  useEffect(() => {
    fetchVerifikasi();
  }, [fetchVerifikasi, activeDate]);

  // Auto-refresh when session window ends (Requirement 8)
  useEffect(() => {
    if (sessionMeta.is_ended || !sessionMeta.waktu_selesai) return;
    const endTime = new Date(sessionMeta.waktu_selesai).getTime();
    const now = Date.now();
    const diff = endTime - now;
    if (diff > 0 && diff < 86400000) {
      const timer = setTimeout(() => {
        fetchVerifikasi();
      }, diff + 1000);
      return () => clearTimeout(timer);
    }
  }, [sessionMeta.is_ended, sessionMeta.waktu_selesai, fetchVerifikasi]);

  // Detect day change (interval + tab focus): reset to today's data and the Subuh tab
  useEffect(() => {
    const checkDate = () => {
      const today = getTodayLocal();
      if (activeDateRef.current === today) return;
      activeDateRef.current = today;
      setAttendances([]);
      setTotalCount(0);
      setFilterSesi("subuh");
      setFilterStatus("all");
      setSearchQuery("");
      setDetailItem(null);
      setRejectItem(null);
      setActiveDate(today);
    };
    const timer = setInterval(checkDate, 30000);
    document.addEventListener("visibilitychange", checkDate);
    window.addEventListener("focus", checkDate);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", checkDate);
      window.removeEventListener("focus", checkDate);
    };
  }, []);

  const handleApprove = async (item: PresensiVerifikasiItem) => {
    try {
      setActionLoadingId(item.user_id);
      let res;
      if (item.id) {
        res = await api.patch<{ success: boolean; message: string }>(
          `/api/fasil/presensi/${item.id}/status`,
          {
            status: "hadir",
            keterangan: "Diverifikasi & disetujui oleh Fasilitator",
          }
        );
      } else {
        res = await api.post<{ success: boolean; message: string }>(
          "/api/fasil/presensi/manual",
          {
            user_id: item.user_id,
            sesi: item.sesi,
            tanggal: item.tanggal,
            status: "hadir",
            keterangan: "Diverifikasi hadir manual oleh Fasilitator",
          }
        );
      }

      if (res.success) {
        setDetailItem(null);
        setNotification({ type: "success", message: `Presensi ${item.nama_mahasiswa} berhasil disetujui.` });
        await fetchVerifikasi();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyetujui presensi.";
      setNotification({ type: "error", message: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (item: PresensiVerifikasiItem) => {
    setOpenMenuUserId(null);
    setRejectItem(item);
    setRejectReason("");
  };

  const getPhotoUrl = (item: PresensiVerifikasiItem) =>
    item.foto_wajah ? `${API_BASE_URL}/uploads/${item.foto_wajah}` : null;

  const getCleanNote = (item: PresensiVerifikasiItem) =>
    item.keterangan
      ? item.keterangan
          .replace(/Diverifikasi & disetujui oleh Fasilitator/gi, "")
          .replace(/Presensi di luar area absensi yang valid/gi, "")
          .replace(/Di luar area absensi/gi, "")
          .replace(/Akurasi GPS \+\/- \d+m/gi, "")
          .replace(/Ditolak Fasil: Lokasi\/foto tidak valid/gi, "")
          .replace(/Ditolak Fasil:/gi, "")
          .replace(/\|/g, "")
          .trim()
      : "";

  const canApprove = (item: PresensiVerifikasiItem) =>
    item.status.toLowerCase() !== "hadir";
  const canReject = (item: PresensiVerifikasiItem) =>
    item.status.toLowerCase() !== "alfa";

  const handleConfirmReject = async () => {
    if (!rejectItem) return;
    try {
      setActionLoadingId(rejectItem.user_id);
      const note = rejectReason.trim()
        ? `Ditolak Fasil: ${rejectReason.trim()}`
        : "Ditolak Fasil: Lokasi/foto tidak valid";

      const finalKeterangan = rejectItem.keterangan
        ? `${rejectItem.keterangan} | ${note}`
        : note;

      let res;
      if (rejectItem.id) {
        res = await api.patch<{ success: boolean; message: string }>(
          `/api/fasil/presensi/${rejectItem.id}/status`,
          {
            status: "alfa",
            keterangan: finalKeterangan,
          }
        );
      } else {
        res = await api.post<{ success: boolean; message: string }>(
          "/api/fasil/presensi/manual",
          {
            user_id: rejectItem.user_id,
            sesi: rejectItem.sesi,
            tanggal: rejectItem.tanggal,
            status: "alfa",
            keterangan: finalKeterangan,
          }
        );
      }

      if (res.success) {
        setNotification({ type: "success", message: `Presensi ${rejectItem.nama_mahasiswa} ditandai Alfa.` });
        setDetailItem(null);
        setRejectItem(null);
        await fetchVerifikasi();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menolak presensi.";
      setNotification({ type: "error", message: msg });
    } finally {
      setActionLoadingId(null);
    }
  };

  const counts = sessionMeta.counts;

  return (
    <div className="flex flex-col gap-6 pb-16 w-full">
      {/* ── Breadcrumb & Page Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-2">
        <div>
          <h1 className="ui-page-title">
            Verifikasi Presensi
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="ui-meta">
              {namaGedung ? `${namaGedung} · ` : ""}{formatLongDate(activeDate)}
            </p>
            {sessionMeta.waktu_mulai && sessionMeta.waktu_selesai && (
              <span className="text-xs px-2 py-0.5 rounded bg-[#f1f5f9] text-[#475569] font-mono">
                {formatClockOnly(sessionMeta.waktu_mulai)} - {formatClockOnly(sessionMeta.waktu_selesai)} WIB
                {sessionMeta.is_active && (
                  <span className="ml-1.5 text-[#15803d] font-bold">● Aktif</span>
                )}
                {sessionMeta.is_ended && (
                  <span className="ml-1.5 text-[#64748b] font-medium">● Selesai</span>
                )}
                {!sessionMeta.is_active && !sessionMeta.is_ended && (
                  <span className="ml-1.5 text-[#64748b] font-medium">● Belum Dimulai</span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Alert Notification ── */}
      {notification && (
        <div
          role="status"
          className={`p-4 border rounded-lg text-sm font-medium flex items-center justify-between gap-3 shadow-xs ${
            notification.type === "success"
              ? "bg-[#ecfdf5] border-[#a7f3d0] text-[#15803d]"
              : "bg-[#fff1f2] border-[#fecdd3] text-[#be123c]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{notification.type === "success" ? "✓" : "⚠️"}</span>
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── SUB-NAV TABS (STATUS FILTER TABS) ── */}
      <div className="border-b border-[#e2e8f0] -mx-4 sm:mx-0 px-4 sm:px-0 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <nav className="flex items-center gap-6 sm:gap-8 min-w-max -mb-[1px]">
          {[
            { key: "all", label: "Semua Mahasiswa", badge: counts?.all },
            { key: "belum_absen", label: "Belum Absen", badge: counts?.belum_absen },
            { key: "hadir", label: "Hadir", badge: counts?.hadir },
            { key: "alfa", label: "Alfa", badge: counts?.alfa },
            { key: "luar_zona", label: "Luar Zona", badge: counts?.luar_zona },
            { key: "terlambat", label: "Terlambat", badge: counts?.terlambat },
          ].map((tab) => {
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilterStatus(tab.key)}
                className={`h-11 border-b-2 text-sm font-semibold transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap bg-transparent px-1 ${
                  isActive
                    ? "border-[#00652c] text-[#00652c]"
                    : "border-transparent text-[#6f7a6e] hover:text-[#131b2e]"
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold leading-none ${
                      isActive
                        ? "bg-[#00652c] text-white"
                        : "bg-[#f1f5f9] text-[#64748b]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── RESPONSIVE TOOLBAR (SESI CHIPS + SEARCH + REFRESH) ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Sesi Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#757575] mr-1 hidden sm:inline">
            Sesi:
          </span>
          {[
            { key: "subuh", label: "Subuh" },
            { key: "malam", label: "Malam" },
            { key: "kegiatan", label: "Kegiatan" },
          ].map((s) => {
            const isSelected = filterSesi === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setFilterSesi(s.key)}
                className={`h-8 px-3 text-xs font-bold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? "bg-[#000000] text-white border border-[#000000]"
                    : "bg-white hover:bg-[#f7f7f7] text-[#555555] hover:text-[#000000] border border-[#cccccc]"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        {/* Search Input + Refresh */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#757575]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari NIM atau nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-8 pr-3 bg-white border border-[#cccccc] focus:border-[#76b900] rounded-[2px] text-xs text-[#000000] placeholder:text-[#757575] outline-none transition-colors"
            />
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchVerifikasi}
            disabled={loading}
            className="h-8 px-3 bg-white hover:bg-[#f7f7f7] text-[#000000] border border-[#cccccc] rounded-[2px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors whitespace-nowrap"
            title="Muat ulang data"
          >
            <svg
              className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Loading / Empty State ── */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-[#000000] border-t-[#76b900] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#757575]">
            Memuat data presensi...
          </p>
        </div>
      ) : attendances.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-[#000000]">
            Belum ada data presensi untuk tanggal ini.
          </p>
          <p className="text-xs text-[#757575] mt-1 font-mono">
            Belum ada presensi yang tercatat.
          </p>
        </div>
      ) : (
        /* ── EXPLORER-STYLE LIST ── */
        <div className="bg-white rounded-xl border border-[#e2e8f0]" role="table" aria-label="Daftar presensi untuk diverifikasi">
          {/* Column header (desktop only) */}
          <div
            role="row"
            className="hidden lg:grid grid-cols-[48px_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,0.9fr)_56px] gap-4 px-5 py-3 border-b border-[#e2e8f0] bg-[#f8fafc] rounded-t-xl text-xs font-semibold text-[#6f7a6e]"
          >
            <span role="columnheader">Foto</span>
            <span role="columnheader">Mahasiswa</span>
            <span role="columnheader">Kamar</span>
            <span role="columnheader">Sesi</span>
            <span role="columnheader">Waktu</span>
            <span role="columnheader">Lokasi</span>
            <span role="columnheader">Status</span>
            <span role="columnheader" className="text-right">Aksi</span>
          </div>

          <div className="divide-y divide-[#f1f5f9]">
          {attendances.map((item) => {
            const isOutsideZone = item.has_record && !item.location_valid;
            const isMenuOpen = openMenuUserId === item.user_id;
            const isBusy = actionLoadingId === item.user_id;
            const thumbUrl = getPhotoUrl(item);

            return (
              <div
                key={item.user_id}
                role="row"
                tabIndex={0}
                onClick={() => setDetailItem(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setDetailItem(item);
                }}
                className={`relative grid grid-cols-[48px_minmax(0,1fr)_auto] lg:grid-cols-[48px_minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,1.5fr)_minmax(0,0.9fr)_56px] items-center gap-x-4 gap-y-1 px-4 sm:px-5 py-3.5 cursor-pointer transition-colors last:rounded-b-xl focus:outline-none focus-visible:bg-[#f1f5f9] ${
                  isMenuOpen ? "bg-[#f1f5f9]" : "hover:bg-[#f8fafc]"
                }`}
              >
                {/* Thumbnail / Avatar */}
                <div role="cell" className="self-start lg:self-center">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-[#e2e8f0] flex items-center justify-center">
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt={`Foto presensi ${item.nama_mahasiswa}`}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="font-bold text-xs text-[#64748b]">
                        {item.nama_mahasiswa ? item.nama_mahasiswa.charAt(0).toUpperCase() : "-"}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mahasiswa */}
                <div role="cell" className="min-w-0">
                  <div className="text-[15px] font-semibold text-[#131b2e] truncate">{item.nama_mahasiswa}</div>
                  <div className="text-xs font-mono text-[#6f7a6e]">NIM {item.nim}</div>
                  {/* Compact meta line for mobile/tablet */}
                  <div className="lg:hidden mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#3f493f]">
                    <span>Kamar {item.kamar}</span>
                    <span className="text-[#94a3b8]">·</span>
                    <span className="capitalize">{item.sesi}</span>
                    <span className="text-[#94a3b8]">·</span>
                    <span>{formatTime(item.waktu)}</span>
                    <span className="text-[#94a3b8]">·</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                {/* Desktop columns */}
                <div role="cell" className="hidden lg:block text-sm text-[#3f493f] truncate">{item.kamar}</div>
                <div role="cell" className="hidden lg:block text-sm text-[#3f493f] capitalize">{item.sesi}</div>
                <div role="cell" className="hidden lg:block">
                  <div className="text-sm text-[#131b2e]">{formatTime(item.waktu)}</div>
                  <div className="text-xs text-[#6f7a6e]">{formatDate(item.tanggal)}</div>
                </div>
                <div role="cell" className="hidden lg:block min-w-0">
                  {item.has_record ? (
                    <>
                      <div className={`text-sm font-medium truncate ${isOutsideZone ? "text-[#b45309]" : "text-[#15803d]"}`}>
                        {isOutsideZone ? "Di luar area" : item.area_nama || "Dalam area"}
                      </div>
                      <div className="text-xs text-[#6f7a6e]">
                        {item.accuracy ? `Akurasi ±${Math.round(item.accuracy)} m` : "Akurasi tidak tercatat"}
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-[#94a3b8] italic">Belum absen</div>
                  )}
                </div>
                <div role="cell" className="hidden lg:block">
                  <StatusBadge status={item.status} />
                </div>

                {/* Actions menu */}
                <div
                  role="cell"
                  className="relative flex justify-end self-start lg:self-center"
                  ref={isMenuOpen ? menuRef : undefined}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setOpenMenuUserId(isMenuOpen ? null : item.user_id)}
                    disabled={isBusy}
                    aria-haspopup="menu"
                    aria-expanded={isMenuOpen}
                    aria-label={`Aksi untuk ${item.nama_mahasiswa}`}
                    className="h-10 w-10 flex items-center justify-center rounded-lg text-[#475569] hover:bg-[#e2e8f0] hover:text-[#131b2e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00652c] disabled:opacity-50 cursor-pointer"
                  >
                    {isBusy ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <circle cx="5" cy="12" r="2" />
                        <circle cx="12" cy="12" r="2" />
                        <circle cx="19" cy="12" r="2" />
                      </svg>
                    )}
                  </button>

                  {isMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 top-full mt-1 z-30 w-48 rounded-lg border border-[#e2e8f0] bg-white py-1 shadow-lg"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setOpenMenuUserId(null);
                          setDetailItem(item);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-[#131b2e] hover:bg-[#f1f5f9] cursor-pointer"
                      >
                        Lihat Detail
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canApprove(item)}
                        onClick={() => {
                          setOpenMenuUserId(null);
                          handleApprove(item);
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#15803d] hover:bg-[#ecfdf5] disabled:text-[#94a3b8] disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
                      >
                        Setujui
                      </button>
                      <div className="my-1 border-t border-[#f1f5f9]" />
                      <button
                        type="button"
                        role="menuitem"
                        disabled={!canReject(item)}
                        onClick={() => openRejectModal(item)}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#be123c] hover:bg-[#fff1f2] disabled:text-[#94a3b8] disabled:hover:bg-transparent disabled:cursor-not-allowed cursor-pointer"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {detailItem && (() => {
        const photoUrl = getPhotoUrl(detailItem);
        const cleanNote = getCleanNote(detailItem);
        const isOutsideZone = detailItem.has_record && !detailItem.location_valid;
        const isBusy = actionLoadingId === detailItem.user_id;
        return (
          <div
            className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-xs"
            onClick={() => setDetailItem(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="detail-title"
              className="w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-4 border-b border-[#e2e8f0]">
                <div className="min-w-0">
                  <h2 id="detail-title" className="text-lg sm:text-xl font-semibold text-[#131b2e] truncate">
                    {detailItem.nama_mahasiswa}
                  </h2>
                  <p className="text-sm font-mono text-[#6f7a6e]">NIM {detailItem.nim}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailItem(null)}
                  className="h-10 px-3 text-sm font-medium text-[#475569] hover:bg-[#f1f5f9] rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-6">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-[#131b2e] flex flex-col items-center justify-center text-center p-4">
                  {photoUrl ? (
                    <Image
                      src={photoUrl}
                      alt={`Foto presensi ${detailItem.nama_mahasiswa}`}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white font-bold text-lg mb-2">
                        {detailItem.nama_mahasiswa ? detailItem.nama_mahasiswa.charAt(0).toUpperCase() : "?"}
                      </div>
                      <span className="text-sm font-medium text-white/80">Belum Ada Foto Presensi</span>
                      <span className="text-xs text-white/50 mt-1 max-w-[220px]">
                        {detailItem.status === "alfa"
                          ? "Mahasiswa tidak melakukan presensi hingga sesi berakhir."
                          : "Mahasiswa belum melakukan presensi mandiri."}
                      </span>
                    </>
                  )}
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-sm content-start">
                  <dt className="text-[#6f7a6e]">Status</dt>
                  <dd><StatusBadge status={detailItem.status} /></dd>
                  <dt className="text-[#6f7a6e]">Gedung</dt>
                  <dd className="text-[#131b2e]">{detailItem.gedung}</dd>
                  <dt className="text-[#6f7a6e]">Kamar</dt>
                  <dd className="text-[#131b2e]">{detailItem.kamar}</dd>
                  <dt className="text-[#6f7a6e]">Sesi</dt>
                  <dd className="text-[#131b2e] capitalize">{detailItem.sesi}</dd>
                  <dt className="text-[#6f7a6e]">Waktu</dt>
                  <dd className="text-[#131b2e]">
                    {detailItem.waktu
                      ? `${formatDate(detailItem.tanggal)} · ${formatTime(detailItem.waktu)}`
                      : "Belum melakukan presensi"}
                  </dd>
                  <dt className="text-[#6f7a6e]">Lokasi</dt>
                  <dd className={detailItem.has_record ? (isOutsideZone ? "text-[#b45309] font-medium" : "text-[#15803d] font-medium") : "text-[#64748b]"}>
                    {detailItem.has_record
                      ? (isOutsideZone ? "Di luar area presensi" : detailItem.area_nama || "Dalam area presensi")
                      : "Belum ada catatan lokasi"}
                  </dd>
                  <dt className="text-[#6f7a6e]">Akurasi</dt>
                  <dd className="text-[#131b2e]">
                    {detailItem.accuracy ? `±${Math.round(detailItem.accuracy)} meter` : "Tidak tercatat"}
                  </dd>
                  {detailItem.latitude != null && detailItem.longitude != null && (
                    <>
                      <dt className="text-[#6f7a6e]">Koordinat</dt>
                      <dd className="text-[#131b2e] font-mono text-xs break-all">
                        {detailItem.latitude}, {detailItem.longitude}
                      </dd>
                    </>
                  )}
                  {cleanNote && (
                    <>
                      <dt className="text-[#6f7a6e]">Catatan</dt>
                      <dd className="text-[#131b2e]">{cleanNote}</dd>
                    </>
                  )}
                </dl>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 sm:px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] sm:rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => openRejectModal(detailItem)}
                  disabled={isBusy || !canReject(detailItem)}
                  className="h-11 px-5 bg-white hover:bg-[#fff1f2] text-[#be123c] border border-[#fecdd3] rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Tolak
                </button>
                <button
                  type="button"
                  onClick={() => handleApprove(detailItem)}
                  disabled={isBusy || !canApprove(detailItem)}
                  className="h-11 px-5 bg-[#00652c] hover:bg-[#004d22] text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isBusy ? "Memproses..." : "Setujui"}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Rejection Modal ── */}
      {rejectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-sm bg-white border border-[#e2e8f0] rounded-xl p-5 shadow-xl">
            <h3 className="text-base font-bold text-[#131b2e] tracking-tight">
              Tolak Presensi {rejectItem.nama_mahasiswa}?
            </h3>
            <p className="text-xs text-[#6f7a6e] mt-1">
              Status presensi akan diubah menjadi <strong>ALFA</strong>.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Alasan penolakan (opsional)..."
                className="w-full h-10 px-3.5 bg-white border border-[#d0d7de] focus:border-[#be123c] rounded-lg text-xs sm:text-sm text-[#131b2e] outline-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setRejectItem(null)}
                  disabled={actionLoadingId === rejectItem.user_id}
                  className="ui-btn-secondary text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionLoadingId === rejectItem.user_id}
                  className="ui-btn-danger text-xs sm:text-sm"
                >
                  {actionLoadingId === rejectItem.user_id ? "Menolak..." : "Tolak Presensi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
