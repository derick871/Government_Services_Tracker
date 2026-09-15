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
    <div
      className={`fixed lg:static top-16 left-0 z-20 h-[calc(100vh-4rem)] bg-slate-700 border-r border-slate-400 text-white transition-all duration-300 flex flex-col justify-between ${isOpen ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
        }`}
    >
      {/* Navigation Group */}
      <div className="p-3 space-y-1">
        <p className={`text-[10px] uppercase font-bold tracking-wider text-amber-700 px-3 py-2 ${!isOpen && 'lg:hidden'}`}>
          Main Navigation
        </p>

        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                closeSidebar();
              }}
              className={`w-half flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30'
                : 'text-white hover:text-amber-100 hover:bg-slate-500'
                }`}
            >
              <Icon size={18} className={isActive ? 'text-amber-400' : 'text-amber-400'} />
              <span className={`truncate ${!isOpen && 'lg:hidden'}`}>{item.label}</span>
              {isActive && isOpen && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Help / Support Block */}
      <div className="p-3 border-t border-slate-800">
        <button
          className="w-half flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:text-amber-100 hover:bg-slate-800 transition-colors"
        >
          <HelpCircle size={18} />
          <span className={`${!isOpen && 'lg:hidden'}`}>Help & Documentation</span>
        </button>
      </div>
    </div>
  );
}
