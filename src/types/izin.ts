export type IzinJenis = "full" | "half";
export type IzinStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface SesiPresensiItem {
  id: number;
  kode: string;
  nama: string;
  jam_mulai: string | null;
  jam_selesai: string | null;
  is_active: boolean;
}

export interface IzinDokumenItem {
  id: number;
  original_name: string | null;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface IzinItem {
  id: number;
  user_id: number;
  mahasiswa_id: number;
  nama_pemohon: string | null;
  nim_pemohon: string | null;
  gedung_id: number | null;
  nama_gedung: string | null;
  nomor_kamar: string | null;
  jenis: IzinJenis;
  tanggal_mulai: string;
  tanggal_selesai: string;
  sesi: SesiPresensiItem | null;
  alasan: string;
  keterangan: string;
  status: IzinStatus;
  dokumen: IzinDokumenItem[];
  has_dokumen: boolean;
  disetujui_oleh: number | null;
  nama_fasil: string | null;
  catatan_fasil: string | null;
  catatan_reviewer: string | null;
  reviewed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationResult<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SubmitIzinPayload {
  jenis: IzinJenis;
  tanggal_mulai: string;
  tanggal_selesai?: string;
  sesi_id?: number;
  keterangan: string;
  dokumen?: File | null;
}

export interface ReviewIzinPayload {
  aksi: "approve" | "reject";
  catatan?: string;
}
