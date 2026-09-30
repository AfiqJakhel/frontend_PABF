'use client';

import React from 'react';
import { Users, CheckCircle2, FileText, XCircle } from 'lucide-react';
import { StatSummary } from '@/types/fasil';

interface StatCardsProps {
  stats: StatSummary;
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Total Penghuni</span>
          <Users className="h-5 w-5 text-slate-400" />
        </div>
        <p className="mt-2 text-3xl font-bold text-slate-800">{stats.totalPenghuni}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Hadir Hari Ini</span>
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.hadir}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Izin / Sakit</span>
          <FileText className="h-5 w-5 text-amber-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-amber-600">{stats.izin}</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Tanpa Keterangan</span>
          <XCircle className="h-5 w-5 text-rose-500" />
        </div>
        <p className="mt-2 text-3xl font-bold text-rose-600">{stats.alpha}</p>
      </div>
    </div>
  );
}