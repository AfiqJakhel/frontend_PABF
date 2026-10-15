"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import type { ApiResponse, AttendanceHistoryData, AttendanceRecord } from "@/types/attendance";
import {
  MONTH_NAMES,
  calculateMonthStats,
  generateGroupedMonthlyAttendanceList,
} from "@/utils/attendanceCalendarHelper";

export default function MahasiswaRiwayatPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const {
    data: historyResponse,
    loading: historyLoading,
    error: historyError,
  } = useApi<ApiResponse<AttendanceHistoryData>>(
    "/api/mahasiswa/presensi/riwayat?per_page=100"
  );
  const { data: todayResponse } = useApi<ApiResponse<AttendanceRecord[]>>(
    "/api/mahasiswa/presensi/hari-ini"
  );

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  }, []);

  const historyRecords = useMemo(
    () => historyResponse?.data?.items ?? [],
    [historyResponse]
  );
  const todayRecords = useMemo(
    () => todayResponse?.data ?? [],
    [todayResponse]
  );

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  // Hitung ringkasan statistik kehadiran bulanan sesuai status di kalender
  const monthStats = useMemo(() => {
    return calculateMonthStats(
      daysInMonth,
      selectedMonth,
      selectedYear,
      currentDate,
      historyRecords,
      todayRecords
    );
  }, [daysInMonth, selectedMonth, selectedYear, currentDate, historyRecords, todayRecords]);

  // Bangun daftar riwayat yang dikelompokkan per hari dengan sesi Subuh & Malam terpisah
  const groupedDays = useMemo(() => {
    return generateGroupedMonthlyAttendanceList(
      selectedMonth,
      selectedYear,
      currentDate,
      historyRecords,
      todayRecords,
      sortOrder
    );
  }, [selectedMonth, selectedYear, currentDate, historyRecords, todayRecords, sortOrder]);

  // Filter daftar riwayat berdasarkan tipe sesi dan status (bentuk tabel tetap konsisten 2 baris per hari)
  const filteredGroupedDays = useMemo(() => {
    return groupedDays
      .map((group) => {
        // Cek apakah hari ini memiliki sesi dengan status yang dicari
        const matchesStatus =
          filterStatus === "all" ||
          group.sessions.some((session) => {
            if (filterStatus === "hadir") return session.status === "hadir";
            if (filterStatus === "terlambat") return session.status === "terlambat";
            if (filterStatus === "izin") return session.status === "izin";
            if (filterStatus === "sakit") return session.status === "sakit";
            if (filterStatus === "alfa") return session.status === "alfa";
            return false;
          });

        if (!matchesStatus) return null;

        // Cek filter tipe sesi jika dispesifikasikan khusus
        if (filterType !== "all") {
          const matchingSessions = group.sessions.filter((session) => {
            if (filterType === "subuh") return session.sesi.toLowerCase() === "subuh";
            if (filterType === "malam") return session.sesi.toLowerCase() === "malam";
            if (filterType === "kegiatan") return session.sesi.toLowerCase() === "kegiatan";
            return true;
          });
          if (matchingSessions.length === 0) return null;
          return {
            ...group,
            sessions: matchingSessions,
          };
        }

        // Secara default (filterType === "all"), pertahankan seluruh sesi (Subuh & Malam)
        // sehingga bentuk tabel selalu seragam 2 baris per hari dengan kolom hari di-merge
        return group;
      })
      .filter((group): group is typeof groupedDays[number] => group !== null);
  }, [groupedDays, filterType, filterStatus]);

  const totalSessionCount = useMemo(() => {
    return filteredGroupedDays.reduce((acc, g) => acc + g.sessions.length, 0);
  }, [filteredGroupedDays]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleResetToCurrentMonth = () => {
    const now = new Date();
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  const isCurrentMonthActive =
    selectedMonth === currentDate.getMonth() &&
    selectedYear === currentDate.getFullYear();

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* ── Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="ui-page-title">Riwayat Presensi Pribadi</h1>
          <p className="ui-meta mt-1">
            Data absensi bulanan dimulai dari tanggal 1 awal bulan, sesi terpisah dan kolom hari disatukan.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/mahasiswa/dashboard"
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ← Kembali ke Kalender
          </Link>
          <Link
            href="/mahasiswa/presensi"
            className="ui-btn-primary self-start sm:self-auto"
          >
            Ambil Presensi Baru
          </Link>
        </div>
      </div>

      {/* ── Section Bulan & Statistik Kalender ── */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-sm font-semibold text-slate-700 transition-colors"
              title="Bulan Sebelumnya"
              aria-label="Bulan sebelumnya"
            >
              ‹
            </button>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-bold text-slate-900 outline-none cursor-pointer focus:border-[#00652C]"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx}>
                  {name} {selectedYear}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-sm font-semibold text-slate-700 transition-colors"
              title="Bulan Selanjutnya"
              aria-label="Bulan selanjutnya"
            >
              ›
            </button>
          </div>

          {!isCurrentMonthActive && (
            <button
              type="button"
              onClick={handleResetToCurrentMonth}
              className="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              Bulan Ini
            </button>
          )}
        </div>

        {/* Ringkasan status kehadiran bulanan sinkron kalender */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 flex-wrap">
          <span className="text-emerald-700">Hadir: {monthStats.hadir}</span>
          <span className="text-slate-300">•</span>
          <span className="text-amber-700">Izin: {monthStats.izin}</span>
          <span className="text-slate-300">•</span>
          <span className="text-rose-700">Terlambat: {monthStats.terlambat}</span>
          <span className="text-slate-300">•</span>
          <span className="text-rose-700">Alpha: {monthStats.alfa}</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-900 font-bold">Kehadiran: {monthStats.percentage}%</span>
        </div>
      </div>

      {/* ── Filter & Urutan Data Bar ── */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Sesi:</span>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-none focus:border-[#00652C]"
            >
              <option value="all">Semua Sesi</option>
              <option value="subuh">Subuh</option>
              <option value="malam">Malam</option>
              <option value="kegiatan">Kegiatan</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
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

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Urutan:</span>
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))}
              className="text-xs py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 transition-colors"
            >
              {sortOrder === "desc" ? "Terbaru ↓" : "Dari Awal Bulan (1) ↑"}
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Menampilkan: <span className="font-bold text-slate-800">{totalSessionCount}</span> sesi presensi ({filteredGroupedDays.length} hari)
        </div>
      </div>

      {historyLoading && (
        <div className="text-sm text-slate-500 py-4">Memuat riwayat presensi...</div>
      )}
      {historyError && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          Gagal mengambil riwayat: {historyError}
        </div>
      )}

      {/* ── Table Riwayat Presensi ── */}
      {/* Kolom Hari di-merge dengan rowSpan, sesi dipisah per baris */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/75 text-slate-500 border-b border-slate-200/80 text-xs font-semibold">
              <tr>
                {/* Kolom 1 (Di-merge per hari) */}
                <th className="px-6 py-3.5 border-r border-slate-100/80">Hari / Tanggal</th>
                {/* Kolom 2 */}
                <th className="px-6 py-3.5">Waktu</th>
                {/* Kolom 3 */}
                <th className="px-6 py-3.5">Sesi Presensi</th>
                {/* Kolom 4 */}
                <th className="px-6 py-3.5">Lokasi</th>
                {/* Kolom 5 */}
                <th className="px-6 py-3.5">Status</th>
                {/* Kolom 6 */}
                <th className="px-6 py-3.5">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGroupedDays.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-sm">
                    Belum ada riwayat presensi yang sesuai pada bulan ini.
                  </td>
                </tr>
              ) : (
                filteredGroupedDays.map((group) =>
                  group.sessions.map((session, sIdx) => {
                    const isFirstSession = sIdx === 0;
                    const isLastSession = sIdx === group.sessions.length - 1;

                    return (
                      <tr
                        key={session.id}
                        className={`transition-colors ${
                          isLastSession ? "border-b border-slate-200" : "border-b border-slate-100/60"
                        } ${
                          session.status === "alfa"
                            ? "bg-rose-50/25 hover:bg-rose-50/50"
                            : "hover:bg-slate-50/60"
                        }`}
                      >
                        {/* Kolom 1: Hari / Tanggal (MERGED DENGAN ROWSPAN) */}
                        {isFirstSession && (
                          <td
                            rowSpan={group.sessions.length}
                            className="px-6 py-4 align-top border-r border-slate-100/80 bg-white"
                          >
                            <div className="flex flex-col gap-0.5">
                              <span className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                                {group.dayName}
                                {group.isToday && (
                                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                    Hari Ini
                                  </span>
                                )}
                              </span>
                              <span className="text-xs text-slate-500 font-medium">
                                {group.tanggalFormatted}
                              </span>
                            </div>
                          </td>
                        )}

                        {/* Kolom 2: Waktu */}
                        <td className="px-6 py-3.5 font-mono text-slate-800 text-xs font-semibold">
                          {session.waktuFormatted}
                        </td>

                        {/* Kolom 3: Sesi Presensi */}
                        <td className="px-6 py-3.5">
                          <span className="font-semibold text-slate-900 capitalize text-xs sm:text-sm">
                            {session.namaSesi}
                          </span>
                        </td>

                        {/* Kolom 4: Lokasi */}
                        <td className="px-6 py-3.5 text-slate-600 text-xs font-mono">
                          {session.lokasi}
                        </td>

                        {/* Kolom 5: Status */}
                        <td className="px-6 py-3.5">
                          {session.status === "hadir" ? (
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200">
                              Hadir
                            </span>
                          ) : session.status === "terlambat" ? (
                            <span className="px-2.5 py-1 bg-rose-50 text-rose-700 text-xs font-medium rounded-full border border-rose-200">
                              Terlambat
                            </span>
                          ) : session.status === "izin" || session.status === "sakit" ? (
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200 capitalize">
                              {session.status}
                            </span>
                          ) : session.status === "alfa" ? (
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-semibold rounded-full border border-rose-300">
                              Alpha
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">
                              Belum Absen
                            </span>
                          )}
                        </td>

                        {/* Kolom 6: Catatan */}
                        <td className="px-6 py-3.5 text-slate-500 text-xs">
                          {session.catatan}
                        </td>
                      </tr>
                    );
                  })
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
