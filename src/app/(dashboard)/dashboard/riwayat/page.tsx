import Link from "next/link";

export default function RiwayatPresensiPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6F7A6E] mb-1">
          <Link href="/dashboard" className="hover:underline">Dashboard</Link>
          <span>/</span>
          <span className="font-semibold text-[#131B2E]">Riwayat Presensi</span>
        </div>
        <h1
          className="text-2xl font-bold text-[#131B2E]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Riwayat Presensi Mahasiswa
        </h1>
        <p className="text-xs text-[#6F7A6E]">
          Seluruh log data kehadiran personal dan status persetujuan bukti foto (FR-07 PRD).
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[380px] shadow-xs">
        <div className="w-16 h-16 rounded-full bg-[#FAF8FF] text-[#00652C] flex items-center justify-center mb-4 border border-[#EAEDFF]">
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-[#131B2E] mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Modul Riwayat Presensi Lengkap
        </h2>
        <p className="text-xs text-[#6F7A6E] max-w-md mb-6 leading-relaxed">
          Filter data bulanan, pratinjau bukti foto, dan rincian catatan penolakan/persetujuan admin asrama akan dihubungkan secara penuh di tahap selanjutnya.
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
