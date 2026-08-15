import React, { useState } from 'react';
import { 
  Search, Bell, User, LogOut, Menu, X, Shield, Building2 
} from 'lucide-react';

export default function Navbar({ user, toggleSidebar, isSidebarOpen, onSearchTracking }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchTracking) {
      onSearchTracking(searchQuery.trim().toUpperCase());
    }
  };

  return 
    <header className="sticky top-0 z-30 h-16 bg-slate-700 border-b border-slate-400 text-white px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* Left: Brand & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="p-2 rounded-lg text-white hover:text-amber-900 hover:bg-amber-500 transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-slate-600 p-2 rounded-lg text-white font-bold">
            <Building2 size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold tracking-wide text-amber-500">County Service Portal</h1>
            <p className="text-[10px] text-white uppercase tracking-wider font-mono">Civic Tracker Engine</p>
          </div>
        </div>
         {/* Center: Global Quick Tracking Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Track status (e.g. TRK-A1B2C3D4)..."
            className="w-full bg-slate-700 border border-grey-200 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-semi-bold transition-all"
          />
        </div>
      </form>
       {/*  Actions, Role Badge & User Context */}
      <div className="flex items-center gap-3">
        {/* Role Badge */}
        <span className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          user?.role === 'OFFICER' 
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
        }`}>
          <Shield size={12} />
          {user?.role || 'CITIZEN'}
        </span>

          {/* Notifications Icon */}
        <button className="relative p-2 rounded-lg text-amber-400 hover:text-amber-100 hover:bg-slate-400 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-amber-900" />
        </button>
        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-400 hover:bg-amber-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-slate-600 flex items-center justify-center font-bold text-xs text-white">
              {user?.email?.charAt(0).toUpperCase() || 'D'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-2 z-50 text-white text-sm">
              <div className="px-4 py-2 border-b border-slate-800">
                <p className="font-medium text-white truncate">{user?.email || 'user@county.go.ke'}</p>
                <p className="text-xs text-white font-mono">County: {user?.county_code || 'Nairobi'}</p>
              </div>
              <a href="#profile" className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 transition-colors">
                <User size={16} /> Profile & Settings
              </a>
              <button 
                onClick={() => console.log('Logout executed')}
                className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>


      