"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/attendance";

interface ActiveSession {
  id: number;
  nama_sesi: string;
  tipe_sesi: string;
  waktu_mulai: string;
  waktu_selesai: string;
  status: string;
  is_aktif: boolean;
}

interface GedungData {
  id: number;
  nama_gedung: string;
  total_kamar: number;
  daftar_kamar: Array<{
    id: number;
    nomor_kamar: string;
    lantai: number;
    total_penghuni: number;
  }>;
}

interface KegiatanItem {
  id: number;
  nama_sesi: string;
  tipe_sesi: string;
  tanggal: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  status: string;
  is_aktif: boolean;
  nama_fasilitator?: string | null;
  keterangan?: string | null;
}

export default function FasilitatorDashboardPage() {
  const [gedung, setGedung] = useState<GedungData | null>(null);
  const [totalMahasiswa, setTotalMahasiswa] = useState<number>(0);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [kegiatanList, setKegiatanList] = useState<KegiatanItem[]>([]);
  const [todayRecap, setTodayRecap] = useState<{ sudah: number; belum: number }>({ sudah: 0, belum: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        // 1. Gedung Saya
        const resGedung = await api.get<{ success: boolean; data: GedungData }>("/api/fasil/gedung-saya");
        if (resGedung?.data) {
          setGedung(resGedung.data);
        }

        // 2. Total Mahasiswa Binaan
        const resMhs = await api.get<{ success: boolean; data: { total: number } }>("/api/fasil/mahasiswa");
        if (resMhs?.data) {
          setTotalMahasiswa(resMhs.data.total);
        }

        // 3. Sesi Aktif
        const resSesi = await api.get<ApiResponse<ActiveSession[]>>("/api/fasil/sesi/aktif");
        if (resSesi?.data) {
          setActiveSessions(resSesi.data);
        }

        // 4. Kegiatan Terbaru (sesi/kegiatan yang dibuat, terbaru lebih dulu)
        const resKegiatan = await api.get<{
          success: boolean;
          data: { items: KegiatanItem[]; total: number };
        }>("/api/fasil/sesi?per_page=6");
        if (resKegiatan?.data?.items) {
          setKegiatanList(resKegiatan.data.items);
        }

        // 5. Rekap Presensi Sesi Hari Ini
        const todayStr = new Date().toISOString().slice(0, 10);
        const resRekap = await api.get<{
          success: boolean;
          data: { total_sudah_absen: number; total_belum_absen: number };
        }>(`/api/fasil/presensi/sesi?sesi=subuh&tanggal=${todayStr}`);
        if (resRekap?.data) {
          setTodayRecap({
            sudah: resRekap.data.total_sudah_absen,
            belum: resRekap.data.total_belum_absen,
          });
        }
      } catch (err) {
        console.error("Failed to load facilitator dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-16 w-full">
      {/* ── Hero Section ── */}
      <section
        aria-labelledby="dashboard-hero-title"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0B2115] via-[#0f2e1c] to-[#00652c] text-white px-6 py-8 sm:px-8 sm:py-10 lg:px-10"
      >
        {/* Subtle background glow (decorative, hidden from assistive tech) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#76b900]/15 blur-3xl"
        />

        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-4 flex-wrap">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#a3e635]">
                Fasilitator Asrama
              </span>
              {gedung && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white border border-white/15">
                  {gedung.nama_gedung}
                </span>
              )}
            </div>

            <h1
              id="dashboard-hero-title"
              className="font-bold tracking-tight text-white text-[clamp(1.75rem,1.3rem+1.8vw,2.5rem)] leading-tight"
            >
              Selamat Bertugas, Fasilitator!
            </h1>
          </div>

          {/* Real-time Session Status */}
          <div className="flex items-center gap-4 self-start lg:self-auto rounded-xl bg-white/[0.07] border border-white/15 px-5 py-4 backdrop-blur-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#76b900] text-[#0B2115] text-xl font-bold">
              {activeSessions.length}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wider text-white/60">
                Status Sesi Presensi
              </span>
              <span className="flex items-center gap-2 text-base font-semibold text-white">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 rounded-full ${activeSessions.length > 0 ? "bg-[#a3e635] animate-pulse" : "bg-white/40"}`}
                />
                {activeSessions.length > 0 ? "Sesi Sedang Dibuka" : "Tidak Ada Sesi Aktif"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section: Summary KPI Metrics ── */}
      <div>
        <div className="mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6f7a6e]">
            Ringkasan Kehadiran & Kapasitas
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 bg-white rounded-lg border border-[#e2e8f0] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#6f7a6e]">
              Mahasiswa Terdaftar
            </span>
            <div className="ui-kpi-value text-[#131b2e] my-1.5">
              {loading ? "..." : totalMahasiswa}
            </div>
            <span className="text-xs text-[#6f7a6e]">Penghuni {gedung?.nama_gedung || "Gedung"}</span>
          </div>

          <div className="p-5 bg-white rounded-lg border border-[#e2e8f0] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#6f7a6e]">
              Total Kamar
            </span>
            <div className="ui-kpi-value text-[#00652c] my-1.5">
              {loading ? "..." : gedung?.total_kamar || 0}
            </div>
            <span className="text-xs text-[#6f7a6e]">Kamar aktif terdata</span>
          </div>

          <div className="p-5 bg-white rounded-lg border border-[#e2e8f0] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#6f7a6e]">
              Sudah Absen Hari Ini
            </span>
            <div className="ui-kpi-value text-[#15803d] my-1.5">
              {loading ? "..." : todayRecap.sudah}
            </div>
            <span className="text-xs text-[#15803d] font-medium">Kehadiran tercatat</span>
          </div>

          <div className="p-5 bg-white rounded-lg border border-[#e2e8f0] flex flex-col justify-between">
            <span className="text-xs font-medium text-[#6f7a6e]">
              Belum Absen Hari Ini
            </span>
            <div className="ui-kpi-value text-[#b45309] my-1.5">
              {loading ? "..." : todayRecap.belum}
            </div>
            <span className="text-xs text-[#b45309] font-medium">Perlu pemantauan</span>
          </div>
        </div>
      </div>

      {/* ── Main Content Grid: Activity List + Quick Management ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Main Column: Kegiatan Terbaru (Col span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
            <div>
              <h2 className="ui-section-title">
                Kegiatan Terbaru
              </h2>
              <p className="ui-meta mt-0.5">
                Sesi dan kegiatan presensi terbaru di {gedung?.nama_gedung || "gedung binaan"}.
              </p>
            </div>
            <Link
              href="/fasilitator/jadwal"
              className="text-xs sm:text-sm font-semibold text-[#00652c] hover:underline whitespace-nowrap"
            >
              Lihat Semua →
            </Link>
          </div>

          {/* Kegiatan List: nama kegiatan, jadwal, status */}
          {kegiatanList.length === 0 ? (
            <div className="py-12 text-center text-sm text-[#6f7a6e] bg-white rounded-lg border border-[#e2e8f0]">
              Belum ada kegiatan terbaru di {gedung?.nama_gedung || "gedung ini"}.
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
              {kegiatanList.map((item) => {
                const formattedDate = item.tanggal
                  ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "";
                const fmtTime = (iso: string | null) =>
                  iso
                    ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                    : "-";
                const isClosed = item.status.toLowerCase() === "ditutup";
                const badgeLabel = item.is_aktif ? "BERLANGSUNG" : isClosed ? "SELESAI" : item.status.toUpperCase();

                return (
                  <div
                    key={item.id}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-base font-semibold text-[#131b2e]">
                          {item.nama_sesi}
                        </span>
                        <span className="text-xs text-[#6f7a6e] capitalize">
                          {item.tipe_sesi}
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm text-[#3f493f]">
                        <span>{formattedDate}</span>
                        <span className="text-[#94a3b8] mx-1.5">·</span>
                        <span>
                          {fmtTime(item.waktu_mulai)}
                          {item.waktu_selesai ? ` - ${fmtTime(item.waktu_selesai)}` : ""} WIB
                        </span>
                      </div>

                      {item.keterangan && (
                        <div className="text-xs text-[#6f7a6e] truncate">{item.keterangan}</div>
                      )}
                    </div>

                    <div className="self-start sm:self-center">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-md border ${
                          item.is_aktif
                            ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
                            : "bg-[#f1f5f9] text-[#475569] border-[#cbd5e1]"
                        }`}
                      >
                        {badgeLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Room Distribution & Fast Links (Col span 4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Room Distribution Structure */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-5">
            <h3 className="text-base font-semibold text-[#131b2e]">
              Struktur Kamar: {gedung?.nama_gedung || "Gedung"}
            </h3>
            <p className="ui-meta mt-1 mb-4">
              Distribusi kamar dan penghuni binaan Anda.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {gedung?.daftar_kamar && gedung.daftar_kamar.length > 0 ? (
                gedung.daftar_kamar.map((k) => (
                  <div
                    key={k.id}
                    className="flex justify-between items-center text-xs sm:text-sm p-2.5 bg-[#f8fafc] border border-[#f1f5f9] rounded-md"
                  >
                    <span className="font-medium text-[#131b2e]">
                      Kamar {k.nomor_kamar} (Lantai {k.lantai})
                    </span>
                    <span className="font-semibold text-[#00652c]">
                      {k.total_penghuni} Mahasiswa
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#6f7a6e] py-4 text-center">
                  Data kamar belum tersedia.
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions (Clean text-first, NO redundant icons) */}
          <div className="bg-white rounded-lg border border-[#e2e8f0] p-5">
            <h3 className="text-base font-semibold text-[#131b2e] mb-1">
              Navigasi Cepat
            </h3>
            <p className="ui-meta mb-4">
              Akses modul operasional fasilitator.
            </p>

            <div className="flex flex-col gap-2">
              <Link
                href="/fasilitator/mahasiswa"
                className="p-3 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#131b2e] text-xs sm:text-sm font-semibold rounded-md border border-[#e2e8f0] flex items-center justify-between transition-colors"
              >
                <span>Kelola Data Mahasiswa</span>
                <span className="text-[#6f7a6e]">→</span>
              </Link>
              <Link
                href="/fasilitator/rekap"
                className="p-3 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#131b2e] text-xs sm:text-sm font-semibold rounded-md border border-[#e2e8f0] flex items-center justify-between transition-colors"
              >
                <span>Rekap & Ekspor Laporan</span>
                <span className="text-[#6f7a6e]">→</span>
              </Link>
              <Link
                href="/fasilitator/area-absensi"
                className="p-3 bg-[#f8fafc] hover:bg-[#f1f5f9] text-[#131b2e] text-xs sm:text-sm font-semibold rounded-md border border-[#e2e8f0] flex items-center justify-between transition-colors"
              >
                <span>Pengaturan Area Presensi (Polygon)</span>
                <span className="text-[#6f7a6e]">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
