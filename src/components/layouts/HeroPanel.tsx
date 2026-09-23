import Image from "next/image";

export default function HeroPanel() {
  return (
    <div
      className="relative flex flex-col justify-between p-8 isolation-isolate overflow-hidden"
      style={{
        width: "608px",
        height: "774px",
        minHeight: "640px",
      }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/kampus-unand.jpg"
          alt="Kampus Universitas Andalas Limau Manis"
          fill
          priority
          sizes="608px"
          className="object-cover object-center"
        />
      </div>

      {/* Scrim Overlay 1: Green Tone Multiply */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          background:
            "linear-gradient(0deg, rgba(0, 101, 44, 0.95) 0%, rgba(0, 101, 44, 0.75) 50%, rgba(0, 101, 44, 0.4) 100%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* Scrim Overlay 2: Horizontal Vignette / Contrast Darkening */}
      <div
        className="absolute inset-0 z-2 pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, rgba(19, 27, 46, 0.4) 0%, rgba(19, 27, 46, 0) 50%, rgba(19, 27, 46, 0) 100%)",
        }}
      />

      <div
        className="relative z-10 flex flex-row justify-between items-center w-full"
        style={{ width: "544px", height: "22px" }}
      >
      </div>

      <div
        className="relative z-10 flex flex-col justify-end items-start w-full pt-16"
        style={{ width: "544px" }}
      >
        <div className="flex flex-col items-start gap-4 w-full">
          {/* Institution Category Label */}
          <div style={{ height: "20px" }}>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
                letterSpacing: "0.7px",
                textTransform: "uppercase",
                color: "#95F8A7",
              }}
            >
              UPT ASRAMA KAMPUS LIMAU MANIH
            </span>
          </div>

          {/* Headline Heading */}
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "32px",
              lineHeight: "40px",
              color: "#FFFFFF",
              margin: 0,
            }}
          >
            Membangun Karakter, Karpet Hijau Kehidupan Kampus.
          </h1>

          {/* Subtext Description */}
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              fontSize: "14px",
              lineHeight: "20px",
              color: "rgba(255, 255, 255, 0.9)",
              maxWidth: "448px",
              margin: 0,
            }}
          >
            Sistem pencatatan kehadiran mandiri terintegrasi untuk mahasiswa penghuni asrama Universitas Andalas berbasis verifikasi foto presisi.
          </p>
        </div>

        {/* Footer Micro-bar inside hero */}
        <div
          className="flex flex-row justify-between items-center w-full pt-6"
          style={{ width: "544px", height: "38px" }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "11px",
              lineHeight: "14px",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            © Universitas Andalas
          </span>
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 500,
              fontSize: "11px",
              lineHeight: "14px",
              color: "rgba(255, 255, 255, 0.6)",
            }}
          >
            Sistem Presensi Asrama
          </span>
        </div>
      </div>
    </div>
  );
}
