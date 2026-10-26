import { api } from "@/lib/apiClient";
import {
  IzinItem,
  PaginationResult,
  SesiPresensiItem,
  SubmitIzinPayload,
  ReviewIzinPayload,
} from "@/types/izin";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const izinService = {
  /**
   * Mengambil master daftar sesi presensi harian (Pagi, Malam, dsb)
   */
  async getSesiPresensi(): Promise<SesiPresensiItem[]> {
    const res = await api.get<ApiResponse<SesiPresensiItem[]>>("/api/sesi");
    return res.data || [];
  },

  /**
   * Mahasiswa mengajukan izin baru (multipart form data)
   */
  async submitIzin(payload: SubmitIzinPayload): Promise<IzinItem> {
    const formData = new FormData();
    formData.append("jenis", payload.jenis);
    formData.append("tanggal_mulai", payload.tanggal_mulai);
    if (payload.tanggal_selesai) {
      formData.append("tanggal_selesai", payload.tanggal_selesai);
    }
    if (payload.sesi_id != null) {
      formData.append("sesi_id", String(payload.sesi_id));
    }
    formData.append("keterangan", payload.keterangan);
    if (payload.dokumen) {
      formData.append("dokumen", payload.dokumen);
    }

    const res = await api.post<ApiResponse<IzinItem>>("/api/izin", formData);
    return res.data;
  },

  /**
   * Mengambil riwayat izin mahasiswa sendiri
   */
  async getIzinSaya(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginationResult<IzinItem>> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.append("status", params.status);
    if (params?.page) query.append("page", String(params.page));
    if (params?.per_page) query.append("per_page", String(params.per_page));

    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await api.get<ApiResponse<PaginationResult<IzinItem>>>(`/api/izin/saya${qs}`);
    return res.data;
  },

  /**
   * Membatalkan izin berstatus pending milik mahasiswa sendiri
   */
  async batalIzin(id: number): Promise<IzinItem> {
    const res = await api.patch<ApiResponse<IzinItem>>(`/api/izin/${id}/batal`);
    return res.data;
  },

  /**
   * Mengambil daftar izin untuk direview fasilitator / admin
   */
  async getIzinReview(params?: {
    status?: string;
    page?: number;
    per_page?: number;
  }): Promise<PaginationResult<IzinItem>> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== "all") query.append("status", params.status);
    if (params?.page) query.append("page", String(params.page));
    if (params?.per_page) query.append("per_page", String(params.per_page));

    const qs = query.toString() ? `?${query.toString()}` : "";
    const res = await api.get<ApiResponse<PaginationResult<IzinItem>>>(`/api/izin/review${qs}`);
    return res.data;
  },

  /**
   * Mengambil detail satu pengajuan izin
   */
  async getDetailIzin(id: number): Promise<IzinItem> {
    const res = await api.get<ApiResponse<IzinItem>>(`/api/izin/${id}`);
    return res.data;
  },

  /**
   * Fasilitator mereview (approve / reject) pengajuan izin
   */
  async reviewIzin(id: number, payload: ReviewIzinPayload): Promise<IzinItem> {
    const res = await api.patch<ApiResponse<IzinItem>>(`/api/izin/${id}/review`, {
      aksi: payload.aksi,
      catatan: payload.catatan || "",
    });
    return res.data;
  },

  /**
   * Mengunduh / memuat dokumen izin privat
   */
  async getDokumenBlob(izinId: number): Promise<Blob> {
    return await api.getBlob(`/api/izin/${izinId}/dokumen`);
  },
};
