"use client";

import { useState } from "react";
import Link from "next/link";

interface Activity {
  id: string;
  nama: string;
  kategori: string;
  lokasi: string;
  tanggal: string;
  waktuMulai: string;
  waktuSelesai: string;
  wajib: boolean;
  status: "Akan Datang" | "Berlangsung" | "Selesai";
}

export default function FasilitatorJadwalPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "ACT-01",
      nama: "Kajian Rutin & Bina Karakter Mahasiswa Asrama",
      kategori: "Spiritual",
      lokasi: "Masjid Asrama Unand",
      tanggal: "24 Sep 2026",
      waktuMulai: "19:30 WIB",
      waktuSelesai: "21:00 WIB",
      wajib: true,
      status: "Berlangsung",
    },
    {
      id: "ACT-02",
      nama: "Senam Pagi & Kebersihan Lingkungan (Piket Asrama)",
      kategori: "Kebersihan & Olahraga",
      lokasi: "Halaman Gedung Asrama A & B",
      tanggal: "27 Sep 2026",
      waktuMulai: "06:30 WIB",
      waktuSelesai: "08:00 WIB",
      wajib: true,
      status: "Akan Datang",
    },
    {
      id: "ACT-03",
      nama: "Sosialisasi Tata Tertib & Jam Malam Semester Ganjil",
      kategori: "Pembinaan",
      lokasi: "Aula Utama Asrama Unand",
      tanggal: "15 Sep 2026",
      waktuMulai: "20:00 WIB",
      waktuSelesai: "21:30 WIB",
      wajib: true,
      status: "Selesai",
    },
  ]);

  const [form, setForm] = useState({
    nama: "",
    kategori: "Spiritual",
    lokasi: "",
    tanggal: "",
    waktuMulai: "",
    waktuSelesai: "",
    wajib: true,
  });

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.lokasi || !form.tanggal) return;

    const newAct: Activity = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      nama: form.nama,
      kategori: form.kategori,
      lokasi: form.lokasi,
      tanggal: form.tanggal,
      waktuMulai: form.waktuMulai || "19:30 WIB",
      waktuSelesai: form.waktuSelesai || "21:00 WIB",
      wajib: form.wajib,
      status: "Akan Datang",
    };

    setActivities([newAct, ...activities]);
    setShowAddModal(false);
    setForm({
      nama: "",
      kategori: "Spiritual",
      lokasi: "",
      tanggal: "",
      waktuMulai: "",
      waktuSelesai: "",
      wajib: true,
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Hapus jadwal kegiatan ini?")) {
      setActivities(activities.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#6F7A6E] mb-1">
            <Link href="/fasilitator/dashboard" className="hover:underline">Dashboard Fasilitator</Link>
            <span>/</span>
            <span className="font-semibold text-[#131B2E]">Jadwal Kegiatan Asrama</span>
          </div>
          <h1
            className="text-2xl font-bold text-[#131B2E]"
            data-ui-style="ui-style-vinz70"
          >
            Manajemen Jadwal Kegiatan Asrama (FR-05)
          </h1>
          <p className="text-xs text-[#6F7A6E]">
            Kelola kegiatan yang membutuhkan presensi foto oleh mahasiswa (kajian, piket, sosialisasi, senam).
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
          + Buat Jadwal Baru
        </button>
      </div>

      {/* Activities Table Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8FF] text-[#6F7A6E] border-b border-[#E2E8F0] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Nama Kegiatan</th>
                <th className="px-6 py-3.5 font-semibold">Kategori</th>
                <th className="px-6 py-3.5 font-semibold">Waktu & Tanggal</th>
                <th className="px-6 py-3.5 font-semibold">Lokasi</th>
                <th className="px-6 py-3.5 font-semibold">Sifat</th>
                <th className="px-6 py-3.5 font-semibold">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {activities.map((act) => (
                <tr key={act.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#131B2E]">
                    {act.nama}
                  </td>
                  <td className="px-6 py-4 text-[#3F493F]">
                    <span className="px-2 py-0.5 rounded bg-[#FAF8FF] border border-[#EAEDFF] text-[11px] font-medium">
                      {act.kategori}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-[#131B2E]">{act.tanggal}</span>
                    <span className="block text-[#6F7A6E] text-[11px] font-mono">
                      {act.waktuMulai} - {act.waktuSelesai}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#3F493F]">
                    {act.lokasi}
                  </td>
                  <td className="px-6 py-4">
                    {act.wajib ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
                        Wajib
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#FAF8FF] text-[#6F7A6E]">
                        Opsional
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {act.status === "Berlangsung" ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0] animate-pulse">
                        ● Berlangsung
                      </span>
                    ) : act.status === "Akan Datang" ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#F0F4FF] text-[#0046A4] border border-[#BAE6FD]">
                        Akan Datang
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF8FF] text-[#6F7A6E]">
                        Selesai
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(act.id)}
                      className="text-xs text-[#BE123C] hover:underline font-semibold cursor-pointer"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0]">
            <h3 className="text-base font-bold text-[#131B2E] mb-1">
              Buat Jadwal Kegiatan Baru
            </h3>
            <p className="text-xs text-[#6F7A6E] mb-4">
              Kegiatan ini akan muncul di dashboard mahasiswa asrama untuk keperluan absensi foto.
            </p>

            <form onSubmit={handleAddActivity} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#131B2E] mb-1">
                  Nama Kegiatan
                </label>
                <input
                  type="text"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Misal: Kajian Bulanan Mahasiswa Asrama"
                  className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#0046A4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">
                    Kategori
                  </label>
                  <select
                    value={form.kategori}
                    onChange={(e) => setForm({ ...form, kategori: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                  >
                    <option value="Spiritual">Spiritual / Kajian</option>
                    <option value="Kebersihan & Piket">Kebersihan & Piket</option>
                    <option value="Pembinaan Karakter">Pembinaan Karakter</option>
                    <option value="Olahraga">Olahraga</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    required
                    value={form.lokasi}
                    onChange={(e) => setForm({ ...form, lokasi: e.target.value })}
                    placeholder="Masjid / Aula / Lapangan"
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">
                    Tanggal
                  </label>
                  <input
                    type="date"
                    required
                    value={form.tanggal}
                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={form.waktuMulai}
                    onChange={(e) => setForm({ ...form, waktuMulai: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#131B2E] mb-1">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={form.waktuSelesai}
                    onChange={(e) => setForm({ ...form, waktuSelesai: e.target.value })}
                    className="w-full text-xs p-2.5 border border-[#E2E8F0] rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="wajib"
                  checked={form.wajib}
                  onChange={(e) => setForm({ ...form, wajib: e.target.checked })}
                  className="rounded border-[#E2E8F0] text-[#0046A4]"
                />
                <label htmlFor="wajib" className="text-xs font-semibold text-[#131B2E]">
                  Kegiatan Wajib (Harus diabsen oleh seluruh penghuni)
                </label>
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
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
