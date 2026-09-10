import React from 'react';
import { 
  LayoutDashboard, FilePlus, Search, Megaphone, ShieldCheck, 
  Settings, ChevronRight, HelpCircle
} from 'lucide-react';

export default function Sidebar({ isOpen, activeRoute, setActiveRoute, userRole }) {
  // Navigation mapping tailored to operational roles
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['CITIZEN', 'OFFICER'] },
    { id: 'new-application', label: 'New Application', icon: FilePlus, roles: ['CITIZEN'] },
    { id: 'track-status', label: 'Track Applications', icon: Search, roles: ['CITIZEN', 'OFFICER'] },
    { id: 'notices', label: 'County Tenders & Notices', icon: Megaphone, roles: ['CITIZEN', 'OFFICER'] },
    { id: 'officer-queue', label: 'FSM Verification Queue', icon: ShieldCheck, roles: ['OFFICER'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['CITIZEN', 'OFFICER'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(userRole || 'CITIZEN'));

  return(
    <div 
      className={`fixed lg:static top-16 left-0 z-20 h-[calc(100vh-4rem)] bg-slate-700 border-r border-slate-400 text-white transition-all duration-300 flex flex-col justify-between ${
        isOpen ? 'w-64' : 'w-0 lg:w-20 overflow-hidden'
      }`}
    >
      {/* Navigation Group */}
      <div className="p-3 space-y-1">
        <p className={`text-[10px] uppercase font-bold tracking-wider text-amber-700 px-3 py-2 ${!isOpen && 'lg:hidden'}`}>
          Main Navigation
        </p>

        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeRoute === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.id)}
              className={`w-half flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive 
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
