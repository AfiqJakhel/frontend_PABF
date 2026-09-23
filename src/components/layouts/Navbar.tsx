"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export default function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Kamis, 24 Sep 2026 • 20:46:15 WIB
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

        {/* Breadcrumb / Context */}
        <div className="flex items-center gap-2 text-xs text-[#6F7A6E]">
          <span className="hidden sm:inline">Portal Asrama</span>
          <span className="hidden sm:inline">/</span>
          <span
            className="font-semibold text-sm text-[#131B2E]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Dashboard Mahasiswa
          </span>
        </div>
      </div>

      {/* Right: Realtime Clock, Status Pill, Account Profile */}
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Realtime Digital Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#FAF8FF] border border-[#EAEDFF] rounded-lg">
          <svg
            className="w-4 h-4 text-[#00652C]"
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
          <span
            className="text-xs font-semibold text-[#131B2E] tracking-tight"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {currentDateTime || "Memuat waktu..."}
          </span>
        </div>

        {/* Account Profile Widget */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1 rounded-lg hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left"
          >
            {/* Avatar Pill */}
            <div className="w-9 h-9 rounded-full bg-[#00652C] text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
              AF
            </div>

            {/* User Meta */}
            <div className="hidden sm:flex flex-col">
              <span
                className="text-xs font-semibold text-[#131B2E] leading-tight"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Mahasiswa
              </span>
              <span
                className="text-[11px] text-[#6F7A6E]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                2211523011
              </span>
            </div>

            {/* Dropdown Chevron */}
            <svg
              className={`w-4 h-4 text-[#6F7A6E] transition-transform duration-200 ${
                showProfileMenu ? "rotate-180" : ""
              }`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-[#F1F5F9]">
                <p className="text-xs font-semibold text-[#131B2E]">Ahmad Afiq</p>
                <p className="text-[11px] text-[#6F7A6E]">NIM: 2211522001</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-[#D3FFD5] text-[#00652C] rounded-full">
                  Mahasiswa Asrama
                </span>
              </div>

              <div className="py-1">
                <button
                  type="button"
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-4 py-2 text-xs text-[#3F493F] hover:bg-[#F8FAFC] flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-[#6F7A6E]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Profil Akun</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full text-left px-4 py-2 text-xs text-[#BE123C] hover:bg-[#FFF1F2] flex items-center gap-2 border-t border-[#F1F5F9]"
                >
                  <svg
                    className="w-4 h-4 text-[#BE123C]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Keluar Akun</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
