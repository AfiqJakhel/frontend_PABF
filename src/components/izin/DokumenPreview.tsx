"use client";

import React, { useEffect, useState } from "react";
import { izinService } from "@/services/izinService";

interface DokumenPreviewProps {
  // Opsi 1: File lokal dari form upload
  localFile?: File | null;
  // Opsi 2: Izin ID dari backend
  izinId?: number;
  mimeType?: string;
  originalName?: string | null;
}

export default function DokumenPreview({
  localFile,
  izinId,
  mimeType,
  originalName,
}: DokumenPreviewProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let createdUrl: string | null = null;

    if (localFile) {
      createdUrl = URL.createObjectURL(localFile);
      setObjectUrl(createdUrl);
      setError(null);
      setIsLoading(false);
    } else if (izinId) {
      setIsLoading(true);
      setError(null);
      izinService
        .getDokumenBlob(izinId)
        .then((blob) => {
          if (!active) return;
          createdUrl = URL.createObjectURL(blob);
          setObjectUrl(createdUrl);
          setIsLoading(false);
        })
        .catch((err) => {
          if (!active) return;
          setError(err instanceof Error ? err.message : "Gagal memuat dokumen.");
          setIsLoading(false);
        });
    } else {
      setObjectUrl(null);
    }

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [localFile, izinId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 border border-[#e2e8f0] rounded-xl bg-[#f8fafc] text-xs text-[#64748b]">
        <div className="w-4 h-4 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin mr-2" />
        Memuat pratinjau dokumen...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 border border-[#fecdd3] rounded-xl bg-[#fff1f2] text-xs text-[#be123c]">
        {error}
      </div>
    );
  }

  if (!objectUrl) {
    return null;
  }

  const effectiveMime = (mimeType || localFile?.type || "").toLowerCase();
  const isImage =
    effectiveMime.startsWith("image/") ||
    /\.(jpg|jpeg|png)$/i.test(originalName || localFile?.name || "");
  const isPdf =
    effectiveMime === "application/pdf" ||
    /\.pdf$/i.test(originalName || localFile?.name || "");

  return (
    <div className="flex flex-col gap-2 mt-2 w-full">
      <div className="border border-[#e2e8f0] rounded-xl overflow-hidden bg-[#f8fafc] flex flex-col items-center">
        {isImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={objectUrl}
            alt={originalName || "Pratinjau Dokumen"}
            className="max-h-[300px] w-auto object-contain rounded-lg p-2"
          />
        ) : isPdf ? (
          <div className="w-full flex flex-col items-center p-5">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-2.5">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <p className="text-xs font-bold text-[#0f172a]">Berkas Dokumen PDF</p>
            <p className="text-[11px] text-[#64748b] truncate max-w-xs mt-0.5">
              {originalName || localFile?.name || "dokumen.pdf"}
            </p>
            <a
              href={objectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 text-xs font-semibold text-[#166534] hover:underline flex items-center gap-1 bg-[#ecfdf5] px-3 py-1.5 rounded-lg border border-[#a7f3d0]"
            >
              Buka PDF di Tab Baru ↗
            </a>
          </div>
        ) : (
          <div className="p-4 text-xs text-[#64748b]">
            Format berkas: {effectiveMime || "Dokumen Lampiran"}
          </div>
        )}
      </div>
      {originalName && (
        <span className="text-[11px] text-[#94a3b8] truncate">
          File: {originalName}
        </span>
      )}
    </div>
  );
}
