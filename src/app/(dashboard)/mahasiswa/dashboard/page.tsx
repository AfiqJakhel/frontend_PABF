"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import type { ApiResponse, AttendanceHistoryData, AttendanceRecord } from "@/types/attendance";

export default function MahasiswaDashboardPage() {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [mounted, setMounted] = useState<boolean>(false);
  const { data: todayResponse } = useApi<ApiResponse<AttendanceRecord[]>>("/api/mahasiswa/presensi/hari-ini");
  const { data: historyResponse } = useApi<ApiResponse<AttendanceHistoryData>>("/api/mahasiswa/presensi/riwayat?per_page=100");
  const todayRecords = todayResponse?.data ?? [];
  const historyRecords = historyResponse?.data?.items ?? [];
  const firstTodayRecord = todayRecords[0];
  const nightRecord = todayRecords.find((record) => record.sesi === "malam");

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

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

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
  // Monday as first day of week: 0 = Sen, 1 = Sel, ..., 6 = Min
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

  // Attendance status helper based on today
  const getDateStatus = (day: number) => {
    const isCurrentMonthView =
      selectedYear === currentDate.getFullYear() &&
      selectedMonth === currentDate.getMonth();

    if (isCurrentMonthView) {
      const todayDate = currentDate.getDate();
      if (day === todayDate) return "today";
      const record = historyRecords.find((item) => item.tanggal === `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
      if (record?.status === "izin" || record?.status === "sakit") return "izin";
      if (record?.status === "alfa") return "ditolak";
      if (record) return "hadir";
      return "future";
    }

    // Past month view
    if (
      selectedYear < currentDate.getFullYear() ||
      (selectedYear === currentDate.getFullYear() && selectedMonth < currentDate.getMonth())
    ) {
      const record = historyRecords.find((item) => item.tanggal === `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
      if (record?.status === "izin" || record?.status === "sakit") return "izin";
      if (record?.status === "alfa") return "ditolak";
      return record ? "hadir" : "future";
    }

    // Future month view
    return "future";
  };

  // Formatted date string for top pill: e.g. "Rabu, 30 Sep 2026"
  const formattedDatePill = mounted
    ? new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(currentDate)
    : "Memuat tanggal...";

  // Formatted date string for section subtitle: e.g. "30 September 2026"
  return (
    <div className="mhs-dashboard">
      {/* ── Section 1: Top Greeting & Header Bar ── */}
      <div className="mhs-header">
        <div className="mhs-header__title-col">
          <h1 className="mhs-header__title">
            Selamat Pagi, Muhammad Afiq!
          </h1>
          <div className="mhs-header__location">
            <span className="mhs-header__location-text">Gedung Asrama A</span>
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
          {/* Card 1: Presensi Masuk */}
          <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6f7a6e] block mb-1">
                  Presensi Masuk (Subuh)
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#131b2e]">
                  {firstTodayRecord ? new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(firstTodayRecord.waktu)) : "Belum Absen"}
                </span>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                  firstTodayRecord
                    ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
                    : "bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1]"
                }`}
              >
                {firstTodayRecord ? firstTodayRecord.status.toUpperCase() : "BELUM ABSEN"}
              </span>
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs text-[#6f7a6e]">
              <span>Pintu Masuk Gedung A</span>
              <span>{firstTodayRecord ? "Tervalidasi" : "Menunggu presensi"}</span>
            </div>
          </div>

          {/* Card 2: Presensi Malam */}
          <div className="p-5 bg-white rounded-xl border border-[#e2e8f0] flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6f7a6e] block mb-1">
                  Presensi Malam
                </span>
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#131b2e]">
                  {nightRecord ? new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(nightRecord.waktu)) : "Belum Absen"}
                </span>
              </div>

              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                  nightRecord
                    ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
                    : "bg-[#fffbeb] text-[#b45309] border-[#fde68a]"
                }`}
              >
                {nightRecord ? nightRecord.status.toUpperCase() : "BELUM ABSEN"}
              </span>
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between gap-2">
              <span className="text-xs text-[#6f7a6e]">Batas: 22:00 WIB</span>
              {!nightRecord && (
                <Link href="/mahasiswa/presensi" className="ui-btn-primary text-xs !py-1.5 !min-h-[32px]">
                  Absen Sekarang
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Monthly Attendance Calendar Widget ── */}
      <div className="bg-white rounded-xl border border-[#e2e8f0] p-5 sm:p-6 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e2e8f0]">
          <div className="flex flex-col gap-1">
            <h2 className="ui-section-title">Kalender Kehadiran</h2>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-[#d0d7de] hover:bg-[#f8fafc] text-sm cursor-pointer"
                title="Bulan Sebelumnya"
                aria-label="Bulan sebelumnya"
              >
                ‹
              </button>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="h-8 px-2 bg-white border border-[#d0d7de] rounded-md text-xs sm:text-sm font-semibold text-[#131b2e] outline-none cursor-pointer"
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
                className="w-8 h-8 flex items-center justify-center rounded-md border border-[#d0d7de] hover:bg-[#f8fafc] text-sm cursor-pointer"
                title="Bulan Selanjutnya"
                aria-label="Bulan selanjutnya"
              >
                ›
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold px-3 py-1.5 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
            <span className="text-[#15803d]">Hadir: 24</span>
            <span className="text-[#94a3b8]">•</span>
            <span className="text-[#b45309]">Izin: 1</span>
            <span className="text-[#94a3b8]">•</span>
            <span className="text-[#be123c]">Alpha: 0</span>
            <span className="text-[#94a3b8]">•</span>
            <span className="text-[#131b2e]">96.8%</span>
          </div>
        </div>

        {/* Calendar Grid Table */}
        <div className="mhs-calendar-body">
          <div className="mhs-calendar-days-header">
            {["SEN", "SEL", "RAB", "KAM", "JUM", "SAB", "MIN"].map((dayName) => (
              <div key={dayName} className="mhs-day-name">
                {dayName}
              </div>
            ))}
          </div>

          <div className="mhs-calendar-grid">
            {prevMonthDays.map((d) => (
              <div key={`prev-${d}`} className="mhs-date-cell mhs-date-cell--inactive">
                <span className="mhs-date-num--inactive">{d}</span>
              </div>
            ))}

            {currentMonthDays.map((day) => {
              const status = getDateStatus(day);

              if (status === "today") {
                return (
                  <div key={`curr-${day}`} className="mhs-date-cell mhs-date-cell--today">
                    <span className="mhs-date-num--today">{day}</span>
                    <span className="mhs-dot mhs-dot--green" />
                  </div>
                );
              }

              if (status === "izin") {
                return (
                  <div key={`curr-${day}`} className="mhs-date-cell mhs-date-cell--izin">
                    <span className="mhs-date-num--izin">{day}</span>
                    <span className="mhs-dot mhs-dot--amber" />
                  </div>
                );
              }

              if (status === "ditolak") {
                return (
                  <div key={`curr-${day}`} className="mhs-date-cell mhs-date-cell--ditolak">
                    <span className="mhs-date-num--ditolak">{day}</span>
                    <span className="mhs-dot mhs-dot--red" />
                  </div>
                );
              }

              if (status === "hadir") {
                return (
                  <div key={`curr-${day}`} className="mhs-date-cell mhs-date-cell--hadir">
                    <span className="mhs-date-num--hadir">{day}</span>
                    <span className="mhs-dot mhs-dot--green" />
                  </div>
                );
              }

              return (
                <div key={`curr-${day}`} className="mhs-date-cell mhs-date-cell--future">
                  <span className="mhs-date-num--future">{day}</span>
                </div>
              );
            })}

            {nextMonthDays.map((nd) => (
              <div key={`next-${nd}`} className="mhs-date-cell mhs-date-cell--inactive">
                <span className="mhs-date-num--inactive">{nd}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Legend at bottom */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f1f5f9] text-xs text-[#6f7a6e]">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#15803d]" />
              <span>Hadir</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#b45309]" />
              <span>Izin / Terlambat</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#be123c]" />
              <span>Alpha</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full border border-[#00652c]" />
              <span>Hari Ini</span>
            </div>
          </div>

          <Link href="/mahasiswa/riwayat" className="text-xs font-semibold text-[#00652c] hover:underline">
            Lihat Riwayat Lengkap →
          </Link>
        </div>
      </div>

      {/* ── Section 4: Agenda Kegiatan Terjadwal ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#e2e8f0]">
          <div>
            <h2 className="ui-section-title">Kegiatan Asrama Terjadwal</h2>
            <p className="ui-meta mt-0.5">Wajib diikuti seluruh penghuni asrama.</p>
          </div>
          <span className="text-xs font-medium text-[#6f7a6e]">2 Kegiatan</span>
        </div>

        <div className="bg-white rounded-xl border border-[#e2e8f0] divide-y divide-[#e2e8f0]">
          {/* Activity 1 */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#131b2e]">Senam Pagi & Kebersihan</h3>
              <p className="text-xs sm:text-sm text-[#6f7a6e] mt-0.5">06:30 - 08:00 WIB • Lapangan Asrama</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-[#ecfdf5] text-[#15803d] border border-[#a7f3d0] self-start sm:self-auto">
              SELESAI
            </span>
          </div>

          {/* Activity 2 */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[#131b2e]">Kajian Rutin & Bina Karakter</h3>
              <p className="text-xs sm:text-sm text-[#6f7a6e] mt-0.5">19:30 - 21:00 WIB • Masjid Asrama</p>
            </div>
            <Link href="/mahasiswa/presensi" className="ui-btn-primary text-xs self-start sm:self-auto">
              Absen Sekarang
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
