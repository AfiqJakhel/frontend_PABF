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

        {/* Date Pill with real-time Indonesian date */}
        <div className="mhs-header__actions">
          <div className="mhs-date-pill">
            <svg width="14" height="15" viewBox="0 0 24 24" fill="none" stroke="#1B6D00" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="mhs-date-pill__text">{formattedDatePill}</span>
          </div>
        </div>
      </div>

      {/* ── Section 2: Presensi Hari Ini Section ── */}
      <div className="mhs-section">
        <div className="mhs-section__header">
          <h2 className="mhs-section__title">Presensi Hari Ini</h2>
        </div>

        <div className="mhs-cards-grid">
          {/* Card 1: Presensi Masuk (Sudah Absen) */}
          <div className="mhs-card">
            <div className="mhs-card__top">
              <div className="mhs-card__info">
                <div className="mhs-icon-box mhs-icon-box--green">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1B6D00" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="mhs-card__text-col">
                  <span className="mhs-card__label">PRESENSI MASUK</span>
                  <span className="mhs-card__value">{firstTodayRecord ? new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(firstTodayRecord.waktu)) : "Belum Absen"}</span>
                </div>
              </div>

              <div className="mhs-badge mhs-badge--green">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#155B00" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{firstTodayRecord ? firstTodayRecord.status.toUpperCase() : "BELUM ABSEN"}</span>
              </div>
            </div>

            <div className="mhs-card__bottom">
              <span className="mhs-card__meta">Pintu Masuk Gedung A</span>
              <div className="mhs-card__meta-status">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B6D00" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="mhs-card__meta">Terverifikasi Admin</span>
              </div>
            </div>
          </div>

          {/* Card 2: Presensi Malam (Belum Absen - Active State) */}
          <div className="mhs-card mhs-card--active">
            <div className="mhs-card__top">
              <div className="mhs-card__info">
                <div className="mhs-icon-box mhs-icon-box--amber">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#904D00" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="mhs-card__text-col">
                  <span className="mhs-card__label">PRESENSI MALAM</span>
                  <span className="mhs-card__value">{nightRecord ? new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(nightRecord.waktu)) : "Belum Absen"}</span>
                </div>
              </div>

              <div className="mhs-badge mhs-badge--amber">
                <span className="mhs-dot mhs-dot--amber" />
                <span>BELUM ABSEN</span>
              </div>
            </div>

            <div className="mhs-card__bottom">
              <span className="mhs-card__meta">Batas Jam Malam: 22:00 WIB</span>
              <Link href="/mahasiswa/presensi" className="mhs-btn-absen">
                <svg width="15" height="14" viewBox="0 0 24 24" fill="none" stroke="#042100" strokeWidth="2.2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Absen Sekarang</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Monthly Attendance Calendar Widget ── */}
      <div className="mhs-calendar-card">
        <div className="mhs-calendar-header">
          <div className="mhs-calendar-title-box">
            <div className="mhs-calendar-icon">
              <svg width="16" height="17" viewBox="0 0 24 24" fill="none" stroke="#191C1B" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>

            <div className="mhs-calendar-title-col">
              <h2 className="mhs-section__title">Kalender Kehadiran</h2>
              <div className="mhs-month-selector">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="mhs-month-btn"
                  title="Bulan Sebelumnya"
                  aria-label="Bulan sebelumnya"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="mhs-month-select"
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
                  className="mhs-month-btn"
                  title="Bulan Selanjutnya"
                  aria-label="Bulan selanjutnya"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="mhs-summary-pill">
            <span className="mhs-summary-item mhs-summary-item--green">Hadir: 24</span>
            <span className="mhs-summary-sep">•</span>
            <span className="mhs-summary-item mhs-summary-item--amber">Izin: 1</span>
            <span className="mhs-summary-sep">•</span>
            <span className="mhs-summary-item mhs-summary-item--red">Alpha: 0</span>
            <span className="mhs-summary-sep">•</span>
            <span className="mhs-summary-item mhs-summary-item--bold">96.8%</span>
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
        <div className="mhs-calendar-footer">
          <div className="mhs-legend-group">
            <div className="mhs-legend-item">
              <span className="mhs-legend-dot mhs-dot--green" />
              <span>Hadir Tepat Waktu</span>
            </div>

            <div className="mhs-legend-item">
              <span className="mhs-legend-dot mhs-dot--amber" />
              <span>Izin / Terlambat</span>
            </div>

            <div className="mhs-legend-item">
              <span className="mhs-legend-dot mhs-dot--red" />
              <span>Ditolak / Alpha</span>
            </div>

            <div className="mhs-legend-item">
              <span className="mhs-legend-ring" />
              <span>Hari Ini</span>
            </div>
          </div>

          <Link href="/mahasiswa/riwayat" className="mhs-history-link">
            <span>Lihat Riwayat Lengkap</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ── Section 4: Agenda Kegiatan Terjadwal ── */}
      <div className="mhs-section">
        <div className="mhs-section__header">
          <div className="mhs-section__title-col">
            <h2 className="mhs-section__title">Kegiatan Asrama Terjadwal</h2>
            <span className="mhs-section__subtitle">Wajib diikuti seluruh penghuni asrama (FR-03)</span>
          </div>

          <div className="mhs-badge-pill">
            <span className="mhs-badge-pill__text">2 Kegiatan</span>
          </div>
        </div>

        <div className="mhs-cards-grid">
          {/* Activity 1: Selesai */}
          <div className="mhs-activity-card">
            <div className="mhs-activity-info">
              <div className="mhs-icon-box mhs-icon-box--grey">
                <svg width="18" height="14" viewBox="0 0 24 24" fill="none" stroke="#1B6D00" strokeWidth="2.5">
                  <path d="M18 20V10" />
                  <path d="M12 20V4" />
                  <path d="M6 20v-6" />
                </svg>
              </div>

              <div className="mhs-activity-text-col">
                <h3 className="mhs-activity-title">Senam Pagi & Kebersihan</h3>
                <span className="mhs-activity-meta">06:30 - 08:00 WIB • Lapangan Asrama</span>
              </div>
            </div>

            <div className="mhs-badge mhs-badge--green">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#155B00" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>SELESAI</span>
            </div>
          </div>

          {/* Activity 2: Absen Sekarang */}
          <div className="mhs-activity-card">
            <div className="mhs-activity-info">
              <div className="mhs-icon-box mhs-icon-box--amber">
                <svg width="16" height="18" viewBox="0 0 24 24" fill="none" stroke="#904D00" strokeWidth="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>

              <div className="mhs-activity-text-col">
                <h3 className="mhs-activity-title">Kajian Rutin & Bina Karakter</h3>
                <span className="mhs-activity-meta">19:30 - 21:00 WIB • Masjid Asrama</span>
              </div>
            </div>

            <Link href="/mahasiswa/presensi" className="mhs-btn-dark">
              <svg width="14" height="13" viewBox="0 0 24 24" fill="none" stroke="#5EDA39" strokeWidth="2.2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span>Absen Sekarang</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
