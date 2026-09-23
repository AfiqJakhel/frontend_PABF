"use client";

import { useState } from "react";
import Sidebar from "@/components/layouts/Sidebar";
import Navbar from "@/components/layouts/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAF8FF]">
      {/* Desktop Sidebar (Fixed 260px) */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30 w-[260px]">
        <Sidebar />
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-white transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Layout Area (offset by 260px on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-[260px] min-w-0 min-h-screen">
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
