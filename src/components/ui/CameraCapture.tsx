"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { type CapturedPhoto, useCamera } from "@/hooks/useCamera";

interface CameraCaptureProps {
  capturedPhoto: CapturedPhoto | null;
  onPhotoCaptured: (photo: CapturedPhoto) => void;
  onRetake: () => void;
  disabled?: boolean;
}

export default function CameraCapture({
  capturedPhoto,
  onPhotoCaptured,
  onRetake,
  disabled = false,
}: CameraCaptureProps) {
  const {
    videoRef,
    isStreaming,
    isLoading,
    cameraError,
    facingMode,
    hasMultipleCameras,
    startCamera,
    stopCamera,
    toggleCameraFacing,
    capturePhoto,
  } = useCamera();

  const [hasStarted, setHasStarted] = useState(false);

  // Auto-start camera when no photo is captured yet
  useEffect(() => {
    if (!capturedPhoto && !hasStarted && !disabled) {
      setHasStarted(true);
      startCamera();
    }
  }, [capturedPhoto, hasStarted, disabled, startCamera]);

  const handleCapture = async () => {
    if (disabled || !isStreaming) return;
    const photo = await capturePhoto();
    if (photo) {
      stopCamera();
      onPhotoCaptured(photo);
    }
  };

  const handleRetake = () => {
    onRetake();
    startCamera();
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Viewfinder Container */}
      <div className="relative w-full aspect-[4/3] sm:aspect-[4/3] max-h-[460px] bg-stone-950 rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-xl flex items-center justify-center">
        {/* If photo is already captured, show preview */}
        {capturedPhoto ? (
          <div className="relative w-full h-full">
            <Image
              src={capturedPhoto.dataUrl}
              alt="Hasil foto selfie absensi"
              fill
              className="object-cover"
              unoptimized
            />
            {/* Captured overlay badge */}
            <div className="absolute top-3.5 left-3.5 bg-emerald-600/90 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              Foto Selfie Siap
            </div>
          </div>
        ) : (
          <>
            {/* Live Video Element */}
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                isStreaming ? "opacity-100" : "opacity-0"
              } ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />

            {/* Flip Camera Button Overlay (Top-Right inside Viewfinder) */}
            {hasMultipleCameras && isStreaming && !isLoading && !cameraError && (
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="absolute top-3.5 right-3.5 z-20 p-2.5 sm:p-3 rounded-full bg-stone-900/60 hover:bg-stone-900/85 active:scale-90 text-white backdrop-blur-md border border-white/20 transition-all shadow-lg flex items-center justify-center group"
                title="Putar Kamera Depan/Belakang"
                aria-label="Putar Kamera"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:rotate-180 transition-transform duration-300"
                >
                  <path d="M20 16v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4" />
                  <polyline points="14 10 20 4 20 10" />
                  <path d="M4 14v-4a2 2 0 0 1 2-2h14" />
                </svg>
              </button>
            )}
            
            {/* Loading Spinner */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950/85 text-white gap-3 z-10 p-4">
                <div className="w-10 h-10 border-3 border-[#5EDA39] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs sm:text-sm font-medium text-stone-300">Menyiapkan kamera...</span>
              </div>
            )}

            {/* Error or Permission Block */}
            {cameraError && !isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-950 p-6 text-center z-10">
                <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h4 className="text-sm font-bold text-white mb-1">Akses Kamera Bermasalah</h4>
                <p className="text-xs text-stone-400 max-w-xs mb-4 leading-relaxed">{cameraError}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => startCamera()}
                    className="px-4 py-2 bg-[#5EDA39] text-[#161D15] rounded-xl text-xs font-bold hover:brightness-95 transition-all shadow-sm"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* Initial start if not started */}
            {!isStreaming && !isLoading && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <button
                  type="button"
                  onClick={() => startCamera()}
                  className="px-5 py-2.5 bg-[#5EDA39] text-[#161D15] rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  Buka Kamera
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div className="w-full mt-4 flex items-center justify-center px-2 sm:px-4">
        {capturedPhoto ? (
          <button
            type="button"
            onClick={handleRetake}
            className="py-2.5 px-6 rounded-2xl border border-stone-300 bg-white text-stone-700 text-xs sm:text-sm font-semibold hover:bg-stone-50 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Ambil Ulang Foto
          </button>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <button
              type="button"
              onClick={handleCapture}
              disabled={disabled || !isStreaming}
              className="group relative p-1.5 rounded-full border-4 border-stone-200 hover:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95"
              title="Ambil Foto Selfie"
              aria-label="Ambil Foto Selfie"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#5EDA39] group-hover:bg-[#52c930] flex items-center justify-center transition-all shadow-inner">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#161D15"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
            </button>
            <span className="text-[11px] font-medium text-stone-500 tracking-wide">
              {disabled || !isStreaming ? "Kamera Belum Siap" : "Ambil Foto"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
