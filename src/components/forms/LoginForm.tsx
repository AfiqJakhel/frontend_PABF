"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const savedNim = typeof window === "undefined" ? "" : localStorage.getItem("remember_nim") || "";
  const [nim, setNim] = useState(savedNim);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(savedNim));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!nim.trim()) { setErrorMessage("NIM wajib diisi."); return; }
    if (!password)   { setErrorMessage("Kata sandi wajib diisi."); return; }

    setIsLoading(true);
    try {
      const apiHost =
        process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== "undefined" && window.location.port === "3000"
          ? "http://127.0.0.1:5000"
          : "");

      const response = await fetch(`${apiHost}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: nim.trim(), password }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        setErrorMessage(result?.message || "Login gagal. Periksa NIM dan kata sandi Anda.");
        setIsLoading(false);
        return;
      }

      if (result.data?.access_token) {
        localStorage.setItem("access_token", result.data.access_token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      if (rememberMe) {
        localStorage.setItem("remember_nim", nim.trim());
      } else {
        localStorage.removeItem("remember_nim");
      }

      const userRole = result.data?.user?.role;
      if (userRole === "admin" || userRole === "fasilitator") {
        router.push("/fasilitator/dashboard");
      } else {
        router.push("/mahasiswa/dashboard");
      }
    } catch {
      setErrorMessage("Tidak dapat terhubung ke server. Pastikan server aktif.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col justify-center"
      data-ui-style="ui-style-qkjqd6"
    >
      {/* ── Header ── */}
      <div data-ui-style="ui-style-n3bqup">
        <h2
          data-ui-style="ui-style-13gfdn4"
        >
          Masuk ke Akun
        </h2>
        <p
          data-ui-style="ui-style-1lipu39"
        >
          Masukkan NIM dan kata sandi Anda untuk melanjutkan.
        </p>
      </div>

      {/* ── Error Alert ── */}
      {errorMessage && (
        <div
          role="alert"
          className="flex items-center gap-2.5 rounded-xl"
          data-ui-style="ui-style-3nyktn"
        >
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" data-ui-style="ui-style-qt7ynf">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 4.5V8.5M8 11.5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>

        {/* NIM Field */}
        <div className="flex flex-col gap-2">
          <label
            htmlFor="nim-input"
            data-ui-style="ui-style-15yn7oz"
          >
            NIM atau Email
          </label>
          <div className="relative flex items-center">
            <span className="absolute pointer-events-none" data-ui-style="ui-style-z2gzjk">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
                  stroke="var(--auth-form-input-icon)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 18C16 15.2386 13.3137 13 10 13C6.68629 13 4 15.2386 4 18"
                  stroke="var(--auth-form-input-icon)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              id="nim-input"
              type="text"
              value={nim}
              onChange={(e) => setNim(e.target.value)}
              placeholder="Contoh: 2211522001"
              autoComplete="username"
              className="auth-input"
              data-ui-style="ui-style-chiv85"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-2">
          <div className="flex flex-row justify-between items-center">
            <label
              htmlFor="password-input"
              data-ui-style="ui-style-15yn7oz"
            >
              Kata Sandi
            </label>
            <button
              type="button"
              className="transition-colors hover:underline focus:outline-none"
              data-ui-style="ui-style-2uj3ig"
            >
              Lupa Kata Sandi?
            </button>
          </div>

          <div className="relative flex items-center">
            <span className="absolute pointer-events-none" data-ui-style="ui-style-z2gzjk">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M6 9V6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6V9"
                  stroke="var(--auth-form-input-icon)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="9" width="12" height="9" rx="2"
                  stroke="var(--auth-form-input-icon)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input
              id="password-input"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan kata sandi"
              autoComplete="current-password"
              className="auth-input"
              data-ui-style="ui-style-ck9gk5"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              className="absolute flex items-center justify-center rounded transition-opacity hover:opacity-60"
              data-ui-style="ui-style-1ori1br"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--auth-form-input-icon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--auth-form-input-icon)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div
          className="flex flex-row items-center gap-2.5 cursor-pointer"
          onClick={() => setRememberMe(!rememberMe)}
          data-ui-style="ui-style-owkp67"
        >
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            className="cursor-pointer accent-[#15803D]"
            data-ui-style="ui-style-1xv5moi"
          />
          <label
            htmlFor="remember-me"
            className="cursor-pointer select-none"
            data-ui-style="ui-style-1aerj88"
          >
            Ingat saya di perangkat ini
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="auth-btn-primary"
          data-ui-style="ui-style-1lxck98"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="rgba(22,29,21,0.2)" strokeWidth="4"/>
                <path fill="var(--auth-form-btn-text)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" className="opacity-75"/>
              </svg>
              <span>Memverifikasi…</span>
            </>
          ) : (
            <>
              <span>Masuk Sekarang</span>
              <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                <path d="M1.75 7H12.25M12.25 7L7.5 2.25M12.25 7L7.5 11.75"
                  stroke="var(--auth-form-btn-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </>
          )}
        </button>
      </form>

      {/* ── Footer note ── */}
      <div data-ui-style="ui-style-11tp2fq">
        <p
          data-ui-style="ui-style-eq5npc"
        >
          Kendala akun atau lupa kata sandi? Hubungi pihak pengelola asrama.
        </p>
      </div>
    </div>
  );
}
