'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, MapPin, Download, Calendar, 
  CheckCircle2, Clock, AlertTriangle, XCircle 
} from 'lucide-react';

export default function KelolaPresensiPage() {
  const [selectedDate, setSelectedDate] = useState('2026-09-30');
  const [selectedSesi, setSelectedSesi] = useState('Semua');
  const [selectedStatus, setSelectedStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Dummy Data Presensi Detail
  const [presensiList, setPresensiList] = useState([
    { id: '1', nama: 'Ahmad Fauzi', kamar: 'A-101', waktu: '04:25 WIB', sesi: 'Subuh', status: 'Tepat Waktu', jarak: '12m', koordinat: '-0.9142, 100.4661' },
    { id: '2', nama: 'Budi Pratama', kamar: 'A-102', waktu: '05:45 WIB', sesi: 'Subuh', status: 'Terlambat', jarak: '45m', koordinat: '-0.9145, 100.4665' },
    { id: '3', nama: 'Citra Dewi', kamar: 'B-201', waktu: '-', sesi: 'Subuh', status: 'Izin', jarak: '-', koordinat: '-' },
    { id: '4', nama: 'Deni Kurniawan', kamar: 'B-202', waktu: '-', sesi: 'Subuh', status: 'Alpha', jarak: '-', koordinat: '-' },
    { id: '5', nama: 'Eko Raharjo', kamar: 'A-105', waktu: '18:10 WIB', sesi: 'Malam', status: 'Tepat Waktu', jarak: '8m', koordinat: '-0.9141, 100.4660' },
  ]);

  const handleStatusChange = (id: string, newStatus: string) => {
    setPresensiList(prev =>
      prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <div className="flex flex-col gap-6 p-2">
      {/* Header Halaman */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Kelola & Rekap Presensi</h1>
          <p className="text-sm text-slate-500">
            Pemantauan presensi geolokasi dan riwayat kehadiran seluruh penghuni asrama
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <Download className="h-4 w-4" /> Export Excel / PDF
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Tanggal Presensi</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Sesi Presensi</label>
          <select
            value={selectedSesi}
            onChange={(e) => setSelectedSesi(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
          >
            <option value="Semua">Semua Sesi</option>
            <option value="Subuh">Subuh (04.00 - 06.00)</option>
            <option value="Malam">Malam (18.00 - 20.30)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Status Kehadiran</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Tepat Waktu">Tepat Waktu</option>
            <option value="Terlambat">Terlambat</option>
            <option value="Izin">Izin</option>
            <option value="Alpha">Alpha</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Cari Penghuni</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Nama atau Kamar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-2 text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tabel Utama Presensi */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-3">Nama Penghuni</th>
                <th className="px-6 py-3">Kamar</th>
                <th className="px-6 py-3">Sesi</th>
                <th className="px-6 py-3">Waktu Presensi</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Validasi Geolokasi</th>
                <th className="px-6 py-3 text-right">Koreksi Fasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {presensiList.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-semibold text-slate-800">{row.nama}</td>
                  <td className="px-6 py-4">{row.kamar}</td>
                  <td className="px-6 py-4">{row.sesi}</td>
                  <td className="px-6 py-4">{row.waktu}</td>
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
                        <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                        {row.jarak} dari Asrama
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={row.status}
                      onChange={(e) => handleStatusChange(row.id, e.target.value)}
                      className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="Tepat Waktu">Tepat Waktu</option>
                      <option value="Terlambat">Terlambat</option>
                      <option value="Izin">Izin</option>
                      <option value="Alpha">Alpha</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}