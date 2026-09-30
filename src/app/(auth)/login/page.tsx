import type { Metadata } from "next";
import HeroPanel from "@/components/layouts/HeroPanel";
import LoginForm from "@/components/forms/LoginForm";

// ============================================================
// LoginPage — Layout classes defined in globals.css:
//   .auth-card, .auth-card__hero, .auth-card__form
// Responsive breakpoints also live in globals.css.
// ============================================================

export const metadata: Metadata = {
  title: "Masuk — SIMAS Asrama Unand",
  description:
    "Masuk ke Sistem Informasi Absensi Asrama Universitas Andalas menggunakan NIM dan kata sandi Anda.",
};

export default function LoginPage() {
  return (
    <div className="auth-card">
      {/* Left: Branding/Hero panel */}
      <div className="auth-card__hero">
        <HeroPanel />
      </div>

      {/* Right: Form panel */}
      <div className="auth-card__form">
        <LoginForm />
      </div>
    </div>
  );
}
