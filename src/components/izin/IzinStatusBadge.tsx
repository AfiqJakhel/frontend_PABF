import React from "react";
import { IzinStatus } from "@/types/izin";

interface IzinStatusBadgeProps {
  status: IzinStatus;
}

export default function IzinStatusBadge({ status }: IzinStatusBadgeProps) {
  switch (status) {
    case "pending":
      return <span className="izin-badge izin-badge-pending">Menunggu</span>;
    case "approved":
      return <span className="izin-badge izin-badge-approved">Disetujui</span>;
    case "rejected":
      return <span className="izin-badge izin-badge-rejected">Ditolak</span>;
    case "cancelled":
      return <span className="izin-badge izin-badge-cancelled">Dibatalkan</span>;
    default:
      return <span className="izin-badge">{status}</span>;
  }
}
