"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import "@/app/izin.css";
import { izinService } from "@/services/izinService";
import { getSesiHariIni, SesiDetail } from "@/services/attendanceService";
import { IzinItem, IzinJenis, SesiPresensiItem } from "@/types/izin";
import IzinStatusBadge from "@/components/izin/IzinStatusBadge";
import DokumenPreview from "@/components/izin/DokumenPreview";
import NvidiaDatePicker from "@/components/izin/NvidiaDatePicker";
import { LoadingState, EmptyState, ErrorState } from "@/components/izin/StateViews";

export default function MahasiswaIzinPage() {
  // Form State
  const [jenis, setJenis] = useState<IzinJenis>("full");
  const [tanggalMulai, setTanggalMulai] = useState("");
  const [tanggalSelesai, setTanggalSelesai] = useState("");
  const [sesiId, setSesiId] = useState<number | "">("");
  const [keterangan, setKeterangan] = useState("");
  const [fileDokumen, setFileDokumen] = useState<File | null>(null);

  // Master Sesi & Sesi Aktif Hari Ini
  const [sesiList, setSesiList] = useState<SesiPresensiItem[]>([]);
  const [activeSession, setActiveSession] = useState<SesiDetail | null>(null);
  const [todayDateStr, setTodayDateStr] = useState<string>("");
  const [isLoadingSesi, setIsLoadingSesi] = useState<boolean>(true);

  // UI state submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Riwayat Izin State
  const [riwayat, setRiwayat] = useState<IzinItem[]>([]);
  const [isLoadingRiwayat, setIsLoadingRiwayat] = useState(true);
  const [riwayatError, setRiwayatError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected item untuk modal pratinjau detail dokumen
  const [selectedIzin, setSelectedIzin] = useState<IzinItem | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Helper untuk manipulasi tanggal YYYY-MM-DD
  const addDaysToDateStr = (dateStr: string, days: number): string => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setDate(dt.getDate() + days);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  };

  // Batas tanggal sesuai konfigurasi backend:
  // maks_mundur = 3 hari, maks_maju = 60 hari, maks_durasi = 14 hari
  const baseToday = todayDateStr || new Date().toISOString().split("T")[0];
  const minAllowedDate = useMemo(() => addDaysToDateStr(baseToday, -3), [baseToday]);
  const maxAllowedDate = useMemo(() => addDaysToDateStr(baseToday, 60), [baseToday]);

  const maxSelesaiDate = useMemo(() => {
    if (!tanggalMulai) return maxAllowedDate;
    const max14 = addDaysToDateStr(tanggalMulai, 13);
    return max14 < maxAllowedDate ? max14 : maxAllowedDate;
  }, [tanggalMulai, maxAllowedDate]);

  // Durasi izin dalam hari
  const durasiHari = useMemo(() => {
    if (jenis === "half") return 1;
    if (!tanggalMulai || !tanggalSelesai) return 0;
    if (tanggalSelesai < tanggalMulai) return 0;
    const [y1, m1, d1] = tanggalMulai.split("-").map(Number);
    const [y2, m2, d2] = tanggalSelesai.split("-").map(Number);
    const dt1 = new Date(y1, m1 - 1, d1).getTime();
    const dt2 = new Date(y2, m2 - 1, d2).getTime();
    return Math.round((dt2 - dt1) / (1000 * 60 * 60 * 24)) + 1;
  }, [jenis, tanggalMulai, tanggalSelesai]);

  // Load master sesi presensi & status sesi aktif hari ini
  useEffect(() => {
    setIsLoadingSesi(true);
    Promise.all([
      izinService.getSesiPresensi(),
      getSesiHariIni().catch(() => null),
    ])
      .then(([masterList, hariIniRes]) => {
        setSesiList(masterList);

        const sesiHariIniList = hariIniRes?.data?.sesi_list || [];
        const serverTanggal = hariIniRes?.data?.tanggal || new Date().toISOString().split("T")[0];
        setTodayDateStr(serverTanggal);

        // Inisialisasi tanggal default ke serverTanggal jika belum terisi
        setTanggalMulai((prev) => prev || serverTanggal);
        setTanggalSelesai((prev) => prev || serverTanggal);

        // Cek apakah ada sesi presensi yang sedang berlangsung
        const active = sesiHariIniList.find((s) => s.is_aktif) || null;
        setActiveSession(active);

        // Preselect sesi jika ada yang cocok, atau default ke sesi pertama
        if (active) {
          const matched = masterList.find(
            (m) => m.kode.toLowerCase() === active.tipe_sesi.toLowerCase()
          );
          if (matched) {
            setSesiId(matched.id);
          } else if (masterList.length > 0) {
            setSesiId(masterList[0].id);
          }
        } else if (masterList.length > 0) {
          setSesiId((prev) => (prev ? prev : masterList[0].id));
        }
      })
      .catch((err) => {
        console.error("Gagal memuat informasi sesi:", err);
      })
      .finally(() => {
        setIsLoadingSesi(false);
      });
  }, []);

  // Handler perubahan tanggal mulai
  const handleTanggalMulaiChange = (newVal: string) => {
    setTanggalMulai(newVal);
    if (!newVal) return;

    if (jenis === "half") {
      setTanggalSelesai(newVal);
    } else {
      // Jika tanggal selesai belum ada atau lebih awal dari tanggal mulai, samakan
      if (!tanggalSelesai || tanggalSelesai < newVal) {
        setTanggalSelesai(newVal);
      } else {
        // Cek jika durasi melebihi 14 hari
        const max14 = addDaysToDateStr(newVal, 13);
        if (tanggalSelesai > max14) {
          setTanggalSelesai(max14);
        }
      }
    }
  };

  // Load riwayat izin mahasiswa
  const fetchRiwayat = useCallback(async () => {
    setIsLoadingRiwayat(true);
    setRiwayatError(null);
    try {
      const data = await izinService.getIzinSaya({
        status: statusFilter,
        page: 1,
        per_page: 50,
      });
      setRiwayat(data.items || []);
    } catch (err) {
      setRiwayatError(err instanceof Error ? err.message : "Gagal memuat riwayat izin.");
    } finally {
      setIsLoadingRiwayat(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRiwayat();
  }, [fetchRiwayat]);

  // Validasi form sisi klien
  const validateForm = (): boolean => {
    setFormError(null);

    if (jenis === "half") {
      if (!tanggalMulai) {
        setFormError("Tanggal izin setengah hari wajib dipilih.");
        return false;
      }
      if (!sesiId) {
        setFormError("Silakan pilih sesi presensi yang akan diajukan izin.");
        return false;
      }
    } else {
      if (!tanggalMulai) {
        setFormError("Tanggal mulai izin wajib diisi.");
        return false;
      }
      if (!tanggalSelesai) {
        setFormError("Tanggal selesai izin wajib diisi.");
        return false;
      }
      if (tanggalSelesai < tanggalMulai) {
        setFormError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
        return false;
      }
      if (durasiHari > 14) {
        setFormError("Durasi izin penuh maksimal adalah 14 hari berturut-turut.");
        return false;
      }
      if (!fileDokumen) {
        setFormError("Dokumen bukti pendukung wajib diunggah untuk izin penuh (full day).");
        return false;
      }
    }

    if (!keterangan.trim()) {
      setFormError("Keterangan atau alasan izin wajib diisi.");
      return false;
    }

    if (keterangan.trim().length < 5) {
      setFormError("Keterangan/alasan izin minimal 5 karakter.");
      return false;
    }

    if (keterangan.trim().length > 1000) {
      setFormError("Keterangan/alasan izin maksimal 1000 karakter.");
      return false;
    }

    // Validasi file lampiran jika diunggah
    if (fileDokumen) {
      const allowedExt = [".jpg", ".jpeg", ".png", ".pdf"];
      const ext = "." + fileDokumen.name.split(".").pop()?.toLowerCase();
      if (!allowedExt.includes(ext)) {
        setFormError("Format dokumen tidak didukung. Harap unggah berkas JPG, PNG, atau PDF.");
        return false;
      }
      if (fileDokumen.size > 5 * 1024 * 1024) {
        setFormError("Ukuran dokumen melebihi batas maksimal 5 MB.");
        return false;
      }
    }

    return true;
  };

  const handleFileSelected = (file: File | null) => {
    setFileDokumen(file);
    if (formError) setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const tglMulai = tanggalMulai || todayDateStr || new Date().toISOString().split("T")[0];
      const tglSelesai = jenis === "half" ? tglMulai : tanggalSelesai;

      await izinService.submitIzin({
        jenis,
        tanggal_mulai: tglMulai,
        tanggal_selesai: tglSelesai,
        sesi_id: jenis === "half" ? Number(sesiId) : undefined,
        keterangan: keterangan.trim(),
        dokumen: fileDokumen,
      });

      const sesiNama = sesiList.find((s) => s.id === Number(sesiId))?.nama || "sesi terpilih";
      setFormSuccess(
        jenis === "half"
          ? `Pengajuan izin setengah hari (${sesiNama}) pada ${tglMulai} berhasil dikirim dan menunggu verifikasi.`
          : `Pengajuan izin penuh (${tglMulai} s.d. ${tglSelesai}) berhasil dikirim dan menunggu verifikasi fasilitator.`
      );

      // Reset form fields
      setKeterangan("");
      setFileDokumen(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (todayDateStr) {
        setTanggalMulai(todayDateStr);
        setTanggalSelesai(todayDateStr);
      }

      // Refresh riwayat izin
      fetchRiwayat();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal mengirim pengajuan izin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatalIzin = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin membatalkan pengajuan izin ini?")) return;

    setActionLoadingId(id);
    try {
      await izinService.batalIzin(id);
      fetchRiwayat();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membatalkan pengajuan izin.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="izin-root w-full flex-1 flex flex-col min-h-0 lg:h-[calc(100vh-8rem)]">
      {/* ── Page Header (NVIDIA Editorial Typography) ── */}
      <div className="shrink-0 mb-4 sm:mb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#000000]">
          Perizinan Mahasiswa
        </h1>
        <p className="text-xs sm:text-sm text-[#757575] mt-0.5">
          Ajukan perizinan tidak mengikuti presensi asrama (penuh atau setengah hari) dan pantau status persetujuan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 items-stretch">
        {/* ── Formulir Pengajuan (5 cols di desktop, 5 cols di xl) ── */}
        <section className="lg:col-span-5 xl:col-span-5 izin-card p-5 sm:p-6 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Signature NVIDIA green corner square */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-[#76b900]" />

          <div className="shrink-0 flex items-center justify-between border-b border-[#cccccc] pb-3 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
              Formulir Pengajuan Izin
            </h2>
            <span className="text-[10px] font-bold text-[#757575] uppercase tracking-wider">
              {jenis === "full" ? "Mode Penuh" : "Mode Setengah Hari"}
            </span>
          </div>

          {formSuccess && (
            <div className="shrink-0 p-3 mb-3.5 border border-[#76b900] bg-[#f4faea] text-xs text-[#275200] rounded-[2px] flex items-start gap-2.5">
              <svg className="w-4 h-4 shrink-0 text-[#76b900] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 font-medium leading-relaxed">{formSuccess}</div>
              <button
                type="button"
                onClick={() => setFormSuccess(null)}
                className="text-[#275200] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {formError && (
            <div className="shrink-0 p-3 mb-3.5 border border-[#e52020] bg-[#fef2f2] text-xs text-[#991b1b] rounded-[2px] flex items-start gap-2.5">
              <svg className="w-4 h-4 shrink-0 text-[#e52020] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 font-medium leading-relaxed">{formError}</div>
              <button
                type="button"
                onClick={() => setFormError(null)}
                className="text-[#991b1b] hover:text-black font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 izin-scrollbar flex flex-col gap-4">
              {/* Segmented Toggle Jenis Izin (NVIDIA 2px Pill Tab) */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                  Tipe Perizinan <span className="text-[#e52020]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setJenis("full");
                      if (formError) setFormError(null);
                    }}
                    className={`h-11 px-3 text-xs font-bold rounded-[2px] border transition-all flex items-center justify-center gap-1.5 ${
                      jenis === "full"
                        ? "bg-[#000000] text-[#ffffff] border-[#000000]"
                        : "bg-[#ffffff] text-[#1a1a1a] border-[#cccccc] hover:border-[#76b900] hover:bg-[#f7f7f7]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        jenis === "full" ? "bg-[#76b900]" : "bg-transparent border border-[#cccccc]"
                      }`}
                    />
                    <span>Izin Penuh (Full Day)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setJenis("half");
                      if (formError) setFormError(null);
                      // Set default sesi jika belum dipilih
                      if (!sesiId && sesiList.length > 0) {
                        setSesiId(sesiList[0].id);
                      }
                      if (tanggalMulai) {
                        setTanggalSelesai(tanggalMulai);
                      }
                    }}
                    className={`h-11 px-3 text-xs font-bold rounded-[2px] border transition-all flex items-center justify-center gap-1.5 ${
                      jenis === "half"
                        ? "bg-[#000000] text-[#ffffff] border-[#000000]"
                        : "bg-[#ffffff] text-[#1a1a1a] border-[#cccccc] hover:border-[#76b900] hover:bg-[#f7f7f7]"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        jenis === "half" ? "bg-[#76b900]" : "bg-transparent border border-[#cccccc]"
                      }`}
                    />
                    <span>Setengah Hari (Half Day)</span>
                  </button>
                </div>
              </div>

              {/* Tanggal & Sesi Berdasarkan Jenis Izin */}
              {jenis === "full" ? (
                /* ── Mode Izin Penuh (Full Day) ── */
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <NvidiaDatePicker
                      label="Tanggal Mulai"
                      value={tanggalMulai}
                      onChange={handleTanggalMulaiChange}
                      minDate={minAllowedDate}
                      maxDate={maxAllowedDate}
                      placeholder="Pilih tgl mulai"
                      required
                    />

                    <NvidiaDatePicker
                      label="Tanggal Selesai"
                      value={tanggalSelesai}
                      onChange={(newVal) => setTanggalSelesai(newVal)}
                      minDate={tanggalMulai || minAllowedDate}
                      maxDate={maxSelesaiDate}
                      placeholder="Pilih tgl selesai"
                      required
                    />
                  </div>

                  {/* Ringkasan Durasi Izin */}
                  {durasiHari > 0 && (
                    <div className="p-2.5 bg-[#f7f7f7] border border-[#cccccc] rounded-[2px] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#76b900]" />
                        <span className="text-[#1a1a1a]">
                          Total Durasi: <strong>{durasiHari} Hari</strong>
                        </span>
                      </div>
                      <span className="text-[11px] text-[#757575]">
                        Maks. 14 hari berturut-turut
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Mode Izin Setengah Hari (Half Day) ── */
                <div className="space-y-3">
                  <NvidiaDatePicker
                    label="Tanggal Izin"
                    value={tanggalMulai}
                    onChange={handleTanggalMulaiChange}
                    minDate={minAllowedDate}
                    maxDate={maxAllowedDate}
                    placeholder="Pilih tanggal izin"
                    required
                    helperText="Izin setengah hari berlaku khusus untuk sesi yang dipilih pada tanggal ini."
                  />

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1a1a1a] mb-1.5">
                      Pilih Sesi Presensi <span className="text-[#e52020]">*</span>
                    </label>

                    {isLoadingSesi ? (
                      <div className="h-11 px-3 bg-[#f7f7f7] border border-[#cccccc] rounded-[2px] flex items-center text-xs text-[#757575]">
                        Memuat daftar sesi...
                      </div>
                    ) : sesiList.length === 0 ? (
                      <div className="p-3 bg-[#fef2f2] border border-[#ffcdd2] rounded-[2px] text-xs text-[#991b1b]">
                        Tidak ada sesi presensi aktif yang terdaftar di sistem.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sesiList.map((sesi) => {
                          const isSelected = sesiId === sesi.id;
                          const isCurrentActive =
                            activeSession &&
                            sesi.kode.toLowerCase() === activeSession.tipe_sesi.toLowerCase();

                          return (
                            <button
                              key={sesi.id}
                              type="button"
                              onClick={() => setSesiId(sesi.id)}
                              className={`p-2.5 text-left rounded-[2px] border transition-all flex flex-col justify-between ${
                                isSelected
                                  ? "border-2 border-[#76b900] bg-[#f4faea]"
                                  : "border-[#cccccc] bg-white hover:border-[#1a1a1a]"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="text-xs font-bold text-[#000000]">
                                  {sesi.nama}
                                </span>
                                {isCurrentActive && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[#76b900] text-black rounded-[2px]">
                                    Aktif
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-[#757575]">
                                {sesi.jam_mulai} - {sesi.jam_selesai} WIB
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Keterangan / Alasan */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1a1a1a]">
                    Keterangan / Alasan <span className="text-[#e52020]">*</span>
                  </label>
                  <span className="text-[10px] text-[#757575]">
                    {keterangan.length}/1000 karakter (min. 5)
                  </span>
                </div>
                <textarea
                  rows={3}
                  className="izin-textarea"
                  placeholder="Tuliskan keterangan detail alasan pengajuan perizinan..."
                  value={keterangan}
                  maxLength={1000}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>

              {/* Upload Dokumen Bukti (Dropzone) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#1a1a1a]">
                    Dokumen Bukti Pendukung{" "}
                    {jenis === "full" ? (
                      <span className="text-[#e52020]">[WAJIB]</span>
                    ) : (
                      <span className="text-[#757575] font-normal">[OPSIONAL]</span>
                    )}
                  </label>
                  <span className="text-[10px] text-[#757575]">Maks. 5 MB</span>
                </div>

                {!fileDokumen ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file) handleFileSelected(file);
                    }}
                    className={`border-2 border-dashed rounded-[2px] p-4 flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
                      isDragging
                        ? "border-[#76b900] bg-[#f4faea]"
                        : "border-[#cccccc] hover:border-[#76b900] bg-[#f7f7f7] hover:bg-[#f4faea]/40"
                    }`}
                  >
                    <div className="w-9 h-9 rounded-[2px] bg-white border border-[#cccccc] flex items-center justify-center text-[#757575] mb-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.75}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-[#111111]">
                      Pilih berkas dokumen <span className="font-normal text-[#757575]">atau seret ke sini</span>
                    </p>
                    <p className="text-[11px] text-[#757575] mt-0.5">
                      Mendukung format JPG, PNG, atau PDF
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) handleFileSelected(file);
                      }}
                    />
                  </div>
                ) : (
                  <div className="border border-[#cccccc] rounded-[2px] p-3 bg-[#f7f7f7] flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-[2px] flex items-center justify-center shrink-0 border ${
                            fileDokumen.name.toLowerCase().endsWith(".pdf")
                              ? "bg-red-50 text-red-600 border-red-200"
                              : "bg-[#f4faea] text-[#275200] border-[#76b900]"
                          }`}
                        >
                          {fileDokumen.name.toLowerCase().endsWith(".pdf") ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#111111] truncate" title={fileDokumen.name}>
                            {fileDokumen.name}
                          </p>
                          <p className="text-[11px] text-[#757575]">
                            {(fileDokumen.size / (1024 * 1024)).toFixed(2)} MB • Berkas Terpilih
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-bold text-[#111111] bg-white border border-[#cccccc] rounded-[2px] hover:border-[#76b900] transition-colors"
                        >
                          Ganti
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFileDokumen(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-[#e52020] bg-white border border-[#ffcdd2] rounded-[2px] hover:bg-[#ffebee] transition-colors"
                          title="Hapus file"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file) handleFileSelected(file);
                      }}
                    />
                    <DokumenPreview localFile={fileDokumen} originalName={fileDokumen.name} />
                  </div>
                )}
              </div>
            </div>

            {/* Submit Action Strip */}
            <div className="shrink-0 pt-3 border-t border-[#cccccc] mt-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="izin-btn-primary w-full"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Mengirim Pengajuan...
                  </span>
                ) : (
                  "Kirim Pengajuan Izin"
                )}
              </button>
            </div>
          </form>
        </section>

        {/* ── Riwayat Izin Saya (7 cols di desktop, 7 cols di xl) ── */}
        <section className="lg:col-span-7 xl:col-span-7 izin-card p-5 sm:p-6 flex flex-col h-full min-h-0 overflow-hidden">
          {/* Signature NVIDIA green corner square */}
          <div className="absolute top-0 right-0 w-3 h-3 bg-[#76b900]" />

          <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#cccccc] pb-3 mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
              Riwayat Pengajuan Izin
            </h2>

            {/* Status Filter Tabs (NVIDIA Pill Tabs) */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              {[
                { key: "all", label: "Semua" },
                { key: "pending", label: "Menunggu" },
                { key: "approved", label: "Disetujui" },
                { key: "rejected", label: "Ditolak" },
                { key: "cancelled", label: "Batal" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setStatusFilter(t.key)}
                  className={`izin-tab ${
                    statusFilter === t.key ? "izin-tab-active" : "izin-tab-inactive"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* List Riwayat Scrollable Container */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 izin-scrollbar flex flex-col">
            {isLoadingRiwayat ? (
              <LoadingState message="Memuat riwayat izin..." />
            ) : riwayatError ? (
              <ErrorState message={riwayatError} onRetry={fetchRiwayat} />
            ) : riwayat.length === 0 ? (
              <EmptyState
                title="Tidak Ada Izin Ditemukan"
                description={
                  statusFilter === "all"
                    ? "Anda belum pernah mengajukan perizinan."
                    : `Tidak ada riwayat perizinan dengan status '${statusFilter}'.`
                }
              />
            ) : (
              <div className="flex flex-col gap-3">
                {riwayat.map((item) => (
                  <div
                    key={item.id}
                    className="border border-[#cccccc] rounded-[2px] p-4 flex flex-col gap-2.5 hover:border-[#1a1a1a] transition-colors bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2 py-0.5 bg-[#f7f7f7] border border-[#cccccc] text-[#111111] rounded-[2px] uppercase">
                          {item.jenis === "half"
                            ? `Setengah Hari (${item.sesi?.nama || "Sesi"})`
                            : "Izin Penuh"}
                        </span>
                        <IzinStatusBadge status={item.status} />
                      </div>
                      <span className="text-[11px] text-[#757575]">
                        Diajukan: {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID") : "-"}
                      </span>
                    </div>

                    <div className="text-xs text-[#1a1a1a]">
                      <span className="font-bold text-[#757575]">Periode: </span>
                      <span className="font-semibold">
                        {item.tanggal_mulai}{" "}
                        {item.tanggal_selesai !== item.tanggal_mulai ? `s.d. ${item.tanggal_selesai}` : ""}
                      </span>
                    </div>

                    <p className="text-xs text-[#1a1a1a] bg-[#f7f7f7] p-2.5 rounded-[2px] border border-[#cccccc] leading-relaxed">
                      {item.keterangan || item.alasan}
                    </p>

                    {/* Catatan Reviewer jika ada */}
                    {item.catatan_fasil && (
                      <div className="text-xs p-2.5 rounded-[2px] bg-[#feeeb2] border border-[#fde68a] text-[#78350f]">
                        <span className="font-bold">Catatan Fasilitator:</span> {item.catatan_fasil}
                      </div>
                    )}

                    {/* Actions & Detail */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#cccccc] mt-1">
                      <div className="flex items-center gap-3">
                        {item.has_dokumen && (
                          <button
                            type="button"
                            onClick={() => setSelectedIzin(item)}
                            className="text-xs text-[#000000] font-bold hover:text-[#5a8d00] flex items-center gap-1 underline"
                          >
                            <svg className="w-3.5 h-3.5 text-[#76b900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Dokumen ({item.dokumen.length})
                          </button>
                        )}
                      </div>

                      {item.status === "pending" && (
                        <button
                          type="button"
                          disabled={actionLoadingId === item.id}
                          onClick={() => handleBatalIzin(item.id)}
                          className="izin-btn-danger-outline text-xs"
                        >
                          {actionLoadingId === item.id ? "Membatalkan..." : "Batalkan Izin"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── Modal Pratinjau Dokumen Riwayat (NVIDIA Flat 2px) ── */}
      {selectedIzin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-lg bg-white border border-[#cccccc] rounded-[2px] p-6 shadow-2xl">
            {/* Signature NVIDIA green corner square */}
            <div className="absolute top-0 right-0 w-3 h-3 bg-[#76b900]" />

            <div className="flex items-center justify-between border-b border-[#cccccc] pb-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#000000]">
                  Dokumen Bukti Izin
                </h3>
                <p className="text-xs text-[#757575] mt-0.5">
                  Periode: {selectedIzin.tanggal_mulai} ({selectedIzin.jenis === "half" ? "Setengah Hari" : "Penuh"})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedIzin(null)}
                className="text-[#757575] hover:text-[#000000] text-sm font-bold w-7 h-7 flex items-center justify-center rounded-[2px] border border-[#cccccc] hover:bg-[#f7f7f7] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="py-4">
              <DokumenPreview
                izinId={selectedIzin.id}
                mimeType={selectedIzin.dokumen?.[0]?.mime_type}
                originalName={selectedIzin.dokumen?.[0]?.original_name}
              />
            </div>

            <div className="flex justify-end pt-3 border-t border-[#cccccc]">
              <button
                type="button"
                onClick={() => setSelectedIzin(null)}
                className="izin-btn-outline"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
