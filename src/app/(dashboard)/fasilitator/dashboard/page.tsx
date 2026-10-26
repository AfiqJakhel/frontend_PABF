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
    loadSummary();
  }, [loadSummary]);

  const formatDateIndo = (isoDate?: string | null) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatShortDate = (isoDate?: string | null) => {
    if (!isoDate) return "-";
    return new Date(isoDate).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (isoTime?: string | null) => {
    if (!isoTime) return "-";
    return new Date(isoTime).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const todayStr = data?.tanggal_hari_ini
    ? formatDateIndo(data.tanggal_hari_ini)
    : formatDateIndo(new Date().toISOString().slice(0, 10));

  const pendingCount = data?.kpi?.total_pending_izin ?? 0;
  const activeSession = data?.sesi?.sesi_aktif;
  const todayUpcomingSession = data?.sesi?.sesi_hari_ini?.[0];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-16 w-full">
      {/* ── Error Banner if any ── */}
      {errorMsg && (
        <div className="p-4 bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] rounded-xl text-sm flex items-center justify-between">
          <span>{errorMsg}</span>
          <button
            type="button"
            onClick={loadSummary}
            className="px-3 py-1 bg-white border border-[#fecdd3] hover:bg-[#fff1f2] rounded-md text-xs font-semibold cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* ── 1. Hero Section: Rich Emerald Gradient ── */}
      <section
        aria-labelledby="dashboard-hero-title"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071c12] via-[#0d3420] to-[#00652c] text-white p-6 sm:p-8 lg:p-9 shadow-md"
      >
        {/* Subtle decorative glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#86efac]/10 blur-3xl"
        />

        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#15803d]/40 text-[#86efac] border border-[#86efac]/20">
                Fasilitator Asrama
              </span>
              <span className="text-xs font-medium text-emerald-100/80">
                {todayStr}
              </span>
            </div>

            <h1
              id="dashboard-hero-title"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight"
            >
              {data?.gedung?.nama_gedung || "Gedung Binaan Asrama"}
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-emerald-100/80">
              Panel operasional dan pemantauan presensi asrama binaan.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Link
                href="/fasilitator/izin"
                className="px-4 py-2.5 bg-[#fef08a] hover:bg-[#fde047] text-[#131b2e] text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Tinjau {pendingCount} Izin</span>
                <span>→</span>
              </Link>
            )}
            <Link
              href="/fasilitator/jadwal"
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white border border-white/20 text-xs sm:text-sm font-semibold rounded-lg transition-colors"
            >
              Kelola Jadwal
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. KPI Summary Cards (4 Cards) ── */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#6f7a6e]">
            Ringkasan Operasional Gedung
          </h2>
          <span className="text-xs text-[#6f7a6e]">
            {loading ? "Memperbarui data..." : "Data Real-time"}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          {/* KPI 1: Mahasiswa Terdaftar */}
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-[#cbd5e1] transition-colors">
            <span className="text-xs font-semibold text-[#6f7a6e]">
              Mahasiswa Binaan
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] my-2">
              {loading ? "..." : `${data?.kpi?.total_mahasiswa ?? 0}`}
              <span className="text-xs font-medium text-[#6f7a6e] ml-1.5 font-normal">orang</span>
            </div>
            <span className="text-xs text-[#6f7a6e] truncate">
              Penghuni {data?.gedung?.nama_gedung || "Gedung"}
            </span>
          </div>

          {/* KPI 2: Izin Menunggu Review (Action Alert) */}
          <Link
            href="/fasilitator/izin"
            className={`p-4 sm:p-5 rounded-xl border shadow-xs flex flex-col justify-between transition-all ${
              pendingCount > 0
                ? "bg-[#fffbeb] border-[#fde68a] hover:border-[#f59e0b]"
                : "bg-white border-[#e2e8f0] hover:border-[#cbd5e1]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold ${pendingCount > 0 ? "text-[#b45309]" : "text-[#6f7a6e]"}`}>
                Izin Butuh Tindakan
              </span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 bg-[#fef3c7] text-[#92400e] text-[10px] font-bold rounded">
                  PENTING
                </span>
              )}
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold my-2 ${pendingCount > 0 ? "text-[#b45309]" : "text-[#131b2e]"}`}>
              {loading ? "..." : `${pendingCount}`}
              <span className="text-xs font-medium ml-1.5 font-normal">pengajuan</span>
            </div>
            <span className={`text-xs ${pendingCount > 0 ? "text-[#b45309] font-medium" : "text-[#6f7a6e]"}`}>
              {pendingCount > 0 ? "Klik untuk meninjau sekarang →" : "Semua perizinan tuntas"}
            </span>
          </Link>

          {/* KPI 3: Mahasiswa di Luar Asrama Hari Ini */}
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-[#cbd5e1] transition-colors">
            <span className="text-xs font-semibold text-[#6f7a6e]">
              Di Luar Asrama (Izin Sah)
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#0369a1] my-2">
              {loading ? "..." : `${data?.kpi?.total_izin_aktif_hari_ini ?? 0}`}
              <span className="text-xs font-medium text-[#6f7a6e] ml-1.5 font-normal">mahasiswa</span>
            </div>
            <span className="text-xs text-[#6f7a6e]">
              Izin disetujui aktif hari ini
            </span>
          </div>

          {/* KPI 4: Kamar & Kapasitas */}
          <div className="p-4 sm:p-5 bg-white rounded-xl border border-[#e2e8f0] shadow-xs flex flex-col justify-between hover:border-[#cbd5e1] transition-colors">
            <span className="text-xs font-semibold text-[#6f7a6e]">
              Kapasitas Kamar
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#00652c] my-2">
              {loading ? "..." : `${data?.gedung?.total_kamar ?? 0}`}
              <span className="text-xs font-medium text-[#6f7a6e] ml-1.5 font-normal">kamar aktif</span>
            </div>
            <span className="text-xs text-[#6f7a6e]">
              Rata-rata {data?.gedung?.rata_penghuni_per_kamar ?? 0} mhs / kamar
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Banner Sesi Aktif / Jadwal Hari Ini ── */}
      {activeSession ? (
        <div className="p-5 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#15803d] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#16a34a]"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#15803d]">
                Sesi Presensi Berlangsung Saat Ini
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#131b2e]">
              {activeSession.nama_sesi} ({activeSession.tipe_sesi})
            </h3>
            <p className="text-xs sm:text-sm text-[#3f493f]">
              Waktu: {formatTime(activeSession.waktu_mulai)} - {formatTime(activeSession.waktu_selesai)} WIB
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="text-xs sm:text-sm text-[#131b2e] bg-white px-3.5 py-2 rounded-lg border border-[#a7f3d0]">
              <span className="font-semibold text-[#15803d]">{activeSession.sudah_absen}</span> sudah absen •{" "}
              <span className="font-semibold text-[#b45309]">{activeSession.belum_absen}</span> belum absen
            </div>
            <Link
              href="/fasilitator/rekap"
              className="px-4 py-2 bg-[#00652c] hover:bg-[#005023] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              Pantau Presensi →
            </Link>
          </div>
        </div>
      ) : todayUpcomingSession ? (
        <div className="p-4 sm:p-5 bg-[#f8fafc] border border-[#e2e8f0] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#e2e8f0] text-[#334155]">
                Agenda Hari Ini
              </span>
              <span className="text-xs text-[#6f7a6e]">
                {formatTime(todayUpcomingSession.waktu_mulai)} - {formatTime(todayUpcomingSession.waktu_selesai)} WIB
              </span>
            </div>
            <h3 className="text-base font-bold text-[#131b2e]">
              {todayUpcomingSession.nama_sesi}
            </h3>
          </div>
          <Link
            href="/fasilitator/jadwal"
            className="text-xs sm:text-sm font-semibold text-[#00652c] hover:underline whitespace-nowrap"
          >
            Atur Sesi di Jadwal →
          </Link>
        </div>
      ) : null}

      {/* ── 4. Main Grid: Action Items & Dorm Structure ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Actionable Leave Reviews & Recent Activities */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          {/* Section: Actionable Pending Izin */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div>
                <h2 className="text-base font-bold text-[#131b2e] flex items-center gap-2">
                  <span>Pengajuan Izin Menunggu Persetujuan</span>
                  {pendingCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#b45309] text-xs font-bold border border-[#fde68a]">
                      {pendingCount}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#6f7a6e] mt-0.5">
                  Izin keluar/pulang dari mahasiswa di {data?.gedung?.nama_gedung || "gedung binaan Anda"}.
                </p>
              </div>

              <Link
                href="/fasilitator/izin"
                className="text-xs sm:text-sm font-semibold text-[#00652c] hover:underline"
              >
                Lihat Semua Izin →
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-[#6f7a6e] bg-white rounded-xl border border-[#e2e8f0]">
                Memuat data pengajuan perizinan...
              </div>
            ) : !data?.izin_pending?.items || data.izin_pending.items.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-xl border border-[#e2e8f0] text-[#6f7a6e] text-xs sm:text-sm">
                <span className="text-[#15803d] font-semibold block mb-1">
                  ✓ Tidak Ada Izin Pending
                </span>
                Semua pengajuan perizinan mahasiswa binaan telah selesai ditinjau.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e2e8f0] divide-y divide-[#e2e8f0] overflow-hidden shadow-xs">
                {data.izin_pending.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-[#131b2e]">
                          {item.nama}
                        </span>
                        <span className="text-xs font-mono text-[#6f7a6e]">
                          ({item.nim})
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-[#f1f5f9] text-[#334155] rounded font-medium border border-[#e2e8f0]">
                          Kamar {item.nomor_kamar} (Lt {item.lantai})
                        </span>
                      </div>

                      <div className="text-xs text-[#6f7a6e] flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-[#0369a1] uppercase">
                          {item.jenis === "full" ? "Izin Penuh (Bermalam)" : "Izin Sesi"}
                        </span>
                        <span>•</span>
                        <span>
                          {formatShortDate(item.tanggal_mulai)} s.d. {formatShortDate(item.tanggal_selesai)}
                        </span>
                      </div>

                      <p className="text-xs text-[#334155] italic bg-[#f8fafc] p-2 rounded border border-[#f1f5f9] mt-1 line-clamp-2">
                        &quot;{item.alasan}&quot;
                      </p>
                    </div>

                    <div className="self-end sm:self-center shrink-0">
                      <Link
                        href={`/fasilitator/izin?highlight=${item.id}`}
                        className="px-3.5 py-2 bg-[#00652c] hover:bg-[#005023] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors inline-block text-center"
                      >
                        Tinjau Izin →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Kegiatan Terbaru */}
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
              <div>
                <h2 className="text-base font-bold text-[#131b2e]">
                  Kegiatan & Sesi Absensi Terbaru
                </h2>
                <p className="text-xs text-[#6f7a6e] mt-0.5">
                  Jadwal dan riwayat pelaksanaan sesi absensi asrama.
                </p>
              </div>

              <Link
                href="/fasilitator/jadwal"
                className="text-xs sm:text-sm font-semibold text-[#00652c] hover:underline"
              >
                Lihat Semua Jadwal →
              </Link>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-[#6f7a6e] bg-white rounded-xl border border-[#e2e8f0]">
                Memuat riwayat kegiatan...
              </div>
            ) : !data?.sesi?.kegiatan_terbaru || data.sesi.kegiatan_terbaru.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#6f7a6e] bg-white rounded-xl border border-[#e2e8f0]">
                Belum ada kegiatan yang terdata di sistem.
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-[#e2e8f0] divide-y divide-[#e2e8f0] overflow-hidden shadow-xs">
                {data.sesi.kegiatan_terbaru.map((item) => {
                  const now = new Date();
                  const startTime = item.waktu_mulai ? new Date(item.waktu_mulai) : null;
                  const endTime = item.waktu_selesai ? new Date(item.waktu_selesai) : null;
                  const rawStatus = (item.status || "").toLowerCase();

                  let badgeText = "Selesai";
                  let badgeColor = "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]";

                  // 1. Selesai: jika status eksplisit ditutup/selesai, atau waktu selesai sudah lewat
                  if (rawStatus === "ditutup" || rawStatus === "selesai" || (endTime && now > endTime)) {
                    badgeText = "Selesai";
                    badgeColor = "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]";
                  }
                  // 2. Aktif: jika is_aktif true, atau waktu sekarang berada dalam rentang waktu pelaksanaan
                  else if (
                    item.is_aktif ||
                    (startTime && endTime && now >= startTime && now <= endTime) ||
                    (startTime && !endTime && now >= startTime && rawStatus === "aktif")
                  ) {
                    badgeText = "Aktif";
                    badgeColor = "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]";
                  }
                  // 3. Belum mulai: jika waktu mulai masih di masa depan
                  else if (startTime && now < startTime) {
                    badgeText = "On Going";
                    badgeColor = "bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]";
                  }
                  // Fallback
                  else if (rawStatus === "aktif") {
                    badgeText = "Aktif";
                    badgeColor = "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]";
                  }

                  return (
                    <div
                      key={item.id}
                      className="p-4 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors"
                    >
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-[#131b2e]">
                            {item.nama_sesi}
                          </span>
                          <span className="text-xs text-[#6f7a6e] capitalize font-medium">
                            ({item.tipe_sesi})
                          </span>
                        </div>

                        <div className="text-xs text-[#3f493f]">
                          <span>{formatShortDate(item.tanggal)}</span>
                          <span className="text-[#94a3b8] mx-1.5">·</span>
                          <span>
                            {formatTime(item.waktu_mulai)}
                            {item.waktu_selesai ? ` - ${formatTime(item.waktu_selesai)}` : ""} WIB
                          </span>
                        </div>

                        {item.keterangan && (
                          <span className="text-xs text-[#6f7a6e] truncate">{item.keterangan}</span>
                        )}
                      </div>

                      <div className="self-start sm:self-center">
                        <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded border ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Floor & Room Distribution & Fast Links */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Box 1: Struktur & Okupansi Kamar per Lantai */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm sm:text-base font-bold text-[#131b2e]">
                Distribusi Kamar & Lantai
              </h3>
              <Link
                href="/fasilitator/mahasiswa"
                className="text-xs font-semibold text-[#00652c] hover:underline"
              >
                Kelola →
              </Link>
            </div>
            <p className="text-xs text-[#6f7a6e] mb-4">
              Pembagian kamar di {data?.gedung?.nama_gedung || "Gedung Binaan"}.
            </p>

            {loading ? (
              <div className="text-center py-6 text-xs text-[#6f7a6e]">
                Memuat struktur kamar...
              </div>
            ) : !data?.gedung?.distribusi_lantai || data.gedung.distribusi_lantai.length === 0 ? (
              <div className="text-center py-6 text-xs text-[#6f7a6e]">
                Data kamar belum tersedia.
              </div>
            ) : (
              <div className="space-y-4">
                {data.gedung.distribusi_lantai.map((lt) => (
                  <div key={lt.lantai} className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#e2e8f0]">
                      <span className="text-xs font-bold text-[#131b2e] uppercase tracking-wide">
                        Lantai {lt.lantai}
                      </span>
                      <span className="text-xs font-medium text-[#15803d] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded">
                        {lt.total_penghuni} Mahasiswa
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {lt.kamar.map((kmr) => (
                        <div
                          key={kmr.id}
                          className="p-2 bg-white rounded border border-[#e2e8f0] text-xs flex justify-between items-center"
                        >
                          <span className="font-semibold text-[#131b2e]">
                            Kamar {kmr.nomor_kamar}
                          </span>
                          <span className="text-[11px] font-medium text-[#6f7a6e]">
                            {kmr.total_penghuni} org
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Box 2: Navigasi Cepat Fasilitator */}
          <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 shadow-xs">
            <h3 className="text-sm sm:text-base font-bold text-[#131b2e] mb-1">
              Navigasi Cepat
            </h3>
            <p className="text-xs text-[#6f7a6e] mb-4">
              Modul operasional harian fasilitator.
            </p>

            <div className="flex flex-col gap-2.5">
              <Link
                href="/fasilitator/izin"
                className="p-3 bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#131b2e] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>Tinjau Perizinan Mahasiswa</span>
                  {pendingCount > 0 && (
                    <span className="px-1.5 py-0.5 bg-[#fef3c7] text-[#92400e] text-[10px] font-bold rounded">
                      {pendingCount}
                    </span>
                  )}
                </div>
                <span className="text-[#6f7a6e]">→</span>
              </Link>

              <Link
                href="/fasilitator/jadwal"
                className="p-3 bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#131b2e] transition-colors"
              >
                <span>Kelola Jadwal & Sesi Presensi</span>
                <span className="text-[#6f7a6e]">→</span>
              </Link>

              <Link
                href="/fasilitator/mahasiswa"
                className="p-3 bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#131b2e] transition-colors"
              >
                <span>Data Master Mahasiswa</span>
                <span className="text-[#6f7a6e]">→</span>
              </Link>

              <Link
                href="/fasilitator/rekap"
                className="p-3 bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#131b2e] transition-colors"
              >
                <span>Rekapitulasi Presensi & Ekspor</span>
                <span className="text-[#6f7a6e]">→</span>
              </Link>

              <Link
                href="/fasilitator/area-absensi"
                className="p-3 bg-[#f8fafc] hover:bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] flex items-center justify-between text-xs sm:text-sm font-semibold text-[#131b2e] transition-colors"
              >
                <span>Pengaturan Area Geofence</span>
                <span className="text-[#6f7a6e]">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
