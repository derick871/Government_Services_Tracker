import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function AppLayout({ children, user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeRoute, setActiveRoute] = useState('dashboard');

  const handleSearchTracking = (trackingNum) => {
    console.log(`Executing direct tracking fetch for: ${trackingNum}`);
    // Wire to your API tracking call
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 antialiased font-sans">
      <Navbar 
        user={user} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onSearchTracking={handleSearchTracking}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          activeRoute={activeRoute} 
          setActiveRoute={setActiveRoute}
          userRole={user?.role}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-7xl w-full mx-auto space-y-6">
            {children}
          </div>
          
          <Footer />
        </main>
      </div>
    </div>
  );
} 
