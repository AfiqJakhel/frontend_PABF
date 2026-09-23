"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [nim, setNim] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!nim.trim()) {
      setErrorMessage("Nomor Induk Mahasiswa (NIM) wajib diisi");
      return;
    }
    if (!password) {
      setErrorMessage("Kata sandi wajib diisi");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/dashboard");
    }, 900);
  };

  return (
    <div
      className="flex flex-col justify-center items-center bg-white"
      style={{
        width: "608px",
        height: "774px",
        minHeight: "640px",
        padding: "48px",
      }}
    >
      {/* Center Section */}
      <div className="flex flex-col items-start w-full gap-6 max-w-[512px]">
        {/* Card Header: Visual Emblem & Title */}
        <div
          className="flex flex-row items-center gap-4 w-full"
          style={{ width: "512px", height: "56px" }}
        >
          {/* Official Emblem SIMAS UNAND */}
          <div
            className="relative flex items-center justify-center rounded-xl overflow-hidden shadow-xs flex-shrink-0"
            style={{ width: "56px", height: "56px" }}
          >
            <Image
              src="/images/logo-simas.svg"
              alt="Official Emblem SIMAS UNAND"
              width={56}
              height={56}
              priority
              className="w-full h-full object-contain"
            />
          </div>

          {/* Heading Container */}
          <div className="flex flex-col justify-center">
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "20px",
                lineHeight: "28px",
                letterSpacing: "-0.5px",
                color: "#131B2E",
                margin: 0,
              }}
            >
              Sistem Informasi Absensi Asrama Unand
            </h2>
          </div>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-xs w-full animate-fadeIn"
            style={{
              width: "512px",
              backgroundColor: "var(--color-status-danger-bg)",
              border: "1px solid var(--color-status-danger-border)",
              color: "var(--color-status-danger-text)",
              fontFamily: "var(--font-sans)",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
              <path d="M8 4.5V8.5M8 11.5H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Login Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-start gap-4"
          style={{ width: "512px" }}
        >
          {/* Field 1: NIM / Identitas Pengguna */}
          <div className="flex flex-col items-start gap-1 w-full">
            <label
              htmlFor="nim-input"
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "14px",
                lineHeight: "20px",
                color: "#131B2E",
              }}
            >
              Nomor Induk Mahasiswa (NIM)
            </label>
            <div className="relative flex items-center w-full">
              {/* User Icon */}
              <div
                className="absolute pointer-events-none flex items-center justify-center"
                style={{ left: "16px" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
                    stroke="#3F493F"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 18C16 15.2386 13.3137 13 10 13C6.68629 13 4 15.2386 4 18"
                    stroke="#3F493F"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <input
                id="nim-input"
                type="text"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Contoh: 2211522001"
                autoComplete="username"
                className="w-full focus:outline-none focus:ring-2 focus:ring-[#00652C] transition-all"
                style={{
                  height: "44px",
                  backgroundColor: "#F2F3FF",
                  borderRadius: "8px",
                  padding: "13px 16px 14px 48px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "17px",
                  color: "#131B2E",
                  border: "none",
                }}
              />
            </div>
          </div>

          {/* Field 2: Kata Sandi with Toggle Visibility */}
          <div className="flex flex-col items-start gap-1 w-full">
            <div className="flex flex-row justify-between items-center w-full">
              <label
                htmlFor="password-input"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "14px",
                  lineHeight: "20px",
                  color: "#131B2E",
                }}
              >
                Kata Sandi
              </label>
              <button
                type="button"
                className="hover:underline focus:outline-none transition-colors"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 600,
                  fontSize: "12px",
                  lineHeight: "16px",
                  color: "#00652C",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                Lupa Kata Sandi?
              </button>
            </div>
            <div className="relative flex items-center w-full">
              {/* Lock Icon */}
              <div
                className="absolute pointer-events-none flex items-center justify-center"
                style={{ left: "16px" }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 9V6C6 3.79086 7.79086 2 10 2C12.2091 2 14 3.79086 14 6V9"
                    stroke="#3F493F"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="4"
                    y="9"
                    width="12"
                    height="9"
                    rx="2"
                    stroke="#3F493F"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <input
                id="password-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akun"
                autoComplete="current-password"
                className="w-full focus:outline-none focus:ring-2 focus:ring-[#00652C] transition-all"
                style={{
                  height: "44px",
                  backgroundColor: "#F2F3FF",
                  borderRadius: "8px",
                  padding: "13px 48px 14px 48px",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "17px",
                  color: "#131B2E",
                  border: "none",
                }}
              />

              {/* Show / Hide Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="absolute flex items-center justify-center p-1 rounded-sm text-[#3F493F] hover:text-[#131B2E] transition-colors"
                style={{ right: "14px" }}
              >
                {showPassword ? (
                  /* Eye-off icon */
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3F493F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye icon */
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3F493F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div
            className="flex flex-row items-center gap-2 py-1 w-full cursor-pointer"
            onClick={() => setRememberMe(!rememberMe)}
          >
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="cursor-pointer accent-[#15803D]"
              style={{
                width: "16px",
                height: "16px",
                border: "1px solid #767676",
                borderRadius: "2.5px",
              }}
            />
            <label
              htmlFor="remember-me"
              className="cursor-pointer select-none"
              style={{
                fontFamily: "var(--font-sans)",
                fontWeight: 400,
                fontSize: "12px",
                lineHeight: "16px",
                color: "#3F493F",
              }}
            >
              Ingat saya di perangkat ini selama 30 hari
            </label>
          </div>

          {/* Action Button: Masuk ke Sistem */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex flex-row justify-center items-center gap-2 w-full transition-all duration-200 cursor-pointer hover:bg-[#166534] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
            style={{
              height: "52px",
              backgroundColor: "#15803D",
              borderRadius: "8px",
              padding: "14px 32px",
              boxShadow:
                "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)",
              border: "none",
            }}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#FFFFFF",
                  }}
                >
                  Memverifikasi...
                </span>
              </div>
            ) : (
              <>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    fontSize: "16px",
                    lineHeight: "24px",
                    color: "#FFFFFF",
                  }}
                >
                  Masuk ke Sistem
                </span>
                {/* Arrow Right Icon */}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.75 7H12.25M12.25 7L7.5 2.25M12.25 7L7.5 11.75"
                    stroke="#FFFFFF"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Support Footer Note */}
        <div
          className="flex flex-col items-center justify-center w-full pt-2"
          style={{ width: "100%" }}
        >
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "16px",
              color: "#3F493F",
              textAlign: "center",
              margin: 0,
            }}
          >
            Mengalami kendala akun? Hubungi pengelola asrama melalui loket helpdesk.
          </p>
        </div>
      </div>
    </div>
  );
}
