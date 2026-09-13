import { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppLayout({ user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchTracking = useCallback((trackingNum) => {
    if (!trackingNum?.trim()) return;
    // This will hit /applications/:tracking_number route
    navigate(`/applications/${trackingNum.trim()}`);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans selection:bg-indigo-500/30">
      <Navbar 
        user={user} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(v => !v)} 
        onSearchTracking={handleSearchTracking}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          // activeRoute is now derived inside Sidebar from useLocation()
          userRole={user?.role}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950 relative">
          {/* Page content layer */}
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-4 md:p-6 lg:p-8">
              <div className="max-w-7xl w-full mx-auto">
                <Outlet context={{ user }} />
              </div>
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}