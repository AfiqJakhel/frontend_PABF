'use client';

import React, { useState } from 'react';
import { FileText, Check, X, ExternalLink, Calendar, Search } from 'lucide-react';

export default function PersetujuanIzinPage() {
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'riwayat'>('pending');

  const [izinData, setIzinData] = useState([
    { id: 'IZ-01', nama: 'Citra Dewi', kamar: 'B-201', tglMulai: '30 Sep 2026', tglSelesai: '02 Okt 2026', alasan: 'Sakit Demam Berdarah', bukti: 'surat_dokter.pdf', status: 'Pending' },
    { id: 'IZ-02', nama: 'Eko Raharjo', kamar: 'A-105', tglMulai: '01 Okt 2026', tglSelesai: '01 Okt 2026', alasan: 'Lomba Debat Mahasiswa Nasional', bukti: 'surat_tugas_rektorat.pdf', status: 'Pending' },
    { id: 'IZ-03', nama: 'Fajar Nugraha', kamar: 'A-103', tglMulai: '20 Sep 2026', tglSelesai: '21 Sep 2026', alasan: 'Acara Keluarga', bukti: 'surat_izin.pdf', status: 'Disetujui' },
    { id: 'IZ-04', nama: 'Gita Gutawa', kamar: 'B-102', tglMulai: '15 Sep 2026', tglSelesai: '15 Sep 2026', alasan: 'Ketinggalan Kereta', bukti: 'tiket.pdf', status: 'Ditolak' },
  ]);

  const handleAction = (id: string, newStatus: 'Disetujui' | 'Ditolak') => {
    setIzinData(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const pendingList = izinData.filter(i => i.status === 'Pending');
  const riwayatList = izinData.filter(i => i.status !== 'Pending');

  return (
    <div className="flex flex-col gap-6 p-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Manajemen & Persetujuan Izin</h1>
        <p className="text-sm text-slate-500">
          Tinjau permohonan izin penghuni asrama beserta validasi bukti fisik
        </p>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveSubTab('pending')}
          className={`flex items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold transition-colors ${
            activeSubTab === 'pending'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Menunggu Persetujuan
          <span className="rounded-full bg-amber-500 px-2 py-0.5 text-xs text-white">
            {pendingList.length}
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('riwayat')}
          className={`border-b-2 px-4 pb-3 text-sm font-semibold transition-colors ${
            activeSubTab === 'riwayat'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Riwayat Keputusan
        </button>
      </div>

      {/* Daftar Pending */}
      {activeSubTab === 'pending' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pendingList.length > 0 ? (
            pendingList.map(item => (
              <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.nama}</h3>
                    <p className="text-xs text-slate-500">Kamar: {item.kamar}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                    Pending
                  </span>
                </div>

                <div className="my-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {item.tglMulai} s/d {item.tglSelesai}
                  </div>
                  <p className="text-xs font-semibold uppercase text-slate-400">Alasan:</p>
                  <p className="mt-0.5 font-medium">{item.alasan}</p>
                </div>

                <div className="mb-4 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Dokumen Bukti:</span>
                  <a
                    href="#"
                    onClick={e => e.preventDefault()}
                    className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    {item.bukti}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => handleAction(item.id, 'Disetujui')}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" /> Setujui Izin
                  </button>
                  <button
                    onClick={() => handleAction(item.id, 'Ditolak')}
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    <X className="h-4 w-4" /> Tolak Permohonan
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              Tidak ada pengajuan izin baru yang perlu diproses.
            </div>
          )}
        </div>
      )}

      {/* Daftar Riwayat */}
      {activeSubTab === 'riwayat' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Nama</th>
                <th className="px-6 py-3">Kamar</th>
                <th className="px-6 py-3">Tanggal Izin</th>
                <th className="px-6 py-3">Alasan</th>
                <th className="px-6 py-3">Status Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {riwayatList.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 font-semibold text-slate-800">{item.nama}</td>
                  <td className="px-6 py-4">{item.kamar}</td>
                  <td className="px-6 py-4">{item.tglMulai}</td>
                  <td className="px-6 py-4">{item.alasan}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        item.status === 'Disetujui'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}