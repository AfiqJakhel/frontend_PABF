"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api, API_BASE_URL } from "@/lib/apiClient";

interface KamarItem {
  id: number;
  nomor_kamar: string;
  lantai: number;
  total_penghuni: number;
}

interface GedungData {
  id: number;
  nama_gedung: string;
  total_kamar: number;
  daftar_kamar: KamarItem[];
}

interface MahasiswaItem {
  id: number;
  nim: string;
  nama: string;
  email: string;
  asal: string;
  jekel: string;
  kamar_id: number;
  nomor_kamar: string;
  lantai: number;
  nama_gedung: string;
  created_at: string | null;
}

export default function FasilitatorMahasiswaPage() {
  const [gedung, setGedung] = useState<GedungData | null>(null);
  const [mahasiswaList, setMahasiswaList] = useState<MahasiswaItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterKamar, setFilterKamar] = useState<string>("all");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<MahasiswaItem | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nim: "",
    nama: "",
    email: "",
    kamar_id: "",
    nomor_kamar: "",
    lantai: 1,
    asal: "",
    jekel: "L",
    password: "password123",
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    total_baris_diproses: number;
    berhasil_dibuat: number;
    berhasil_diperbarui: number;
    gagal_count: number;
    errors: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchGedungDanMahasiswa = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Ambil info gedung binaan fasilitator
      const resGedung = await api.get<{ success: boolean; data: GedungData }>("/api/fasil/gedung-saya");
      if (resGedung?.data) {
        setGedung(resGedung.data);
      }

      // 2. Ambil data mahasiswa binaan
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (filterKamar && filterKamar !== "all") params.append("kamar", filterKamar);

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const resMhs = await api.get<{
        success: boolean;
        data: { gedung_id: number; nama_gedung: string; total: number; mahasiswa: MahasiswaItem[] };
      }>(`/api/fasil/mahasiswa${queryStr}`);

      if (resMhs?.data?.mahasiswa) {
        setMahasiswaList(resMhs.data.mahasiswa);
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Gagal memuat data mahasiswa.";
      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filterKamar]);

  useEffect(() => {
    fetchGedungDanMahasiswa();
  }, [fetchGedungDanMahasiswa]);

  // Handle Add Student
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nim || !formData.nama) {
      showToast("error", "NIM dan Nama Mahasiswa wajib diisi.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        nim: formData.nim,
        nama: formData.nama,
        email: formData.email || undefined,
        asal: formData.asal || undefined,
        jekel: formData.jekel || undefined,
        password: formData.password || "password123",
      };

      if (formData.kamar_id) {
        payload.kamar_id = Number(formData.kamar_id);
      } else if (formData.nomor_kamar) {
        payload.nomor_kamar = formData.nomor_kamar;
        payload.lantai = Number(formData.lantai) || 1;
      }

      await api.post("/api/fasil/mahasiswa", payload);
      showToast("success", `Mahasiswa ${formData.nama} berhasil ditambahkan ke ${gedung?.nama_gedung}.`);
      setShowAddModal(false);
      resetForm();
      fetchGedungDanMahasiswa();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal menambahkan mahasiswa.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Student
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        nama: formData.nama,
        email: formData.email || undefined,
        asal: formData.asal || undefined,
        jekel: formData.jekel || undefined,
      };

      if (formData.kamar_id) {
        payload.kamar_id = Number(formData.kamar_id);
      } else if (formData.nomor_kamar) {
        payload.nomor_kamar = formData.nomor_kamar;
      }

      await api.put(`/api/fasil/mahasiswa/${selectedStudent.id}`, payload);
      showToast("success", `Data mahasiswa ${formData.nama} berhasil diperbarui.`);
      setShowEditModal(false);
      setSelectedStudent(null);
      resetForm();
      fetchGedungDanMahasiswa();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal memperbarui mahasiswa.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Student
  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      setSubmitting(true);
      await api.delete(`/api/fasil/mahasiswa/${selectedStudent.id}`);
      showToast("success", `Mahasiswa ${selectedStudent.nama} berhasil dihapus.`);
      setShowDeleteModal(false);
      setSelectedStudent(null);
      fetchGedungDanMahasiswa();
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal menghapus mahasiswa.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle CSV Import
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      showToast("error", "Pilih berkas CSV terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", csvFile);

      const res = await api.post<{
        success: boolean;
        message: string;
        data: {
          total_baris_diproses: number;
          berhasil_dibuat: number;
          berhasil_diperbarui: number;
          gagal_count: number;
          errors: string[];
        };
      }>("/api/fasil/mahasiswa/import-csv", formDataUpload);

      if (res?.data) {
        setImportResult(res.data);
        showToast("success", `Import selesai: ${res.data.berhasil_dibuat} dibuat, ${res.data.berhasil_diperbarui} diperbarui.`);
        fetchGedungDanMahasiswa();
      }
    } catch (err: unknown) {
      showToast("error", err instanceof Error ? err.message : "Gagal mengimpor berkas CSV.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const url = `${API_BASE_URL}/api/fasil/mahasiswa/template-csv`;
    
    // Download using link with auth header fetch or trigger
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token || ""}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = `template_import_mahasiswa_${gedung?.nama_gedung ? gedung.nama_gedung.replace(/\s+/g, "_").toLowerCase() : "gedung"}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => showToast("error", "Gagal mengunduh template CSV."));
  };

  const resetForm = () => {
    setFormData({
      nim: "",
      nama: "",
      email: "",
      kamar_id: gedung?.daftar_kamar?.[0]?.id ? String(gedung.daftar_kamar[0].id) : "",
      nomor_kamar: "",
      lantai: 1,
      asal: "",
      jekel: "L",
      password: "password123",
    });
  };

  const openEditModal = (mhs: MahasiswaItem) => {
    setSelectedStudent(mhs);
    setFormData({
      nim: mhs.nim,
      nama: mhs.nama,
      email: mhs.email === "-" ? "" : mhs.email,
      kamar_id: mhs.kamar_id ? String(mhs.kamar_id) : "",
      nomor_kamar: mhs.nomor_kamar,
      lantai: mhs.lantai,
      asal: mhs.asal === "-" ? "" : mhs.asal,
      jekel: mhs.jekel === "-" ? "L" : mhs.jekel,
      password: "",
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (mhs: MahasiswaItem) => {
    setSelectedStudent(mhs);
    setShowDeleteModal(true);
  };

  return (
    <div className="flex flex-col gap-6 pb-16 w-full">
      {/* Toast Notification */}
      {notification && (
        <div
          role="status"
          className={`fixed top-4 right-4 z-50 px-4 py-3 border text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all ${
            notification.type === "success"
              ? "bg-[#ecfdf5] text-[#15803d] border-[#a7f3d0]"
              : "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]"
          }`}
        >
          {notification.message}
        </div>
      )}

      {/* Header: Title, Building & Count */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#e2e8f0]">
        <div>
          <h1 className="ui-page-title">
            Data Master Mahasiswa
          </h1>
          <div className="flex items-center gap-2 mt-2 text-sm text-[#6f7a6e]">
            <span className="font-semibold text-[#131b2e]">
              {gedung?.nama_gedung || "Gedung Binaan"}
            </span>
            <span>•</span>
            <span className="text-[#00652c] font-medium">
              {loading ? "Memuat..." : `${mahasiswaList.length} mahasiswa terdaftar`}
            </span>
          </div>
        </div>

        {/* Action Buttons: Clean text-focused buttons without excessive icons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="ui-btn-secondary text-xs sm:text-sm"
            title="Unduh format template CSV untuk gedung ini"
          >
            Download Template CSV
          </button>

          <button
            type="button"
            onClick={() => {
              setImportResult(null);
              setCsvFile(null);
              setShowImportModal(true);
            }}
            className="ui-btn-secondary text-xs sm:text-sm"
          >
            Import CSV
          </button>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="ui-btn-primary text-xs sm:text-sm"
          >
            Tambah Mahasiswa
          </button>
        </div>
      </div>

      {/* Filter and Search Bar: Minimalist with clean borders */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari mahasiswa (nama atau NIM)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 px-3.5 bg-white border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] placeholder:text-[#6f7a6e] outline-none transition-colors"
          />
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="filter-kamar-select" className="text-xs font-medium text-[#6f7a6e] whitespace-nowrap">Filter Kamar:</label>
          <select
            id="filter-kamar-select"
            value={filterKamar}
            onChange={(e) => setFilterKamar(e.target.value)}
            className="h-10 px-3 bg-white border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-xs sm:text-sm font-medium text-[#131b2e] outline-none cursor-pointer"
          >
            <option value="all">Semua Kamar</option>
            {gedung?.daftar_kamar.map((k) => (
              <option key={k.id} value={k.nomor_kamar}>
                Kamar {k.nomor_kamar} (Lantai {k.lantai})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student List Table: Clean, Responsive with controlled horizontal scroll */}
      <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-[#6f7a6e]">
            Memuat data mahasiswa {gedung?.nama_gedung || ""}...
          </div>
        ) : mahasiswaList.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#6f7a6e]">
            Belum ada mahasiswa yang terdaftar pada {gedung?.nama_gedung || "gedung ini"}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8fafc] text-[#131b2e] border-b border-[#e2e8f0] font-semibold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">NIM & Mahasiswa</th>
                  <th className="px-5 py-3.5">Kamar & Lantai</th>
                  <th className="px-5 py-3.5">Jenis Kelamin</th>
                  <th className="px-5 py-3.5">Asal Daerah</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0]">
                {mahasiswaList.map((mhs) => (
                  <tr key={mhs.id} className="hover:bg-[#f8fafc] transition-colors">
                    <td className="px-5 py-4">
                      <span className="font-semibold text-[#131b2e] block">{mhs.nama}</span>
                      <span className="text-xs font-mono text-[#6f7a6e]">{mhs.nim}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-[#131b2e]">Kamar {mhs.nomor_kamar}</span>
                      <span className="block text-xs text-[#6f7a6e]">Lantai {mhs.lantai}</span>
                    </td>
                    <td className="px-5 py-4 text-[#3f493f]">
                      {mhs.jekel === "L" ? "Laki-laki" : mhs.jekel === "P" ? "Perempuan" : "-"}
                    </td>
                    <td className="px-5 py-4 text-[#3f493f]">{mhs.asal || "-"}</td>
                    <td className="px-5 py-4 font-mono text-xs text-[#6f7a6e]">{mhs.email || "-"}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(mhs)}
                          className="px-3 py-1.5 text-xs font-medium border border-[#d0d7de] hover:border-[#131b2e] text-[#131b2e] bg-white rounded-md transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(mhs)}
                          className="px-3 py-1.5 text-xs font-medium border border-[#fecdd3] hover:bg-[#fff1f2] text-[#be123c] bg-white rounded-md transition-colors cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Tambah Mahasiswa */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#e2e8f0] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3.5 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">
                  Tambah Mahasiswa Penghuni
                </h3>
                <span className="text-xs font-semibold text-[#00652c] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full mt-1 inline-block">
                  Lokasi: {gedung?.nama_gedung}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#6f7a6e] hover:text-[#131b2e] text-base p-1"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    NIM <span className="text-[#be123c]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                    placeholder="221152xxxx"
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] font-mono outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Nama Lengkap <span className="text-[#be123c]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    placeholder="Nama Mahasiswa"
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Pilih Kamar ({gedung?.nama_gedung})
                  </label>
                  <select
                    value={formData.kamar_id}
                    onChange={(e) => setFormData({ ...formData, kamar_id: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm font-medium text-[#131b2e] outline-none"
                  >
                    <option value="">-- Buat / Ketik Kamar Manual --</option>
                    {gedung?.daftar_kamar.map((k) => (
                      <option key={k.id} value={k.id}>
                        Kamar {k.nomor_kamar} (Lantai {k.lantai}) - {k.total_penghuni} org
                      </option>
                    ))}
                  </select>
                </div>
                {!formData.kamar_id && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                        No. Kamar
                      </label>
                      <input
                        type="text"
                        value={formData.nomor_kamar}
                        onChange={(e) => setFormData({ ...formData, nomor_kamar: e.target.value })}
                        placeholder="201"
                        className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm font-mono text-[#131b2e] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                        Lantai
                      </label>
                      <input
                        type="number"
                        value={formData.lantai}
                        onChange={(e) => setFormData({ ...formData, lantai: Number(e.target.value) })}
                        min={1}
                        max={10}
                        className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.jekel}
                    onChange={(e) => setFormData({ ...formData, jekel: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Asal Daerah
                  </label>
                  <input
                    type="text"
                    value={formData.asal}
                    onChange={(e) => setFormData({ ...formData, asal: e.target.value })}
                    placeholder="Kota / Daerah Asal"
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Email Mahasiswa
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="mhs@unand.ac.id"
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Password Awal
                  </label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm font-mono text-[#131b2e] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3.5 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="ui-btn-secondary text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="ui-btn-primary text-xs sm:text-sm disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Mahasiswa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Mahasiswa */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#e2e8f0] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3.5 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">
                  Edit Data Mahasiswa
                </h3>
                <span className="text-xs text-[#6f7a6e]">
                  NIM: {selectedStudent.nim} • {gedung?.nama_gedung}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-[#6f7a6e] hover:text-[#131b2e] text-base p-1"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Pindah Kamar ({gedung?.nama_gedung})
                  </label>
                  <select
                    value={formData.kamar_id}
                    onChange={(e) => setFormData({ ...formData, kamar_id: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm font-medium text-[#131b2e] outline-none"
                  >
                    {gedung?.daftar_kamar.map((k) => (
                      <option key={k.id} value={k.id}>
                        Kamar {k.nomor_kamar} (Lantai {k.lantai})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={formData.jekel}
                    onChange={(e) => setFormData({ ...formData, jekel: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#131b2e] mb-1">
                    Asal Daerah
                  </label>
                  <input
                    type="text"
                    value={formData.asal}
                    onChange={(e) => setFormData({ ...formData, asal: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d7de] focus:border-[#00652c] rounded-lg text-sm text-[#131b2e] outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-3.5 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="ui-btn-secondary text-xs sm:text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="ui-btn-primary text-xs sm:text-sm disabled:opacity-50"
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Mahasiswa */}
      {showDeleteModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 border border-[#fecdd3] shadow-xl">
            <h3 className="text-base font-bold text-[#be123c] mb-2">
              Konfirmasi Hapus Mahasiswa
            </h3>
            <p className="text-sm text-[#3f493f] mb-4">
              Apakah Anda yakin ingin menghapus mahasiswa <span className="font-semibold text-[#131b2e]">{selectedStudent.nama}</span> ({selectedStudent.nim}) dari {gedung?.nama_gedung}? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="ui-btn-secondary text-xs sm:text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleDeleteConfirm}
                className="ui-btn-danger text-xs sm:text-sm disabled:opacity-50"
              >
                {submitting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Import CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 border border-[#e2e8f0] shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3.5 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#131b2e]">
                  Import Mahasiswa Massal (CSV)
                </h3>
                <span className="text-xs font-semibold text-[#00652c] bg-[#ecfdf5] border border-[#a7f3d0] px-2 py-0.5 rounded-full mt-1 inline-block">
                  Target: {gedung?.nama_gedung}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="text-[#6f7a6e] hover:text-[#131b2e] text-base p-1"
                aria-label="Tutup"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="flex flex-col gap-4">
              <div className="text-xs text-[#6f7a6e] leading-relaxed">
                Seluruh baris mahasiswa yang diimpor akan <strong>terkunci secara otomatis</strong> ke gedung binaan Anda ({gedung?.nama_gedung}).
              </div>

              <div className="border border-dashed border-[#d0d7de] p-6 text-center rounded-lg bg-[#f8fafc]">
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setCsvFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="ui-btn-secondary text-xs sm:text-sm mb-2"
                >
                  Pilih Berkas CSV
                </button>
                <p className="text-xs text-[#6f7a6e]">
                  {csvFile ? `File terpilih: ${csvFile.name}` : "Hanya mendukung file .csv dengan encoding UTF-8"}
                </p>
              </div>

              {importResult && (
                <div className="p-3.5 border border-[#e2e8f0] bg-[#f8fafc] rounded-lg text-xs space-y-1">
                  <div className="font-semibold text-[#131b2e]">Hasil Pemrosesan:</div>
                  <div className="text-[#15803d]">✓ {importResult.berhasil_dibuat} mahasiswa baru dibuat</div>
                  <div className="text-[#0369a1]">↻ {importResult.berhasil_diperbarui} data diperbarui</div>
                  {importResult.gagal_count > 0 && (
                    <div className="text-[#be123c] mt-1">
                      ✕ {importResult.gagal_count} baris gagal:
                      <ul className="list-disc list-inside text-xs text-[#6f7a6e] mt-1 max-h-24 overflow-y-auto">
                        {importResult.errors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-between items-center pt-3.5 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="text-xs font-semibold text-[#00652c] hover:underline"
                >
                  Unduh Format Template CSV
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="ui-btn-secondary text-xs sm:text-sm"
                  >
                    Tutup
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !csvFile}
                    className="ui-btn-primary text-xs sm:text-sm disabled:opacity-50"
                  >
                    {submitting ? "Mengimpor..." : "Mulai Import"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
