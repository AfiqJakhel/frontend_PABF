"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import type { ApiResponse, AttendanceHistoryData } from "@/types/attendance";

export default function MahasiswaRiwayatPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const { data: response, loading, error } = useApi<ApiResponse<AttendanceHistoryData>>(
    "/api/mahasiswa/presensi/riwayat?per_page=100"
  );
  const attendanceData = (response?.data?.items ?? []).map((item) => ({
    id: String(item.id),
    tanggal: new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(item.tanggal)),
    waktu: new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(item.waktu)),
    tipe: item.sesi,
    lokasi: item.latitude != null && item.longitude != null ? `${item.latitude}, ${item.longitude}` : "Lokasi tidak tersedia",
    status: item.status,
    catatan: item.keterangan ?? "Tidak ada keterangan.",
  }));

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
          <h1 className="ui-page-title">Riwayat Presensi Pribadi</h1>
          <p className="ui-meta mt-1">
            Daftar seluruh catatan absensi harian dan kegiatan asrama Anda.
          </p>
        </div>

        <Link
          href="/mahasiswa/presensi"
          className="ui-btn-primary self-start sm:self-auto"
        >
          Ambil Presensi Baru
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-[#00652C]"
            >
              <option value="all">Semua Tipe</option>
              <option value="malam">Malam</option>
              <option value="subuh">Subuh</option>
              <option value="kegiatan">Kegiatan</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-[#00652C]"
            >
              <option value="all">Semua Status</option>
              <option value="hadir">Hadir</option>
              <option value="terlambat">Terlambat</option>
              <option value="izin">Izin</option>
              <option value="sakit">Sakit</option>
              <option value="alfa">Alpha</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total: <span className="font-bold text-slate-800">{filtered.length}</span> data
        </div>
      </div>

      {loading && <div className="text-sm text-slate-500 py-4">Memuat riwayat presensi...</div>}
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">Gagal mengambil riwayat: {error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 text-slate-500 border-b border-slate-200/80 text-xs font-semibold">
              <tr>
                <th className="px-6 py-3.5">Tipe Presensi</th>
                <th className="px-6 py-3.5">Waktu & Tanggal</th>
                <th className="px-6 py-3.5">Lokasi / Keterangan</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Catatan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-sm">
                    Belum ada riwayat presensi yang sesuai.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 capitalize">
                      {item.tipe}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-slate-900 font-semibold text-xs">{item.waktu}</span>
                      <span className="block text-slate-500 text-xs mt-0.5">{item.tanggal}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs font-mono">
                      {item.lokasi}
                    </td>
                    <td className="px-6 py-4">
                      {item.status === "hadir" ? (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                          Hadir
                        </span>
                      ) : item.status === "izin" || item.status === "sakit" ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 capitalize">
                          {item.status}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-medium rounded-full border border-rose-200 capitalize">
                          {item.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {item.catatan}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
