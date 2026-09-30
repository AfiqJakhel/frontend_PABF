'use client';

import React, { useState } from 'react';
import { Search, Filter, MapPin } from 'lucide-react';
import { PresensiItem } from '@/types/fasil';

interface TabelPresensiProps {
  data: PresensiItem[];
  onUpdateStatus: (id: string, statusBaru: PresensiItem['status']) => void;
}

export default function TabelPresensi({ data, onUpdateStatus }: TabelPresensiProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.kamar.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || item.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Toolbars & Filter */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau nomor kamar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Tepat Waktu">Tepat Waktu</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Izin">Izin</option>
            <option value="Alpha">Alpha</option>
          </select>
        </div>
      </div>

      {/* Tabel Data Presensi */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Penghuni</th>
              <th className="px-6 py-3">Kamar</th>
              <th className="px-6 py-3">Sesi / Waktu</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Geolokasi (Radius)</th>
              <th className="px-6 py-3 text-right">Aksi Fasil</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredData.length > 0 ? (
              filteredData.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-800">{row.nama}</td>
                  <td className="px-6 py-4">{row.kamar}</td>
                  <td className="px-6 py-4">
                    {row.sesi} <span className="text-slate-400">({row.waktu})</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.status === 'Tepat Waktu'
                          ? 'bg-emerald-100 text-emerald-800'
                          : row.status === 'Terlambat'
                          ? 'bg-amber-100 text-amber-800'
                          : row.status === 'Izin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {row.koordinat !== '-' ? (
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                        {row.jarakMeter}m dari Asrama
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={row.status}
                      onChange={(e) =>
                        onUpdateStatus(row.id, e.target.value as PresensiItem['status'])
                      }
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="Tepat Waktu">Tepat Waktu</option>
                      <option value="Terlambat">Terlambat</option>
                      <option value="Izin">Izin</option>
                      <option value="Alpha">Alpha</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Data presensi tidak ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}