import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { Card, Button, Input, Select } from '@/components/ui/core';

export default function DivisionManagement() {
  const [divisions, setDivisions] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', managerId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const dSnap = await getDocs(query(collection(db, 'divisions'))).catch(e => handleFirestoreError(e, OperationType.LIST, 'divisions'));
      if (dSnap) setDivisions(dSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const uSnap = await getDocs(query(collection(db, 'users'))).catch(e => handleFirestoreError(e, OperationType.LIST, 'users'));
      if (uSnap) setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async () => {
    if (!editForm.name.trim()) return;
    try {
      if (isAdding) {
        const id = crypto.randomUUID().replace(/-/g, '').substring(0, 16);
        await setDoc(doc(db, 'divisions', id), {
          name: editForm.name,
          managerId: editForm.managerId || null,
          createdAt: new Date(),
          updatedAt: new Date()
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, `divisions/${id}`));
      } else if (editingDocId) {
        await updateDoc(doc(db, 'divisions', editingDocId), {
          name: editForm.name,
          managerId: editForm.managerId || null,
          updatedAt: new Date()
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `divisions/${editingDocId}`));
      }
      setIsAdding(false);
      setEditingDocId(null);
      setEditForm({ name: '', managerId: '' });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const managers = users.filter(u => u.role === 'manager' || u.role === 'admin');

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Manajemen Divisi</h1>
        <Button onClick={() => { setIsAdding(true); setEditingDocId(null); setEditForm({name: '', managerId: ''}) }}>
          Tambah Divisi
        </Button>
      </header>

      <div className="p-8 flex-1 overflow-auto">
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Nama Divisi</th>
                <th className="px-6 py-4">Manajer</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isAdding && (
                <tr className="bg-blue-50">
                  <td className="px-6 py-4">
                    <Input placeholder="Nama Divisi" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  </td>
                  <td className="px-6 py-4">
                    <Select value={editForm.managerId} onChange={e => setEditForm({...editForm, managerId: e.target.value})}>
                      <option value="">-- Pilih Manajer --</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Batal</Button>
                    <Button size="sm" onClick={handleSave}>Simpan</Button>
                  </td>
                </tr>
              )}
              {loading ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Memuat data...</td></tr>
              ) : divisions.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  {editingDocId === d.id ? (
                    <>
                      <td className="px-6 py-4">
                        <Input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                      </td>
                      <td className="px-6 py-4">
                        <Select value={editForm.managerId} onChange={e => setEditForm({...editForm, managerId: e.target.value})}>
                          <option value="">-- Pilih Manajer --</option>
                          {managers.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </Select>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => setEditingDocId(null)}>Batal</Button>
                        <Button size="sm" onClick={handleSave}>Simpan</Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 font-medium text-slate-900">{d.name}</td>
                      <td className="px-6 py-4">
                        {users.find(u => u.id === d.managerId)?.name || <span className="text-slate-400 italic">Belum ada</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button size="sm" variant="outline" onClick={() => {
                          setEditingDocId(d.id);
                          setEditForm({ name: d.name, managerId: d.managerId || '' });
                          setIsAdding(false);
                        }}>Edit</Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
