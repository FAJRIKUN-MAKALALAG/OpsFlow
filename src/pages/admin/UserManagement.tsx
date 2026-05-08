import React, { useState } from 'react';
import { Card, Button, Input, Select } from '@/components/ui/core';

// Placeholder data – empty arrays
const dummyUsers = [];
const dummyDivisions = [];

export default function UserManagement() {
  const [users] = useState(dummyUsers);
  const [divisions] = useState(dummyDivisions);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', nik: '', role: 'staff', divisionId: '' });

  const handleEdit = (u: any) => {
    setEditingUserId(u.id);
    setEditForm({ name: u.name || '', nik: u.nik || '', role: u.role || 'staff', divisionId: u.divisionId || '' });
  };

  const handleSave = () => {
    // No persistence – just close edit mode
    setEditingUserId(null);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center px-8 shrink-0">
        <h1 className="text-lg font-semibold text-slate-800">Manajemen Pengguna</h1>
      </header>
      <div className="p-8 flex-1 overflow-auto">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[10px] uppercase text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4">Email / NIK</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Divisi</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Tidak ada data pengguna</td></tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      {editingUserId === u.id ? (
                        <>
                          <td className="px-6 py-4"><Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} /></td>
                          <td className="px-6 py-4">
                            <div className="text-slate-500 text-xs mb-1">{u.email}</div>
                            <Input value={editForm.nik} onChange={e => setEditForm({ ...editForm, nik: e.target.value })} placeholder="NIK" />
                          </td>
                          <td className="px-6 py-4"><Select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="staff">Staff</option>
                          </Select></td>
                          <td className="px-6 py-4"><Select value={editForm.divisionId} onChange={e => setEditForm({ ...editForm, divisionId: e.target.value })}>
                            <option value="">-- Pilih Divisi --</option>
                            {divisions.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                          </Select></td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button size="sm" variant="ghost" onClick={() => setEditingUserId(null)}>Batal</Button>
                            <Button size="sm" onClick={handleSave}>Simpan</Button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-medium text-slate-900">{u.name}</td>
                          <td className="px-6 py-4"><div className="text-slate-900">{u.email}</div><div className="text-slate-500 text-xs">{u.nik || '-'}</div></td>
                          <td className="px-6 py-4 uppercase text-xs font-bold">{u.role}</td>
                          <td className="px-6 py-4">{divisions.find(d => d.id === u.divisionId)?.name || '-'}</td>
                          <td className="px-6 py-4 text-right"><Button size="sm" variant="outline" onClick={() => handleEdit(u)}>Edit</Button></td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
