"use client";

import { useState } from "react";
import Link from "next/link";

export default function MahasiswaRiwayatPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const attendanceData = [
    {
      id: "ABS-01",
      tanggal: "24 Sep 2026",
      waktu: "17:40 WIB",
      tipe: "Presensi Asrama",
      lokasi: "Pintu Gedung Asrama A",
      status: "Disetujui",
      catatan: "Wajah jelas, tepat waktu.",
    },
    {
      id: "ABS-02",
      tanggal: "24 Sep 2026",
      waktu: "07:15 WIB",
      tipe: "Presensi Asrama",
      lokasi: "Pos Keamanan Utama",
      status: "Disetujui",
      catatan: "Keperluan kuliah.",
    },
    {
      id: "ABS-03",
      tanggal: "23 Sep 2026",
      waktu: "21:30 WIB",
      tipe: "Presensi Asrama",
      lokasi: "Pintu Gedung Asrama A",
      status: "Disetujui",
      catatan: "Kembali sebelum batas jam malam.",
    },
    {
      id: "ABS-04",
      tanggal: "22 Sep 2026",
      waktu: "20:05 WIB",
      tipe: "Presensi Kegiatan",
      lokasi: "Masjid Asrama Unand",
      status: "Menunggu",
      catatan: "Sedang ditinjau oleh fasilitator.",
    },
    {
      id: "ABS-05",
      tanggal: "20 Sep 2026",
      waktu: "22:15 WIB",
      tipe: "Presensi Asrama",
      lokasi: "Pintu Gedung Asrama A",
      status: "Ditolak",
      catatan: "Foto buram & melewati batas jam malam (22:00 WIB).",
    },
    {
      id: "ABS-06",
      tanggal: "19 Sep 2026",
      waktu: "06:30 WIB",
      tipe: "Presensi Kegiatan",
      lokasi: "Lapangan Asrama Unand",
      status: "Disetujui",
      catatan: "Senam Pagi Asrama.",
    },
  ];

  const filtered = attendanceData.filter((item) => {
    if (filterType !== "all" && item.tipe !== filterType) return false;
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6F7A6E] mb-1">
            <Link href="/mahasiswa/dashboard" className="hover:underline">Dashboard Mahasiswa</Link>
            <span>/</span>
            <span className="font-semibold text-[#131B2E]">Riwayat Presensi</span>
          </div>
          <h1 className="page-title">Riwayat Presensi Pribadi</h1>
          <p className="text-xs text-[#6F7A6E]">
            Daftar seluruh catatan foto absensi harian dan kegiatan asrama yang telah Anda lakukan.
          </p>
        </div>

        <Link
          href="/mahasiswa/presensi"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00652C] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-xs self-start sm:self-auto"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Ambil Presensi Baru
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-[11px] font-semibold text-[#6F7A6E] block mb-1">Jenis Presensi:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs p-2 bg-[#FAF8FF] border border-[#E2E8F0] rounded-lg font-medium text-[#131B2E]"
            >
              <option value="all">Semua Tipe</option>
              <option value="Presensi Asrama">Presensi Asrama</option>
              <option value="Presensi Kegiatan">Presensi Kegiatan</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6F7A6E] block mb-1">Status Verifikasi:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs p-2 bg-[#FAF8FF] border border-[#E2E8F0] rounded-lg font-medium text-[#131B2E]"
            >
              <option value="all">Semua Status</option>
              <option value="Disetujui">Disetujui</option>
              <option value="Menunggu">Menunggu</option>
              <option value="Ditolak">Ditolak</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#6F7A6E]">
          Menampilkan <span className="font-bold text-[#131B2E]">{filtered.length}</span> catatan
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8FF] text-[#6F7A6E] border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Tipe Presensi</th>
                <th className="px-6 py-3.5 font-semibold">Waktu & Tanggal</th>
                <th className="px-6 py-3.5 font-semibold">Lokasi / Keterangan</th>
                <th className="px-6 py-3.5 font-semibold">Status Verifikasi</th>
                <th className="px-6 py-3.5 font-semibold">Catatan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#131B2E]">
                    {item.tipe}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[#131B2E] font-medium">{item.waktu}</span>
                    <span className="block text-[#6F7A6E] text-[11px]">{item.tanggal}</span>
                  </td>
                  <td className="px-6 py-4 text-[#3F493F]">
                    {item.lokasi}
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "Disetujui" ? (
                      <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#15803D] text-[11px] font-semibold rounded-full border border-[#A7F3D0]">
                        ✓ Disetujui
                      </span>
                    ) : item.status === "Menunggu" ? (
                      <span className="px-2.5 py-1 bg-[#FFFBEB] text-[#B45309] text-[11px] font-semibold rounded-full border border-[#FDE68A]">
                        ⏳ Menunggu
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-[#FFF1F2] text-[#BE123C] text-[11px] font-semibold rounded-full border border-[#FECDD3]">
                        ✕ Ditolak
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#6F7A6E]">
                    {item.catatan}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
