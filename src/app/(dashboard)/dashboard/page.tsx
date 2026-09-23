import Link from "next/link";

export default function DashboardPage() {
  const recentAttendances = [
    {
      id: "ABS-20260924-01",
      tanggal: "24 Sep 2026",
      waktu: "06:45 WIB",
      tipe: "Presensi Masuk",
      keterangan: "Pintu Gedung A",
      status: "Disetujui",
      catatanAdmin: "Terverifikasi",
    },
    {
      id: "ABS-20260923-02",
      tanggal: "23 Sep 2026",
      waktu: "21:30 WIB",
      tipe: "Presensi Masuk",
      keterangan: "Pintu Gedung A",
      status: "Disetujui",
      catatanAdmin: "Tepat Waktu",
    },
    {
      id: "ABS-20260923-01",
      tanggal: "23 Sep 2026",
      waktu: "07:15 WIB",
      tipe: "Presensi Keluar",
      keterangan: "Kampus Limau Manis",
      status: "Disetujui",
      catatanAdmin: "Terverifikasi",
    },
    {
      id: "ABS-20260922-03",
      tanggal: "22 Sep 2026",
      waktu: "20:05 WIB",
      tipe: "Presensi Kegiatan",
      keterangan: "Kajian Karakter",
      status: "Menunggu",
      catatanAdmin: "Dalam Tinjauan",
    },
  ];

  return (
    <div className="flex flex-col gap-6 sm:gap-8 pb-12 w-full">
      {/* Welcome Banner Card (Pure Gradient, No Floating Circles) */}
      <div
        className="rounded-2xl p-6 sm:p-8 text-white shadow-sm w-full"
        style={{
          background:
            "linear-gradient(135deg, #00652C 0%, #15803D 60%, #166534 100%)",
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
          {/* Greeting Column */}
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-[#95F8A7] tracking-wide">
                Gedung Asrama A • Kamar 204
              </span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white m-0"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Selamat Datang, Mahasiswa!
            </h1>
          </div>

          {/* Curfew Reminder Card inside Banner */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-5 py-3.5 flex items-center gap-3.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-[#FFDCC3] text-[#904D00] flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#FFDCC3] uppercase tracking-wider">
                Batas Jam Gerbang
              </span>
              <span
                className="text-xl font-bold text-white leading-tight"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                22:00 WIB
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Status Presensi Hari Ini */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2
            className="text-base font-bold text-[#131B2E]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Status Presensi Hari Ini
          </h2>
          <span className="text-xs text-[#6F7A6E]">
            Kamis, 24 September 2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Card 1: Absen Masuk */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-[#6F7A6E]">
                Presensi Masuk
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]">
                Sudah Absen
              </span>
            </div>
            <div
              className="text-2xl font-bold text-[#131B2E]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              06:45 WIB
            </div>
          </div>

          {/* Card 2: Absen Keluar */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-[#6F7A6E]">
                Presensi Keluar
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                Belum Dilakukan
              </span>
            </div>
            <div
              className="text-2xl font-bold text-[#6F7A6E]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              --:-- WIB
            </div>
          </div>

          {/* Card 3: Tingkat Kehadiran Bulanan */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-[#6F7A6E]">
                Kehadiran Bulan Ini
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]">
                Semester Ganjil
              </span>
            </div>
            <div
              className="text-2xl font-bold text-[#131B2E]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              96%
            </div>
          </div>

          {/* Card 4: Verifikasi Tertunda */}
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs flex flex-col justify-between h-28">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-[#6F7A6E]">
                Status Verifikasi
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                1 Menunggu
              </span>
            </div>
            <div
              className="text-2xl font-bold text-[#B45309]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              1 Foto
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons & Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Action Card (Col 1) */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3
              className="text-base font-bold text-[#131B2E] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Aksi Cepat Presensi
            </h3>

            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard/presensi"
                className="flex items-center justify-center gap-2.5 w-full py-3 px-4 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-sm font-semibold transition-all shadow-xs"
                style={{ fontFamily: "var(--font-display)" }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <span>Ambil Presensi Harian</span>
              </Link>

              <Link
                href="/dashboard/presensi"
                className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 bg-white hover:bg-[#F8FAFC] text-[#00652C] border border-[#A7F3D0] rounded-lg text-xs font-semibold transition-colors"
                style={{ fontFamily: "var(--font-sans)" }}
              >
                <svg
                  className="w-4 h-4 text-[#00652C]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Presensi Kegiatan Terjadwal</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Upcoming Dormitory Activities (Col 2 & 3) */}
        <div className="lg:col-span-2 bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-base font-bold text-[#131B2E]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Jadwal Kegiatan Asrama Terdekat
              </h3>
              <span className="text-xs font-semibold text-[#00652C]">
                2 Kegiatan
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {/* Event 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#FAF8FF] border border-[#EAEDFF] rounded-lg gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E2E7FF] text-[#00652C] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    📖
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#131B2E]">
                        Kajian Rutin Malam Jumat
                      </h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FFDAD6] text-[#93000A]">
                        Wajib
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6F7A6E] mt-0.5">
                      Masjid Asrama Limau Manis
                    </p>
                  </div>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <span
                    className="text-xs font-bold text-[#131B2E] block"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Kamis, 20:00 WIB
                  </span>
                </div>
              </div>

              {/* Event 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#FAF8FF] border border-[#EAEDFF] rounded-lg gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#E2E7FF] text-[#00652C] flex items-center justify-center font-bold text-xs flex-shrink-0">
                    🧹
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-[#131B2E]">
                        Gotong Royong & Piket Kebersihan Blok A
                      </h4>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FFDAD6] text-[#93000A]">
                        Wajib
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6F7A6E] mt-0.5">
                      Gedung Asrama A
                    </p>
                  </div>
                </div>
                <div className="sm:text-right flex-shrink-0">
                  <span
                    className="text-xs font-bold text-[#131B2E] block"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Sabtu, 08:00 WIB
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#F1F5F9] text-right">
            <Link
              href="/dashboard/riwayat"
              className="text-xs font-semibold text-[#00652C] hover:underline"
            >
              Lihat seluruh agenda asrama →
            </Link>
          </div>
        </div>
      </div>

      {/* Riwayat Presensi Terakhir */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3
            className="text-base font-bold text-[#131B2E]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Riwayat Presensi Terkini
          </h3>
          <Link
            href="/dashboard/riwayat"
            className="text-xs font-semibold text-[#00652C] hover:underline self-start sm:self-auto"
          >
            Lihat Semua Riwayat →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#E2E8F0]">
                <th className="py-3 px-6">ID & Tanggal</th>
                <th className="py-3 px-6">Jenis Presensi</th>
                <th className="py-3 px-6">Waktu</th>
                <th className="py-3 px-6">Lokasi / Keterangan</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] text-xs">
              {recentAttendances.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-[#FAF8FF] transition-colors"
                >
                  <td className="py-4 px-6">
                    <span
                      className="font-medium text-[#131B2E] block"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.id}
                    </span>
                    <span className="text-[11px] text-[#6F7A6E]">
                      {item.tanggal}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-medium text-[#131B2E]">
                    {item.tipe}
                  </td>
                  <td
                    className="py-4 px-6 font-semibold text-[#131B2E]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item.waktu}
                  </td>
                  <td className="py-4 px-6 text-[#3F493F]">
                    {item.keterangan}
                  </td>
                  <td className="py-4 px-6">
                    {item.status === "Disetujui" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#15803D] border border-[#A7F3D0]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D]" />
                        Disetujui
                      </span>
                    ) : item.status === "Menunggu" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#B45309]" />
                        Menunggu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#BE123C]" />
                        Ditolak
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-[#6F7A6E] text-[11px]">
                    {item.catatanAdmin}
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
