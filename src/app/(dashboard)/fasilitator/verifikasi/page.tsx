"use client";

import { useState } from "react";
import Link from "next/link";

interface AttendanceVerification {
  id: string;
  nama: string;
  nim: string;
  gedung: string;
  kamar: string;
  tipe: string;
  waktu: string;
  tanggal: string;
  keterangan: string;
  fotoUrl: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  alasanTolak?: string;
}

export default function FasilitatorVerifikasiPage() {
  const [filterStatus, setFilterStatus] = useState<string>("Menunggu");
  const [selectedItem, setSelectedItem] = useState<AttendanceVerification | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [attendances, setAttendances] = useState<AttendanceVerification[]>([
    {
      id: "VERIF-101",
      nama: "Muhammad Afiq",
      nim: "2211523011",
      gedung: "Gedung A",
      kamar: "204",
      tipe: "Presensi Masuk",
      waktu: "17:40 WIB",
      tanggal: "24 Sep 2026",
      keterangan: "Kembali dari praktikum laboratorium komputer.",
      fotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      status: "Menunggu",
    },
    {
      id: "VERIF-102",
      nama: "Rifqi Pratama",
      nim: "2211522045",
      gedung: "Gedung B",
      kamar: "108",
      tipe: "Presensi Kegiatan",
      waktu: "19:35 WIB",
      tanggal: "24 Sep 2026",
      keterangan: "Kajian Rutin Malam Jumat di Masjid Asrama.",
      fotoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
      status: "Menunggu",
    },
    {
      id: "VERIF-103",
      nama: "Fajar Maulana",
      nim: "2211521019",
      gedung: "Gedung A",
      kamar: "312",
      tipe: "Presensi Masuk",
      waktu: "21:55 WIB",
      tanggal: "24 Sep 2026",
      keterangan: "Kembali sebelum batas jam malam 22:00 WIB.",
      fotoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
      status: "Menunggu",
    },
    {
      id: "VERIF-104",
      nama: "Dinda Rahmawati",
      nim: "2211523088",
      gedung: "Gedung Putri C",
      kamar: "201",
      tipe: "Presensi Keluar",
      waktu: "07:20 WIB",
      tanggal: "24 Sep 2026",
      keterangan: "Izin kuliah pagi ke Kampus Limau Manis.",
      fotoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
      status: "Menunggu",
    },
    {
      id: "VERIF-105",
      nama: "Ilham Ramadhan",
      nim: "2211522010",
      gedung: "Gedung B",
      kamar: "204",
      tipe: "Presensi Masuk",
      waktu: "22:15 WIB",
      tanggal: "23 Sep 2026",
      keterangan: "Kembali lewat jam malam.",
      fotoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
      status: "Ditolak",
      alasanTolak: "Terlambat melewati batas jam malam (22:00 WIB).",
    },
  ]);

  const handleApprove = (id: string) => {
    setAttendances((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "Disetujui" } : item))
    );
  };

  const openRejectModal = (item: AttendanceVerification) => {
    setSelectedItem(item);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!selectedItem) return;
    setAttendances((prev) =>
      prev.map((item) =>
        item.id === selectedItem.id
          ? { ...item, status: "Ditolak", alasanTolak: rejectReason || "Foto tidak sesuai ketentuan asrama." }
          : item
      )
    );
    setShowRejectModal(false);
    setSelectedItem(null);
  };

  const filtered = attendances.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6F7A6E] mb-1">
          <Link href="/fasilitator/dashboard" className="hover:underline">Dashboard Fasilitator</Link>
          <span>/</span>
          <span className="font-semibold text-[#131B2E]">Verifikasi Foto Presensi</span>
        </div>
        <h1
          className="text-2xl font-bold text-[#131B2E]"
          data-ui-style="ui-style-vinz70"
        >
          Verifikasi Bukti Foto Presensi (FR-04)
        </h1>
        <p className="text-xs text-[#6F7A6E]">
          Admin / Pembina asrama memverifikasi foto selfie mahasiswa secara manual untuk memastikan keaslian kehadiran di asrama.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["Menunggu", "Disetujui", "Ditolak", "all"].map((statusKey) => (
            <button
              key={statusKey}
              type="button"
              onClick={() => setFilterStatus(statusKey)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filterStatus === statusKey
                  ? "bg-[#0046A4] text-white shadow-xs"
                  : "bg-[#FAF8FF] text-[#6F7A6E] hover:bg-[#EAEDFF] hover:text-[#131B2E]"
              }`}
            >
              {statusKey === "all"
                ? "Semua Status"
                : statusKey === "Menunggu"
                ? `⏳ Menunggu (${attendances.filter((a) => a.status === "Menunggu").length})`
                : statusKey}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#6F7A6E]">
          Total: <strong className="text-[#131B2E]">{filtered.length}</strong> data presensi
        </span>
      </div>

      {/* Grid of Photo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden flex flex-col justify-between"
          >
            {/* Photo Box */}
            <div className="aspect-16/10 bg-[#161D15] relative flex items-center justify-center overflow-hidden border-b border-[#E2E8F0]">
              <div className="absolute top-3 left-3 z-10">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-black/60 backdrop-blur-sm text-white border border-white/20">
                  {item.tipe}
                </span>
              </div>
              <div className="absolute top-3 right-3 z-10">
                {item.status === "Disetujui" ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#15803D] text-white shadow-xs">
                    ✓ Disetujui
                  </span>
                ) : item.status === "Menunggu" ? (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#FE932C] text-[#161D15] shadow-xs">
                    ⏳ Perlu Review
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#BE123C] text-white shadow-xs">
                    ✕ Ditolak
                  </span>
                )}
              </div>

              {/* Photo preview container */}
              <div className="w-full h-full flex flex-col items-center justify-center text-white/60 bg-gradient-to-t from-black/80 to-transparent p-4">
                <span className="text-4xl mb-1">🤳</span>
                <span className="text-[11px] text-white/80 font-mono">
                  {item.tanggal} • {item.waktu}
                </span>
              </div>
            </div>

            {/* Resident Details */}
            <div className="p-5 flex flex-col gap-3 flex-1">
              <div>
                <h3 className="font-bold text-sm text-[#131B2E]">
                  {item.nama}
                </h3>
                <p className="text-xs text-[#6F7A6E] font-mono">
                  {item.nim} • {item.gedung} (Kamar {item.kamar})
                </p>
              </div>

              <div className="p-3 bg-[#FAF8FF] rounded-xl border border-[#EAEDFF] text-xs">
                <span className="font-semibold text-[#131B2E] block mb-0.5">Keterangan Mahasiswa:</span>
                <p className="text-[#3F493F] text-[11px] italic">
                  &ldquo;{item.keterangan}&rdquo;
                </p>
                {item.alasanTolak && (
                  <div className="mt-2 pt-2 border-t border-[#FECDD3] text-[11px] text-[#BE123C]">
                    <strong>Alasan Ditolak:</strong> {item.alasanTolak}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-t border-[#E2E8F0] bg-[#FAFAFA] flex items-center gap-2">
              {item.status === "Menunggu" ? (
                <>
                  <button
                    type="button"
                    onClick={() => openRejectModal(item)}
                    className="flex-1 py-2 px-3 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ✕ Tolak Presensi
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApprove(item.id)}
                    className="flex-1 py-2 px-3 bg-[#00652C] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    ✓ Setujui Presensi
                  </button>
                </>
              ) : (
                <div className="w-full text-center text-xs font-medium text-[#6F7A6E] py-1">
                  Status telah ditetapkan sebagai <span className="font-bold">{item.status}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reject Reason Modal */}
      {showRejectModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#131B2E] mb-1">
              Tolak Foto Presensi {selectedItem.nama}
            </h3>
            <p className="text-xs text-[#6F7A6E] mb-4">
              Mahasiswa akan menerima notifikasi bahwa presensinya ditolak beserta alasan penolakan (FR-09).
            </p>

            <label className="block text-xs font-semibold text-[#131B2E] mb-1">
              Alasan Penolakan:
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Foto tidak memperlihatkan wajah dengan jelas / bukan di area asrama..."
              className="w-full text-xs p-3 border border-[#E2E8F0] rounded-xl mb-4 focus:outline-none focus:border-[#BE123C]"
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#6F7A6E] hover:bg-[#FAF8FF] rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-bold bg-[#BE123C] hover:bg-[#93000A] text-white rounded-lg shadow-xs"
              >
                Konfirmasi Tolak
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
