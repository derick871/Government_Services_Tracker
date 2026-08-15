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
  
}
