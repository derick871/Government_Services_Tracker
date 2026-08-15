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
    <header className="sticky top-0 z-30 h-16 bg-slate-900 border-b border-slate-800 text-slate-100 px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* Left: Brand & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold">
            <Building2 size={20} />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-semibold tracking-wide text-slate-100">County Service Portal</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Civic Tracker Engine</p>
          </div>
        </div>