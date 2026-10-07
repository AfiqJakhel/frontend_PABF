"use client";

import { useEffect, useCallback } from "react";

interface StoredUser {
  nama?: string;
  nim?: string;
  email?: string;
  role?: string;
}

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  user?: StoredUser | null;
  role?: "fasilitator" | "mahasiswa";
  isLoading?: boolean;
}

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  user,
  role = "mahasiswa",
  isLoading = false,
}: LogoutConfirmModalProps) {
  // Close modal on Escape key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent background scrolling while modal is open
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const displayName = user?.nama || (role === "fasilitator" ? "Fasilitator Asrama" : "Mahasiswa Asrama");
  const displayIdentifier = user?.nim || user?.email || (role === "fasilitator" ? "Portal Fasilitator" : "Portal Mahasiswa");
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const isFasil = role === "fasilitator";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) {
          onClose();
        }
      }}
    >
      {/* ── Modal Card (DESIGN.md: 2px radius, hairline border #cccccc, flat canvas #ffffff) ── */}
      <div className="relative w-full max-w-md bg-white border border-[#cccccc] rounded-[2px] shadow-sm">
        {/* Signature DESIGN.md: 12x12px solid NVIDIA Green (#76b900) corner square */}
        <div
          className="absolute -top-[1px] -left-[1px] w-[12px] h-[12px] bg-[#76b900] z-20"
          aria-hidden="true"
        />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center border border-transparent hover:border-[#cccccc] hover:bg-[#f7f7f7] text-[#757575] hover:text-[#000000] rounded-[2px] transition-colors focus:outline-none disabled:opacity-50"
          aria-label="Tutup dialog"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Card Body */}
        <div className="p-6 sm:p-7">
          {/* Eyebrow & Title */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#76b900] font-mono">
                {isFasil ? "FASILITATOR" : "MAHASISWA"}
              </span>
              <span className="text-[11px] text-[#cccccc]">•</span>
              <span className="text-[11px] font-semibold text-[#757575] uppercase tracking-wider">
                Logout Akun
              </span>
            </div>
            <h2 id="logout-dialog-title" className="text-2xl font-bold text-[#000000] tracking-tight">
              Keluar dari Akun?
            </h2>
          </div>

          {/* Account Detail Panel (DESIGN.md: surface-soft #f7f7f7, hairline border #cccccc, 2px radius) */}
          <div className="mt-4 p-3.5 bg-[#f7f7f7] border border-[#cccccc] rounded-[2px] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 bg-[#000000] text-[#76b900] font-bold text-xs flex items-center justify-center rounded-[2px] border border-[#1a1a1a]">
                {initials || (isFasil ? "FS" : "MHS")}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-[#000000] truncate">
                    {displayName}
                  </span>
                </div>
                <p className="text-xs text-[#757575] font-mono truncate mt-0.5">
                  {displayIdentifier}
                </p>
              </div>
            </div>

            <span className="shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-white text-[#1a1a1a] border border-[#cccccc] rounded-[2px]">
              {isFasil ? "Fasilitator" : "Mahasiswa"}
            </span>
          </div>

          {/* Security Callout (DESIGN.md: 2px radius, hairline rule, flat text) */}
          <div className="mt-3.5 p-3 bg-[#f7f7f7] border-l-4 border-l-[#76b900] border-y border-r border-[#cccccc] rounded-[2px] flex items-start gap-2.5 text-xs text-[#1a1a1a] leading-relaxed">
            <svg
              className="w-4 h-4 shrink-0 text-[#76b900] mt-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="1" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>
              Anda perlu memasukkan kembali NIM dan kata sandi untuk masuk kembali ke sistem.
            </span>
          </div>
        </div>

        {/* Action Buttons Strip (DESIGN.md: surface-soft #f7f7f7, border-t #cccccc, 44px buttons) */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 bg-[#f7f7f7] border-t border-[#cccccc] px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto h-[44px] px-5 bg-white hover:bg-[#f0f0f0] active:bg-[#e5e5e5] text-[#000000] border border-[#cccccc] rounded-[2px] text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
          >
            Stay
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto h-[44px] px-6 bg-[#000000] hover:bg-[#e52020] active:bg-[#650b0b] text-white border border-transparent rounded-[2px] text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
