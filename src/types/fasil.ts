export interface PresensiItem {
  id: string;
  nama: string;
  kamar: string;
  waktu: string;
  sesi: 'Subuh' | 'Malam';
  status: 'Tepat Waktu' | 'Terlambat' | 'Izin' | 'Alpha';
  jarakMeter: number;
  koordinat: string;
}

export interface IzinItem {
  id: string;
  nama: string;
  kamar: string;
  tanggal: string;
  alasan: string;
  buktiUrl: string;
  status: 'Pending' | 'Disetujui' | 'Ditolak';
}

export interface StatSummary {
  totalPenghuni: number;
  hadir: number;
  izin: number;
  alpha: number;
}