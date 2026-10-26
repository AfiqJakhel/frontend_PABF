"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

interface NvidiaDatePickerProps {
  label?: string;
  value: string; // Format: "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  minDate?: string; // Format: "YYYY-MM-DD"
  maxDate?: string; // Format: "YYYY-MM-DD"
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
  helperText?: string;
}

const MONTH_NAMES_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const DAY_NAMES_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export default function NvidiaDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Pilih tanggal...",
  required = false,
  disabled = false,
  error,
  helperText,
}: NvidiaDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse YYYY-MM-DD safely into local year, month (1-12), day (1-31)
  const parseYMD = (str: string): [number, number, number] | null => {
    if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
    const [y, m, d] = str.split("-").map(Number);
    return [y, m, d];
  };

  const formatYMD = (y: number, m: number, d: number): string => {
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  // State untuk bulan & tahun kalender yang sedang dilihat
  const initialYearMonth = useMemo(() => {
    const parsed = parseYMD(value);
    if (parsed) return { year: parsed[0], month: parsed[1] };
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth() + 1 };
  }, [value]);

  const [viewYear, setViewYear] = useState(initialYearMonth.year);
  const [viewMonth, setViewMonth] = useState(initialYearMonth.month);

  // Sinkronisasi view jika value di luar berubah
  useEffect(() => {
    const parsed = parseYMD(value);
    if (parsed) {
      setViewYear(parsed[0]);
      setViewMonth(parsed[1]);
    }
  }, [value]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Format label teks yang ramah pengguna
  const formattedDisplayValue = useMemo(() => {
    const parsed = parseYMD(value);
    if (!parsed) return "";
    const [y, m, d] = parsed;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [value]);

  // Navigasi bulan
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  // Matrix hari kalender (Senin s.d. Minggu)
  const calendarDays = useMemo(() => {
    const daysInCurrentMonth = new Date(viewYear, viewMonth, 0).getDate();
    // JS getDay(): 0 is Sunday, 1 is Monday ... 6 is Saturday
    // Convert ke Monday = 0, ..., Sunday = 6
    const firstDayIndex = (new Date(viewYear, viewMonth - 1, 1).getDay() + 6) % 7;

    const daysInPrevMonth = new Date(viewYear, viewMonth - 1, 0).getDate();

    const items: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isSelected: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = formatYMD(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    );

    // Hari dari bulan sebelumnya
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevM = viewMonth === 1 ? 12 : viewMonth - 1;
      const prevY = viewMonth === 1 ? viewYear - 1 : viewYear;
      const dStr = formatYMD(prevY, prevM, day);
      const isDis = (minDate && dStr < minDate) || (maxDate && dStr > maxDate);

      items.push({
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: false,
        isDisabled: Boolean(isDis),
        isSelected: value === dStr,
        isToday: todayStr === dStr,
      });
    }

    // Hari bulan saat ini
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dStr = formatYMD(viewYear, viewMonth, day);
      const isDis = (minDate && dStr < minDate) || (maxDate && dStr > maxDate);

      items.push({
        dateStr: dStr,
        dayNumber: day,
        isCurrentMonth: true,
        isDisabled: Boolean(isDis),
        isSelected: value === dStr,
        isToday: todayStr === dStr,
      });
    }

    // Hari bulan berikutnya untuk melengkapi baris grid (kelipatan 7)
    const remaining = 7 - (items.length % 7);
    if (remaining < 7) {
      for (let day = 1; day <= remaining; day++) {
        const nextM = viewMonth === 12 ? 1 : viewMonth + 1;
        const nextY = viewMonth === 12 ? viewYear + 1 : viewYear;
        const dStr = formatYMD(nextY, nextM, day);
        const isDis = (minDate && dStr < minDate) || (maxDate && dStr > maxDate);

        items.push({
          dateStr: dStr,
          dayNumber: day,
          isCurrentMonth: false,
          isDisabled: Boolean(isDis),
          isSelected: value === dStr,
          isToday: todayStr === dStr,
        });
      }
    }

    return items;
  }, [viewYear, viewMonth, value, minDate, maxDate]);

  const handleSelectDate = (dateStr: string) => {
    onChange(dateStr);
    setIsOpen(false);
  };

  const todayStr = formatYMD(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  );

  const isTodayDisabled = Boolean(
    (minDate && todayStr < minDate) || (maxDate && todayStr > maxDate)
  );

  const tomorrowStr = (() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return formatYMD(t.getFullYear(), t.getMonth() + 1, t.getDate());
  })();

  const isTomorrowDisabled = Boolean(
    (minDate && tomorrowStr < minDate) || (maxDate && tomorrowStr > maxDate)
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
          {label} {required && <span className="text-[#e52020]">*</span>}
        </label>
      )}

      {/* Trigger Button / Input Field */}
      <div
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full h-11 px-3.5 bg-white border rounded-[2px] flex items-center justify-between cursor-pointer transition-colors ${
          disabled
            ? "bg-[#f7f7f7] border-[#cccccc] cursor-not-allowed opacity-60 text-[#a7a7a7]"
            : isOpen
            ? "border-2 border-[#76b900]"
            : error
            ? "border-2 border-[#e52020]"
            : "border-[#cccccc] hover:border-[#1a1a1a]"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <svg
            className={`w-4 h-4 shrink-0 transition-colors ${
              isOpen ? "text-[#76b900]" : "text-[#757575]"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span
            className={`text-sm truncate select-none ${
              formattedDisplayValue
                ? "font-semibold text-[#111111]"
                : "text-[#757575] font-normal"
            }`}
          >
            {formattedDisplayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              title="Hapus tanggal"
              className="w-5 h-5 rounded-[2px] flex items-center justify-center text-[#757575] hover:text-[#000000] hover:bg-[#f7f7f7] text-xs transition-colors"
            >
              ✕
            </button>
          )}
          <svg
            className={`w-3.5 h-3.5 text-[#757575] transition-transform duration-150 ${
              isOpen ? "rotate-180 text-[#76b900]" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {helperText && !error && (
        <p className="text-[11px] text-[#757575] mt-1">{helperText}</p>
      )}
      {error && <p className="text-[11px] text-[#e52020] font-medium mt-1">{error}</p>}

      {/* Popover Kalender NVIDIA */}
      {isOpen && (
        <div className="absolute left-0 mt-1 w-72 sm:w-80 bg-white border border-[#cccccc] rounded-[2px] p-3.5 z-50 shadow-[0_4px_16px_rgba(0,0,0,0.12)] animate-in fade-in zoom-in-95 duration-100">
          {/* NVIDIA Signature Corner Square */}
          <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#76b900]" />

          {/* Header Kalender: Bulan, Tahun, dan Tombol Navigasi */}
          <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-[#cccccc]">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                {MONTH_NAMES_ID[viewMonth - 1]} {viewYear}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                title="Bulan sebelumnya"
                className="w-7 h-7 flex items-center justify-center rounded-[2px] border border-[#cccccc] bg-white text-[#111111] hover:bg-[#f7f7f7] hover:border-[#76b900] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                title="Bulan berikutnya"
                className="w-7 h-7 flex items-center justify-center rounded-[2px] border border-[#cccccc] bg-white text-[#111111] hover:bg-[#f7f7f7] hover:border-[#76b900] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Baris Nama Hari */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAY_NAMES_ID.map((dayName) => (
              <span
                key={dayName}
                className="text-[10px] font-bold text-[#757575] uppercase tracking-wider py-1"
              >
                {dayName}
              </span>
            ))}
          </div>

          {/* Grid Tanggal */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              if (item.isDisabled) {
                return (
                  <div
                    key={idx}
                    className="h-8 flex items-center justify-center text-xs text-[#a7a7a7] cursor-not-allowed select-none rounded-[2px] bg-transparent"
                    title="Tanggal di luar batas izin"
                  >
                    {item.dayNumber}
                  </div>
                );
              }

              if (item.isSelected) {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectDate(item.dateStr)}
                    className="h-8 flex items-center justify-center text-xs font-bold bg-[#76b900] text-black rounded-[2px] transition-transform active:scale-95 shadow-xs"
                  >
                    {item.dayNumber}
                  </button>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(item.dateStr)}
                  className={`h-8 flex items-center justify-center text-xs rounded-[2px] transition-colors border ${
                    item.isToday
                      ? "border-[#76b900] font-bold text-[#111111] bg-[#f4faea]"
                      : item.isCurrentMonth
                      ? "border-transparent text-[#1a1a1a] hover:bg-[#f7f7f7] hover:border-[#cccccc]"
                      : "border-transparent text-[#898989] hover:bg-[#f7f7f7]"
                  }`}
                >
                  {item.dayNumber}
                </button>
              );
            })}
          </div>

          {/* Preset Cepat di Footer */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#cccccc]">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={isTodayDisabled}
                onClick={() => handleSelectDate(todayStr)}
                className={`px-2 py-1 text-[11px] font-bold rounded-[2px] border transition-colors ${
                  isTodayDisabled
                    ? "border-transparent text-[#a7a7a7] cursor-not-allowed"
                    : "border-[#cccccc] bg-white text-[#111111] hover:border-[#76b900] hover:bg-[#f4faea]"
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                disabled={isTomorrowDisabled}
                onClick={() => handleSelectDate(tomorrowStr)}
                className={`px-2 py-1 text-[11px] font-bold rounded-[2px] border transition-colors ${
                  isTomorrowDisabled
                    ? "border-transparent text-[#a7a7a7] cursor-not-allowed"
                    : "border-[#cccccc] bg-white text-[#111111] hover:border-[#76b900] hover:bg-[#f4faea]"
                }`}
              >
                Besok
              </button>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-[11px] font-bold text-[#757575] hover:text-[#000000] px-2 py-1"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
