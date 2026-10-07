import { api } from "@/lib/apiClient";
import type {
  AreaAbsensi,
  AreaAbsensiListResponse,
  AreaAbsensiResponse,
  BuatAreaPayload,
  UpdateAreaPayload,
} from "@/types/areaAbsensi";
import type { ApiResponse } from "@/types/attendance";

export function getSemuaArea(aktifOnly: boolean = false) {
  const query = aktifOnly ? "?aktif=true" : "";
  return api.get<AreaAbsensiListResponse>(`/api/admin/area-absensi${query}`);
}

export function getDetailArea(areaId: number) {
  return api.get<AreaAbsensiResponse>(`/api/admin/area-absensi/${areaId}`);
}

export function buatArea(payload: BuatAreaPayload) {
  return api.post<AreaAbsensiResponse>(
    "/api/admin/area-absensi",
    payload as unknown as Record<string, unknown>
  );
}

export function updateArea(areaId: number, payload: UpdateAreaPayload) {
  return api.put<AreaAbsensiResponse>(
    `/api/admin/area-absensi/${areaId}`,
    payload as unknown as Record<string, unknown>
  );
}

export function hapusArea(areaId: number) {
  return api.delete<ApiResponse<null>>(`/api/admin/area-absensi/${areaId}`);
}

export function toggleActiveArea(areaId: number) {
  return api.patch<AreaAbsensiResponse>(`/api/admin/area-absensi/${areaId}/toggle`);
}

// ─── Facilitator Building-Scoped Polygon API ─────────────────────────────────

export interface FasilPolygonListResponse {
  success: boolean;
  message: string;
  data: {
    gedung_id: number;
    nama_gedung: string;
    areas: AreaAbsensi[];
  };
}

export function getPolygonFasil(aktifOnly: boolean = false) {
  const query = aktifOnly ? "?aktif=true" : "";
  return api.get<FasilPolygonListResponse>(`/api/fasil/polygon${query}`);
}

export function buatPolygonFasil(payload: BuatAreaPayload) {
  return api.post<AreaAbsensiResponse>(
    "/api/fasil/polygon",
    payload as unknown as Record<string, unknown>
  );
}

export function updatePolygonFasil(areaId: number, payload: UpdateAreaPayload) {
  return api.put<AreaAbsensiResponse>(
    `/api/fasil/polygon/${areaId}`,
    payload as unknown as Record<string, unknown>
  );
}

export function hapusPolygonFasil(areaId: number) {
  return api.delete<ApiResponse<null>>(`/api/fasil/polygon/${areaId}`);
}

export function toggleActivePolygonFasil(areaId: number) {
  return api.patch<AreaAbsensiResponse>(`/api/fasil/polygon/${areaId}/toggle`);
}

export const areaAbsensiService = {
  getSemuaArea,
  getDetailArea,
  buatArea,
  updateArea,
  hapusArea,
  toggleActiveArea,
  // Facilitator Scoped
  getPolygonFasil,
  buatPolygonFasil,
  updatePolygonFasil,
  hapusPolygonFasil,
  toggleActivePolygonFasil,
};

export default areaAbsensiService;

