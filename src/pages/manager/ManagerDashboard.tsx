import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, getDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
  const { profile } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  
  const [metrics, setMetrics] = useState({
    total: 0,
    pending: 0,
    revision: 0,
  });

  useEffect(() => {
    async function fetchData() {
      if (!profile || profile.role !== 'manager' || !profile.divisionId) {
        setLoading(false);
        return;
      }
      try {
        // Fetch Reports for this division
        const q = query(
          collection(db, 'reports'),
          where('divisionId', '==', profile.divisionId)
        );
        const querySnapshot = await getDocs(q).catch((error) => handleFirestoreError(error, OperationType.LIST, 'reports'));
        
        if (querySnapshot) {
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          // Sort by date (desc) in code since we might not have a composite index right away
          data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setReports(data);
          
          let p = 0;
          let r = 0;
          let t = data.length;
          data.forEach(x => {
            if (x.status === 'Pending Review') p++;
            if (x.status === 'Revision Required') r++;
          });
          setMetrics({ total: t, pending: p, revision: r });
          
          // Fetch users involved to display names
          const userIds = [...new Set(data.map(r => r.staffId))];
          const userMap: Record<string, any> = {};
          await Promise.all(userIds.map(async (uid) => {
            const userSnap = await getDoc(doc(db, 'users', uid)).catch(() => null);
            if (userSnap && userSnap.exists()) {
              userMap[uid] = userSnap.data();
            }
          }));
          setUsers(userMap);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [profile]);

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
  };

  if (profile?.role === 'manager' && !profile.divisionId) {
    return (
      <div className="p-8">
        <div className="bg-amber-50 text-amber-800 p-4 rounded-xl border border-amber-200">
          Anda belum dimasukkan ke divisi mana pun. Silakan hubungi Administrator.
        </div>
      </div>
    );
  }

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Dashboard Manager</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500 font-medium italic">{format(new Date(), 'EEEE, dd MMM yyyy')}</span>
        </div>
      </header>

      <div className="p-8 flex-1 overflow-auto space-y-6">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Laporan Divisi</p>
            <p className="text-3xl font-bold text-slate-900">{metrics.total}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Menunggu Approval</p>
            <p className="text-3xl font-bold text-blue-600">{metrics.pending}</p>
            {metrics.pending > 0 && (
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
                <span>Perlu Tindakan Segera</span>
              </div>
            )}
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Perlu Revisi</p>
            <p className="text-3xl font-bold text-amber-500">{metrics.revision}</p>
          </div>
        </div>

        {/* Dashboard Table Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Antrean Laporan Tim</h3>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-3">Karyawan</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Aktivitas</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
                ) : reports.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Belum ada laporan dari tim.</td></tr>
                ) : (
                  reports.map(report => {
                    const u = users[report.staffId] || { name: 'Unknown User' };
                    return (
                      <tr key={report.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold">
                            {getInitials(u.name)}
                          </div>
                          <span className="font-medium text-slate-900">{u.name}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600">{report.date}</td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">{report.title}</p>
                          <p className="text-xs text-slate-400">{report.category}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider ${
                            report.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            report.status === 'Revision Required' ? 'bg-amber-50 text-amber-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/manager/review/${report.id}`}>
                            <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md font-bold text-xs hover:bg-blue-100">
                              Review
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}
