import Link from "next/link";

export default function AmbilPresensiPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6F7A6E] mb-1">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <span>/</span>
          <span className="font-semibold text-[#131B2E]">Ambil Presensi</span>
        </div>
        <h1
          className="text-2xl font-bold text-[#131B2E]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Ambil Presensi Foto
        </h1>
        <p className="text-xs text-[#6F7A6E]">
          Kamera presensi mandiri mahasiswa asrama Universitas Andalas (FR-02 & FR-03).
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[380px] shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#ECFDF5] text-[#15803D] flex items-center justify-center mb-4">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#131B2E] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Modul Pengambilan Foto Presensi
        </h2>
        <p className="text-xs text-[#6F7A6E] max-w-md mb-6 leading-relaxed">
          Fitur kamera foto presensi harian (masuk/keluar asrama) dan presensi kegiatan terjadwal akan dihubungkan pada tahap berikutnya sesuai PRD.
        </p>
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-[#00652C] hover:bg-[#15803D] text-white rounded-lg text-xs font-semibold transition-colors"
        >
          Kembali ke Dashboard
        </Link>
      </div>
    </div>
  );
}
