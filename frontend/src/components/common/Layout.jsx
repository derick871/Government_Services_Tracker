import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans selection:bg-indigo-500/30">
      <header>
        <Navbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((open) => !open)}
        />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav aria-label="Primary navigation">
          <Sidebar
            isOpen={isSidebarOpen}
            closeSidebar={() => setIsSidebarOpen(false)}
          />
        </nav>

        <main className="flex-1 overflow-y-auto bg-slate-950 relative">
          <div className="min-h-full flex flex-col">
            <div className="flex-1 p-4 md:p-6 lg:p-8">
              <Outlet />
            </div>
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}