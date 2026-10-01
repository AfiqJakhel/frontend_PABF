export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export type AttendanceStatus = "hadir" | "terlambat" | "alfa" | "izin" | "sakit";

export interface AttendanceRecord {
  id: number;
  user_id: number;
  nim: string;
  nama_mahasiswa?: string | null;
  tanggal: string;
  waktu: string;
  sesi: string;
  latitude?: number | null;
  longitude?: number | null;
  status: AttendanceStatus;
  foto_wajah?: string | null;
  keterangan?: string | null;
}

export interface AttendanceHistoryData {
  items: AttendanceRecord[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}

export interface AttendanceSummaryItem {
  nim: string;
  nama: string;
  gedung?: string | null;
  kamar?: string | null;
  hadir: number;
  terlambat: number;
  izin: number;
  sakit: number;
  alfa: number;
  total: number;
  persentase: number;
}

export interface AttendanceSummaryData {
  tanggal_mulai: string;
  tanggal_selesai: string;
  sesi: string;
  summary: AttendanceSummaryItem[];
  total_mahasiswa: number;
}