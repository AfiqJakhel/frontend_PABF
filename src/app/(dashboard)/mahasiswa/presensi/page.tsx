"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function MahasiswaPresensiPage() {
  const [note, setNote] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSimulatePhoto = () => {
    setSelectedPhoto("data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22400%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22%23161D15%22%2F%3E%3Ccircle%20cx%3D%22200%22%20cy%3D%22120%22%20r%3D%2245%22%20fill%3D%22%235EDA39%22%20opacity%3D%220.35%22%2F%3E%3Cpath%20d%3D%22M120%20255c12-55%20148-55%20160%200%22%20fill%3D%22%235EDA39%22%20opacity%3D%220.35%22%2F%3E%3C%2Fsvg%3E");
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedPhoto) setIsSubmitted(true);
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setSelectedPhoto(null);
    setNote("");
  };

  if (isSubmitted) {
    return <main className="photo-attendance"><section className="photo-attendance__success"><div className="photo-attendance__success-icon">✓</div><h1>Presensi berhasil dikirim</h1><p>Foto bukti kehadiran telah tercatat dan akan diverifikasi oleh fasilitator asrama.</p><div><button type="button" className="button button--secondary" onClick={resetForm}>Ambil foto lain</button><Link className="button button--primary" href="/mahasiswa/dashboard">Kembali ke dashboard</Link></div></section></main>;
  }

  return (
    <main className="photo-attendance">
      <header className="photo-attendance__header"><p className="eyebrow">Presensi foto</p><h1>Ambil Foto Presensi</h1><p>Presensi akan dicatat sesuai jadwal aktif yang dibuat fasilitator.</p></header>
      <form className="photo-attendance__form" onSubmit={handleSubmit}>
        <section className="photo-attendance__schedule"><div className="photo-attendance__schedule-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg></div><div><span>Jadwal presensi aktif</span><h2>Presensi Asrama</h2><p>20:00 - 22:00 WIB</p></div><strong>Dibuka</strong></section>
        <section className="photo-attendance__activity"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 6.5 2z" /></svg><div><h2>Kajian Rutin & Bina Karakter</h2><p>Presensi kegiatan: 19:30 - 21:00 WIB, Masjid Asrama</p></div></section>
        <section className="photo-capture">
          <div className="photo-capture__heading"><div><h2>Foto bukti kehadiran</h2><p>Pastikan wajah terlihat jelas dan pencahayaan cukup.</p></div>{selectedPhoto && <span>✓ Foto siap</span>}</div>
          <div className="photo-capture__preview">{selectedPhoto ? <Image src={selectedPhoto} alt="Pratinjau foto presensi" width={400} height={300} unoptimized /> : <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg><strong>Kamera siap digunakan</strong><p>Ambil foto diri sebagai bukti kehadiran.</p></div>}</div>
          <button type="button" className="button button--primary photo-capture__button" onClick={handleSimulatePhoto}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" /></svg>{selectedPhoto ? "Ambil ulang foto" : "Ambil foto"}</button>
          <label className="photo-capture__note" htmlFor="note">Catatan atau keterangan <span>(opsional)</span><textarea id="note" rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Tambahkan catatan bila diperlukan..." /></label>
          <button type="submit" disabled={!selectedPhoto} className="button button--submit">Kirim bukti presensi</button>
        </section>
      </form>
    </main>
  );
}
