"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/lib/apiClient";

interface SesiItem {
  id: number;
  nama_sesi: string;
  tipe_sesi: string;
  tanggal: string | null;
  waktu_mulai: string | null;
  waktu_selesai: string | null;
  status: string;
  is_aktif: boolean;
  keterangan: string | null;
  nama_fasilitator?: string | null;
}

interface ApiResponseDaftarSesi {
  items: SesiItem[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
  server_time?: string;
}

const PRESET_KEGIATAN = [
  "Shalat Subuh Berjamaah",
  "Shalat Maghrib Berjamaah",
  "Shalat Isya Berjamaah",
  "Kajian Rutin & Bina Karakter Mahasiswa",
  "Senam Pagi & Olahraga Asrama",
  "Piket Kebersihan Lingkungan Asrama",
  "Sosialisasi Tata Tertib & Jam Malam",
  "Tutorial & Mentoring Akademik",
  "Rapat Evaluasi Penghuni Gedung",
  "Lainnya (Ketik Manual Kegiatan)",
];

const NAMA_BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

// Helper untuk format string tanggal YYYY-MM-DD
function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper untuk format label tanggal Indonesia
function formatTanggalIndo(dateStr: string): string {
  if (!dateStr) return "-";
  const [y, m, d] = dateStr.split("-").map(Number);
  if (!y || !m || !d) return dateStr;
  return `${d} ${NAMA_BULAN[m - 1]} ${y}`;
}

export default function FasilitatorJadwalPage() {
  const [kegiatanList, setKegiatanList] = useState<SesiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [serverTimeStr, setServerTimeStr] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter tab
  const [filterTab, setFilterTab] = useState<"semua" | "akan_datang" | "selesai">("semua");

  // Modal State
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields (Tanggal, Jam Mulai, Kegiatan, Keterangan) - Jam Selesai DIHAPUS SEPENUHNYA
  const [formTanggal, setFormTanggal] = useState<string>("");
  const [formJamMulai, setFormJamMulai] = useState<string>("");
  const [formKegiatan, setFormKegiatan] = useState<string>("");
  const [customKegiatanText, setCustomKegiatanText] = useState<string>("");
  const [formKeterangan, setFormKeterangan] = useState<string>("");

  // UI Dropdown & Datepicker Popover State
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [isTimePickerOpen, setIsTimePickerOpen] = useState<boolean>(false);
  const [isKegiatanOpen, setIsKegiatanOpen] = useState<boolean>(false);

  // Calendar View Month/Year State
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState<SesiItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);
  const kegiatanRef = useRef<HTMLDivElement>(null);

  // Fetch daftar jadwal
  const fetchJadwal = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await api.get<{ success: boolean; data: ApiResponseDaftarSesi }>(
        "/api/fasil/sesi?tipe_sesi=kegiatan&per_page=50"
      );
      if (res?.data?.items) {
        setKegiatanList(res.data.items);
      }
      if (res?.data?.server_time) {
        setServerTimeStr(res.data.server_time);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memuat jadwal kegiatan.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [fetchJadwal]);

  // Click outside listener untuk menutup popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setIsTimePickerOpen(false);
      }
      if (kegiatanRef.current && !kegiatanRef.current.contains(event.target as Node)) {
        setIsKegiatanOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Waktu server sekarang
  const currentServerDate = serverTimeStr ? new Date(serverTimeStr) : new Date();
  const todayStr = toDateString(currentServerDate);

  // Cek apakah tanggal yang dipilih adalah hari ini
  const isSelectedDateToday = formTanggal === todayStr;

  // Hitung jam & menit sekarang untuk validasi "Hari ini"
  const currentHour = currentServerDate.getHours();
  const currentMinute = currentServerDate.getMinutes();
  const currentTimeTotalMinutes = currentHour * 60 + currentMinute;

  // Validasi apakah slot jam tertentu sudah lewat jika tanggal = hari ini
  const isTimeSlotPast = (timeStr: string): boolean => {
    if (!isSelectedDateToday) return false;
    const [h, m] = timeStr.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return false;
    const slotMinutes = h * 60 + m;
    return slotMinutes <= currentTimeTotalMinutes;
  };

  // Daftar opsi slot waktu (kelipatan 30 menit dari 05:00 hingga 23:30)
  const TIME_SLOTS: string[] = [];
  for (let h = 5; h <= 23; h++) {
    const hh = String(h).padStart(2, "0");
    TIME_SLOTS.push(`${hh}:00`);
    TIME_SLOTS.push(`${hh}:30`);
  }

  // Buka modal tambah jadwal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormTanggal("");
    setFormJamMulai("");
    setFormKegiatan("");
    setCustomKegiatanText("");
    setFormKeterangan("");
    setFormError(null);
    setCalendarViewDate(new Date(currentServerDate));
    setShowModal(true);
  };

  // Buka modal edit jadwal
  const handleOpenEditModal = (item: SesiItem) => {
    if (item.waktu_mulai) {
      const scheduleTime = new Date(item.waktu_mulai);
      if (scheduleTime <= currentServerDate) {
        alert("Jadwal yang sudah berlalu tidak dapat diedit.");
        return;
      }
    }

    setIsEditing(true);
    setEditingId(item.id);
    const dateStr = item.tanggal || (item.waktu_mulai ? item.waktu_mulai.slice(0, 10) : "");
    setFormTanggal(dateStr);

    let jamStr = "";
    if (item.waktu_mulai) {
      const d = new Date(item.waktu_mulai);
      jamStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    }
    setFormJamMulai(jamStr);

    if (PRESET_KEGIATAN.includes(item.nama_sesi)) {
      setFormKegiatan(item.nama_sesi);
      setCustomKegiatanText("");
    } else {
      setFormKegiatan("Lainnya (Ketik Manual Kegiatan)");
      setCustomKegiatanText(item.nama_sesi);
    }

    setFormKeterangan(item.keterangan || "");
    setFormError(null);
    if (dateStr) {
      setCalendarViewDate(new Date(dateStr));
    }
    setShowModal(true);
  };

  // Handler simpan jadwal (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validasi Tanggal
    if (!formTanggal) {
      setFormError("Silakan pilih tanggal kegiatan.");
      return;
    }
    if (formTanggal < todayStr) {
      setFormError("Tanggal kegiatan tidak boleh berada di masa lalu.");
      return;
    }

    // 2. Validasi Jam Mulai
    if (!formJamMulai) {
      setFormError("Silakan pilih jam mulai kegiatan.");
      return;
    }
    if (isSelectedDateToday && isTimeSlotPast(formJamMulai)) {
      setFormError("Jam mulai harus berada di masa depan dari waktu sekarang.");
      return;
    }

    // 3. Validasi Kegiatan
    const finalKegiatan = formKegiatan === "Lainnya (Ketik Manual Kegiatan)"
      ? customKegiatanText.trim()
      : formKegiatan;

    if (!finalKegiatan) {
      setFormError("Silakan pilih atau masukkan nama kegiatan.");
      return;
    }

    // 4. Verifikasi tanggal + jam mulai > currentServerDateTime
    const chosenDateTime = new Date(`${formTanggal}T${formJamMulai}:00`);
    if (chosenDateTime <= currentServerDate) {
      setFormError("Jadwal tidak dapat dibuat karena waktu yang dipilih sudah berlalu.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        nama_sesi: finalKegiatan,
        tipe_sesi: "kegiatan",
        tanggal: formTanggal,
        jam_mulai: formJamMulai,
        keterangan: formKeterangan.trim() || null,
      };

      if (isEditing && editingId) {
        await api.put(`/api/fasil/sesi/${editingId}`, {
          nama_sesi: finalKegiatan,
          tanggal: formTanggal,
          jam_mulai: formJamMulai,
          keterangan: formKeterangan.trim() || null,
        });
        setSuccessMessage("Jadwal kegiatan berhasil diperbarui.");
      } else {
        await api.post("/api/fasil/sesi", payload);
        setSuccessMessage("Jadwal kegiatan berhasil dibuat.");
      }

      setShowModal(false);
      fetchJadwal();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan jadwal kegiatan.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Hapus Jadwal
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await api.delete(`/api/fasil/sesi/${deleteTarget.id}`);
      setSuccessMessage("Jadwal kegiatan berhasil dihapus.");
      setDeleteTarget(null);
      fetchJadwal();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal menghapus jadwal.");
    } finally {
      setDeleting(false);
    }
  };

  // Logika Render Kalender Custom Datepicker
  const year = calendarViewDate.getFullYear();
  const month = calendarViewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCalendarViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarViewDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (d: number) => {
    const selected = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (selected < todayStr) return;

    setFormTanggal(selected);
    setIsDatePickerOpen(false);

    if (selected === todayStr && formJamMulai && isTimeSlotPast(formJamMulai)) {
      setFormJamMulai("");
    }
  };

  // Filter daftar kegiatan sesuai tab
  const filteredKegiatan = kegiatanList.filter((item) => {
    const isPast = item.waktu_mulai ? new Date(item.waktu_mulai) <= currentServerDate : false;
    if (filterTab === "akan_datang") return !isPast && item.status !== "ditutup";
    if (filterTab === "selesai") return isPast || item.status === "ditutup";
    return true;
  });

  return (
    <div className="w-full min-h-screen flex flex-col gap-6 pb-12 text-[#1a1a1a]">
      {/* ── Header Responsif & Full Width Device ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e2e8f0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-6 bg-[#76b900] rounded-full inline-block" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0f172a]">
              Jadwal Kegiatan Asrama
            </h1>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="h-[42px] px-5 bg-[#76b900] hover:bg-[#659e00] text-[#000000] font-bold text-sm rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto border border-[#76b900]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jadwal
        </button>
      </div>

      {/* ── Feedback Banners ── */}
      {successMessage && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] p-3.5 text-sm rounded-lg flex items-center justify-between shadow-xs">
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-xs text-[#166534] hover:underline font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-[#fff1f2] border border-[#fecdd3] text-[#e52020] p-3.5 text-sm rounded-lg flex items-center justify-between shadow-xs">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs text-[#e52020] hover:underline font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      )}

      {/* ── Filter Tab Strip Responsif ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-[#e2e8f0]">
        <button
          type="button"
          onClick={() => setFilterTab("semua")}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            filterTab === "semua"
              ? "bg-[#0f172a] text-[#ffffff] shadow-xs"
              : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
          }`}
        >
          Semua Jadwal ({kegiatanList.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("akan_datang")}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            filterTab === "akan_datang"
              ? "bg-[#0f172a] text-[#ffffff] shadow-xs"
              : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
          }`}
        >
          Akan Datang
        </button>
        <button
          type="button"
          onClick={() => setFilterTab("selesai")}
          className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            filterTab === "selesai"
              ? "bg-[#0f172a] text-[#ffffff] shadow-xs"
              : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
          }`}
        >
          Selesai / Berlalu
        </button>
      </div>

      {/* ── Loading / Empty State Sesuai Verifikasi Presensi ── */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-6 h-6 border-2 border-[#000000] border-t-[#76b900] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-mono uppercase tracking-wider text-[#757575]">
            Memuat daftar jadwal kegiatan...
          </p>
        </div>
      ) : filteredKegiatan.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm font-semibold text-[#000000]">
            Tidak ada jadwal kegiatan asrama yang ditemukan.
          </p>
        </div>
      ) : (
        /* Jika ada data: Render Tabel Responsif */
        <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[640px]">
              <thead className="bg-[#f8fafc] text-[#475569] border-b border-[#e2e8f0] text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Nama Kegiatan</th>
                  <th className="px-5 py-3.5">Waktu Kegiatan</th>
                  <th className="px-5 py-3.5">Lokasi / Keterangan</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {filteredKegiatan.map((item) => {
                  const scheduleDate = item.tanggal
                    ? formatTanggalIndo(item.tanggal)
                    : item.waktu_mulai
                    ? formatTanggalIndo(item.waktu_mulai.slice(0, 10))
                    : "-";

                  let jamMulaiStr = "-";
                  if (item.waktu_mulai) {
                    const d = new Date(item.waktu_mulai);
                    jamMulaiStr = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")} WIB`;
                  }

                  const isPast = item.waktu_mulai ? new Date(item.waktu_mulai) <= currentServerDate : false;
                  const isClosed = item.status === "ditutup";

                  return (
                    <tr key={item.id} className="hover:bg-[#f8fafc] transition-colors">
                      <td className="px-5 py-4 font-semibold text-[#0f172a]">
                        <div className="flex items-center gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-[#76b900] shrink-0" />
                          <span>{item.nama_sesi}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-[#0f172a] text-xs sm:text-sm">
                          {scheduleDate}
                        </div>
                        {/* HANYA JAM MULAI - Jam Selesai Dihapus Sepenuhnya */}
                        <div className="text-xs text-[#64748b] font-mono mt-0.5">
                          Jam Mulai: <span className="font-semibold text-[#0f172a]">{jamMulaiStr}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#64748b] text-xs sm:text-sm">
                        {item.keterangan || "-"}
                      </td>
                      <td className="px-5 py-4">
                        {isPast || isClosed ? (
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-[#f1f5f9] text-[#64748b] border border-[#e2e8f0]">
                            Selesai
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-[#ecfdf5] text-[#15803d] border border-[#a7f3d0]">
                            Akan Datang
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            disabled={isPast || isClosed}
                            onClick={() => handleOpenEditModal(item)}
                            title={isPast || isClosed ? "Jadwal yang sudah berlalu tidak dapat diedit" : "Edit Jadwal"}
                            className={`text-xs font-semibold transition-colors ${
                              isPast || isClosed
                                ? "text-[#94a3b8] cursor-not-allowed opacity-50"
                                : "text-[#0f172a] hover:text-[#76b900] cursor-pointer underline"
                            }`}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="text-xs font-semibold text-[#e11d48] hover:text-[#9f1239] cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL TAMBAH / EDIT JADWAL (TIDAK TERLALU KOTAK, RESPONSIF) ── */}
      {showModal && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-xl max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#76b900]" />
                <h3 className="text-base sm:text-lg font-bold text-[#0f172a]">
                  {isEditing ? "Edit Jadwal Kegiatan" : "Tambah Jadwal Kegiatan"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#64748b] hover:text-[#0f172a] hover:bg-[#f1f5f9] transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 bg-[#fff1f2] border border-[#fecdd3] text-[#e52020] p-3 text-xs font-medium rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* ── 1. CUSTOM DATEPICKER (ROUNDED-LG) ── */}
              <div className="relative" ref={datePickerRef}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#334155] mb-1.5">
                  Tanggal Kegiatan <span className="text-[#e11d48]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsDatePickerOpen(!isDatePickerOpen);
                    setIsTimePickerOpen(false);
                    setIsKegiatanOpen(false);
                  }}
                  className={`w-full h-[42px] px-3.5 bg-[#ffffff] border text-left flex items-center justify-between text-sm rounded-lg transition-all cursor-pointer ${
                    isDatePickerOpen ? "border-[#76b900] ring-2 ring-[#76b900]/20" : "border-[#cbd5e1] hover:border-[#94a3b8]"
                  }`}
                >
                  <span className={formTanggal ? "text-[#0f172a] font-medium" : "text-[#94a3b8]"}>
                    {formTanggal ? formatTanggalIndo(formTanggal) : "Pilih Tanggal Kegiatan"}
                  </span>
                  <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>

                {/* Popover Kalender */}
                {isDatePickerOpen && (
                  <div className="absolute top-[100%] left-0 mt-1 w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-3.5 z-30 shadow-xl">
                    {/* Header Bulan & Tahun */}
                    <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2.5 mb-2.5">
                      <span className="font-bold text-xs sm:text-sm text-[#0f172a]">
                        {NAMA_BULAN[month]} {year}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="w-7 h-7 flex items-center justify-center text-[#0f172a] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-md text-xs font-bold cursor-pointer"
                        >
                          ◀
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMonth}
                          className="w-7 h-7 flex items-center justify-center text-[#0f172a] hover:bg-[#f1f5f9] border border-[#e2e8f0] rounded-md text-xs font-bold cursor-pointer"
                        >
                          ▶
                        </button>
                      </div>
                    </div>

                    {/* Hari Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#64748b] mb-1">
                      {NAMA_HARI.map((h) => (
                        <div key={h} className="py-1">
                          {h}
                        </div>
                      ))}
                    </div>

                    {/* Tanggal Grid */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {Array.from({ length: firstDayIndex }).map((_, idx) => (
                        <div key={`blank-${idx}`} className="p-2" />
                      ))}

                      {Array.from({ length: daysInMonth }).map((_, idx) => {
                        const dayNum = idx + 1;
                        const dateFormatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                        const isPast = dateFormatted < todayStr;
                        const isToday = dateFormatted === todayStr;
                        const isSelected = dateFormatted === formTanggal;

                        return (
                          <button
                            key={`day-${dayNum}`}
                            type="button"
                            disabled={isPast}
                            onClick={() => handleSelectDate(dayNum)}
                            className={`p-2 font-medium rounded-lg transition-colors text-center ${
                              isSelected
                                ? "bg-[#76b900] text-[#000000] font-bold shadow-xs"
                                : isPast
                                ? "text-[#cbd5e1] bg-[#f8fafc] cursor-not-allowed pointer-events-none"
                                : isToday
                                ? "border border-[#76b900] text-[#0f172a] font-bold hover:bg-[#f1f5f9] cursor-pointer"
                                : "text-[#1e293b] hover:bg-[#f1f5f9] cursor-pointer"
                            }`}
                          >
                            {dayNum}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 border border-[#76b900] rounded-xs inline-block" /> Hari ini
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-xs inline-block" /> Tanggal lampau
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 2. JAM MULAI (HANYA JAM MULAI, JAM SELESAI DIHAPUS) ── */}
              <div className="relative" ref={timePickerRef}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#334155]">
                    Jam Mulai <span className="text-[#e11d48]">*</span>
                  </label>
                  {isSelectedDateToday && (
                    <span className="text-[11px] text-[#e11d48] font-medium">
                      *Jam lampau dinonaktifkan untuk hari ini
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimePickerOpen(!isTimePickerOpen);
                      setIsDatePickerOpen(false);
                      setIsKegiatanOpen(false);
                    }}
                    className={`flex-1 h-[42px] px-3.5 bg-[#ffffff] border text-left flex items-center justify-between text-sm rounded-lg transition-all cursor-pointer ${
                      isTimePickerOpen ? "border-[#76b900] ring-2 ring-[#76b900]/20" : "border-[#cbd5e1] hover:border-[#94a3b8]"
                    }`}
                  >
                    <span className={formJamMulai ? "text-[#0f172a] font-bold font-mono" : "text-[#94a3b8]"}>
                      {formJamMulai ? `${formJamMulai} WIB` : "Pilih Jam Mulai"}
                    </span>
                    <svg className="w-4 h-4 text-[#64748b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>

                  {/* Manual Time Input */}
                  <input
                    type="time"
                    value={formJamMulai}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormJamMulai(val);
                    }}
                    className="w-[110px] h-[42px] px-2 text-center text-xs font-mono font-bold bg-[#ffffff] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#76b900] focus:ring-2 focus:ring-[#76b900]/20"
                  />
                </div>

                {/* Popover Slot Waktu */}
                {isTimePickerOpen && (
                  <div className="absolute top-[100%] left-0 mt-1 w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl p-3 z-30 shadow-xl">
                    <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2 mb-2">
                      <span className="text-xs font-bold text-[#0f172a]">
                        Pilih Slot Jam Mulai
                      </span>
                      <span className="text-[11px] text-[#64748b]">
                        {isSelectedDateToday ? "Hari ini (dibatasi)" : "Masa Depan (semua aktif)"}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-[180px] overflow-y-auto p-1">
                      {TIME_SLOTS.map((slot) => {
                        const isPast = isTimeSlotPast(slot);
                        const isSelected = formJamMulai === slot;

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isPast}
                            onClick={() => {
                              setFormJamMulai(slot);
                              setIsTimePickerOpen(false);
                            }}
                            className={`py-1.5 px-1 text-center font-mono text-xs rounded-lg transition-colors ${
                              isSelected
                                ? "bg-[#76b900] text-[#000000] font-bold shadow-xs"
                                : isPast
                                ? "bg-[#f8fafc] text-[#cbd5e1] cursor-not-allowed border border-[#f1f5f9]"
                                : "bg-[#ffffff] text-[#1e293b] hover:bg-[#f1f5f9] border border-[#e2e8f0] cursor-pointer"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── 3. CUSTOM DROPDOWN KEGIATAN (ROUNDED-LG) ── */}
              <div className="relative" ref={kegiatanRef}>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#334155] mb-1.5">
                  Kegiatan Asrama <span className="text-[#e11d48]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsKegiatanOpen(!isKegiatanOpen);
                    setIsDatePickerOpen(false);
                    setIsTimePickerOpen(false);
                  }}
                  className={`w-full h-[42px] px-3.5 bg-[#ffffff] border text-left flex items-center justify-between text-sm rounded-lg transition-all cursor-pointer ${
                    isKegiatanOpen ? "border-[#76b900] ring-2 ring-[#76b900]/20" : "border-[#cbd5e1] hover:border-[#94a3b8]"
                  }`}
                >
                  <span className={formKegiatan ? "text-[#0f172a] font-medium" : "text-[#94a3b8]"}>
                    {formKegiatan || "Pilih Kegiatan Asrama"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-[#64748b] transition-transform ${isKegiatanOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Popover Opsi Kegiatan */}
                {isKegiatanOpen && (
                  <div className="absolute top-[100%] left-0 mt-1 w-full bg-[#ffffff] border border-[#e2e8f0] rounded-xl z-30 shadow-xl max-h-[220px] overflow-y-auto p-1">
                    {PRESET_KEGIATAN.map((kegiatan) => {
                      const isSelected = formKegiatan === kegiatan;
                      return (
                        <button
                          key={kegiatan}
                          type="button"
                          onClick={() => {
                            setFormKegiatan(kegiatan);
                            setIsKegiatanOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-[#76b900] text-[#000000] font-bold"
                              : "text-[#1e293b] hover:bg-[#f1f5f9]"
                          }`}
                        >
                          <span>{kegiatan}</span>
                          {isSelected && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Input Manual Jika Memilih 'Lainnya (Ketik Manual Kegiatan)' */}
                {formKegiatan === "Lainnya (Ketik Manual Kegiatan)" && (
                  <input
                    type="text"
                    required
                    value={customKegiatanText}
                    onChange={(e) => setCustomKegiatanText(e.target.value)}
                    placeholder="Masukkan nama kegiatan khusus..."
                    className="mt-2 w-full h-[40px] px-3 text-xs bg-[#ffffff] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#76b900] focus:ring-2 focus:ring-[#76b900]/20"
                  />
                )}
              </div>

              {/* ── 4. LOKASI / KETERANGAN (OPSIONAL) ── */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#334155] mb-1.5">
                  Lokasi / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  value={formKeterangan}
                  onChange={(e) => setFormKeterangan(e.target.value)}
                  placeholder="Misal: Masjid Asrama Unand / Aula Utama"
                  className="w-full h-[42px] px-3.5 text-sm bg-[#ffffff] border border-[#cbd5e1] rounded-lg focus:outline-none focus:border-[#76b900] focus:ring-2 focus:ring-[#76b900]/20"
                />
              </div>

              {/* ── Action Buttons ── */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e2e8f0] mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="h-[42px] px-5 bg-transparent border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#334155] font-semibold text-sm rounded-lg cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[42px] px-6 bg-[#76b900] hover:bg-[#659e00] text-[#000000] font-bold text-sm rounded-lg transition-all shadow-sm hover:shadow border border-[#76b900] cursor-pointer"
                >
                  {submitting ? "Menyimpan..." : isEditing ? "Simpan Perubahan" : "Simpan Jadwal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL KONFIRMASI HAPUS (ROUNDED-2XL) ── */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#ffffff] border border-[#e2e8f0] rounded-2xl max-w-sm w-full p-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-[#e2e8f0] pb-3 mb-3">
              <span className="w-2.5 h-2.5 rounded-full bg-[#e11d48]" />
              <h4 className="text-base font-bold text-[#0f172a]">Hapus Jadwal Kegiatan</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed mb-4">
              Apakah Anda yakin ingin menghapus kegiatan{" "}
              <span className="font-bold text-[#0f172a]">&quot;{deleteTarget.nama_sesi}&quot;</span>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-[38px] px-4 border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#334155] text-xs font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="h-[38px] px-4 bg-[#e11d48] hover:bg-[#be123c] text-[#ffffff] text-xs font-bold rounded-lg cursor-pointer transition-colors"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus Jadwal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
