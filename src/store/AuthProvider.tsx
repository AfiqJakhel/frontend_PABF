"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/lib/apiClient";

export interface AuthUser {
  id: number;
  nim: string;
  nama: string;
  role: "mahasiswa" | "fasil" | "admin" | string;
  email?: string | null;
  kamar?: string | null;
  kamar_id?: number | null;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inisialisasi auth dari localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedToken = localStorage.getItem("access_token");
      const savedUserStr = localStorage.getItem("user");

      if (savedToken && savedUserStr) {
        setToken(savedToken);
        setUser(JSON.parse(savedUserStr));
      }
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    (accessToken: string, userData: AuthUser) => {
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("user", JSON.stringify(userData));

      if (userData.role === "fasil" || userData.role === "admin") {
        router.push("/fasilitator/dashboard");
      } else {
        router.push("/mahasiswa/dashboard");
      }
    },
    [router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  }, [router]);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get<{ success: boolean; data: AuthUser }>("/api/auth/me");
      if (res.data) {
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch {
      // Jika refresh gagal, biarkan state saat ini atau tangani di interceptor
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
