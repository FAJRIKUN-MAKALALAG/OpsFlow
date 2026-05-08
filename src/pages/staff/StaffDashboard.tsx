import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/core';

export default function StaffDashboard() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (!profile) return;
      try {
        const q = query(
          collection(db, 'reports'),
          where('staffId', '==', profile.userId),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q).catch((error) => {
          return handleFirestoreError(error, OperationType.LIST, 'reports');
        });
        if (querySnapshot) {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setReports(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [profile]);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Laporan Saya</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 font-medium italic">{format(new Date(), 'EEEE, dd MMM yyyy')}</span>
          <Link to="/staff/report/new">
            <Button size="sm">Buat Laporan</Button>
          </Link>
        </div>
      </header>
      
      <div className="p-8 flex-1 overflow-auto">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-800">Riwayat Laporan</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Tanggal</th>
                  <th className="px-6 py-4">Aktivitas</th>
                  <th className="px-6 py-4">Durasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Belum ada laporan.</td></tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {report.date}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{report.title}</p>
                        <p className="text-xs text-slate-500">{report.category}</p>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-600">
                        {Math.floor(report.durationMinutes / 60)}h {report.durationMinutes % 60}m
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                          report.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                          report.status === 'Revision Required' ? 'bg-amber-50 text-amber-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/staff/report/${report.id}`}>
                          <button className="px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-md font-bold text-xs hover:bg-slate-50 shadow-sm">
                            Detail
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
