"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface CapturedPhoto {
  blob: Blob;
  dataUrl: string;
  file: File;
}

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Check if multiple camera devices exist
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const videoInputs = devices.filter((d) => d.kind === "videoinput");
      setHasMultipleCameras(videoInputs.length > 1);
    }).catch(() => {
      // Ignore enumeration errors
    });
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = useCallback(async (preferredFacing: "user" | "environment" = facingMode) => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Browser Anda tidak mendukung akses kamera secara langsung.");
      return false;
    }

    setIsLoading(true);
    setCameraError(null);
    stopCamera();

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: preferredFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // On iOS and modern browsers, play() must be handled carefully
        await videoRef.current.play().catch(() => {});
      }

      setIsStreaming(true);
      setFacingMode(preferredFacing);
      setIsLoading(false);
      return true;
    } catch (err: unknown) {
      stopCamera();
      setIsLoading(false);

      const error = err as { name?: string; message?: string };
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        setCameraError("Izin akses kamera ditolak. Harap izinkan kamera pada browser Anda untuk absensi selfie.");
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        setCameraError("Perangkat kamera tidak ditemukan di gadget/komputer Anda.");
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        setCameraError("Kamera sedang digunakan oleh aplikasi lain. Silakan tutup aplikasi tersebut.");
      } else {
        setCameraError(`Gagal mengakses kamera: ${error.message || "Terjadi kesalahan internal"}`);
      }
      return false;
    }
  }, [facingMode, stopCamera]);

  const toggleCameraFacing = useCallback(async () => {
    const nextFacing = facingMode === "user" ? "environment" : "user";
    await startCamera(nextFacing);
  }, [facingMode, startCamera]);

  const capturePhoto = useCallback((): Promise<CapturedPhoto | null> => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || !isStreaming || video.videoWidth === 0 || video.videoHeight === 0) {
        resolve(null);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(null);
        return;
      }

      // If user camera, mirror the frame horizontally so it looks natural like a mirror
      if (facingMode === "user") {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.88);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }

          const filename = `selfie_${Date.now()}.jpg`;
          const file = new File([blob], filename, { type: "image/jpeg" });

          resolve({
            blob,
            dataUrl,
            file,
          });
        },
        "image/jpeg",
        0.88
      );
    });
  }, [isStreaming, facingMode]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
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
  };
}
