import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { LayoutDashboard, FileText, Users, Settings, LogOut, CheckSquare, Layers } from 'lucide-react';
import { cn } from './ui/core';

export default function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'manager', 'staff'] },
    { path: '/staff/report/new', icon: FileText, label: 'Buat Laporan', roles: ['staff', 'manager', 'admin'] },
    { path: '/staff', icon: CheckSquare, label: 'Laporan Saya', roles: ['staff', 'manager', 'admin'] },
    { path: '/manager', icon: Users, label: 'Tim Saya', roles: ['manager', 'admin'] },
    { path: '/admin/users', icon: Users, label: 'Manajemen Pengguna', roles: ['admin'] },
    { path: '/admin/divisions', icon: Layers, label: 'Manajemen Divisi', roles: ['admin'] },
  ];

  return (
    <div className="flex h-screen w-screen bg-[#F8F9FA] font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">O</div>
            <span className="text-xl font-bold tracking-tight text-slate-900">OpsFlow</span>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map(
            (item) =>
              profile &&
              item.roles.includes(profile.role) && (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-500 hover:bg-slate-50'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              )
          )}
        </nav>
        <div className="p-4 border-t border-slate-100 shrink-0 space-y-2">
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-2 text-slate-500 hover:bg-slate-50 hover:text-red-600 rounded-xl transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            Keluar
          </button>
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center border-2 border-white uppercase">
              {profile ? getInitials(profile.name) : 'Us'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 truncate w-36">
                {profile?.name}
              </p>
              <p className="text-xs text-slate-500 capitalize">{profile?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
