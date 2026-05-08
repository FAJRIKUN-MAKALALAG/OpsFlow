import React from 'react';
import { Card } from '@/components/ui/core';

export default function AdminDashboard() {
  // Static placeholder metrics (database features removed)
  const metrics = { users: 0, divisions: 0, reports: 0 };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Admin Nisa Dashboard</h1>
      </header>

      <div className="p-8 flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Pengguna</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.users}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Divisi</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.divisions}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Laporan (Sistem)</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.reports}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
