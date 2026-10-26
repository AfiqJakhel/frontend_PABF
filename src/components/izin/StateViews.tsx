import React from "react";

export function LoadingState({ message = "Memuat data izin..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-[#cccccc] rounded-[2px] bg-white">
      <div className="w-8 h-8 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin mb-3" />
      <p className="text-sm text-[#666666] font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({
  title = "Belum Ada Pengajuan Izin",
  description = "Tidak ada data perizinan yang ditemukan.",
  actionButton,
}: {
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-[#cccccc] rounded-[2px] bg-white text-center">
      <div className="w-12 h-12 rounded-[2px] border border-[#cccccc] bg-[#f8f8f8] flex items-center justify-center mb-3 text-[#888888]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <line x1="9" y1="13" x2="15" y2="13" />
          <line x1="9" y1="17" x2="13" y2="17" />
        </svg>
      </div>
      <h4 className="text-sm font-bold text-[#111111]">{title}</h4>
      <p className="text-xs text-[#666666] mt-1 max-w-sm">{description}</p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
}

export function ErrorState({
  message = "Terjadi kesalahan saat memuat data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 border border-[#ffcdd2] rounded-[2px] bg-[#ffebee] text-center">
      <p className="text-xs font-semibold text-[#c62828]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 izin-btn-outline text-xs py-1 px-3"
        >
          Coba Lagi
        </button>
      )}
    </div>
  );
}
