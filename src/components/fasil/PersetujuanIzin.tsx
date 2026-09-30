'use client';

import React from 'react';
import { FileText, Check, X } from 'lucide-react';
import { IzinItem } from '@/types/fasil';

interface PersetujuanIzinProps {
  data: IzinItem[];
  onAction: (id: string, status: 'Disetujui' | 'Ditolak') => void;
}

export default function PersetujuanIzin({ data, onAction }: PersetujuanIzinProps) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-slate-800">{item.nama}</h3>
                <p className="text-xs text-slate-500">
                  Kamar: {item.kamar} • Tanggal: {item.tanggal}
                </p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  item.status === 'Pending'
                    ? 'bg-amber-100 text-amber-800'
                    : item.status === 'Disetujui'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="my-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Alasan Izin
              </p>
              {item.alasan}
            </div>

            <div className="mb-4 flex items-center justify-between text-xs">
              <span className="text-slate-500">Lampiran Bukti:</span>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="flex items-center gap-1 font-semibold text-indigo-600 hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                {item.buktiUrl}
              </a>
            </div>

            {item.status === 'Pending' ? (
              <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
                <button
                  onClick={() => onAction(item.id, 'Disetujui')}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-emerald-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" /> Setujui
                </button>
                <button
                  onClick={() => onAction(item.id, 'Ditolak')}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-rose-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700"
                >
                  <X className="h-4 w-4" /> Tolak
                </button>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-2 text-right">
                <span className="text-xs text-slate-400">Status telah diperbarui</span>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="col-span-2 rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
          Tidak ada permohonan izin.
        </div>
      )}
    </div>
  );
}