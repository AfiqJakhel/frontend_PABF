"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import CameraCapture from "@/components/ui/CameraCapture";
import LocationStatus from "@/components/ui/LocationStatus";
import type { CapturedPhoto } from "@/hooks/useCamera";
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  getSesiHariIni,
  submitAbsensi,
  validateAttendanceLocation,
  type SesiDetail,
} from "@/services/attendanceService";
import type { SubmitAbsensiResponseData } from "@/types/attendance";

type AttendanceStep =
  | "CAMERA"
  | "LOCATING"
  | "READY"
  | "SUBMITTING"
  | "SUCCESS"
  | "ERROR";

export default function MahasiswaPresensiPage() {
  const [step, setStep] = useState<AttendanceStep>("CAMERA");
  const [capturedPhoto, setCapturedPhoto] = useState<CapturedPhoto | null>(null);
  const [note, setNote] = useState("");
  const [submitResult, setSubmitResult] = useState<SubmitAbsensiResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ── Sesi Presensi State ──
  const [selectedSesi, setSelectedSesi] = useState<"subuh" | "malam" | "kegiatan">("subuh");
  const [sesiList, setSesiList] = useState<SesiDetail[]>([]);
  const [isLoadingSesi, setIsLoadingSesi] = useState<boolean>(true);
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0);
  const [currentTick, setCurrentTick] = useState<number>(Date.now());

  // Geofence polygon state
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean | null>(null);
  const [geofenceAreaName, setGeofenceAreaName] = useState<string | null>(null);
  const [gedungNama, setGedungNama] = useState<string | null>(null);
  const [isValidatingGeofence, setIsValidatingGeofence] = useState<boolean>(false);

  const {
    latitude,
    longitude,
    accuracy,
    isLocating,
    geoError,
    requestLocation,
    isAccuracySufficient,
  } = useGeolocation(50); // 50m max allowed accuracy

  // Fetch data sesi presensi dari backend
  const fetchSesi = useCallback(async (selectDefaultActive = false) => {
    try {
      const res = await getSesiHariIni();
      if (res.success && res.data) {
        const list = res.data.sesi_list || [];
        setSesiList(list);

        if (res.data.server_time) {
          const serverMs = new Date(res.data.server_time).getTime();
          setServerTimeOffset(serverMs - Date.now());
        }

        // Jika inisialisasi awal, arahkan default tab ke sesi yang sedang aktif
        if (selectDefaultActive && list.length > 0) {
          const activeSesi = list.find((s) => s.is_aktif && !s.sudah_absen);
          if (activeSesi) {
            setSelectedSesi(activeSesi.tipe_sesi);
          } else {
            // Jika tidak ada yang aktif, cek apakah malam belum absen
            const malam = list.find((s) => s.tipe_sesi === "malam");
            const subuh = list.find((s) => s.tipe_sesi === "subuh");
            if (subuh && !subuh.sudah_absen) {
              setSelectedSesi("subuh");
            } else if (malam && !malam.sudah_absen) {
              setSelectedSesi("malam");
            }
          }
        }
      }
    } catch (err) {
      console.error("Gagal memuat daftar sesi presensi:", err);
    } finally {
      setIsLoadingSesi(false);
    }
  }, []);

  // Polling halus per 30 detik untuk sinkronisasi server dan timer per 5 detik untuk transisi status
  useEffect(() => {
    fetchSesi(true);

    const syncInterval = setInterval(() => {
      fetchSesi(false);
    }, 30000);

    const tickInterval = setInterval(() => {
      setCurrentTick(Date.now());
    }, 5000);

    return () => {
      clearInterval(syncInterval);
      clearInterval(tickInterval);
    };
  }, [fetchSesi]);

  // Data sesi terpilih
  const currentSesiData = sesiList.find((s) => s.tipe_sesi === selectedSesi) ?? {
    tipe_sesi: selectedSesi,
    nama_sesi:
      selectedSesi === "subuh"
        ? "Subuh"
        : selectedSesi === "malam"
        ? "Malam"
        : "Kegiatan Gedung",
    tanggal: new Date().toISOString().split("T")[0],
    jam_mulai:
      selectedSesi === "subuh"
        ? "04:30"
        : selectedSesi === "malam"
        ? "19:00"
        : "-",
    jam_selesai:
      selectedSesi === "subuh"
        ? "06:00"
        : selectedSesi === "malam"
        ? "21:00"
        : "-",
    waktu_mulai: "",
    waktu_selesai: "",
    is_aktif: false,
    status_sesi: "tidak_aktif" as "aktif" | "tidak_aktif",
    pesan_status:
      selectedSesi === "kegiatan"
        ? "Tidak ada jadwal kegiatan yang sedang berlangsung di gedung Anda hari ini."
        : "Memuat jadwal sesi...",
    keterangan: null,
    gedung_nama: null,
    sudah_absen: false,
    presensi_info: null,
  };

  // Helper untuk mengevaluasi apakah suatu sesi aktif secara realtime
  const isSesiCurrentlyActive = useCallback(
    (s: SesiDetail | undefined) => {
      if (!s) return false;
      if (s.tipe_sesi === "kegiatan") return Boolean(s.is_aktif);
      if (!s.waktu_mulai || !s.waktu_selesai) return s.is_aktif;
      const nowMs = currentTick + serverTimeOffset;
      const startMs = new Date(s.waktu_mulai).getTime();
      const endMs = new Date(s.waktu_selesai).getTime();
      return nowMs >= startMs && nowMs <= endMs;
    },
    [currentTick, serverTimeOffset]
  );

  const isSesiNotStarted = useCallback(
    (s: SesiDetail | undefined) => {
      if (!s || !s.waktu_mulai) return false;
      const nowMs = currentTick + serverTimeOffset;
      const startMs = new Date(s.waktu_mulai).getTime();
      return nowMs < startMs;
    },
    [currentTick, serverTimeOffset]
  );

  const isSesiPastDeadline = useCallback(
    (s: SesiDetail | undefined) => {
      if (!s || !s.waktu_selesai) return false;
      const nowMs = currentTick + serverTimeOffset;
      const endMs = new Date(s.waktu_selesai).getTime();
      return nowMs > endMs;
    },
    [currentTick, serverTimeOffset]
  );

  const isCurrentSesiActive = isSesiCurrentlyActive(currentSesiData);
  const isCurrentSesiUpcoming = isSesiNotStarted(currentSesiData);
  const isCurrentSesiExpired = isSesiPastDeadline(currentSesiData);

  const checkGeofence = async (lat: number, lon: number, acc: number | null) => {
    try {
      setIsValidatingGeofence(true);
      const res = await validateAttendanceLocation(lat, lon, acc);
      if (res.success && res.data) {
        setIsInsideGeofence(res.data.inside_polygon);
        setGeofenceAreaName(res.data.area_nama);
        setGedungNama(res.data.gedung_nama);
      }
    } catch (e) {
      console.error("Gagal validasi polygon:", e);
    } finally {
      setIsValidatingGeofence(false);
    }
  };

  // When photo is taken, automatically trigger GPS geolocation & geofence validation
  const handlePhotoCaptured = async (photo: CapturedPhoto) => {
    setCapturedPhoto(photo);
    setStep("LOCATING");
    setErrorMessage(null);

    // Request GPS
    const loc = await requestLocation();
    if (loc) {
      await checkGeofence(loc.latitude, loc.longitude, loc.accuracy);
      setStep("READY");
    } else {
      setStep("LOCATING");
    }
  };

  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setStep("CAMERA");
    setErrorMessage(null);
  };

  const handleManualLocationFetch = async () => {
    const loc = await requestLocation();
    if (loc) {
      await checkGeofence(loc.latitude, loc.longitude, loc.accuracy);
      if (capturedPhoto) {
        setStep("READY");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedPhoto || latitude === null || longitude === null) return;

    setStep("SUBMITTING");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("foto", capturedPhoto.file);
      formData.append("latitude", latitude.toString());
      formData.append("longitude", longitude.toString());
      formData.append("sesi", selectedSesi); // Ikat ke sesi yang dipilih pada tab
      if (accuracy !== null) {
        formData.append("accuracy", accuracy.toString());
      }

      if (note.trim()) {
        formData.append("keterangan", note.trim());
      }

      const res = await submitAbsensi(formData);

      if (res.success && res.data) {
        setSubmitResult(res.data);
        setStep("SUCCESS");
        // Refetch status sesi agar data tab terupdate
        fetchSesi(false);
      } else {
        setErrorMessage(res.message || "Gagal mencatat absensi.");
        setStep("ERROR");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengirim absensi.";
      setErrorMessage(msg);
      setStep("ERROR");
    }
  };

  const handleReset = () => {
    setCapturedPhoto(null);
    setSubmitResult(null);
    setErrorMessage(null);
    setNote("");
    setIsInsideGeofence(null);
    setGeofenceAreaName(null);
    setGedungNama(null);
    setStep("CAMERA");
  };

  const handleSwitchTab = (sesiKey: "subuh" | "malam" | "kegiatan") => {
    setSelectedSesi(sesiKey);
    setCapturedPhoto(null);
    setSubmitResult(null);
    setErrorMessage(null);
    setNote("");
    setIsInsideGeofence(null);
    setGeofenceAreaName(null);
    setGedungNama(null);
    setStep("CAMERA");
  };

  const isFormReady = capturedPhoto !== null && latitude !== null && longitude !== null;

  return (
    <div className="w-full min-w-0 space-y-6 pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mt-1">
            Ambil Presensi Mahasiswa
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-2xl">
            Pastikan foto jelas, cahaya cukup, dan berada di dalam area yang telah ditentukan
          </p>
        </div>
      </div>

      {/* ── SESSION TABS & STATUS BANNER ── */}
      <div className="bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Tab Controls: [ Subuh ] [ Malam ] */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Sesi Presensi Harian
            </span>
            <p className="text-xs text-stone-400 mt-0.5">
              Pilih sesi presensi untuk melihat status dan batas waktu operasional
            </p>
          </div>

          {/* Sliding Capsule Pill Switcher */}
          <div
            className="relative flex items-center p-1 bg-stone-100/90 rounded-full border border-stone-200/80 w-full sm:w-[460px] h-[46px] select-none"
            role="tablist"
            aria-label="Pilihan Sesi Presensi"
          >
            {/* Moving Capsule Background */}
            <div
              className={`absolute top-1 bottom-1 rounded-full bg-white shadow-sm border border-stone-200/90 transition-transform duration-300 ease-out pointer-events-none ${
                selectedSesi === "subuh"
                  ? "translate-x-0"
                  : selectedSesi === "malam"
                  ? "translate-x-full"
                  : "translate-x-[200%]"
              }`}
              style={{
                left: "4px",
                width: "calc((100% - 8px) / 3)",
              }}
              aria-hidden="true"
            />

            {/* Sesi Subuh Button */}
            <button
              type="button"
              role="tab"
              aria-selected={selectedSesi === "subuh"}
              onClick={() => handleSwitchTab("subuh")}
              className={`flex-1 h-full relative z-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                selectedSesi === "subuh" ? "text-stone-900" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Subuh
            </button>

            {/* Sesi Malam Button */}
            <button
              type="button"
              role="tab"
              aria-selected={selectedSesi === "malam"}
              onClick={() => handleSwitchTab("malam")}
              className={`flex-1 h-full relative z-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer ${
                selectedSesi === "malam" ? "text-stone-900" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              Malam
            </button>

            {/* Sesi Kegiatan Button */}
            <button
              type="button"
              role="tab"
              aria-selected={selectedSesi === "kegiatan"}
              onClick={() => handleSwitchTab("kegiatan")}
              className={`flex-1 h-full relative z-10 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-colors duration-200 cursor-pointer gap-1 sm:gap-1.5 ${
                selectedSesi === "kegiatan" ? "text-stone-900 font-extrabold" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              <span>Kegiatan</span>
            </button>
          </div>
        </div>

        {/* Selected Session Information Card */}
        <div className="p-4 rounded-2xl border bg-stone-50 border-stone-200/80">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                {selectedSesi === "kegiatan"
                  ? currentSesiData.nama_sesi || "Kegiatan Gedung"
                  : `Sesi ${currentSesiData.nama_sesi}`}
              </h2>

              {/* Status Badge */}
              {isCurrentSesiActive ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Sesi Aktif
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200/80 text-stone-700 border border-stone-300">
                  Tidak Aktif
                </span>
              )}

              {/* Status Kehadiran jika sudah absen */}
              {currentSesiData.sudah_absen && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  Sudah Presensi ({currentSesiData.presensi_info?.status?.toUpperCase() ?? "TERCATAT"})
                </span>
              )}
            </div>

              {/* Batas Waktu Sesi (Selalu Ditampilkan!) */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-medium mt-1.5 flex-wrap">
                <span className="text-stone-500">
                  {selectedSesi === "kegiatan" ? "Jadwal Kegiatan:" : "Batas Waktu:"}
                </span>
                <span className="font-mono font-bold text-stone-900 bg-white px-2.5 py-0.5 rounded-lg border border-stone-200">
                  {currentSesiData.jam_mulai} - {currentSesiData.jam_selesai} WIB
                </span>
                <span className="text-stone-300 hidden sm:inline">•</span>
                <span className="text-stone-500 text-xs">
                  {currentSesiData.pesan_status}
                </span>
              </div>
            </div>
          </div>
        </div>

      {/* ── SUCCESS RECEIPT VIEW ── */}
      {step === "SUCCESS" && submitResult && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 shadow-xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 ring-8 ring-emerald-50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-1">
            {submitResult.location_valid
              ? "Presensi Langsung Hadir!"
              : "Presensi Tercatat (Di Luar Zona)"}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mb-6">
            {submitResult.location_valid
              ? "Lokasi GPS Anda terverifikasi di dalam area kampus. Kehadiran Anda langsung SAH & HADIR otomatis tanpa perlu verifikasi fasilitator."
              : "Koordinat GPS dan foto Anda telah tersimpan. Karena berada di luar area kampus, kehadiran Anda akan ditinjau oleh Fasilitator."}
          </p>

          {/* Receipt Breakdown Card */}
          <div className="w-full bg-stone-50 rounded-2xl border border-stone-200 p-4 sm:p-5 mb-6 text-left space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <span className="text-xs text-stone-500 font-medium">Status Kehadiran</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  submitResult.location_valid
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {submitResult.location_valid ? "✓ Hadir (Langsung Sah)" : "Perlu Verifikasi Fasil"}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Sesi Presensi:</span>
              <span className="font-semibold text-stone-800 uppercase tracking-wider">
                {submitResult.sesi}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Lokasi / Area:</span>
              {submitResult.location_valid ? (
                <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {submitResult.area_nama} (Terverifikasi di Area)
                </span>
              ) : (
                <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1.5 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Di Luar Area Geofencing (Tercatat)
                </span>
              )}
            </div>

            {submitResult.keterangan && (
              <div className="flex items-start justify-between text-xs sm:text-sm">
                <span className="text-stone-500 shrink-0">Catatan / Status:</span>
                <span className="text-stone-700 text-right font-medium max-w-[70%]">
                  {submitResult.keterangan}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-stone-500">Waktu Presensi:</span>
              <span className="font-mono text-stone-700">
                {new Date(submitResult.waktu).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>

            {capturedPhoto && (
              <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs text-stone-500">Foto Selfie:</span>
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-stone-300 shadow-2xs">
                  <Image
                    src={capturedPhoto.dataUrl}
                    alt="Selfie"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <Link
              href="/mahasiswa/dashboard"
              className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm text-center shadow-md transition-all"
            >
              Kembali ke Dashboard
            </Link>
            <Link
              href="/mahasiswa/riwayat"
              className="py-3 px-5 rounded-xl border border-stone-300 bg-white text-stone-700 font-semibold text-xs sm:text-sm text-center hover:bg-stone-50 transition-all shadow-2xs"
            >
              Lihat Riwayat Presensi
            </Link>
          </div>
        </div>
      )}

      {/* ── ERROR ALERT VIEW ── */}
      {step === "ERROR" && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 shadow-xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mb-1">
            Presensi Belum Berhasil
          </h2>
          <p className="text-xs sm:text-sm text-rose-700 bg-rose-50 border border-rose-200 px-4 py-3 rounded-2xl max-w-md mb-6 leading-relaxed">
            {errorMessage || "Terjadi kesalahan saat memproses absensi."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 py-3 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
            >
              Coba Lagi
            </button>
            <Link
              href="/mahasiswa/dashboard"
              className="py-3 px-5 rounded-xl border border-stone-300 bg-white text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-50 transition-all text-center"
            >
              Ke Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* ── KONDISI 1: SUDAH ABSEN PADA SESI INI ── */}
      {step !== "SUCCESS" && step !== "ERROR" && currentSesiData.sudah_absen && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-blue-200/80 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">
              Presensi Sesi {currentSesiData.nama_sesi} Telah Selesai
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-md mx-auto">
              Anda sudah melakukan presensi untuk sesi ini pada hari ini. Status kehadiran Anda tercatat sebagai:
            </p>
            <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider border border-blue-200">
              {currentSesiData.presensi_info?.status ?? "HADIR"}
            </div>
            {currentSesiData.presensi_info?.waktu && (
              <p className="text-xs text-stone-400 mt-2">
                Waktu: {new Date(currentSesiData.presensi_info.waktu).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
              </p>
            )}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/mahasiswa/dashboard"
              className="py-3 px-6 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all"
            >
              Ke Dashboard
            </Link>
            <Link
              href="/mahasiswa/riwayat"
              className="py-3 px-6 rounded-xl border border-stone-300 bg-white text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-50 transition-all"
            >
              Lihat Riwayat Presensi
            </Link>
          </div>
        </div>
      )}

      {/* ── KONDISI 2A: SESI SUBUH/MALAM BELUM DIMULAI & BELUM ABSEN ── */}
      {step !== "SUCCESS" && step !== "ERROR" && !currentSesiData.sudah_absen && selectedSesi !== "kegiatan" && isCurrentSesiUpcoming && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs text-center space-y-3">
          <div>
            <h3 className="text-xl font-bold text-stone-900">
              Sesi Belum Dimulai
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-md mx-auto">
              Sesi <strong>{currentSesiData.nama_sesi}</strong> saat ini belum dimulai. Presensi akan dibuka pada rentang waktu:
            </p>
            <div className="inline-block mt-3 px-4 py-2 bg-stone-100 rounded-xl font-mono text-sm font-bold text-stone-800 border border-stone-200">
              {currentSesiData.jam_mulai} - {currentSesiData.jam_selesai} WIB
            </div>
            <p className="text-xs text-stone-500 mt-2 font-medium">
              {currentSesiData.pesan_status}
            </p>
          </div>
          <p className="text-xs text-stone-400">
            * Tombol presensi akan otomatis aktif ketika waktu server memasuki jadwal sesi tersebut.
          </p>
        </div>
      )}

      {/* ── KONDISI 2B: KEGIATAN TIDAK AKTIF / BELUM DIBUKA / SELESAI ── */}
      {step !== "SUCCESS" && step !== "ERROR" && !currentSesiData.sudah_absen && selectedSesi === "kegiatan" && !isCurrentSesiActive && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs text-center space-y-3">
          <div>
            <h3 className="text-xl font-bold text-stone-900">
              Presensi Kegiatan Belum / Tidak Tersedia
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 mt-1.5 max-w-md mx-auto leading-relaxed">
              {currentSesiData.pesan_status || "Presensi hanya dapat dilakukan jika ada kegiatan gedung yang sedang aktif dibuka oleh Fasilitator Anda."}
            </p>
            {currentSesiData.jam_mulai !== "-" && (
              <div className="inline-block mt-3 px-4 py-2 bg-stone-100 rounded-xl font-mono text-sm font-bold text-stone-800 border border-stone-200">
                Jadwal: {currentSesiData.jam_mulai} - {currentSesiData.jam_selesai} WIB
              </div>
            )}
          </div>
          <p className="text-xs text-stone-400">
            * Kamera dan formulir presensi hanya akan terbuka otomatis saat sesi kegiatan berstatus aktif oleh Fasilitator gedung.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => fetchSesi(false)}
              className="py-2.5 px-5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs sm:text-sm transition-all text-center cursor-pointer"
            >
              Perbarui Status Sesi
            </button>
            <Link
              href="/mahasiswa/riwayat"
              className="py-2.5 px-5 rounded-xl border border-stone-200 bg-white text-stone-700 font-semibold text-xs sm:text-sm hover:bg-stone-50 transition-all text-center"
            >
              Lihat Riwayat Presensi
            </Link>
          </div>
        </div>
      )}

      {/* ── KONDISI 3: SESI AKTIF ATAU SESI TERLEWAT/TERLAMBAT (MAIN FORM) ── */}
      {step !== "SUCCESS" &&
        step !== "ERROR" &&
        !currentSesiData.sudah_absen &&
        (selectedSesi === "kegiatan" ? isCurrentSesiActive : !isCurrentSesiUpcoming) && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Late attendance alert banner if session past deadline */}
          {isCurrentSesiExpired && selectedSesi !== "kegiatan" && (
            <div className="lg:col-span-12 p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs">
              <h4 className="text-sm font-bold text-rose-900 m-0">
                Batas Waktu Sesi Terlewat (Status Alfa) — Presensi Terlambat Dibuka
              </h4>
              <p className="text-xs text-rose-700 m-0 mt-1 leading-relaxed">
                Batas waktu reguler sesi <strong>{currentSesiData.nama_sesi}</strong> telah berakhir pada pukul {currentSesiData.jam_selesai} WIB. Anda saat ini berstatus <strong>Alfa</strong> pada sesi ini, namun Anda tetap diperkenankan mengambil presensi susulan sekarang dengan status <strong>Terlambat</strong>.
              </p>
            </div>
          )}

          {/* Left Column: Camera Viewfinder */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200/80 p-4 sm:p-6 shadow-xs flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm sm:text-base font-bold text-stone-900">
                  Foto Selfie Bukti Kehadiran
                </h3>
              </div>

              {capturedPhoto && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  ✓ Foto Terpasang
                </span>
              )}
            </div>

            <CameraCapture
              capturedPhoto={capturedPhoto}
              onPhotoCaptured={handlePhotoCaptured}
              onRetake={handleRetakePhoto}
              disabled={step === "SUBMITTING"}
            />

            {/* Quick tips list below camera */}
            <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/70 text-xs text-stone-500 flex items-start gap-2.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-700 shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>
                <strong>Panduan:</strong> Wajah menghadap lurus ke kamera dengan pencahayaan memadai. Pastikan tidak mengenakan masker agar verifikasi wajah jelas.
              </span>
            </div>
          </div>

          {/* Right Column: Location, Notes, Submit */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            {/* Step 2: Location Card */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-stone-900">
                    Lokasi GPS Anda
                  </h3>
                </div>

                {latitude !== null && longitude !== null && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {isInsideGeofence !== null && (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          isInsideGeofence
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {isInsideGeofence
                          ? `✓ Dalam Area: ${geofenceAreaName || "Valid"}`
                          : "Di Luar Area Polygon"}
                      </span>
                    )}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isAccuracySufficient
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-stone-100 text-stone-600 border border-stone-200"
                      }`}
                    >
                      {isAccuracySufficient ? "Sinyal Presisi" : "Sinyal Perkiraan"}
                    </span>
                  </div>
                )}
              </div>

              <LocationStatus
                latitude={latitude}
                longitude={longitude}
                accuracy={accuracy}
                isLocating={isLocating}
                geoError={geoError}
                onRequestLocation={handleManualLocationFetch}
                maxAccuracy={50}
                isValidatingGeofence={isValidatingGeofence}
                insideGeofence={isInsideGeofence}
                geofenceAreaName={geofenceAreaName}
                gedungNama={gedungNama}
              />

              {!capturedPhoto && (
                <p className="text-[11px] text-stone-400 text-center">
                  * Lokasi GPS otomatis diaktifkan dan diverifikasi setelah Anda mengambil foto selfie.
                </p>
              )}
            </div>

            {/* Agenda Kegiatan Resmi dari Fasilitator */}
            {selectedSesi === "kegiatan" && (
              <div className="bg-stone-50 rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs flex flex-col gap-3">
                <div className="border-b border-stone-200 pb-3">
                  <h3 className="text-sm font-bold text-stone-900">
                    Kegiatan Asrama Terjadwal
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Diselenggarakan oleh Fasilitator Gedung Anda
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-bold text-stone-900">
                      {currentSesiData.nama_sesi}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Aktif Berlangsung
                    </span>
                  </div>
                  {currentSesiData.keterangan && (
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {currentSesiData.keterangan}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-stone-500 pt-1 border-t border-stone-100 font-mono">
                    <span>{currentSesiData.jam_mulai} - {currentSesiData.jam_selesai} WIB</span>
                    {currentSesiData.gedung_nama && (
                      <>
                        <span className="text-stone-300">•</span>
                        <span className="font-sans font-medium text-stone-600">{currentSesiData.gedung_nama}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Notes & Final Submit Button */}
            <div className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Catatan / Keterangan <span className="text-stone-400 font-normal">(Opsional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Misal: Sedang bertugas piket / di rumah / ada keperluan..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={step === "SUBMITTING"}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Ready Indicator Checklist */}
              <div className="space-y-1.5 text-xs text-stone-500 border-t border-stone-100 pt-3">
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${capturedPhoto ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-500"}`}>
                    {capturedPhoto ? "✓" : "•"}
                  </span>
                  <span className={capturedPhoto ? "text-stone-800 font-medium" : ""}>
                    {capturedPhoto ? "Foto selfie telah siap" : "Ambil foto selfie di kamera"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${latitude !== null && longitude !== null ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-500"}`}>
                    {latitude !== null && longitude !== null ? "✓" : "•"}
                  </span>
                  <span className={latitude !== null && longitude !== null ? "text-stone-800 font-medium" : ""}>
                    {latitude !== null && longitude !== null ? "Koordinat GPS terdeteksi" : "Sinyal GPS terdeteksi"}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={!isFormReady || step === "SUBMITTING"}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:bg-stone-300 disabled:text-stone-500 disabled:cursor-not-allowed"
              >
                {step === "SUBMITTING" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memproses & Mengirim...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    {isCurrentSesiExpired ? "Kirim Presensi (Terlambat)" : "Kirim Bukti Presensi"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
