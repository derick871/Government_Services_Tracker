 import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Bell, User, LogOut, Menu, X, Shield, Building2, LogIn 
} from 'lucide-react';

export default function Navbar({ user, toggleSidebar, isSidebarOpen, onSearchTracking, onLogout }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchTracking) {
      onSearchTracking(searchQuery.trim().toUpperCase());
    }
  };

  const handleSignOutClick = () => {
    setShowProfileMenu(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("access");
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-800 border-b border-slate-700 text-white px-4 md:px-6 flex items-center justify-between shadow-sm">
      {/* Left: Brand & Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        {user && (
          <button
            onClick={toggleSidebar}
            aria-label="Toggle Navigation Sidebar"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="bg-amber-500/10 text-amber-400 p-2 rounded-lg font-bold border border-amber-500/20">
            <Building2 size={20} />
          </div>
          <div className="hidden sm:block">
            <Link to="/" className="text-sm font-semibold tracking-wide text-amber-400 hover:underline">
              County Service Portal
            </Link>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Civic Tracker Engine</p>
          </div>
        </div>
      </div>

      {/* Center: Global Quick Tracking Input */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Track status (e.g. TRK-B12CKP5)..."
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>
      </form>

      {/* Right Actions / Authentication Profile Menu */}
      <div className="flex items-center gap-3">
        {user ? (
          <>
            {/* Role Badge */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20">
              <Shield size={12} />
              {user?.role || 'CITIZEN'}
            </span>

            {/* Notifications Icon */}
            <button className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            {/* User Profile Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-600 hover:bg-slate-700 transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-2 z-50 text-white text-sm">
                  <div className="px-4 py-2 border-b border-slate-800">
                    <p className="font-medium text-white truncate">{user?.email}</p>
                    <p className="text-xs text-slate-400 font-mono">County: {user?.county_code || 'Nairobi'}</p>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
                  >
                    <User size={16} /> Profile & Settings
                  </Link>
                  <button 
                    onClick={handleSignOutClick}
                    className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Unauthenticated State: Show Login / Register Links */
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-2 rounded-lg border border-slate-600 transition-all"
            >
              <LogIn size={14} /> Login
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-semibold px-3 py-2 rounded-lg transition-all"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </header> 
  );
}