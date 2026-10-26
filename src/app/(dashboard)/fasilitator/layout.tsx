"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function FasilitatorRoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!token) {
      router.replace("/login");
      return;
    }

    if (user && user.role !== "fasil" && user.role !== "admin" && user.role !== "fasilitator") {
      router.replace("/mahasiswa/dashboard");
    }
  }, [user, token, isLoading, router]);

  if (
    isLoading ||
    !token ||
    (user && user.role !== "fasil" && user.role !== "admin" && user.role !== "fasilitator")
  ) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#76b900] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
