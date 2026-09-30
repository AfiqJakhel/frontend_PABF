"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface MenuItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

interface SidebarProps {
  onCloseMobile?: () => void;
}

export default function Sidebar({ onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const role = pathname.startsWith("/fasilitator") ? "fasilitator" : "mahasiswa";
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  // Mahasiswa Menu according to PRD (FR-01, FR-02/03 Absen Foto, FR-07 Riwayat)
  const mahasiswaMenus: MenuItem[] = [
    {
      name: "Dashboard",
      href: "/mahasiswa/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      name: "Ambil Presensi",
      href: "/mahasiswa/presensi",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <circle cx="12" cy="13" r="4" />
        </svg>
      ),
    },
    {
      name: "Riwayat Presensi",
      href: "/mahasiswa/riwayat",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
  ];

  // Fasilitator Menu according to PRD (FR-04, FR-05, FR-06/10, FR-08)
  const fasilitatorMenus: MenuItem[] = [
    {
      name: "Dashboard",
      href: "/fasilitator/dashboard",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      ),
    },
    {
      name: "Verifikasi Presensi",
      href: "/fasilitator/verifikasi",
      badge: "14",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
    {
      name: "Jadwal Kegiatan",
      href: "/fasilitator/jadwal",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      name: "Rekap & Laporan",
      href: "/fasilitator/rekap",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      ),
    },
    {
      name: "Data Mahasiswa",
      href: "/fasilitator/mahasiswa",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const currentMenus = role === "fasilitator" ? fasilitatorMenus : mahasiswaMenus;

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  return (
    <aside
      className="flex flex-col justify-between h-screen z-30 overflow-y-auto"
      data-ui-style="ui-style-vcftkp"
    >
      {/* Top Branding Section */}
      <div className="flex flex-col gap-6">
        {/* Header Branding (HorizontalBorder) */}
        <div
          className="flex items-center gap-3 pb-6"
          data-ui-style="ui-style-1r94u99"
        >
          <Image
            src="/images/logo-simas.svg"
            alt="Logo SIMAS UNAND"
            width={40}
            height={40}
            priority
            className="flex-shrink-0"
          />

          <div className="flex flex-col">
            <span
              data-ui-style="ui-style-1p0vi4v"
            >
              SIMAS UNAND
            </span>
            <span
              data-ui-style="ui-style-jekctd"
            >
              {role === "fasilitator" ? "PORTAL FASILITATOR" : "PORTAL MAHASISWA"}
            </span>
          </div>
        </div>

        {/* Navigation Menus */}
        <div className="flex flex-col gap-1.5">
          <div className="px-3 pb-1">
            <span
              data-ui-style="ui-style-1v71no0"
            >
              MENU UTAMA
            </span>
          </div>

          {currentMenus.map((item) => {
            const isActive =
              item.href.endsWith("/dashboard")
                ? pathname === item.href || (role === "mahasiswa" && pathname === "/dashboard")
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onCloseMobile}
                className={`sidebar-nav-item ${isActive ? "sidebar-nav-item--active" : ""}`}
              >
                <span className="sidebar-nav-item__icon">
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#BE123C] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom Section: Account card and profile menu */}
      <div className="relative pt-6" data-ui-style="ui-style-jqmtqh">
        <button
          type="button"
          onClick={() => setShowProfileMenu((isOpen) => !isOpen)}
          aria-expanded={showProfileMenu}
          aria-haspopup="menu"
          aria-label="Buka menu akun"
          className="flex w-full items-center gap-3 text-left transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#76B900]"
          data-ui-style="ui-style-3u9dyp"
        >
          <div className={`sidebar-avatar ${role === "fasilitator" ? "sidebar-avatar--fasilitator" : ""}`}>
            {role === "fasilitator" ? "FS" : "AF"}
          </div>
          <span className="min-w-0 flex-1">
            <span className="block truncate" data-ui-style="ui-style-1msccub">
              {role === "fasilitator" ? "Ahmad Fauzi" : "Afiq"}
            </span>
            <span className="block truncate" data-ui-style="ui-style-3p5hkc">
              {role === "fasilitator" ? "Pembina Asrama" : "2211523011"}
            </span>
          </span>
          <svg className={`h-4 w-4 flex-shrink-0 text-[#DDE5D6] transition-transform ${showProfileMenu ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showProfileMenu && (
          <div className="absolute bottom-[76px] left-0 right-0 z-40 overflow-hidden rounded-xl border border-white/10 bg-[#102016] py-1.5 shadow-xl" role="menu">
            <Link
              href={role === "fasilitator" ? "/fasilitator/dashboard" : "/mahasiswa/dashboard"}
              onClick={() => setShowProfileMenu(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[#E6E9E7] transition-colors hover:bg-white/10"
              role="menuitem"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              </svg>
              Dashboard Saya
            </Link>
            <button
              type="button"
              onClick={() => { setShowProfileMenu(false); setShowLogoutDialog(true); }}
              className="flex w-full items-center gap-2 border-t border-white/10 px-4 py-2.5 text-left text-xs font-medium text-[#FFB4AB] transition-colors hover:bg-white/10"
              role="menuitem"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Keluar Sesi
            </button>
          </div>
        )}
      </div>

      {showLogoutDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="logout-title">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h2 id="logout-title" className="text-lg font-bold text-[#191C1B]">Keluar dari akun?</h2>
            <p className="mt-2 text-sm leading-5 text-[#596155]">
              Anda akan keluar dari portal dan perlu masuk kembali untuk melanjutkan.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowLogoutDialog(false)} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#3E4A38] hover:bg-[#F2F4F2]">Batal</button>
              <button type="button" onClick={handleLogout} className="rounded-lg bg-[#BA1A1A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#93000A]">Keluar</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
