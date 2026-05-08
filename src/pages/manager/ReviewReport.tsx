import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Card, Button, Textarea } from '@/components/ui/core';

export default function ReviewReport() {
  const { profile } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [report, setReport] = useState<any>(null);
  const [staff, setStaff] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id || !profile) return;
      try {
        const reportDoc = await getDoc(doc(db, 'reports', id)).catch((error) => handleFirestoreError(error, OperationType.GET, `reports/${id}`));
        if (reportDoc && reportDoc.exists()) {
          const data = reportDoc.data();
          setReport({ id: reportDoc.id, ...data });
          setComments(data.managerComments || '');
          
          if (data.staffId) {
            const staffDoc = await getDoc(doc(db, 'users', data.staffId));
            if (staffDoc.exists()) {
              setStaff(staffDoc.data());
            }
          }
        } else {
          setReport(null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, profile]);

  const handleAction = async (status: 'Approved' | 'Revision Required') => {
    if (!id) return;
    if (status === 'Revision Required' && !comments.trim()) {
      alert("Catatan wajib diisi jika meminta revisi.");
      return;
    }
    
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'reports', id), {
        status,
        managerComments: comments,
        updatedAt: serverTimestamp()
      }).catch((error) => handleFirestoreError(error, OperationType.UPDATE, `reports/${id}`));
      navigate('/manager');
    } catch (e) {
      console.error(e);
      alert("Gagal memperbarui laporan.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-8">Memuat...</div>;
  if (!report) return <div className="p-8">Laporan tidak ditemukan.</div>;

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Review Laporan Harian</h1>
      </header>

      <div className="p-8 flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 space-y-6">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{report.title}</h2>
                  <div className="flex gap-3 text-sm text-slate-500 mt-2">
                    <span className="font-medium bg-slate-100 px-2 py-0.5 rounded text-slate-700">{report.category}</span>
                    <span>{report.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    report.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                    report.status === 'Revision Required' ? 'bg-amber-50 text-amber-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Deskripsi Detail</h3>
                <p className="text-slate-700 whitespace-pre-wrap">{report.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Durasi Pengerjaan</h3>
                  <p className="font-mono text-slate-800">{Math.floor(report.durationMinutes / 60)}h {report.durationMinutes % 60}m</p>
                </div>
                {report.attachmentUrl && (
                  <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-1">Lampiran</h3>
                    <a href={report.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Lihat Dokumen &rarr;
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-5 bg-slate-50 border-slate-200">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Informasi Staf</h3>
              {staff ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                    {staff.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{staff.name}</p>
                    <p className="text-xs text-slate-500">{staff.nik || 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">Data staf tidak ditemukan.</p>
              )}
            </Card>

            <Card className="p-5 border-slate-200">
              <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Panel Evaluasi</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Catatan Manager (Opsional)</label>
                  <Textarea
                    placeholder="Tuliskan apresiasi atau instruksi perbaikan untuk staf..."
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows={4}
                    disabled={report.status !== 'Pending Review'}
                  />
                </div>

                {report.status === 'Pending Review' && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <Button
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                      onClick={() => handleAction('Revision Required')}
                      disabled={actionLoading}
                    >
                      Minta Revisi
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleAction('Approved')}
                      disabled={actionLoading}
                    >
                      Terima Laporan
                    </Button>
                  </div>
                )}
                
                {report.status !== 'Pending Review' && (
                  <Button variant="outline" className="w-full" onClick={() => navigate('/manager')}>
                    Kembali
                  </Button>
                )}
              </div>
            </Card>
          </div>

        </div>
      </div>
    </>
  );
}
