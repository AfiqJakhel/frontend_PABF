"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";

interface KamarDetail {
  id: number;
  nomor_kamar: string;
  total_penghuni: number;
}

interface LantaiGroup {
  lantai: number;
  total_kamar: number;
  total_penghuni: number;
  kamar: KamarDetail[];
}

interface GedungSummary {
  id: number;
  nama_gedung: string;
  total_kamar: number;
  total_mahasiswa: number;
  rata_penghuni_per_kamar: number;
  distribusi_lantai: LantaiGroup[];
}

interface KPISummary {
  total_mahasiswa: number;
  total_kamar: number;
  total_pending_izin: number;
  total_izin_aktif_hari_ini: number;
}

interface PendingIzinItem {
  id: number;
  nim: string;
  nama: string;
  nomor_kamar: string;
  lantai: number;
  jenis: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  alasan: string;
  created_at: string | null;
}

interface SesiAktifSummary {
  id: number;
  nama_sesi: string;
  tipe_sesi: string;
  tanggal: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  status: string;
  is_aktif: boolean;
  sudah_absen: number;
  belum_absen: number;
}

interface SesiItem {
  id: number;
  nama_sesi: string;
  tipe_sesi: string;
  tanggal: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  status: string;
  is_aktif: boolean;
  keterangan?: string | null;
}

interface DashboardSummaryResponse {
  gedung: GedungSummary;
  kpi: KPISummary;
  izin_pending: {
    total: number;
    items: PendingIzinItem[];
  };
  sesi: {
    sesi_aktif: SesiAktifSummary | null;
    sesi_hari_ini: SesiItem[];
    kegiatan_terbaru: SesiItem[];
  };
  tanggal_hari_ini: string;
}

export default function FasilitatorDashboardPage() {
  const [data, setData] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [clockStr, setClockStr] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [searchKamar, setSearchKamar] = useState<string>("");

  const loadSummary = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.get<{ success: boolean; data: DashboardSummaryResponse }>("/api/fasil/dashboard/summary");
      if (res?.data) {
        setData(res.data);
      }
    } catch (err: unknown) {
      console.error("Gagal memuat dashboard summary:", err);
      setErrorMsg(err instanceof Error ? err.message : "Gagal memuat ringkasan dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const fetchSummary = async () => {
      try {
        setErrorMsg(null);
        const res = await api.get<{ success: boolean; data: DashboardSummaryResponse }>("/api/fasil/dashboard/summary");
        if (!ignore && res?.data) {
          setData(res.data);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Gagal memuat dashboard summary:", err);
          setErrorMsg(err instanceof Error ? err.message : "Gagal memuat ringkasan dashboard.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };
    fetchSummary();
    return () => {
      ignore = true;
    };
  }, []);

  // Live Clock: "Sen, 26 Okt 2026 · 23.35 WIB" updated every minute
  useEffect(() => {
    const formatHeaderClock = (d: Date) => {
      const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agt", "Sep", "Okt", "Nov", "Des"];
      const dayName = days[d.getDay()];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${dayName}, ${day} ${month} ${year} · ${hours}.${minutes} WIB`;
    };

    const initialTimer = window.setTimeout(() => {
      setClockStr(formatHeaderClock(new Date()));
    }, 0);

    const intervalTimer = setInterval(() => {
      setClockStr(formatHeaderClock(new Date()));
    }, 60000);

    return () => {
      window.clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, []);

  const formatShortDate = (isoDate?: string | null) => {
    if (!isoDate) return "-";
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTimePeriod = (startIso?: string | null, endIso?: string | null) => {
    const formatHMDot = (iso?: string | null) => {
      if (!iso) return "";
      const d = new Date(iso);
      if (isNaN(d.getTime())) return "";
      const h = String(d.getHours()).padStart(2, "0");
      const m = String(d.getMinutes()).padStart(2, "0");
      return `${h}.${m}`;
    };
    const s = formatHMDot(startIso);
    const e = formatHMDot(endIso);
    if (s && e) return `${s}-${e} WIB`;
    if (s) return `${s} WIB`;
    return "-";
  };

  const pendingCount = data?.kpi?.total_pending_izin ?? 0;
  const activeSession = data?.sesi?.sesi_aktif;

  return (
    <div className="flex flex-col gap-6 pb-16 w-full">
      {/* ── Error Banner ── */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs sm:text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={loadSummary}
            className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-900 rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── 1. Header Kompak & Bersahabat ── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:px-6 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-tight">
              {data?.gedung?.nama_gedung || "Gedung Asrama Putra A"}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Portal Fasilitator Asrama SIMAS UNAND
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
          {clockStr && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 tabular-nums">
              <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>{clockStr}</span>
            </div>
          )}
          <Link
            href="/fasilitator/jadwal"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#76b900] hover:bg-[#65a000] text-black text-xs sm:text-sm font-bold rounded-lg shadow-xs hover:shadow transition-all whitespace-nowrap cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Kelola Jadwal</span>
          </Link>
        </div>
      </header>

      {/* ── 2. Kartu Angka (Ringkasan Operasional) ── */}
      <section aria-label="Ringkasan Operasional" className="flex flex-col lg:flex-row gap-4 items-stretch">
        {/* Primary Card: Mahasiswa Binaan (±40% on desktop) */}
        <Link
          href="/fasilitator/mahasiswa"
          className="w-full lg:w-[40%] rounded-xl p-5 sm:p-6 flex flex-col justify-between transition-all group shadow-xs hover:shadow-md cursor-pointer border-2 bg-white border-slate-200 hover:border-slate-300"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-wide">
              Mahasiswa Binaan
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Penghuni Aktif
            </span>
          </div>

          <div className="text-[64px] sm:text-[72px] lg:text-[76px] font-bold text-slate-900 leading-none tabular-nums my-4">
            {loading ? "..." : (data?.kpi?.total_mahasiswa ?? 0)}
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors pt-1">
            <span>Kelola data mahasiswa binaan</span>
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Secondary Cards: 3 Kolom Sejajar (±60% on desktop) */}
        <div className="w-full lg:w-[60%] grid grid-cols-1 sm:grid-cols-3 gap-4 items-stretch">
          {/* Izin Butuh Tindakan (Ditukar ke sini) */}
          <Link
            href="/fasilitator/izin"
            className={`border rounded-xl p-5 flex flex-col justify-between shadow-xs transition-all cursor-pointer group ${
              pendingCount > 0
                ? "bg-amber-50/40 border-amber-300 hover:border-amber-400 hover:shadow-sm"
                : "bg-white border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Izin Butuh Tindakan
              </span>
              {pendingCount > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                  Perlu Respon
                </span>
              ) : (
                <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="text-[36px] sm:text-[40px] font-bold text-slate-900 leading-none tabular-nums mt-4">
              {loading ? "..." : pendingCount}
            </div>
          </Link>

          {/* Di Luar Asrama (Izin Sah) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Di Luar Asrama (Izin Sah)
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
            </div>
            <div className="text-[36px] sm:text-[40px] font-bold text-slate-900 leading-none tabular-nums mt-4">
              {loading ? "..." : (data?.kpi?.total_izin_aktif_hari_ini ?? 0)}
            </div>
          </div>

          {/* Kamar Aktif */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Kamar Aktif
              </span>
              <div className="w-7 h-7 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
            </div>
            <div className="text-[36px] sm:text-[40px] font-bold text-slate-900 leading-none tabular-nums mt-4">
              {loading ? "..." : (data?.gedung?.total_kamar ?? 0)}
            </div>
          </div>
        </div>
      </section>

      {/* ── Active Session Alert (jika ada sesi berlangsung) ── */}
      {activeSession && (
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Sesi Presensi Berlangsung Saat Ini
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              {activeSession.nama_sesi} ({activeSession.tipe_sesi}) · {formatTimePeriod(activeSession.waktu_mulai, activeSession.waktu_selesai)}
            </h3>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-xs text-slate-700 border border-emerald-200 px-3 py-1.5 rounded-lg bg-white shadow-xs">
              <span className="font-bold text-emerald-700 tabular-nums">{activeSession.sudah_absen}</span> hadir ·{" "}
              <span className="font-bold text-amber-700 tabular-nums">{activeSession.belum_absen}</span> belum
            </div>
            <Link
              href="/fasilitator/rekap"
              className="px-4 py-2 bg-[#76b900] hover:bg-[#65a000] text-black text-xs font-bold rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              Pantau Presensi →
            </Link>
          </div>
        </div>
      )}

      {/* ── 3. Konten Utama (Grid 2 Kolom: Kiri ±8/12, Kanan ±4/12) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Kolom Kiri (8/12): Perizinan & Kegiatan */}
        <div className="lg:col-span-8 flex flex-col gap-6 lg:gap-8">
          {/* Kiri Atas: Pengajuan Izin Menunggu Persetujuan */}
          <section aria-labelledby="heading-izin-pending" className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <h2 id="heading-izin-pending" className="text-base font-bold text-slate-900">
                  Pengajuan Izin Menunggu Persetujuan
                </h2>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
                    {pendingCount}
                  </span>
                )}
              </div>
              <Link
                href="/fasilitator/izin"
                className="text-xs sm:text-sm font-semibold text-[#00652c] hover:text-[#005023] hover:underline transition-colors"
              >
                Lihat Semua Izin →
              </Link>
            </div>

            {loading ? (
              <div className="h-14 px-4 bg-white border border-slate-200 rounded-xl flex items-center text-xs text-slate-500 shadow-xs">
                Memuat data perizinan...
              </div>
            ) : !data?.izin_pending?.items || data.izin_pending.items.length === 0 ? (
              <div className="h-14 px-4 bg-emerald-50/40 border border-emerald-200/70 rounded-xl flex items-center justify-between text-xs sm:text-sm text-slate-600 shadow-xs">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Tidak ada pengajuan izin yang menunggu persetujuan.</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                {data.izin_pending.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-slate-900">
                          {item.nama}
                        </span>
                        <span className="text-xs font-mono text-slate-500">
                          ({item.nim})
                        </span>
                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium border border-slate-200">
                          Kamar {item.nomor_kamar} (Lt {item.lantai})
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sky-700 uppercase">
                          {item.jenis === "full" ? "Izin Penuh (Bermalam)" : "Izin Sesi"}
                        </span>
                        <span>•</span>
                        <span>
                          {formatShortDate(item.tanggal_mulai)} s.d. {formatShortDate(item.tanggal_selesai)}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-0.5 line-clamp-2">
                        &quot;{item.alasan}&quot;
                      </p>
                    </div>

                    <div className="self-end sm:self-center shrink-0">
                      <Link
                        href={`/fasilitator/izin?highlight=${item.id}`}
                        className="px-4 py-2 bg-[#76b900] hover:bg-[#65a000] text-black text-xs font-bold rounded-lg shadow-xs hover:shadow transition-all inline-block text-center cursor-pointer"
                      >
                        Tinjau Izin →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Kiri Bawah: Kegiatan & Sesi Absensi Terbaru */}
          <section aria-labelledby="heading-kegiatan-terbaru" className="flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h2 id="heading-kegiatan-terbaru" className="text-base font-bold text-slate-900">
                Kegiatan & Sesi Absensi Terbaru
              </h2>
              <Link
                href="/fasilitator/jadwal"
                className="text-xs sm:text-sm font-semibold text-[#00652c] hover:text-[#005023] hover:underline transition-colors"
              >
                Lihat Semua Jadwal →
              </Link>
            </div>

            {loading ? (
              <div className="h-14 px-4 bg-white border border-slate-200 rounded-xl flex items-center text-xs text-slate-500 shadow-xs">
                Memuat riwayat kegiatan...
              </div>
            ) : !data?.sesi?.kegiatan_terbaru || data.sesi.kegiatan_terbaru.length === 0 ? (
              <div className="h-14 px-4 bg-white border border-slate-200 rounded-xl flex items-center text-xs text-slate-500 shadow-xs">
                Belum ada kegiatan yang terdata di sistem.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
                {data.sesi.kegiatan_terbaru.slice(0, 5).map((item) => {
                  const now = new Date();
                  const startTime = item.waktu_mulai ? new Date(item.waktu_mulai) : null;
                  const endTime = item.waktu_selesai ? new Date(item.waktu_selesai) : null;
                  const rawStatus = (item.status || "").toLowerCase();

                  let badgeText = "Selesai";
                  let badgeClass = "bg-slate-100 text-slate-600 border-slate-200";

                  if (rawStatus === "ditutup" || rawStatus === "selesai" || (endTime && now > endTime)) {
                    badgeText = "Selesai";
                    badgeClass = "bg-slate-100 text-slate-600 border-slate-200";
                  } else if (
                    item.is_aktif ||
                    (startTime && endTime && now >= startTime && now <= endTime) ||
                    (startTime && !endTime && now >= startTime && rawStatus === "aktif")
                  ) {
                    badgeText = "Aktif";
                    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  } else if (startTime && now < startTime) {
                    badgeText = "On Going";
                    badgeClass = "bg-sky-50 text-sky-700 border-sky-200";
                  } else if (rawStatus === "aktif") {
                    badgeText = "Aktif";
                    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  }

                  const timeStr = formatTimePeriod(item.waktu_mulai, item.waktu_selesai);

                  return (
                    <div
                      key={item.id}
                      className="px-4 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {item.nama_sesi}
                        </span>
                        <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md whitespace-nowrap">
                          {item.tipe_sesi}
                        </span>
                        <span className="text-xs text-slate-500 hidden sm:inline whitespace-nowrap">
                          {formatShortDate(item.tanggal)} · {timeStr}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <span className="text-xs text-slate-500 sm:hidden whitespace-nowrap">
                          {timeStr}
                        </span>
                        <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeClass}`}>
                          {badgeText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Kolom Kanan (4/12): Distribusi Kamar & Lantai */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section aria-labelledby="heading-distribusi-kamar" className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-4">
              <h2 id="heading-distribusi-kamar" className="text-base font-bold text-slate-900">
                Distribusi Kamar & Lantai
              </h2>
              <Link
                href="/fasilitator/mahasiswa"
                className="text-xs font-semibold text-[#00652c] hover:underline transition-colors"
              >
                Kelola →
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Memuat struktur kamar...
              </div>
            ) : !data?.gedung?.distribusi_lantai || data.gedung.distribusi_lantai.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Data kamar belum tersedia.
              </div>
            ) : (() => {
                const distribusiLantai = data.gedung.distribusi_lantai;
                const activeFloor = selectedFloor ?? distribusiLantai[0]?.lantai ?? 1;
                const currentFloorData = distribusiLantai.find((lt) => lt.lantai === activeFloor) ?? distribusiLantai[0];
                const floorRooms = currentFloorData?.kamar || [];
                const filteredRooms = searchKamar.trim()
                  ? floorRooms.filter((k) => k.nomor_kamar.toLowerCase().includes(searchKamar.toLowerCase()))
                  : floorRooms;

                return (
                  <div className="flex flex-col">
                    {/* Floor Selector Tabs */}
                    <div className="flex gap-1.5 p-1 bg-slate-100 rounded-lg overflow-x-auto mb-3">
                      {distribusiLantai.map((lt) => {
                        const isSelected = lt.lantai === activeFloor;
                        return (
                          <button
                            key={lt.lantai}
                            type="button"
                            onClick={() => {
                              setSelectedFloor(lt.lantai);
                              setSearchKamar("");
                            }}
                            className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer text-center whitespace-nowrap ${
                              isSelected
                                ? "bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                            }`}
                          >
                            Lantai {lt.lantai}
                          </button>
                        );
                      })}
                    </div>

                    {/* Floor Stats & Quick Search */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="text-xs text-slate-500 font-medium">
                        <span className="font-bold text-slate-900">{currentFloorData?.total_kamar ?? 0}</span> kamar ·{" "}
                        <span className="font-bold text-slate-900">{currentFloorData?.total_penghuni ?? 0}</span> mahasiswa
                      </div>
                      <div className="relative w-32 sm:w-36">
                        <input
                          type="text"
                          placeholder="Cari kamar..."
                          value={searchKamar}
                          onChange={(e) => setSearchKamar(e.target.value)}
                          className="w-full pl-6 pr-2 py-1 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 text-slate-800 placeholder-slate-400"
                        />
                        <svg className="w-3 h-3 text-slate-400 absolute left-2 top-2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>

                    {/* Table Header */}
                    <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-t-lg text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                      <span>Kamar</span>
                      <span>Penghuni (Max 4)</span>
                    </div>

                    {/* Room List (Compact Scrollable max-h-72) */}
                    <div className="max-h-72 overflow-y-auto border-x border-b border-slate-200/80 rounded-b-lg divide-y divide-slate-100 bg-white">
                      {filteredRooms.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          {searchKamar ? `Kamar "${searchKamar}" tidak ditemukan.` : "Belum ada kamar di lantai ini."}
                        </div>
                      ) : (
                        filteredRooms.map((kmr) => {
                          const kapasitas = 4;
                          const terisi = kmr.total_penghuni;
                          const isFull = terisi >= kapasitas;
                          return (
                            <div
                              key={kmr.id}
                              className="flex items-center justify-between px-3.5 py-2 text-xs hover:bg-slate-50/80 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-800">
                                  Kamar {kmr.nomor_kamar}
                                </span>
                                {isFull ? (
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 border border-rose-200/60">
                                    Penuh
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                    Sisa {kapasitas - terisi}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2.5">
                                <div className="flex items-center gap-1" title={`${terisi} dari ${kapasitas} terisi`}>
                                  {[...Array(kapasitas)].map((_, idx) => (
                                    <span
                                      key={idx}
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        idx < terisi ? (isFull ? "bg-rose-500" : "bg-emerald-500") : "bg-slate-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-slate-800 tabular-nums min-w-[28px] text-right">
                                  {terisi}/{kapasitas}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Footer Info */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span>Total gedung: {data.gedung.total_kamar} kamar</span>
                      <Link
                        href="/fasilitator/mahasiswa"
                        className="font-semibold text-[#00652c] hover:underline"
                      >
                        Detail Penghuni →
                      </Link>
                    </div>
                  </div>
                );
              })()}
          </section>
        </div>
      </div>
    </div>
  );
}
