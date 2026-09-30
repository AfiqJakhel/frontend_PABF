'use client';

import React from 'react';
import { User, Phone, Home } from 'lucide-react';

export default function DataPenghuniPage() {
  const penghuniList = [
    { id: '1', nama: 'Ahmad Fauzi', kamar: 'A-101', noHp: '081234567890', status: 'Aktif' },
    { id: '2', nama: 'Budi Pratama', kamar: 'A-102', noHp: '081298765432', status: 'Aktif' },
    { id: '3', nama: 'Citra Dewi', kamar: 'B-201', noHp: '085211223344', status: 'Izin Sakit' },
    { id: '4', nama: 'Deni Kurniawan', kamar: 'B-202', noHp: '087855667788', status: 'Aktif' },
  ];

  return (
    <div className="flex flex-col gap-6 p-2">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Daftar Penghuni Asrama</h1>
        <p className="text-sm text-slate-500">
          Katalog data penghuni kamar sebagai referensi validasi Fasilitator
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {penghuniList.map((p) => (
          <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">{p.nama}</h3>
                <span className="text-xs text-slate-400">ID Penghuni: #{p.id}</span>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Home className="h-4 w-4 text-slate-400" />
                <span>Kamar: <strong>{p.kamar}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400" />
                <span>Kontak: {p.noHp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}