"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export default function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const pathname = usePathname();
  const [currentDateTime, setCurrentDateTime] = useState<string>("");

  const isFasilitator = pathname.startsWith("/fasilitator");

  // Determine page title based on pathname
  let pageTitle = "Dashboard Mahasiswa";
  if (pathname.includes("/mahasiswa/presensi")) pageTitle = "Ambil Presensi Foto";
  else if (pathname.includes("/mahasiswa/riwayat")) pageTitle = "Riwayat Presensi";
  else if (pathname.includes("/fasilitator/verifikasi")) pageTitle = "Verifikasi Presensi";
  else if (pathname.includes("/fasilitator/jadwal")) pageTitle = "Jadwal Kegiatan Asrama";
  else if (pathname.includes("/fasilitator/rekap")) pageTitle = "Rekap & Laporan Kehadiran";
  else if (pathname.includes("/fasilitator/mahasiswa")) pageTitle = "Data Master Mahasiswa";
  else if (isFasilitator) pageTitle = "Dashboard Fasilitator";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      };

      const formatter = new Intl.DateTimeFormat("id-ID", options);
      const formatted = formatter.format(now);
      setCurrentDateTime(`${formatted} WIB`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Mobile Toggle & Page Context */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#3F493F] hover:bg-[#F8FAFC] transition-colors"
          aria-label="Buka Menu"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="flex items-center gap-2 text-xs text-[#6F7A6E]">
          {!pathname.includes("/mahasiswa/presensi") && <>
            <span className="hidden sm:inline">{isFasilitator ? "Portal Fasilitator" : "Portal Mahasiswa"}</span>
            <span className="hidden sm:inline">/</span>
          </>}
          <span className="navbar-page-title">{pageTitle}</span>
        </div>
      </div>

      {/* Right: Realtime Clock */}
      <div className="flex items-center">
        {/* Realtime Digital Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FAF8FF] border border-[#EAEDFF] rounded-lg">
          <svg
            className={`w-4 h-4 ${isFasilitator ? "text-[#0046A4]" : "text-[#00652C]"}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="navbar-clock">{currentDateTime || "Memuat waktu..."}</span>
        </div>

      </div>
    </header>
  );
}
