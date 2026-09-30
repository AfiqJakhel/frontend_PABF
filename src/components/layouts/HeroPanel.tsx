"use client";

import Image from "next/image";

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="var(--auth-hero-accent)" strokeWidth="1.6"/>
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="var(--auth-hero-accent)" strokeWidth="1.6"/>
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="var(--auth-hero-accent)" strokeWidth="1.6"/>
        <path d="M14.5 11v6M11 14.5h7" stroke="var(--auth-hero-accent)" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    label: "Absensi Berbasis Foto",
    desc: "Mahasiswa unggah foto sebagai bukti kehadiran. Admin verifikasi secara manual.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="3" width="16" height="14" rx="2" stroke="var(--auth-hero-accent)" strokeWidth="1.6"/>
        <path d="M2 8h16" stroke="var(--auth-hero-accent)" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M6 1v4M14 1v4" stroke="var(--auth-hero-accent)" strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M5.5 12h4M5.5 14.5h7" stroke="var(--auth-hero-accent)" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    label: "Rekap & Laporan",
    desc: "Dashboard rekap kehadiran harian, mingguan, dan bulanan siap ekspor.",
  },
];

export default function HeroPanel() {
  return (
    <div
      className="relative flex flex-col justify-between overflow-hidden"
      data-ui-style="ui-style-3fdg8l"
    >
      {/* Blur glow — top-left */}
      <div
        aria-hidden="true"
        data-ui-style="ui-style-wfe3ki"
      />

      {/* Blur glow — bottom-right */}
      <div
        aria-hidden="true"
        data-ui-style="ui-style-1udbt7r"
      />

      {/* Grid texture */}
      <div
        aria-hidden="true"
        data-ui-style="ui-style-114uv1l"
      />

      {/* ═══════════ CONTENT ═══════════ */}
      <div className="relative flex flex-col" data-ui-style="ui-style-g3x1zs">

        {/* Logo + Badge */}
        <div className="flex flex-row items-center gap-4" data-ui-style="ui-style-n3etrp">
          <div
            data-ui-style="ui-style-138ub0n"
          >
            <Image
              src="/images/logo-simas.svg"
              alt="Logo SIMAS Asrama Unand"
              width={52}
              height={52}
              priority
              data-ui-style="ui-style-pp70z2"
            />
          </div>
          <div>
            <span
              data-ui-style="ui-style-114jylo"
            >
              UPT Asrama Unand
            </span>
            <span
              data-ui-style="ui-style-19sa35t"
            >
              SIMAS
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1
          data-ui-style="ui-style-1qr6jzi"
        >
          Sistem Presensi<br />Asrama Unand
        </h1>

        {/* Subtitle */}
        <p
          data-ui-style="ui-style-1o7enrw"
        >
          Presensi digital berbasis bukti foto  untuk seluruh warga asrama Universitas Andalas.
        </p>

        {/* 2-column feature grid */}
        <div
          data-ui-style="ui-style-121z7gw"
        >
          {FEATURES.map((f, i) => (
            <div
              key={i}
              data-ui-style="ui-style-1cnfk8y"
            >
              {/* Icon bubble */}
              <div
                data-ui-style="ui-style-mr7wa5"
              >
                {f.icon}
              </div>

              {/* Label */}
              <p
                data-ui-style="ui-style-g7pqod"
              >
                {f.label}
              </p>

              {/* Description */}
              <p
                data-ui-style="ui-style-1cytwfh"
              >
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer micro-bar */}
      <div
        className="relative flex flex-row items-center gap-2"
        data-ui-style="ui-style-18s1apt"
      >
        <div
          data-ui-style="ui-style-1nkw61d"
        />
        <span
          data-ui-style="ui-style-h61o1y"
        >
          © Universitas Andalas
        </span>
      </div>
    </div>
  );
}
