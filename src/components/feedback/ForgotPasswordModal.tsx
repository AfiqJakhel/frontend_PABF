"use client";

import { useEffect, useCallback } from "react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  // Handle ESC key press
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs modal-backdrop-animate"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forgot-password-title"
      aria-describedby="forgot-password-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* ── Modal Card ── */}
      <div className="relative w-full max-w-md bg-white border border-[#E6E9E7] rounded-2xl shadow-2xl p-6 sm:p-7 modal-card-animate overflow-hidden">
        {/* Subtle decorative glow at top corner */}
        <div
          className="absolute -top-16 -right-16 w-36 h-36 bg-[#81FE5A]/20 rounded-full blur-2xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#596155] hover:text-[#191C1B] hover:bg-[#F2F4F2] transition-colors focus:outline-none"
          aria-label="Tutup dialog bantuan"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Header Icon + Title */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#15803D]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div className="flex-1 pr-6">
            <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#15803D] bg-[#ECFDF5] px-2 py-0.5 rounded-md mb-1 font-mono">
              Bantuan Akun
            </span>
            <h3
              id="forgot-password-title"
              className="text-lg font-bold text-[#191C1B] tracking-tight m-0"
            >
              Lupa Kata Sandi?
            </h3>
          </div>
        </div>

        {/* Description / Info Box */}
        <div
          id="forgot-password-desc"
          className="text-sm text-[#596155] leading-relaxed mb-5"
        >
          <div className="bg-[#FAF8FF] border border-[#E2E7FF] rounded-xl p-4 text-[#191C1B]">
            <p className="m-0 leading-relaxed">
              Silakan hubungi pihak <strong>pengelola asrama</strong> untuk bantuan terkait akun atau reset kata sandi Anda.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end pt-2 border-t border-[#E6E9E7]">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-xl transition-all shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#15803D]/30"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
