"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
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
  const [selectedSesi, setSelectedSesi] = useState<"subuh" | "malam">("subuh");
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
    nama_sesi: selectedSesi === "subuh" ? "Subuh" : "Malam",
    tanggal: new Date().toISOString().split("T")[0],
    jam_mulai: selectedSesi === "subuh" ? "04:30" : "19:00",
    jam_selesai: selectedSesi === "subuh" ? "06:00" : "21:00",
    waktu_mulai: "",
    waktu_selesai: "",
    is_aktif: false,
    status_sesi: "tidak_aktif" as const,
    pesan_status: "Memuat jadwal sesi...",
    sudah_absen: false,
    presensi_info: null,
  };

  // Helper untuk mengevaluasi apakah suatu sesi aktif secara realtime
  const isSesiCurrentlyActive = useCallback(
    (s: SesiDetail | undefined) => {
      if (!s) return false;
      if (!s.waktu_mulai || !s.waktu_selesai) return s.is_aktif;
      const nowMs = currentTick + serverTimeOffset;
      const startMs = new Date(s.waktu_mulai).getTime();
      const endMs = new Date(s.waktu_selesai).getTime();
      return nowMs >= startMs && nowMs <= endMs;
    },
    [currentTick, serverTimeOffset]
  );

  const isCurrentSesiActive = isSesiCurrentlyActive(currentSesiData);

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

  const handleSwitchTab = (sesiKey: "subuh" | "malam") => {
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

          <div className="inline-flex p-1 bg-stone-100 rounded-2xl w-full sm:w-auto" role="tablist">
            {(["subuh", "malam"] as const).map((sesiKey) => {
              const sData = sesiList.find((s) => s.tipe_sesi === sesiKey);
              const isSelected = selectedSesi === sesiKey;
              const isAktif = isSesiCurrentlyActive(sData);
              const isSudah = sData?.sudah_absen ?? false;

              return (
                <button
                  key={sesiKey}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSwitchTab(sesiKey)}
                  className={`flex-1 sm:flex-initial px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-white text-stone-900 shadow-sm border border-stone-200/60"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/40"
                  }`}
                >
                  <span className="capitalize">{sesiKey}</span>
                  {/* Status Indicator Dot */}
                  {isAktif ? (
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse"
                      title="Sesi sedang aktif"
                    />
                  ) : (
                    <span
                      className="w-2 h-2 rounded-full bg-stone-300"
                      title="Sesi tidak aktif"
                    />
                  )}
                  {isSudah && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Session Information Card */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200/70">
          <div className="flex items-start sm:items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                isCurrentSesiActive
                  ? "bg-emerald-100 text-emerald-700 ring-4 ring-emerald-50"
                  : "bg-stone-200/70 text-stone-500"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-stone-900">
                  Sesi {currentSesiData.nama_sesi}
                </h2>

                {/* Status Aktif / Tidak Aktif */}
                {isCurrentSesiActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-200/80 text-stone-700 border border-stone-300">
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    Tidak Aktif
                  </span>
                )}

                {/* Status Kehadiran jika sudah absen */}
                {currentSesiData.sudah_absen && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                    ✓ Sudah Presensi ({currentSesiData.presensi_info?.status?.toUpperCase() ?? "TERCATAT"})
                  </span>
                )}
              </div>

              {/* Batas Waktu Sesi (Selalu Ditampilkan!) */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-600 font-medium mt-1.5 flex-wrap">
                <span className="text-stone-500">Batas Waktu:</span>
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

      {/* ── KONDISI 2: SESI TIDAK AKTIF & BELUM ABSEN ── */}
      {step !== "SUCCESS" && step !== "ERROR" && !currentSesiData.sudah_absen && !isCurrentSesiActive && (
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-stone-200/80 p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center mx-auto ring-8 ring-stone-50">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900">
              Presensi Belum Dapat Dilakukan
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 mt-1.5 max-w-md mx-auto">
              Sesi <strong>{currentSesiData.nama_sesi}</strong> saat ini sedang tidak aktif. Presensi hanya dapat dilakukan pada rentang waktu:
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

      {/* ── KONDISI 3: SESI AKTIF & BELUM ABSEN (MAIN FORM) ── */}
      {step !== "SUCCESS" && step !== "ERROR" && !currentSesiData.sudah_absen && isCurrentSesiActive && (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
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
                    Kirim Bukti Presensi
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
