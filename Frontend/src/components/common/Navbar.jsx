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