import { api } from "@/lib/apiClient";
import type { ApiResponse, SubmitAbsensiResponseData } from "@/types/attendance";

export interface LocationValidationData {
  allowed: boolean;
  inside_polygon: boolean;
  area_id: number | null;
  area_nama: string | null;
  gedung_id: number | null;
  gedung_nama: string | null;
  accuracy: number | null;
  max_allowed_accuracy: number;
  accuracy_sufficient: boolean;
}

export function validateAttendanceLocation(latitude: number, longitude: number, accuracy?: number | null) {
  return api.post<ApiResponse<LocationValidationData>>("/api/mahasiswa/presensi/validasi-lokasi", {
    latitude,
    longitude,
    accuracy: accuracy ?? null,
  });
}

export interface SesiDetail {
  tipe_sesi: "subuh" | "malam";
  nama_sesi: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  waktu_mulai: string;
  waktu_selesai: string;
  is_aktif: boolean;
  status_sesi: "aktif" | "tidak_aktif";
  pesan_status: string;
  sudah_absen: boolean;
  presensi_info?: {
    id: number;
    status: string;
    waktu: string | null;
    location_valid: boolean;
    area_nama: string | null;
    keterangan: string | null;
  } | null;
}

export interface SesiHariIniResponseData {
  tanggal: string;
  server_time: string;
  sesi_list: SesiDetail[];
}

export function getSesiHariIni() {
  return api.get<ApiResponse<SesiHariIniResponseData>>("/api/mahasiswa/presensi/sesi");
}

export interface SesiAktif {
  id: number;
  nama_sesi: string;
  tipe_sesi: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  status: string;
  is_aktif: boolean;
  nama_fasilitator?: string | null;
  keterangan?: string | null;
}

export function getSesiAktifMahasiswa() {
  return api.get<ApiResponse<SesiAktif[]>>("/api/mahasiswa/presensi/sesi-aktif");
}

export function submitAbsensi(formData: FormData) {
  return api.post<ApiResponse<SubmitAbsensiResponseData>>("/api/mahasiswa/presensi/absen", formData);
}
