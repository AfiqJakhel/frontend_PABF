"use client";

import { useState } from "react";
import Link from "next/link";

interface RecapItem {
  id: string;
  nim: string;
  nama: string;
  gedung: string;
  kamar: string;
  totalHadir: number;
  totalTerlambat: number;
  totalIzin: number;
  totalAlpha: number;
  persentase: number;
}

export default function FasilitatorRekapPage() {
  const [filterGedung, setFilterGedung] = useState("all");
  const [filterBulan, setFilterBulan] = useState("September 2026");

  const recapData: RecapItem[] = [
    {
      id: "REC-01",
      nim: "2211523011",
      nama: "Muhammad Afiq",
      gedung: "Gedung A",
      kamar: "204",
      totalHadir: 24,
      totalTerlambat: 0,
      totalIzin: 0,
      totalAlpha: 0,
      persentase: 100,
    },
    {
      id: "REC-02",
      nim: "2211522045",
      nama: "Rifqi Pratama",
      gedung: "Gedung B",
      kamar: "108",
      totalHadir: 23,
      totalTerlambat: 1,
      totalIzin: 0,
      totalAlpha: 0,
      persentase: 96,
    },
    {
      id: "REC-03",
      nim: "2211521019",
      nama: "Fajar Maulana",
      gedung: "Gedung A",
      kamar: "312",
      totalHadir: 22,
      totalTerlambat: 1,
      totalIzin: 1,
      totalAlpha: 0,
      persentase: 92,
    },
    {
      id: "REC-04",
      nim: "2211523088",
      nama: "Dinda Rahmawati",
      gedung: "Gedung Putri C",
      kamar: "201",
      totalHadir: 24,
      totalTerlambat: 0,
      totalIzin: 0,
      totalAlpha: 0,
      persentase: 100,
    },
    {
      id: "REC-05",
      nim: "2211522010",
      nama: "Ilham Ramadhan",
      gedung: "Gedung B",
      kamar: "204",
      totalHadir: 19,
      totalTerlambat: 3,
      totalIzin: 1,
      totalAlpha: 1,
      persentase: 79,
    },
  ];

  const filtered = recapData.filter((item) => {
    if (filterGedung !== "all" && item.gedung !== filterGedung) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = "NIM,Nama,Gedung,Kamar,Total Hadir,Terlambat,Izin,Alpha,Persentase\n";
    const rows = filtered
      .map(
        (r) =>
          `"${r.nim}","${r.nama}","${r.gedung}","${r.kamar}",${r.totalHadir},${r.totalTerlambat},${r.totalIzin},${r.totalAlpha},"${r.persentase}%"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Rekap_Presensi_Asrama_${filterBulan.replace(" ", "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6F7A6E] mb-1">
            <Link href="/fasilitator/dashboard" className="hover:underline">Dashboard Fasilitator</Link>
            <span>/</span>
            <span className="font-semibold text-[#131B2E]">Rekap Kehadiran</span>
          </div>
          <h1
            className="text-2xl font-bold text-[#131B2E]"
            data-ui-style="ui-style-vinz70"
          >
            Rekap & Laporan Kehadiran (FR-06 & FR-10)
          </h1>
          <p className="text-xs text-[#6F7A6E]">
            Laporan kepatuhan kehadiran mahasiswa per periode beserta fitur ekspor data CSV / Excel untuk kebutuhan pihak asrama.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00652C] hover:bg-[#15803D] text-white rounded-xl text-xs font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Unduh Laporan CSV / Excel (FR-10)
        </button>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="text-[11px] font-semibold text-[#6F7A6E] block mb-1">Periode Bulan:</label>
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="text-xs p-2 bg-[#FAF8FF] border border-[#E2E8F0] rounded-lg font-medium text-[#131B2E]"
            >
              <option value="September 2026">September 2026 (Aktif)</option>
              <option value="Agustus 2026">Agustus 2026</option>
              <option value="Juli 2026">Juli 2026</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-[#6F7A6E] block mb-1">Gedung Asrama:</label>
            <select
              value={filterGedung}
              onChange={(e) => setFilterGedung(e.target.value)}
              className="text-xs p-2 bg-[#FAF8FF] border border-[#E2E8F0] rounded-lg font-medium text-[#131B2E]"
            >
              <option value="all">Semua Gedung Asrama</option>
              <option value="Gedung A">Gedung Asrama A (Putra)</option>
              <option value="Gedung B">Gedung Asrama B (Putra)</option>
              <option value="Gedung Putri C">Gedung Asrama C (Putri)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#6F7A6E]">
          Total Data: <span className="font-bold text-[#131B2E]">{filtered.length} Mahasiswa</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8FF] text-[#6F7A6E] border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Mahasiswa</th>
                <th className="px-6 py-3.5 font-semibold">Gedung & Kamar</th>
                <th className="px-6 py-3.5 font-semibold text-center">Hadir</th>
                <th className="px-6 py-3.5 font-semibold text-center">Terlambat</th>
                <th className="px-6 py-3.5 font-semibold text-center">Izin</th>
                <th className="px-6 py-3.5 font-semibold text-center">Alpha</th>
                <th className="px-6 py-3.5 font-semibold text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#131B2E] block">{item.nama}</span>
                    <span className="text-[11px] font-mono text-[#6F7A6E]">{item.nim}</span>
                  </td>
                  <td className="px-6 py-4 text-[#3F493F]">
                    {item.gedung} • Kamar {item.kamar}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#15803D]">
                    {item.totalHadir}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-[#B45309]">
                    {item.totalTerlambat}
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-[#0369A1]">
                    {item.totalIzin}
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#BE123C]">
                    {item.totalAlpha}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        item.persentase >= 90
                          ? "bg-[#ECFDF5] text-[#15803D]"
                          : item.persentase >= 80
                          ? "bg-[#FFFBEB] text-[#B45309]"
                          : "bg-[#FFF1F2] text-[#BE123C]"
                      }`}
                    >
                      {item.persentase}%
                    </span>
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
