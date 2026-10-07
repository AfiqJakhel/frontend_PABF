import type { ApiResponse } from "@/types/attendance";

export interface AreaAbsensi {
  id: number;
  nama: string;
  deskripsi?: string | null;
  coordinates: number[][][]; // [[[lng, lat], ...]] (GeoJSON standard polygon rings)
  is_active: boolean;
  dibuat_oleh?: number | null;
  nama_pembuat?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type AreaAbsensiListResponse = ApiResponse<AreaAbsensi[]>;
export type AreaAbsensiResponse = ApiResponse<AreaAbsensi>;

export interface BuatAreaPayload {
  nama: string;
  deskripsi?: string;
  coordinates: number[][][]; // [[[lng, lat], ...]]
  is_active?: boolean;
}

export interface UpdateAreaPayload {
  nama?: string;
  deskripsi?: string;
  coordinates?: number[][][];
  is_active?: boolean;
}
