import type { AttendanceRecord, AttendanceStatus } from "@/types/attendance";

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export type CalendarDayStatus =
  | "today"
  | "hadir"
  | "izin"
  | "terlambat"
  | "alfa"
  | "future";

export interface MonthlyStats {
  hadir: number;
  izin: number;
  terlambat: number;
  alfa: number;
  percentage: string;
}

export interface SessionAttendanceItem {
  id: string;
  sesi: string; // "subuh" | "malam" | "kegiatan"
  namaSesi: string; // "Subuh", "Malam", "Kegiatan"
  waktuFormatted: string; // "05:15" or "-"
  lokasi: string;
  status: AttendanceStatus | "belum_absen";
  catatan: string;
  isAlfa: boolean;
}

export interface DayAttendanceGroup {
  dateStr: string; // "YYYY-MM-DD"
  dayName: string; // "Kamis"
  dayNumber: number; // 15
  tanggalFormatted: string; // "15 Okt 2026"
  isToday: boolean;
  sessions: SessionAttendanceItem[];
}

export type SingleSessionStatus =
  | "hadir"
  | "izin"
  | "sakit"
  | "terlambat"
  | "alfa"
  | "belum_absen"
  | "future";

export interface SingleSessionEvaluation {
  status: SingleSessionStatus;
  record?: AttendanceRecord;
  waktuFormatted: string;
  lokasi: string;
  catatan: string;
  isExpired: boolean;
  isActive: boolean;
}

export interface DaySessionEvaluation {
  dateStr: string;
  day: number;
  dayName: string;
  tanggalFormatted: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  subuh: SingleSessionEvaluation;
  malam: SingleSessionEvaluation;
  kegiatan?: SingleSessionEvaluation[];
  overallStatus: CalendarDayStatus;
}

/**
 * Mengevaluasi status presensi per sesi (Subuh & Malam) secara independen untuk kalender.
 */
export function getDaySessionEvaluation(
  day: number,
  selectedMonth: number,
  selectedYear: number,
  currentDate: Date,
  historyRecords: AttendanceRecord[],
  todayRecords: AttendanceRecord[] = []
): DaySessionEvaluation {
  const currentTotalMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const isSubuhExpired = currentTotalMinutes > 6 * 60; // Batas Subuh: 06:00 WIB
  const isMalamExpired = currentTotalMinutes > 22 * 60; // Batas Malam: 22:00 WIB
  const isMalamActive = currentTotalMinutes >= 19 * 60 && currentTotalMinutes <= 22 * 60; // Sesi Malam: 19:00 - 22:00 WIB

  const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dayDate = new Date(selectedYear, selectedMonth, day);
  const dayName = DAY_NAMES[dayDate.getDay()];
  const tanggalFormatted = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
  }).format(dayDate);

  const isCurrentMonthView =
    selectedYear === currentDate.getFullYear() &&
    selectedMonth === currentDate.getMonth();

  const isPastMonthView =
    selectedYear < currentDate.getFullYear() ||
    (selectedYear === currentDate.getFullYear() &&
      selectedMonth < currentDate.getMonth());

  const isToday = isCurrentMonthView && day === currentDate.getDate();
  const isPast = isPastMonthView || (isCurrentMonthView && day < currentDate.getDate());
  const isFuture = !isToday && !isPast;

  // Kumpulkan semua record untuk tanggal ini
  const dayRecords = historyRecords.filter((item) => item.tanggal === dateStr);
  if (isToday) {
    for (const tr of todayRecords) {
      if (!dayRecords.some((dr) => dr.id === tr.id || (dr.sesi && dr.sesi.toLowerCase() === tr.sesi.toLowerCase()))) {
        dayRecords.push(tr);
      }
    }
  }

  // Cek apakah ada status izin/sakit umum hari itu
  const generalIzinRecord = dayRecords.find(
    (r) => r.status === "izin" || r.status === "sakit"
  );

  // Helper format lokasi
  const formatLokasi = (rec?: AttendanceRecord) => {
    if (!rec) return "-";
    if (rec.latitude != null && rec.longitude != null) {
      return `${rec.latitude.toFixed(6)}, ${rec.longitude.toFixed(6)}`;
    }
    return rec.area_absensi_id ? "Area Asrama Terdaftar" : "Lokasi tidak tersedia";
  };

  const formatWaktu = (rec?: AttendanceRecord) => {
    if (!rec?.waktu) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(rec.waktu));
    } catch {
      return rec.waktu;
    }
  };

  // 1. Evaluasi Sesi Subuh
  const subuhRec = dayRecords.find((r) => r.sesi && r.sesi.toLowerCase() === "subuh");
  let subuhStatus: SingleSessionStatus = "future";
  let subuhWaktu = "-";
  let subuhLokasi = "-";
  let subuhCatatan = "";
  let subuhExpired = false;
  let subuhActive = false;

  if (subuhRec) {
    subuhStatus = subuhRec.status;
    subuhWaktu = formatWaktu(subuhRec);
    subuhLokasi = formatLokasi(subuhRec);
    subuhCatatan = subuhRec.keterangan || (subuhRec.status === "terlambat" ? "Presensi tercatat lewat batas (Terlambat)." : "Presensi tervalidasi.");
  } else if (generalIzinRecord) {
    subuhStatus = generalIzinRecord.status;
    subuhCatatan = generalIzinRecord.keterangan || "Izin/Sakit disetujui.";
  } else if (isPast) {
    subuhStatus = "alfa";
    subuhCatatan = "Tidak melakukan presensi Subuh (Alfa).";
  } else if (isToday) {
    if (isSubuhExpired) {
      subuhStatus = "alfa";
      subuhExpired = true;
      subuhCatatan = "Batas waktu Subuh telah lewat (Alfa).";
    } else {
      subuhStatus = "belum_absen";
      subuhActive = true;
      subuhCatatan = "Sesi Subuh sedang berlangsung (Batas 06:00 WIB).";
    }
  } else {
    subuhStatus = "future";
    subuhCatatan = "Sesi Subuh belum dibuka.";
  }

  const subuhEval: SingleSessionEvaluation = {
    status: subuhStatus,
    record: subuhRec,
    waktuFormatted: subuhWaktu,
    lokasi: subuhLokasi,
    catatan: subuhCatatan,
    isExpired: subuhExpired,
    isActive: subuhActive,
  };

  // 2. Evaluasi Sesi Malam
  const malamRec = dayRecords.find((r) => r.sesi && r.sesi.toLowerCase() === "malam");
  let malamStatus: SingleSessionStatus = "future";
  let malamWaktu = "-";
  let malamLokasi = "-";
  let malamCatatan = "";
  let malamExpired = false;
  let malamActive = false;

  if (malamRec) {
    malamStatus = malamRec.status;
    malamWaktu = formatWaktu(malamRec);
    malamLokasi = formatLokasi(malamRec);
    malamCatatan = malamRec.keterangan || (malamRec.status === "terlambat" ? "Presensi tercatat lewat batas (Terlambat)." : "Presensi tervalidasi.");
  } else if (generalIzinRecord) {
    malamStatus = generalIzinRecord.status;
    malamCatatan = generalIzinRecord.keterangan || "Izin/Sakit disetujui.";
  } else if (isPast) {
    malamStatus = "alfa";
    malamCatatan = "Tidak melakukan presensi Malam (Alfa).";
  } else if (isToday) {
    if (isMalamExpired) {
      malamStatus = "alfa";
      malamExpired = true;
      malamCatatan = "Batas waktu Malam telah lewat (Alfa).";
    } else if (isMalamActive) {
      malamStatus = "belum_absen";
      malamActive = true;
      malamCatatan = "Sesi Malam sedang aktif dibuka (19:00 - 22:00 WIB).";
    } else {
      malamStatus = "belum_absen";
      malamCatatan = "Sesi Malam belum dibuka (Dibuka pukul 19:00 WIB).";
    }
  } else {
    malamStatus = "future";
    malamCatatan = "Sesi Malam belum dibuka.";
  }

  const malamEval: SingleSessionEvaluation = {
    status: malamStatus,
    record: malamRec,
    waktuFormatted: malamWaktu,
    lokasi: malamLokasi,
    catatan: malamCatatan,
    isExpired: malamExpired,
    isActive: malamActive,
  };

  // Overall status harian untuk fallback ringkasan
  let overallStatus: CalendarDayStatus = "future";
  if (isFuture) {
    overallStatus = "future";
  } else if (isToday) {
    if (subuhStatus === "hadir" && (malamStatus === "hadir" || malamStatus === "belum_absen")) {
      overallStatus = "today";
    } else if (subuhStatus === "alfa" && malamStatus === "alfa") {
      overallStatus = "alfa";
    } else {
      overallStatus = "today";
    }
  } else {
    // Hari lampau
    if (subuhStatus === "hadir" && malamStatus === "hadir") {
      overallStatus = "hadir";
    } else if (subuhStatus === "izin" || malamStatus === "izin" || subuhStatus === "sakit" || malamStatus === "sakit") {
      overallStatus = "izin";
    } else if (subuhStatus === "terlambat" || malamStatus === "terlambat") {
      overallStatus = "terlambat";
    } else if (subuhStatus === "alfa" || malamStatus === "alfa") {
      overallStatus = "alfa";
    } else {
      overallStatus = "hadir";
    }
  }

  return {
    dateStr,
    day,
    dayName,
    tanggalFormatted,
    isToday,
    isPast,
    isFuture,
    subuh: subuhEval,
    malam: malamEval,
    overallStatus,
  };
}

/**
 * Menghitung status presensi harian untuk kalender (backward compatibility).
 */
export function getDayStatus(
  day: number,
  selectedMonth: number,
  selectedYear: number,
  currentDate: Date,
  historyRecords: AttendanceRecord[],
  todayRecords: AttendanceRecord[] = []
): CalendarDayStatus {
  const evaluation = getDaySessionEvaluation(
    day,
    selectedMonth,
    selectedYear,
    currentDate,
    historyRecords,
    todayRecords
  );
  return evaluation.overallStatus;
}

/**
 * Menghitung ringkasan statistik kehadiran bulanan (Hadir, Izin, Terlambat, Alfa, Persentase).
 * Menghitung berbasis total sesi wajib (Subuh & Malam).
 */
export function calculateMonthStats(
  daysInMonth: number,
  selectedMonth: number,
  selectedYear: number,
  currentDate: Date,
  historyRecords: AttendanceRecord[],
  todayRecords: AttendanceRecord[] = []
): MonthlyStats {
  let hadir = 0;
  let izin = 0;
  let terlambat = 0;
  let alfa = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const evalResult = getDaySessionEvaluation(
      d,
      selectedMonth,
      selectedYear,
      currentDate,
      historyRecords,
      todayRecords
    );

    // Hitung per sesi wajib jika hari lampau
    if (evalResult.isPast) {
      for (const ses of [evalResult.subuh, evalResult.malam]) {
        if (ses.status === "hadir") hadir++;
        else if (ses.status === "izin" || ses.status === "sakit") izin++;
        else if (ses.status === "terlambat") terlambat++;
        else if (ses.status === "alfa") alfa++;
      }
    } else if (evalResult.isToday) {
      // Hari ini hanya hitung sesi yang sudah selesai / terisi
      for (const ses of [evalResult.subuh, evalResult.malam]) {
        if (ses.status === "hadir") hadir++;
        else if (ses.status === "izin" || ses.status === "sakit") izin++;
        else if (ses.status === "terlambat") terlambat++;
        else if (ses.status === "alfa") alfa++;
      }
    }
  }

  const totalEvaluated = hadir + izin + terlambat + alfa;
  const percentage =
    totalEvaluated > 0
      ? (((hadir + terlambat) / totalEvaluated) * 100).toFixed(1)
      : "100";

  return { hadir, izin, terlambat, alfa, percentage };
}

/**
 * Menghasilkan daftar riwayat presensi yang dikelompokkan per hari,
 * dengan setiap sesi wajib (Subuh & Malam) dipisah menjadi baris tersendiri,
 * siap untuk di-merge pada kolom hari dengan rowSpan.
 */
export function generateGroupedMonthlyAttendanceList(
  selectedMonth: number,
  selectedYear: number,
  currentDate: Date,
  historyRecords: AttendanceRecord[],
  todayRecords: AttendanceRecord[] = [],
  sortOrder: "asc" | "desc" = "desc"
): DayAttendanceGroup[] {
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const isCurrentMonth =
    selectedYear === currentDate.getFullYear() &&
    selectedMonth === currentDate.getMonth();
  const isPastMonth =
    selectedYear < currentDate.getFullYear() ||
    (selectedYear === currentDate.getFullYear() &&
      selectedMonth < currentDate.getMonth());

  const maxDayToEvaluate = isCurrentMonth
    ? currentDate.getDate()
    : isPastMonth
    ? daysInMonth
    : 0;

  const currentTotalMinutes = currentDate.getHours() * 60 + currentDate.getMinutes();
  const isSubuhExpired = currentTotalMinutes > 6 * 60; // Batas Subuh: 06:00 WIB
  const isMalamExpired = currentTotalMinutes > 22 * 60; // Batas Malam: 22:00 WIB

  const groups: DayAttendanceGroup[] = [];

  for (let d = 1; d <= maxDayToEvaluate; d++) {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayDate = new Date(selectedYear, selectedMonth, d);
    const dayName = DAY_NAMES[dayDate.getDay()];
    const tanggalFormatted = new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(dayDate);
    const isToday = isCurrentMonth && d === currentDate.getDate();

    // Ambil semua record untuk tanggal ini
    const dayRecords = historyRecords.filter((item) => item.tanggal === dateStr);

    // Gabungkan dengan todayRecords jika hari ini
    if (isToday) {
      for (const tr of todayRecords) {
        if (!dayRecords.some((dr) => dr.id === tr.id || dr.sesi === tr.sesi)) {
          dayRecords.push(tr);
        }
      }
    }

    const sessions: SessionAttendanceItem[] = [];

    // ── 1. Sesi Subuh ───────────────────────────────────────────
    const subuhRec = dayRecords.find((r) => r.sesi.toLowerCase() === "subuh");
    if (subuhRec) {
      let waktuFormatted = "-";
      if (subuhRec.waktu) {
        try {
          waktuFormatted = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(subuhRec.waktu));
        } catch {
          waktuFormatted = subuhRec.waktu;
        }
      }
      const lokasi =
        subuhRec.latitude != null && subuhRec.longitude != null
          ? `${subuhRec.latitude.toFixed(6)}, ${subuhRec.longitude.toFixed(6)}`
          : subuhRec.area_absensi_id
          ? "Area Asrama Terdaftar"
          : "Lokasi tidak tersedia";

      sessions.push({
        id: String(subuhRec.id),
        sesi: "subuh",
        namaSesi: "Subuh",
        waktuFormatted,
        lokasi,
        status: subuhRec.status,
        catatan: subuhRec.keterangan || "Presensi tercatat.",
        isAlfa: subuhRec.status === "alfa",
      });
    } else {
      // Tidak ada record Subuh
      if (!isToday || (isToday && isSubuhExpired)) {
        sessions.push({
          id: `alfa-${dateStr}-subuh`,
          sesi: "subuh",
          namaSesi: "Subuh",
          waktuFormatted: "-",
          lokasi: "-",
          status: "alfa",
          catatan: isToday
            ? "Batas waktu Subuh telah lewat (Alfa)."
            : "Tidak melakukan presensi Subuh (Alfa).",
          isAlfa: true,
        });
      } else {
        sessions.push({
          id: `today-${dateStr}-subuh`,
          sesi: "subuh",
          namaSesi: "Subuh",
          waktuFormatted: "-",
          lokasi: "-",
          status: "belum_absen",
          catatan: "Sesi Subuh belum diambil.",
          isAlfa: false,
        });
      }
    }

    // ── 2. Sesi Malam ───────────────────────────────────────────
    const malamRec = dayRecords.find((r) => r.sesi.toLowerCase() === "malam");
    if (malamRec) {
      let waktuFormatted = "-";
      if (malamRec.waktu) {
        try {
          waktuFormatted = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(malamRec.waktu));
        } catch {
          waktuFormatted = malamRec.waktu;
        }
      }
      const lokasi =
        malamRec.latitude != null && malamRec.longitude != null
          ? `${malamRec.latitude.toFixed(6)}, ${malamRec.longitude.toFixed(6)}`
          : malamRec.area_absensi_id
          ? "Area Asrama Terdaftar"
          : "Lokasi tidak tersedia";

      sessions.push({
        id: String(malamRec.id),
        sesi: "malam",
        namaSesi: "Malam",
        waktuFormatted,
        lokasi,
        status: malamRec.status,
        catatan: malamRec.keterangan || "Presensi tercatat.",
        isAlfa: malamRec.status === "alfa",
      });
    } else {
      // Tidak ada record Malam
      if (!isToday || (isToday && isMalamExpired)) {
        sessions.push({
          id: `alfa-${dateStr}-malam`,
          sesi: "malam",
          namaSesi: "Malam",
          waktuFormatted: "-",
          lokasi: "-",
          status: "alfa",
          catatan: isToday
            ? "Batas waktu Malam telah lewat (Alfa)."
            : "Tidak melakukan presensi Malam (Alfa).",
          isAlfa: true,
        });
      } else {
        sessions.push({
          id: `today-${dateStr}-malam`,
          sesi: "malam",
          namaSesi: "Malam",
          waktuFormatted: "-",
          lokasi: "-",
          status: "belum_absen",
          catatan: "Sesi Malam belum dibuka / belum diambil.",
          isAlfa: false,
        });
      }
    }

    // ── 3. Sesi Tambahan (Kegiatan atau lainnya) ────────────────
    const extraRecords = dayRecords.filter(
      (r) => r.sesi.toLowerCase() !== "subuh" && r.sesi.toLowerCase() !== "malam"
    );
    for (const er of extraRecords) {
      let waktuFormatted = "-";
      if (er.waktu) {
        try {
          waktuFormatted = new Intl.DateTimeFormat("id-ID", { timeStyle: "short" }).format(new Date(er.waktu));
        } catch {
          waktuFormatted = er.waktu;
        }
      }
      const lokasi =
        er.latitude != null && er.longitude != null
          ? `${er.latitude.toFixed(6)}, ${er.longitude.toFixed(6)}`
          : er.area_absensi_id
          ? "Area Asrama Terdaftar"
          : "Lokasi tidak tersedia";

      sessions.push({
        id: String(er.id),
        sesi: er.sesi,
        namaSesi: er.sesi.charAt(0).toUpperCase() + er.sesi.slice(1),
        waktuFormatted,
        lokasi,
        status: er.status,
        catatan: er.keterangan || "Kegiatan asrama.",
        isAlfa: er.status === "alfa",
      });
    }

    groups.push({
      dateStr,
      dayName,
      dayNumber: d,
      tanggalFormatted,
      isToday,
      sessions,
    });
  }

  // Pengurutan grup tanggal
  groups.sort((a, b) => {
    return sortOrder === "desc"
      ? b.dateStr.localeCompare(a.dateStr)
      : a.dateStr.localeCompare(b.dateStr);
  });

  return groups;
}
