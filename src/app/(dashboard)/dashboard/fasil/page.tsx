'use client';

import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import { PresensiItem, IzinItem, StatSummary } from '@/types/fasil';
import StatCards from '@/components/fasil/StatCards';
import TabelPresensi from '@/components/fasil/TabelPresensi';
import PersetujuanIzin from '@/components/fasil/PersetujuanIzin';

export default function FasilDashboardPage() {
  const [activeTab, setActiveTab] = useState<'presensi' | 'izin'>('presensi');

  // Dummy Data Presensi
  const [dataPresensi, setDataPresensi] = useState<PresensiItem[]>([
    { id: '1', nama: 'Ahmad Fauzi', kamar: 'A-101', waktu: '04:25 WIB', sesi: 'Subuh', status: 'Tepat Waktu', jarakMeter: 12, koordinat: '-0.9142, 100.4661' },
    { id: '2', nama: 'Budi Pratama', kamar: 'A-102', waktu: '05:45 WIB', sesi: 'Subuh', status: 'Terlambat', jarakMeter: 45, koordinat: '-0.9145, 100.4665' },
    { id: '3', nama: 'Citra Dewi', kamar: 'B-201', waktu: '-', sesi: 'Subuh', status: 'Izin', jarakMeter: 0, koordinat: '-' },
    { id: '4', nama: 'Deni Kurniawan', kamar: 'B-202', waktu: '-', sesi: 'Subuh', status: 'Alpha', jarakMeter: 0, koordinat: '-' },
  ]);

  // Dummy Data Izin
  const [dataIzin, setDataIzin] = useState<IzinItem[]>([
    { id: 'IZ-01', nama: 'Citra Dewi', kamar: 'B-201', tanggal: '30 Sep 2026', alasan: 'Sakit (Demam tinggi)', buktiUrl: 'surat_dokter.pdf', status: 'Pending' },
    { id: 'IZ-02', nama: 'Eko Raharjo', kamar: 'A-105', tanggal: '01 Okt 2026', alasan: 'Kegiatan Lomba Kampus', buktiUrl: 'surat_tugas.pdf', status: 'Pending' },
  ]);

  // Handler Update Status Presensi Manual (Override)
  const handleUpdateStatusPresensi = (id: string, statusBaru: PresensiItem['status']) => {
    setDataPresensi((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: statusBaru } : item))
    );
  };

  // Handler Persetujuan Izin
  const handleActionIzin = (id: string, statusBaru: 'Disetujui' | 'Ditolak') => {
    setDataIzin((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: statusBaru } : item))
    );
  };

  // Kalkulasi Statistik
  const stats: StatSummary = {
    totalPenghuni: 42,
    hadir: dataPresensi.filter((p) => p.status === 'Tepat Waktu' || p.status === 'Terlambat').length,
    izin: dataPresensi.filter((p) => p.status === 'Izin').length,
    alpha: dataPresensi.filter((p) => p.status === 'Alpha').length,
  };

  const pendingIzinCount = dataIzin.filter((i) => i.status === 'Pending').length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header & Status Sesi Presensi */}
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Fasilitator</h1>
          <p className="text-sm text-slate-500">
            Monitoring Presensi Geolokasi dan Pengelolaan Izin Penghuni Asrama
          </p>
        </div>

        {/* Indikator Sesi Aktif */}
        <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-emerald-800">
          <Clock className="h-5 w-5 animate-pulse text-emerald-600" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Sesi Aktif</p>
            <p className="text-sm font-bold">Malam: 18.00 - 20.30 WIB</p>
          </div>
        </div>
      </header>

      {/* Ringkasan Statistik */}
      <StatCards stats={stats} />

      {/* Navigasi Tab */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('presensi')}
          className={`border-b-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors ${
            activeTab === 'presensi'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Data Presensi Penghuni
        </button>
        <button
          onClick={() => setActiveTab('izin')}
          className={`flex items-center gap-2 border-b-2 px-4 pb-3 pt-2 text-sm font-semibold transition-colors ${
            activeTab === 'izin'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Persetujuan Izin
          {pendingIzinCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
              {pendingIzinCount}
            </span>
          )}
        </button>
      </div>

      {/* Konten Tab */}
      {activeTab === 'presensi' ? (
        <TabelPresensi data={dataPresensi} onUpdateStatus={handleUpdateStatusPresensi} />
      ) : (
        <PersetujuanIzin data={dataIzin} onAction={handleActionIzin} />
      )}
    </div>
  );
}