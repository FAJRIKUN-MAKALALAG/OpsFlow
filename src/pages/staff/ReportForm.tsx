import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { useAuth } from '@/lib/AuthContext';
import { Button, Input, Select, Textarea, Card, cn } from '@/components/ui/core';

export default function ReportForm() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!!id);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    category: 'Rutin',
    description: '',
    durationHours: '0',
    durationMinutes: '0',
    attachmentUrl: '',
    status: 'Pending Review'
  });
  const [managerComments, setManagerComments] = useState('');

  useEffect(() => {
    async function fetchReport() {
      if (!id) return;
      try {
        const docRef = doc(db, 'reports', id);
        const docSnap = await getDoc(docRef).catch((error) => handleFirestoreError(error, OperationType.GET, `reports/${id}`));
        
        if (docSnap && docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            date: data.date || '',
            title: data.title || '',
            category: data.category || 'Rutin',
            description: data.description || '',
            durationHours: String(Math.floor((data.durationMinutes || 0) / 60)),
            durationMinutes: String((data.durationMinutes || 0) % 60),
            attachmentUrl: data.attachmentUrl || '',
            status: data.status || 'Pending Review'
          });
          if (data.managerComments) {
            setManagerComments(data.managerComments);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setInitialLoading(false);
      }
    }
    fetchReport();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    try {
      const totalMinutes = parseInt(formData.durationHours || '0') * 60 + parseInt(formData.durationMinutes || '0');
      
      const reportData = {
        staffId: profile.userId,
        divisionId: profile.divisionId || 'unassigned',
        date: formData.date,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        durationMinutes: totalMinutes,
        attachmentUrl: formData.attachmentUrl,
        status: 'Pending Review',
        updatedAt: serverTimestamp()
      };

      if (id) {
        const docRef = doc(db, 'reports', id);
        await updateDoc(docRef, reportData).catch((error) => handleFirestoreError(error, OperationType.UPDATE, `reports/${id}`));
      } else {
        const reportId = crypto.randomUUID().replace(/-/g, '').substring(0, 20); // Basic random ID
        const docRef = doc(db, 'reports', reportId);
        await setDoc(docRef, {
          ...reportData,
          createdAt: serverTimestamp()
        }).catch((error) => handleFirestoreError(error, OperationType.CREATE, `reports/${reportId}`));
      }
      
      navigate('/staff');
    } catch (error) {
      console.error("Error saving report", error);
      alert("Failed to save report.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="p-8">Memuat...</div>;
  }

  const isReadOnly = formData.status === 'Approved' || (id && profile?.role === 'manager' && profile.userId !== formData.staffId);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">
          {id ? (isReadOnly ? 'Detail Laporan' : 'Revisi Laporan') : 'Buat Laporan Baru'}
        </h1>
      </header>

      <div className="p-8 flex-1 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {formData.status === 'Revision Required' && !isReadOnly && (
            <Card className="bg-amber-50 border-amber-200 p-4">
              <h3 className="text-amber-800 font-bold mb-1 text-sm">Laporan Perlu Direvisi</h3>
              <p className="text-amber-700 text-sm">{managerComments || "Tidak ada catatan khusus dari manajer."}</p>
            </Card>
          )}

          {formData.status === 'Approved' && (
            <Card className="bg-emerald-50 border-emerald-200 p-4">
              <h3 className="text-emerald-800 font-bold mb-1 text-sm">Laporan Telah Disetujui</h3>
              {managerComments && (
                <p className="text-emerald-700 text-sm mt-2"><b>Catatan Manajer: </b>{managerComments}</p>
              )}
            </Card>
          )}

          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Tanggal Pelaporan</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Judul Aktivitas</label>
                <Input
                  type="text"
                  name="title"
                  placeholder="Misal: Maintenance Server Internal"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Kategori</label>
                <Select name="category" value={formData.category} onChange={handleChange} disabled={isReadOnly}>
                  <option value="Rutin">Rutin</option>
                  <option value="Proyek Khusus">Proyek Khusus</option>
                  <option value="Administratif">Administratif</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Deskripsi Detail</label>
                <Textarea
                  name="description"
                  placeholder="Jelaskan apa yang dikerjakan..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  disabled={isReadOnly}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Durasi Pengerjaan</label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      name="durationHours"
                      min="0"
                      value={formData.durationHours}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    />
                    <span className="text-sm text-slate-500">Jam</span>
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="number"
                      name="durationMinutes"
                      min="0"
                      max="59"
                      value={formData.durationMinutes}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    />
                    <span className="text-sm text-slate-500">Menit</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Tautan Lampiran (Opsional)</label>
                <Input
                  type="url"
                  name="attachmentUrl"
                  placeholder="https://..."
                  value={formData.attachmentUrl}
                  onChange={handleChange}
                  disabled={isReadOnly}
                />
                <p className="text-xs text-slate-400">Tautan dokumen bukti file upload.</p>
              </div>

              {!isReadOnly && (
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                  <Button type="button" variant="ghost" onClick={() => navigate(-1)}>Batal</Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Menyimpan...' : 'Kirim Laporan'}
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
