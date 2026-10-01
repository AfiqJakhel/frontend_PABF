import { api } from "@/lib/apiClient";
import type { ApiResponse } from "@/types/attendance";

export interface LocationValidationData {
  allowed: boolean;
  distance_meters: number;
  radius_meters: number;
}

export function validateAttendanceLocation(latitude: number, longitude: number) {
  return api.post<ApiResponse<LocationValidationData>>("/api/mahasiswa/presensi/validasi-lokasi", {
    latitude,
    longitude,
  });
}