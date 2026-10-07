"use client";

import { useRef, useState } from "react";
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
      <div>
        <h1 className="ui-page-title">Impor Pengguna Massal</h1>
        <p className="ui-meta mt-1">Tambahkan mahasiswa atau pengguna fasilitator melalui file data CSV atau Excel.</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 p-6 md:p-8 max-w-2xl shadow-xs">
        <form onSubmit={submit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="user-import" className="block text-sm font-semibold text-slate-800 mb-2">
              File Data Pengguna (.csv, .xlsx)
            </label>
            <input
              ref={inputRef}
              id="user-import"
              type="file"
              accept=".csv,.xlsx"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              className="w-full text-sm p-3 border border-slate-200 rounded-lg bg-slate-50/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer"
            />
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Format kolom:</span>
            <ul className="list-disc pl-5 mt-1 space-y-0.5">
              <li><span className="font-medium text-slate-800">Kolom wajib:</span> <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700 font-mono">nim</code>, <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700 font-mono">nama</code>, <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700 font-mono">password</code></li>
              <li><span className="font-medium text-slate-800">Kolom opsional:</span> <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700 font-mono">role</code>, <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700 font-mono">email</code>, <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700 font-mono">asal</code>, <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700 font-mono">jekel</code>, <code className="bg-slate-200/60 px-1 py-0.5 rounded text-slate-700 font-mono">kamar_id</code></li>
            </ul>
          </div>

          {message && (
            <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}
          {error && (
            <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Impor gagal: {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading || !file}
              className="ui-btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses Impor..." : "Mulai Impor Pengguna"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}