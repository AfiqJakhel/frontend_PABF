"use client";

import { useState } from "react";
import Link from "next/link";

interface Resident {
  id: string;
  nim: string;
  nama: string;
  fakultas: string;
  gedung: string;
  kamar: string;
  lantai: number;
  status: "Aktif" | "Cuti" | "Alumni";
  noHp: string;
}

export default function FasilitatorMahasiswaPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGedung, setFilterGedung] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const [residents, setResidents] = useState<Resident[]>([
    {
      id: "MHS-01",
      nim: "2211523011",
      nama: "Muhammad Afiq",
      fakultas: "Teknologi Informasi",
      gedung: "Gedung A",
      kamar: "204",
      lantai: 2,
      status: "Aktif",
      noHp: "0812-3456-7890",
    },
    {
      id: "MHS-02",
      nim: "2211522045",
      nama: "Rifqi Pratama",
      fakultas: "Teknik",
      gedung: "Gedung B",
      kamar: "108",
      lantai: 1,
      status: "Aktif",
      noHp: "0813-9876-5432",
    },
    {
      id: "MHS-03",
      nim: "2211521019",
      nama: "Fajar Maulana",
      fakultas: "MIPA",
      gedung: "Gedung A",
      kamar: "312",
      lantai: 3,
      status: "Aktif",
      noHp: "0821-4567-8901",
    },
    {
      id: "MHS-04",
      nim: "2211523088",
      nama: "Dinda Rahmawati",
      fakultas: "Kedokteran",
      gedung: "Gedung Putri C",
      kamar: "201",
      lantai: 2,
      status: "Aktif",
      noHp: "0852-1234-5678",
    },
    {
      id: "MHS-05",
      nim: "2211522010",
      nama: "Ilham Ramadhan",
      fakultas: "Ekonomi",
      gedung: "Gedung B",
      kamar: "204",
      lantai: 2,
      status: "Aktif",
      noHp: "0812-6543-2109",
    },
  ]);

  const [form, setForm] = useState({
    nim: "",
    nama: "",
    fakultas: "",
    gedung: "Gedung A",
    kamar: "",
    lantai: 1,
    noHp: "",
  });

  const handleAddResident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nim || !form.nama) return;

    const newRes: Resident = {
      id: `MHS-${Date.now().toString().slice(-4)}`,
      nim: form.nim,
      nama: form.nama,
      fakultas: form.fakultas || "Teknologi Informasi",
      gedung: form.gedung,
      kamar: form.kamar || "101",
      lantai: Number(form.lantai) || 1,
      status: "Aktif",
      noHp: form.noHp || "-",
    };

    setResidents([newRes, ...residents]);
    setShowAddModal(false);
    setForm({
      nim: "",
      nama: "",
      fakultas: "",
      gedung: "Gedung A",
      kamar: "",
      lantai: 1,
      noHp: "",
    });
  };

  const filtered = residents.filter((r) => {
    const matchQuery =
      r.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.nim.includes(searchQuery);
    const matchGedung = filterGedung === "all" || r.gedung === filterGedung;
    return matchQuery && matchGedung;
  });

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6F7A6E] mb-1">
            <Link href="/fasilitator/dashboard" className="hover:underline">Dashboard Fasilitator</Link>
            <span>/</span>
            <span className="font-semibold text-[#131B2E]">Data Mahasiswa</span>
          </div>
          <h1
            className="text-2xl font-bold text-[#131B2E]"
            data-ui-style="ui-style-vinz70"
          >
            Data Master Mahasiswa Asrama (FR-08)
          </h1>
          <p className="text-xs text-[#6F7A6E]">
            Kelola data induk penghuni asrama Unand, penempatan kamar, dan status keaktifan.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0046A4] hover:bg-[#003882] text-white rounded-xl text-xs font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          + Tambah Mahasiswa
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-3 items-center flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari berdasarkan nama atau NIM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs p-2.5 bg-[#FAF8FF] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0046A4]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterGedung}
            onChange={(e) => setFilterGedung(e.target.value)}
            className="text-xs p-2.5 bg-[#FAF8FF] border border-[#E2E8F0] rounded-xl font-medium text-[#131B2E]"
          >
            <option value="all">Semua Gedung Asrama</option>
            <option value="Gedung A">Gedung A (Putra)</option>
            <option value="Gedung B">Gedung B (Putra)</option>
            <option value="Gedung Putri C">Gedung Putri C</option>
          </select>

          <span className="text-xs text-[#6F7A6E]">
            {filtered.length} Mahasiswa
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8FF] text-[#6F7A6E] border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">NIM & Mahasiswa</th>
                <th className="px-6 py-3.5 font-semibold">Fakultas</th>
                <th className="px-6 py-3.5 font-semibold">Penempatan Kamar</th>
                <th className="px-6 py-3.5 font-semibold">Kontak No. HP</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
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
                    {item.fakultas}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#131B2E]">{item.gedung}</span>
                    <span className="block text-[11px] text-[#6F7A6E]">
                      Kamar {item.kamar} (Lantai {item.lantai})
                    </span>
                  </td>
                  <td className="px-6 py-4 font-mono text-[#3F493F]">
                    {item.noHp}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Resident Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#131B2E] mb-1">
              Tambah Mahasiswa Penghuni Asrama
            </h3>
            <p className="text-xs text-[#6F7A6E] mb-4">
              Masukkan data mahasiswa untuk diikutsertakan ke dalam sistem absensi asrama.
            </p>

            <form onSubmit={handleAddResident} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">NIM</label>
                  <input
                    type="text"
                    required
                    value={form.nim}
                    onChange={(e) => setForm({ ...form, nim: e.target.value })}
                    placeholder="221152xxxx"
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0046A4]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    placeholder="Nama Mahasiswa"
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0046A4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131B2E] mb-1">Fakultas</label>
                <input
                  type="text"
                  value={form.fakultas}
                  onChange={(e) => setForm({ ...form, fakultas: e.target.value })}
                  placeholder="Misal: Teknologi Informasi"
                  className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">Gedung</label>
                  <select
                    value={form.gedung}
                    onChange={(e) => setForm({ ...form, gedung: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                  >
                    <option value="Gedung A">Gedung A</option>
                    <option value="Gedung B">Gedung B</option>
                    <option value="Gedung Putri C">Gedung Putri C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">Kamar</label>
                  <input
                    type="text"
                    value={form.kamar}
                    onChange={(e) => setForm({ ...form, kamar: e.target.value })}
                    placeholder="204"
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">Lantai</label>
                  <input
                    type="number"
                    value={form.lantai}
                    onChange={(e) => setForm({ ...form, lantai: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#131B2E] mb-1">No. WhatsApp / HP</label>
                <input
                  type="text"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#6F7A6E] hover:bg-[#FAF8FF] rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-[#0046A4] hover:bg-[#003882] text-white rounded-lg shadow-xs"
                >
                  Simpan Mahasiswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
