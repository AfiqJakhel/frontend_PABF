"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg
          className="w-5 h-5 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: "Ambil Presensi",
      href: "/dashboard/presensi",
      icon: (
        <svg
          className="w-5 h-5 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      name: "Riwayat Presensi",
      href: "/dashboard/riwayat",
      icon: (
        <svg
          className="w-5 h-5 flex-shrink-0"
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
      ),
    },
  ];

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <aside
      className="flex flex-col justify-between h-screen bg-white border-r border-[#E2E8F0] z-30"
      style={{
        width: "260px",
        minWidth: "260px",
      }}
    >
      {/* Top Branding Section */}
      <div className="flex flex-col">
        {/* Header Branding */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-[#E2E8F0]">
          <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative">
            <Image
              src="/images/logo-simas.svg"
              alt="Logo SIMAS UNAND"
              width={36}
              height={36}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span
              className="font-bold text-base leading-tight tracking-tight text-[#131B2E]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              SIMAS UNAND
            </span>
            <span
              className="text-[11px] font-medium text-[#00652C]"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Portal Mahasiswa
            </span>
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="px-3 py-6 flex flex-col gap-1">
          <div className="px-3 pb-2">
            <span
              className="text-[11px] font-semibold text-[#6F7A6E] tracking-wider uppercase"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              Menu Utama
            </span>
          </div>

          {menuItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#F2F3FF] text-[#00652C] font-semibold shadow-xs"
                    : "text-[#3F493F] hover:bg-[#F8FAFC] hover:text-[#131B2E]"
                }`}
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <span className={isActive ? "text-[#00652C]" : "text-[#6F7A6E]"}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-4 bg-[#00652C] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Student Unit Info & Logout */}
      <div className="p-4 border-t border-[#E2E8F0] flex flex-col gap-3">
        {/* Asrama Room Info Card */}
        <div className="bg-[#FAF8FF] border border-[#EAEDFF] rounded-lg p-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#E2E7FF] text-[#00652C] flex items-center justify-center font-bold text-xs">
            A
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className="text-xs font-semibold text-[#131B2E] truncate"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Gedung Asrama A
            </span>
            <span className="text-[11px] text-[#6F7A6E] truncate">
              Kamar 204 • Lantai 2
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-semibold text-[#BE123C] hover:bg-[#FFF1F2] transition-colors border border-transparent hover:border-[#FECDD3] cursor-pointer"
          style={{ fontFamily: "var(--font-sans)" }}
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
