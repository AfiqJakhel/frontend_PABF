"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import type { ApiResponse, AttendanceHistoryData, AttendanceRecord } from "@/types/attendance";
import {
  MONTH_NAMES,
  calculateMonthStats,
  getDaySessionEvaluation,
  type SingleSessionStatus,
} from "@/utils/attendanceCalendarHelper";

interface KegiatanItem {
  id: number;
  nama_kegiatan: string;
  tanggal: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  jam_formatted: string;
  jam_mulai: string;
  jam_selesai: string | null;
  lokasi: string;
  keterangan: string;
  nama_fasilitator: string;
  status: "aktif" | "akan_datang" | "selesai" | "sudah_absen";
  status_label: string;
  is_aktif: boolean;
  sudah_absen: boolean;
  can_absen: boolean;
}

interface KegiatanResponseData {
  gedung_nama: string | null;
  total: number;
  items: KegiatanItem[];
}

export default function MahasiswaDashboardPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [mounted, setMounted] = useState<boolean>(false);

  const { data: todayResponse } = useApi<ApiResponse<AttendanceRecord[]>>("/api/mahasiswa/presensi/hari-ini");
  const { data: historyResponse } = useApi<ApiResponse<AttendanceHistoryData>>("/api/mahasiswa/presensi/riwayat?per_page=100");
  const { data: kegiatanResponse, loading: isLoadingKegiatan } = useApi<ApiResponse<KegiatanResponseData>>(
    "/api/mahasiswa/presensi/kegiatan"
  );

  const todayRecords = todayResponse?.data ?? [];
  const historyRecords = historyResponse?.data?.items ?? [];
  const kegiatanList = kegiatanResponse?.data?.items ?? [];
  const gedungNama = kegiatanResponse?.data?.gedung_nama ?? null;

  const subuhRecord = todayRecords.find((record) => record.sesi === "subuh") || todayRecords[0];
  const nightRecord = todayRecords.find((record) => record.sesi === "malam");

  // Perhitungan jam & batas sesi hari ini
  const currentTotalMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const isSubuhExpired = currentTotalMinutes > 6 * 60; // Batas Subuh: 06:00 WIB
  const isMalamExpired = currentTotalMinutes > 22 * 60; // Batas Malam: 22:00 WIB
  const isMalamActive = currentTotalMinutes >= 19 * 60 && currentTotalMinutes <= 22 * 60;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = new Date();
      setMounted(true);
      setCurrentDate(now);
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const monthNames = MONTH_NAMES;

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

  // Generate calendar days for the selected month
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

  let startingDayOfWeek = firstDayOfMonth.getDay() - 1;
  if (startingDayOfWeek === -1) startingDayOfWeek = 6;

  // Previous month trailing days
  const prevMonthDaysCount = new Date(selectedYear, selectedMonth, 0).getDate();
  const prevMonthDays: number[] = [];
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    prevMonthDays.push(prevMonthDaysCount - i);
  }

  // Days in current month
  const currentMonthDays: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentMonthDays.push(d);
  }

  // Next month leading days to complete grid (multiples of 7)
  const totalCells = Math.ceil((startingDayOfWeek + daysInMonth) / 7) * 7;
  const nextMonthDaysCount = totalCells - (startingDayOfWeek + daysInMonth);
  const nextMonthDays: number[] = [];
  for (let n = 1; n <= nextMonthDaysCount; n++) {
    nextMonthDays.push(n);
  }

  // Dynamic monthly attendance statistics from centralized helper
  const monthStats = calculateMonthStats(
    daysInMonth,
    selectedMonth,
    selectedYear,
    currentDate,
    historyRecords,
    todayRecords
  );

  // Helper styling chip sesi
  const getSessionBadgeClass = (status: SingleSessionStatus, isActive?: boolean) => {
    if (isActive) return "mhs-session-badge--aktif";
    switch (status) {
      case "hadir":
        return "mhs-session-badge--hadir";
      case "izin":
      case "sakit":
        return "mhs-session-badge--izin";
      case "terlambat":
        return "mhs-session-badge--terlambat";
      case "alfa":
        return "mhs-session-badge--alfa";
      case "belum_absen":
      case "future":
      default:
        return "mhs-session-badge--future";
    }
  };

  return (
    <div className="mhs-dashboard">
      {/* ── Section 1: Top Greeting & Header Bar ── */}
      <div className="mhs-header">
        <div className="mhs-header__title-col">
          <h1 className="mhs-header__title">
            Selamat Pagi, Muhammad Afiq!
          </h1>
          <div className="mhs-header__location">
            <span className="mhs-header__location-text">
              {gedungNama ? `Gedung Asrama ${gedungNama}` : "Gedung Asrama A"}
            </span>
            <span className="mhs-header__dot" />
            <span className="mhs-header__location-text">Kamar 204</span>
          </div>
        </div>
      </div>

      {/* ── Section 2: Presensi Hari Ini Section ── */}
      <div className="mhs-section">
        <div className="mhs-section__header">
          <h2 className="ui-section-title">Presensi Hari Ini</h2>
        </div>

        <div className="mhs-cards-grid">
          {/* Card 1: Presensi Masuk (Subuh) */}
          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#e2e8f0] flex flex-col justify-between gap-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b] block mb-1">
                  Presensi Masuk (Subuh)
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#131b2e]">
                  {subuhRecord ? new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(subuhRecord.waktu)) : "Belum Absen"}
                </span>
              </div>

              {subuhRecord ? (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    subuhRecord.status === "terlambat"
                      ? "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]"
                      : subuhRecord.status === "izin" || subuhRecord.status === "sakit"
                      ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
                      : "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
                  }`}
                >
                  {subuhRecord.status.toUpperCase()}
                </span>
              ) : isSubuhExpired ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-[#fef2f2] text-[#e52020] border-[#fecaca]">
                  ALFA (TERLEWAT)
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]">
                  BELUM ABSEN
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs text-[#64748b]">
              <span>Batas: 06:00 WIB</span>
              {!subuhRecord && (
                <Link
                  href="/mahasiswa/presensi"
                  className={`ui-btn-primary text-xs !py-1.5 !min-h-[34px] rounded-xl ${
                    isSubuhExpired ? "bg-[#e52020] hover:bg-[#b91c1c] border-none text-white" : ""
                  }`}
                >
                  {isSubuhExpired ? "Absen Terlambat" : "Absen Sekarang"}
                </Link>
              )}
              {subuhRecord && <span className="text-[#15803d] font-medium">Pintu Masuk Gedung A • Tervalidasi</span>}
            </div>
          </div>

          {/* Card 2: Presensi Malam */}
          <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#e2e8f0] flex flex-col justify-between gap-4 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#64748b] block mb-1">
                  Presensi Malam
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#131b2e]">
                  {nightRecord ? new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(nightRecord.waktu)) : "Belum Absen"}
                </span>
              </div>

              {nightRecord ? (
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border ${
                    nightRecord.status === "terlambat"
                      ? "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]"
                      : nightRecord.status === "izin" || nightRecord.status === "sakit"
                      ? "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
                      : "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
                  }`}
                >
                  {nightRecord.status.toUpperCase()}
                </span>
              ) : isMalamExpired ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-[#fef2f2] text-[#e52020] border-[#fecaca]">
                  ALFA (TERLEWAT)
                </span>
              ) : isMalamActive ? (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-[#fffbeb] text-[#b45309] border-[#fde68a]">
                  SEDANG AKTIF
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg border bg-[#f8fafc] text-[#64748b] border-[#e2e8f0]">
                  BELUM DIBUKA
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
              <span className="text-xs text-[#64748b]">Batas: 22:00 WIB</span>
              {!nightRecord && (
                <Link
                  href="/mahasiswa/presensi"
                  className={`ui-btn-primary text-xs !py-1.5 !min-h-[34px] rounded-xl ${
                    isMalamExpired ? "bg-[#e52020] hover:bg-[#b91c1c] border-none text-white" : ""
                  }`}
                >
                  {isMalamExpired ? "Absen Terlambat" : "Absen Sekarang"}
                </Link>
              )}
              {nightRecord && <span className="text-xs text-[#15803d] font-medium">Tervalidasi</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Monthly Attendance Calendar Widget with Dual Sessions ── */}
      <div className="mhs-calendar-card">
        {/* Calendar Header with Navigation and Summary Stats */}
        <div className="mhs-calendar-header">
          <div className="flex flex-col gap-1">
            <h2 className="ui-section-title">Kalender Kehadiran</h2>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] text-sm cursor-pointer"
                title="Bulan Sebelumnya"
                aria-label="Bulan sebelumnya"
              >
                ‹
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-8 px-2.5 bg-white border border-[#e2e8f0] rounded-lg text-xs sm:text-sm font-semibold text-[#131b2e] outline-none cursor-pointer"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx}>
                    {m} {selectedYear}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleNextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e2e8f0] hover:bg-[#f8fafc] text-sm cursor-pointer"
                title="Bulan Selanjutnya"
                aria-label="Bulan selanjutnya"
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold px-3 py-1.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] flex-wrap">
            <span className="text-[#15803d]">Hadir: {monthStats.hadir}</span>
            <span className="text-[#cbd5e1]">•</span>
            <span className="text-[#b45309]">Izin: {monthStats.izin}</span>
            <span className="text-[#cbd5e1]">•</span>
            <span className="text-[#be123c]">Terlambat: {monthStats.terlambat}</span>
            <span className="text-[#cbd5e1]">•</span>
            <span className="text-[#e52020]">Alfa: {monthStats.alfa}</span>
            <span className="text-[#cbd5e1]">•</span>
            <span className="text-[#131b2e] font-bold">{monthStats.percentage}%</span>
          </div>
        </div>

        {/* Calendar Grid Table */}
        <div className="mhs-calendar-body">
          <div className="mhs-calendar-days-header mb-1.5">
            {["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"].map((dayName) => (
              <div key={dayName} className="text-[11px] font-semibold tracking-wider text-[#64748b] uppercase text-center py-1">
                {dayName}
              </div>
            ))}
          </div>

          <div className="mhs-calendar-grid">
            {/* Prev month padding cells */}
            {prevMonthDays.map((d) => (
              <div key={`prev-${d}`} className="mhs-date-cell mhs-date-cell--inactive">
                <span className="mhs-date-num mhs-date-num--inactive">{d}</span>
                <div className="mhs-cell-sessions">
                  <span className="mhs-session-badge mhs-session-badge--future" title="Bulan Sebelumnya">S</span>
                  <span className="mhs-session-badge mhs-session-badge--future" title="Bulan Sebelumnya">M</span>
                </div>
              </div>
            ))}

            {/* Current month days with dual session indicators */}
            {currentMonthDays.map((day) => {
              const dayEval = getDaySessionEvaluation(
                day,
                selectedMonth,
                selectedYear,
                currentDate,
                historyRecords,
                todayRecords
              );

              const cellClasses = [
                "mhs-date-cell",
                dayEval.isToday ? "mhs-date-cell--today" : "",
                dayEval.isFuture ? "mhs-date-cell--future" : "",
              ]
                .filter(Boolean)
                .join(" ");

              const subuhBadgeClass = getSessionBadgeClass(dayEval.subuh.status, dayEval.subuh.isActive);
              const malamBadgeClass = getSessionBadgeClass(dayEval.malam.status, dayEval.malam.isActive);

              const tooltipText = `Tanggal ${day} ${monthNames[selectedMonth]} ${selectedYear}
• Subuh: ${dayEval.subuh.status.toUpperCase()} (${dayEval.subuh.waktuFormatted})
• Malam: ${dayEval.malam.status.toUpperCase()} (${dayEval.malam.waktuFormatted})`;

              return (
                <div
                  key={`curr-${day}`}
                  className={cellClasses}
                  title={tooltipText}
                >
                  <span className={`mhs-date-num ${dayEval.isToday ? "mhs-date-num--today" : ""}`}>
                    {day}
                  </span>

                  <div className="mhs-cell-sessions">
                    <span
                      className={`mhs-session-badge ${subuhBadgeClass}`}
                      title={`Subuh: ${dayEval.subuh.status.toUpperCase()}`}
                    >
                      S
                    </span>
                    <span
                      className={`mhs-session-badge ${malamBadgeClass}`}
                      title={`Malam: ${dayEval.malam.status.toUpperCase()}`}
                    >
                      M
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Next month padding cells */}
            {nextMonthDays.map((nd) => (
              <div key={`next-${nd}`} className="mhs-date-cell mhs-date-cell--inactive">
                <span className="mhs-date-num mhs-date-num--inactive">{nd}</span>
                <div className="mhs-cell-sessions">
                  <span className="mhs-session-badge mhs-session-badge--future" title="Bulan Berikutnya">S</span>
                  <span className="mhs-session-badge mhs-session-badge--future" title="Bulan Berikutnya">M</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9] text-xs text-[#64748b]">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-md bg-[#ecfdf5] border border-[#a7f3d0] text-[#15803d] text-[9px] font-bold flex items-center justify-center">S</span>
              <span className="w-4 h-4 rounded-md bg-[#ecfdf5] border border-[#a7f3d0] text-[#15803d] text-[9px] font-bold flex items-center justify-center">M</span>
              <span>Subuh & Malam</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#15803d]" />
              <span>Hadir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b45309]" />
              <span>Izin / Sakit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e52020]" />
              <span>Alfa & Terlambat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full border-2 border-[#15803d] bg-[#f0fdf4]" />
              <span>Hari Ini</span>
            </div>
          </div>

          <Link href="/mahasiswa/riwayat" className="text-xs font-semibold text-[#15803d] hover:underline flex items-center gap-1">
            Lihat Riwayat Lengkap →
          </Link>
        </div>
      </div>

      {/* ── Section 4: Agenda Kegiatan Terjadwal (Terkoneksi dengan Fasilitator) ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
          <div>
            <h2 className="ui-section-title">Agenda Kegiatan Asrama</h2>
            <p className="ui-meta mt-0.5">
              {gedungNama
                ? `Dijadwalkan oleh Fasilitator Gedung ${gedungNama}.`
                : "Wajib diikuti seluruh penghuni asrama."}
            </p>
          </div>
          <span className="text-xs font-medium text-[#64748b]">
            {isLoadingKegiatan ? "Memuat..." : `${kegiatanList.length} Kegiatan`}
          </span>
        </div>

        {isLoadingKegiatan ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 text-center text-xs text-[#64748b]">
            Memuat kegiatan asrama terjadwal...
          </div>
        ) : kegiatanList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 text-center flex flex-col items-center justify-center gap-2 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-[#f1f5f9] flex items-center justify-center text-lg text-[#64748b]">
              📅
            </div>
            <h3 className="text-sm font-semibold text-[#131b2e]">Belum Ada Kegiatan Terjadwal</h3>
            <p className="text-xs text-[#64748b] max-w-sm">
              Fasilitator belum menjadwalkan kegiatan asrama untuk gedung Anda. Silakan periksa kembali secara berkala.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#e2e8f0] divide-y divide-[#f1f5f9] shadow-xs">
            {kegiatanList.map((item) => {
              const tanggalIndo = item.tanggal
                ? new Intl.DateTimeFormat("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }).format(new Date(item.tanggal))
                : "Jadwal Rutin";

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafbfc] transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-[#131b2e]">
                        {item.nama_kegiatan}
                      </h3>
                      {item.is_aktif && !item.sudah_absen && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ecfdf5] text-[#15803d] border border-[#a7f3d0]">
                          AKTIF SEKARANG
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-[#64748b]">
                      {tanggalIndo} • {item.jam_formatted} • {item.lokasi}
                    </p>
                    {item.keterangan && item.keterangan !== "-" && (
                      <p className="text-xs text-[#718096] italic mt-0.5">
                        {item.keterangan}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {item.can_absen ? (
                      <Link
                        href="/mahasiswa/presensi?sesi=kegiatan"
                        className="ui-btn-primary text-xs !py-1.5 !px-4 rounded-xl"
                      >
                        Absen Sekarang
                      </Link>
                    ) : item.sudah_absen ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#ecfdf5] text-[#15803d] border border-[#a7f3d0]">
                        SUDAH ABSEN
                      </span>
                    ) : item.status === "akan_datang" ? (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#f8fafc] text-[#64748b] border border-[#e2e8f0]">
                        AKAN DATANG
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#f1f5f9] text-[#94a3b8] border border-[#e2e8f0]">
                        SELESAI
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
