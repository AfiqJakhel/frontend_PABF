"use client";

import React from "react";
import { IzinItem } from "@/types/izin";
import IzinStatusBadge from "./IzinStatusBadge";
import DokumenPreview from "./DokumenPreview";

interface DetailIzinModalProps {
  item: IzinItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onReject?: (item: IzinItem) => void;
  isAdmin?: boolean;
  actionLoadingId?: number | null;
}

function formatTanggalIndo(tglStr?: string | null) {
  if (!tglStr) return "-";
  try {
    const d = new Date(tglStr);
    if (isNaN(d.getTime())) return tglStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return tglStr;
  }
}

function formatWaktuIndo(isoStr?: string | null) {
  if (!isoStr) return "-";
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " WIB";
  } catch {
    return isoStr;
  }
}

function hitungDurasiHari(mulaiStr?: string | null, selesaiStr?: string | null) {
  if (!mulaiStr) return "";
  if (!selesaiStr || mulaiStr === selesaiStr) return "1 Hari";
  try {
    const d1 = new Date(mulaiStr);
    const d2 = new Date(selesaiStr);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} Hari`;
  } catch {
    return "";
  }
}

export default function DetailIzinModal({
  item,
  isOpen,
  onClose,
  onApprove,
  onReject,
  isAdmin = false,
  actionLoadingId = null,
}: DetailIzinModalProps) {
  if (!isOpen || !item) return null;

  const isPending = item.status === "pending";
  const isActionLoading = actionLoadingId === item.id;
  const durasi = hitungDurasiHari(item.tanggal_mulai, item.tanggal_selesai);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white border border-[#e2e8f0] rounded-2xl shadow-xl flex flex-col my-auto max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-detail-title"
      >
        {/* ── Modal Header (Modern, Clean & Rounded) ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#76b900] rounded-full inline-block" />
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-detail-title" className="text-base sm:text-lg font-bold text-[#0f172a] tracking-tight">
                  Detail Pengajuan Perizinan #{item.id}
                </h2>
                <IzinStatusBadge status={item.status} />
              </div>
              <p className="text-xs text-[#64748b] mt-0.5">
                Diajukan pada {formatWaktuIndo(item.created_at)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#e2e8f0] rounded-full transition-colors font-bold text-base cursor-pointer"
            title="Tutup dialog"
          >
            ✕
          </button>
        </div>

        {/* ── Modal Body (Scrollable) ── */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm izin-scrollbar flex-1">
          {/* Section: Identitas Mahasiswa & Lokasi */}
          <div className="p-4 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#166534] mb-3 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Identitas Pemohon
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-[#64748b] block mb-0.5">Nama Mahasiswa</span>
                <span className="font-bold text-[#0f172a] text-sm block">
                  {item.nama_pemohon || "Mahasiswa"}
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block mb-0.5">NIM</span>
                <span className="font-mono font-semibold text-[#0f172a] text-sm block">
                  {item.nim_pemohon || "-"}
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block mb-0.5">Gedung Asrama</span>
                <span className="font-semibold text-[#0f172a] block">
                  {item.nama_gedung || "Gedung Asrama"}
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block mb-0.5">Nomor Kamar</span>
                <span className="font-semibold text-[#0f172a] block">
                  Kamar {item.nomor_kamar || "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Rincian Perizinan */}
          <div className="border border-[#e2e8f0] rounded-xl p-4 bg-white shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] mb-3 flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              Rincian Izin & Periode
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pb-3 border-b border-[#f1f5f9]">
              <div>
                <span className="text-[#64748b] block mb-1">Jenis Perizinan</span>
                <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-[#f1f5f9] border border-[#e2e8f0] text-[#0f172a]">
                  {item.jenis === "half" ? "Half Day (Sesi Tertentu)" : "Full Day (Seharian Penuh)"}
                </span>
              </div>
              <div>
                <span className="text-[#64748b] block mb-1">Rentang Tanggal</span>
                <span className="font-semibold text-[#0f172a] block text-sm">
                  {formatTanggalIndo(item.tanggal_mulai)}
                  {item.tanggal_selesai && item.tanggal_selesai !== item.tanggal_mulai ? (
                    <> s.d. {formatTanggalIndo(item.tanggal_selesai)}</>
                  ) : null}
                </span>
                {durasi && (
                  <span className="text-[11px] text-[#64748b]">
                    Durasi: <strong className="text-[#0f172a]">{durasi}</strong>
                  </span>
                )}
              </div>
              <div>
                <span className="text-[#64748b] block mb-1">Sesi Presensi Terkait</span>
                {item.jenis === "half" && item.sesi ? (
                  <span className="font-semibold text-[#0f172a] block">
                    {item.sesi.nama} ({item.sesi.jam_mulai || "-"} - {item.sesi.jam_selesai || "-"})
                  </span>
                ) : (
                  <span className="text-[#94a3b8] block">Semua sesi pada periode ini</span>
                )}
              </div>
            </div>

            {/* Alasan / Catatan Pemohon */}
            <div className="mt-3">
              <span className="text-xs font-semibold text-[#475569] block mb-1">
                Alasan / Keperluan Mahasiswa:
              </span>
              <div className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs text-[#1e293b] whitespace-pre-wrap leading-relaxed font-sans">
                {item.keterangan || item.alasan || "Tidak ada rincian alasan yang dituliskan."}
              </div>
            </div>
          </div>

          {/* Section: Dokumen Lampiran */}
          <div className="border border-[#e2e8f0] rounded-xl p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Dokumen Pendukung / Surat Izin ({item.dokumen?.length || 0})
              </h3>
              {item.has_dokumen && (
                <span className="text-[11px] font-semibold text-[#166534] bg-[#ecfdf5] px-2.5 py-0.5 border border-[#a7f3d0] rounded-full">
                  Berkas Terlampir
                </span>
              )}
            </div>

            {item.has_dokumen && item.dokumen?.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs text-[#475569] bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0] flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="font-semibold text-[#0f172a]">
                      {item.dokumen[0].original_name || "Dokumen Pendukung"}
                    </span>
                    <span className="text-[#64748b] ml-2 font-mono">
                      ({(item.dokumen[0].size_bytes / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[#64748b]">
                    {item.dokumen[0].mime_type}
                  </span>
                </div>

                <div className="pt-2">
                  <DokumenPreview
                    izinId={item.id}
                    mimeType={item.dokumen[0].mime_type}
                    originalName={item.dokumen[0].original_name}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#f8fafc] border border-dashed border-[#cbd5e1] rounded-lg text-center text-xs text-[#94a3b8]">
                Tidak ada dokumen surat bukti atau lampiran yang diunggah pemohon.
              </div>
            )}
          </div>

          {/* Section: Riwayat / Hasil Peninjauan */}
          {(item.status !== "pending" || item.catatan_fasil) && (
            <div className={`p-4 rounded-xl border text-xs ${
              item.status === "approved"
                ? "bg-[#f0fdf4] border-[#86efac] text-[#166534]"
                : item.status === "rejected"
                ? "bg-[#fff1f2] border-[#fecdd3] text-[#be123c]"
                : "bg-[#f8fafc] border-[#e2e8f0] text-[#475569]"
            }`}>
              <h4 className="font-bold uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                Informasi Peninjauan (Review)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-[#64748b] block mb-0.5">Ditinjau Oleh:</span>
                  <span className="font-bold text-[#0f172a]">{item.nama_fasil || "Fasilitator Gedung"}</span>
                </div>
                <div>
                  <span className="text-[#64748b] block mb-0.5">Waktu Peninjauan:</span>
                  <span className="font-semibold text-[#0f172a]">{formatWaktuIndo(item.reviewed_at)}</span>
                </div>
              </div>
              {item.catatan_fasil && (
                <div className="mt-3 pt-2.5 border-t border-black/10">
                  <span className="font-bold block mb-0.5">Catatan Reviewer:</span>
                  <p className="bg-white/90 p-2.5 rounded-lg border border-black/10 text-[#0f172a]">
                    {item.catatan_fasil}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Modal Footer (Action Buttons) ── */}
        <div className="px-6 py-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#64748b]">
            {isPending ? (
              <span className="flex items-center gap-1.5 font-medium text-[#b45309]">
                <span className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
                Menunggu peninjauan fasilitator
              </span>
            ) : (
              <span>Pengajuan telah diproses</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="izin-btn-outline text-xs h-9 px-4 rounded-lg"
              disabled={isActionLoading}
            >
              Tutup
            </button>

            {/* Aksi Persetujuan jika pending dan bukan admin */}
            {!isAdmin && isPending && onReject && onApprove && (
              <>
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => onReject(item)}
                  className="izin-btn-danger-outline text-xs h-9 px-3.5 rounded-lg"
                >
                  Tolak Izin
                </button>
                <button
                  type="button"
                  disabled={isActionLoading}
                  onClick={() => onApprove(item.id)}
                  className="izin-btn-primary text-xs h-9 px-4 rounded-lg"
                >
                  {isActionLoading ? "Memproses..." : "Setujui Izin"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
