"use client";

import { useState } from "react";
import Link from "next/link";

interface VerificationItem {
  id: string;
  nama: string;
  nim: string;
  gedung: string;
  kamar: string;
  tipe: string;
  waktu: string;
  keterangan: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
}

export default function FasilitatorDashboardPage() {
  const [queue, setQueue] = useState<VerificationItem[]>([
    {
      id: "VERIF-01",
      nama: "Muhammad Afiq",
      nim: "2211523011",
      gedung: "Gedung A",
      kamar: "204",
      tipe: "Presensi Masuk",
      waktu: "17:40 WIB",
      keterangan: "Kembali dari kegiatan praktikum laboratorium.",
      status: "Menunggu",
    },
    {
      id: "VERIF-02",
      nama: "Rifqi Pratama",
      nim: "2211522045",
      gedung: "Gedung B",
      kamar: "108",
      tipe: "Presensi Kegiatan",
      waktu: "19:35 WIB",
      keterangan: "Kajian Rutin Malam Jumat di Masjid Asrama.",
      status: "Menunggu",
    },
    {
      id: "VERIF-03",
      nama: "Fajar Maulana",
      nim: "2211521019",
      gedung: "Gedung A",
      kamar: "312",
      tipe: "Presensi Masuk",
      waktu: "21:55 WIB",
      keterangan: "Kembali menjelang jam malam (22:00 WIB).",
      status: "Menunggu",
    },
    {
      id: "VERIF-04",
      nama: "Dinda Rahmawati",
      nim: "2211523088",
      gedung: "Gedung Putri C",
      kamar: "201",
      tipe: "Presensi Keluar",
      waktu: "07:20 WIB",
      keterangan: "Izin kuliah pagi ke Gedung FTI.",
      status: "Menunggu",
    },
  ]);

  const handleApprove = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Disetujui" } : item))
    );
  };

  const handleReject = (id: string) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Ditolak" } : item))
    );
  };

  const pendingCount = queue.filter((i) => i.status === "Menunggu").length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 w-full">
      {/* Header Banner */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white shadow-sm w-full relative overflow-hidden"
        data-ui-style="ui-style-1x2bw8j"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full relative z-10">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-[#95F8A7] tracking-wide">
                Panel Pembina & Fasilitator Asrama
              </span>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#81FE5A]/20 text-[#81FE5A] border border-[#81FE5A]/40">
                UPT Asrama Universitas Andalas
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0"
              data-ui-style="ui-style-vinz70"
            >
              Selamat Bertugas, Pembina Asrama!
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              Pantau kepatuhan kehadiran, verifikasi bukti foto absensi mahasiswa secara manual (FR-04), dan kelola jadwal kegiatan asrama.
            </p>
          </div>

          {/* Quick Verification Alert */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3.5 flex items-center gap-3.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#FECDD3] text-[#BE123C] flex items-center justify-center flex-shrink-0 font-bold">
              {pendingCount}
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-white/70 font-medium">
                Antrean Verifikasi
              </span>
              <span
                className="text-sm font-bold text-white tracking-tight"
                data-ui-style="ui-style-16is3ud"
              >
                {pendingCount} Foto Menunggu
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-medium text-[#6F7A6E]">Total Penghuni Asrama</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#131B2E] mt-1 font-mono">342</div>
          <span className="text-[11px] text-[#6F7A6E]">Gedung A, B, C, D</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-medium text-[#6F7A6E]">Hadir di Asrama Hari Ini</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#15803D] mt-1 font-mono">318</div>
          <span className="text-[11px] text-[#15803D] font-medium">93.0% Tingkat Kepatuhan</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-medium text-[#6F7A6E]">Menunggu Verifikasi Manual</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#B45309] mt-1 font-mono">14</div>
          <span className="text-[11px] text-[#B45309] font-medium">Foto bukti perlu ditinjau</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
          <span className="text-xs font-medium text-[#6F7A6E]">Izin / Tidak Hadir</span>
          <div className="text-2xl sm:text-3xl font-bold text-[#0369A1] mt-1 font-mono">10</div>
          <span className="text-[11px] text-[#0369A1] font-medium">Izin pulang / sakit</span>
        </div>
      </div>

      {/* Main Grid: Verifikasi Antrean + Distribusi Gedung */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Antrean Verifikasi Foto Presensi (Col span 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="p-6 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="text-base font-bold text-[#131B2E]"
                  data-ui-style="ui-style-vinz70"
                >
                  Verifikasi Cepat Bukti Foto Presensi
                </h2>
                <span className="px-2 py-0.5 bg-[#FE932C]/20 text-[#904D00] text-[10px] font-bold rounded-full">
                  FR-04
                </span>
              </div>
              <p className="text-xs text-[#6F7A6E]">
                Tinjau foto selfie kehadiran mahasiswa dan berikan persetujuan manual.
              </p>
            </div>
            <Link
              href="/fasilitator/verifikasi"
              className="text-xs font-semibold text-[#0046A4] hover:underline"
            >
              Lihat Semua Antrean →
            </Link>
          </div>

          {/* Verification Cards List */}
          <div className="p-6 flex flex-col gap-4">
            {queue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-[#E2E8F0] bg-[#FAF8FF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Photo Thumbnail simulation + Resident details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-14 h-14 rounded-lg bg-[#161D15] flex items-center justify-center flex-shrink-0 text-white font-mono text-xs border border-[#5EDA39]/40 relative overflow-hidden">
                    <span className="text-lg">🤳</span>
                  </div>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-[#131B2E]">
                        {item.nama}
                      </span>
                      <span className="text-[11px] font-mono text-[#6F7A6E]">
                        ({item.nim})
                      </span>
                    </div>
                    <span className="text-[11px] text-[#6F7A6E]">
                      {item.gedung} • Kamar {item.kamar} • <span className="font-semibold text-[#00652C]">{item.tipe}</span> ({item.waktu})
                    </span>
                    <span className="text-[11px] text-[#3F493F] italic mt-0.5 line-clamp-1">
                      &ldquo;{item.keterangan}&rdquo;
                    </span>
                  </div>
                </div>

                {/* Status or Action Buttons */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  {item.status === "Menunggu" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReject(item.id)}
                        className="px-3 py-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        ✕ Tolak
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApprove(item.id)}
                        className="px-3.5 py-1.5 bg-[#00652C] hover:bg-[#15803D] text-white rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                      >
                        ✓ Setujui
                      </button>
                    </>
                  ) : item.status === "Disetujui" ? (
                    <span className="px-3 py-1 bg-[#ECFDF5] text-[#15803D] text-xs font-semibold rounded-full border border-[#A7F3D0]">
                      ✓ Disetujui
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-[#FFF1F2] text-[#BE123C] text-xs font-semibold rounded-full border border-[#FECDD3]">
                      ✕ Ditolak
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Distribusi Kehadiran per Gedung & Jadwal Terdekat (Col span 1) */}
        <div className="flex flex-col gap-6">
          {/* Progress per Gedung */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs">
            <h2
              className="text-base font-bold text-[#131B2E] mb-1"
              data-ui-style="ui-style-vinz70"
            >
              Kehadiran per Gedung
            </h2>
            <p className="text-xs text-[#6F7A6E] mb-4">
              Persentase mahasiswa yang telah berada di asrama:
            </p>

            <div className="flex flex-col gap-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Gedung Asrama A (Putra)</span>
                  <span className="text-[#00652C]">96% (96/100)</span>
                </div>
                <div className="w-full h-2 bg-[#EAEDFF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00652C] rounded-full" data-ui-style="ui-style-1ralbvs" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Gedung Asrama B (Putra)</span>
                  <span className="text-[#00652C]">92% (88/96)</span>
                </div>
                <div className="w-full h-2 bg-[#EAEDFF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00652C] rounded-full" data-ui-style="ui-style-1ral8q4" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Gedung Asrama C (Putri)</span>
                  <span className="text-[#00652C]">90% (72/80)</span>
                </div>
                <div className="w-full h-2 bg-[#EAEDFF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00652C] rounded-full" data-ui-style="ui-style-1ral71q" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Gedung Asrama D (Putri)</span>
                  <span className="text-[#00652C]">94% (62/66)</span>
                </div>
                <div className="w-full h-2 bg-[#EAEDFF] rounded-full overflow-hidden">
                  <div className="h-full bg-[#00652C] rounded-full" data-ui-style="ui-style-1rala7e" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Box */}
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs flex flex-col gap-3">
            <h3 className="text-xs font-bold text-[#131B2E] uppercase tracking-wider">
              Aksi Cepat Fasilitator
            </h3>
            <Link
              href="/fasilitator/jadwal"
              className="w-full py-2.5 px-4 bg-[#F0F4FF] hover:bg-[#DAE2FD] text-[#0046A4] text-xs font-semibold rounded-xl flex items-center justify-between transition-colors"
            >
              <span>+ Buat Jadwal Kegiatan Asrama</span>
              <span>→</span>
            </Link>
            <Link
              href="/fasilitator/rekap"
              className="w-full py-2.5 px-4 bg-[#ECFDF5] hover:bg-[#D3FFD5] text-[#00652C] text-xs font-semibold rounded-xl flex items-center justify-between transition-colors"
            >
              <span>📊 Unduh Rekap Laporan Kehadiran</span>
              <span>→</span>
            </Link>
            <Link
              href="/fasilitator/mahasiswa"
              className="w-full py-2.5 px-4 bg-[#FAF8FF] hover:bg-[#EAEDFF] text-[#131B2E] text-xs font-semibold rounded-xl flex items-center justify-between transition-colors"
            >
              <span>👥 Kelola Data Mahasiswa</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
