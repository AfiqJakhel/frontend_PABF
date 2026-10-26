"use client";

import React, { useState } from "react";

interface RejectReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (catatan: string) => void;
  isLoading?: boolean;
}

export default function RejectReasonDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
}: RejectReasonDialogProps) {
  const [catatan, setCatatan] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catatan.trim()) {
      setError("Alasan penolakan wajib diisi.");
      return;
    }
    if (catatan.trim().length < 3) {
      setError("Alasan penolakan minimal 3 karakter.");
      return;
    }
    setError("");
    onSubmit(catatan.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-base font-bold text-[#0f172a]">Tolak Pengajuan Izin</h3>
        <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
          Berikan catatan atau alasan penolakan agar mahasiswa mengetahui penyebab pengajuan ditolak.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#334155] mb-1">
              Catatan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              className="izin-textarea rounded-lg"
              placeholder="Contoh: Bukti surat dokter tidak jelas atau tanggal izin tidak sesuai..."
              value={catatan}
              onChange={(e) => {
                setCatatan(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
            />
            {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 mt-2">
            <button
              type="button"
              className="izin-btn-outline rounded-lg"
              onClick={onClose}
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="izin-btn-danger-outline font-semibold rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : "Konfirmasi Tolak"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
