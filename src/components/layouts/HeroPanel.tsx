"use client";

import Image from "next/image";

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7z" stroke="var(--auth-hero-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="9" r="2.5" stroke="var(--auth-hero-accent)" strokeWidth="1.8"/>
      </svg>
    ),
    label: "Geofencing & Foto Selfie",
    desc: "Validasi presensi akurat melalui foto selfie dan radius koordinat polygon gedung asrama.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="var(--auth-hero-accent)" strokeWidth="1.8"/>
        <path d="M12 7v5l3.5 2" stroke="var(--auth-hero-accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: "Sesi Subuh & Malam",
    desc: "Presensi terstruktur per sesi waktu server, pengajuan izin, dan verifikasi oleh fasilitator gedung.",
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
              src="/images/logo-unand.svg"
              alt="Logo Universitas Andalas"
              width={52}
              height={52}
              priority
              className="object-contain"
              data-ui-style="ui-style-pp70z2"
            />
          </div>
          <div>
            <span
              data-ui-style="ui-style-114jylo"
            >
              Asrama Unand
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
          Presensi digital berbasis verifikasi foto selfie dan validasi Geofencing batas polygon gedung asrama Universitas Andalas.
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
