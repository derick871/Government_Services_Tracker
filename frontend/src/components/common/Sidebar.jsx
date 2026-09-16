import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FilePlus, Search, Megaphone, ShieldCheck,
  Settings, ChevronRight, HelpCircle
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

export default function Sidebar({ isOpen, closeSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  // Navigation mapping tailored to operational roles
  const navItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['CITIZEN', 'OFFICER', 'ADMIN'] },
    { id: 'new-application', path: '/applyservice', label: 'New Application', icon: FilePlus, roles: ['CITIZEN'] },
    { id: 'track-status', path: '/trackservice', label: 'Track Applications', icon: Search, roles: ['CITIZEN', 'OFFICER', 'ADMIN'] },
    { id: 'notices', path: '/applyservice', label: 'County Tenders & Notices', icon: Megaphone, roles: ['CITIZEN', 'OFFICER', 'ADMIN'] },
    { id: 'officer-queue', path: '/adminconsole', label: 'FSM Verification Queue', icon: ShieldCheck, roles: ['OFFICER', 'ADMIN'] },
    { id: 'settings', path: '/profile', label: 'Settings', icon: Settings, roles: ['CITIZEN', 'OFFICER', 'ADMIN'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className={`relative shrink-0 transition-[width] duration-300 ${isOpen ? 'lg:w-64' : 'lg:w-20'}`}>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={closeSidebar}
          className="fixed inset-0 top-16 z-30 bg-slate-950/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 top-16 z-40 flex h-[calc(100vh-4rem)] w-72 flex-col justify-between overflow-y-auto border-r border-slate-400 bg-slate-700 text-white shadow-2xl transition-transform duration-300 lg:static lg:top-auto lg:z-auto lg:h-[calc(100vh-4rem)] lg:w-full lg:translate-x-0 lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="p-3 space-y-1">
          <p className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 ${!isOpen && 'lg:hidden'}`}>
            Main Navigation
          </p>

          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  navigate(item.path);
                  closeSidebar();
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${isActive
                  ? 'border border-indigo-500/30 bg-indigo-600/15 text-indigo-400'
                  : 'text-white hover:bg-slate-500 hover:text-amber-100'
                  }`}
              >
                <Icon size={18} className="shrink-0 text-amber-400" />
                <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{item.label}</span>
                {isActive && isOpen && <ChevronRight size={14} className="ml-auto shrink-0 text-indigo-400" />}
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-slate-800 hover:text-amber-100"
          >
            <HelpCircle size={18} className="shrink-0" />
            <span className={`${!isOpen && 'lg:hidden'}`}>Help & Documentation</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
