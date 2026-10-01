"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation } from "@/hooks/useApi";
import type { ApiResponse } from "@/types/attendance";

interface ImportResult {
  created: number;
  rows: number;
}

export default function FasilitatorPenggunaPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const { mutate, loading, error } = useMutation<ApiResponse<ImportResult>>("POST", "/api/fasil/users/import");
  const [message, setMessage] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (!file) {
      setMessage("Pilih file CSV atau XLSX terlebih dahulu.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await mutate(formData);
      setMessage(response.message);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      // Error ditampilkan dari state useMutation.
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12 w-full">
      <div><div className="flex items-center gap-2 text-xs text-[#6F7A6E] mb-1"><Link href="/fasilitator/dashboard">Dashboard Fasilitator</Link><span>/</span><span className="font-semibold text-[#131B2E]">Manajemen Pengguna</span></div><h1 className="page-title">Impor Pengguna Massal</h1><p className="text-xs text-[#6F7A6E]">Tambahkan mahasiswa atau pengguna fasilitator melalui CSV atau Excel.</p></div>
      <form onSubmit={submit} className="max-w-xl bg-white rounded-2xl border border-[#E2E8F0] p-6 flex flex-col gap-4">
        <label htmlFor="user-import" className="text-sm font-semibold text-[#131B2E]">File pengguna</label>
        <input ref={inputRef} id="user-import" type="file" accept=".csv,.xlsx" onChange={(event) => setFile(event.target.files?.[0] ?? null)} className="min-h-11 text-sm" />
        <p className="text-xs text-[#6F7A6E]">Kolom wajib: `nim`, `nama`, `password`. Kolom opsional: `role`, `email`, `asal`, `jekel`, `kamar_id`.</p>
        {message && <div role="status" className="rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] px-4 py-3 text-sm text-[#15803D]">{message}</div>}
        {error && <div role="alert" className="rounded-xl border border-[#FECDD3] bg-[#FFF1F2] px-4 py-3 text-sm text-[#BE123C]">Impor gagal: {error}</div>}
        <button type="submit" disabled={loading || !file} className="min-h-11 rounded-xl bg-[#00652C] text-white text-sm font-bold disabled:opacity-50">{loading ? "Memproses..." : "Impor Pengguna"}</button>
      </form>
    </div>
  );
}