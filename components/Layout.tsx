import React from 'react';
import { 
  LayoutDashboard, 
  Car, 
  Map as MapIcon, 
  Users, 
  MessageSquare, 
  LogOut, 
  PlusCircle,
  Bell,
  Settings,
  Search
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/UIComponents';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  userEmail: string;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, userEmail, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Özet' },
    { path: '/inventory', icon: Car, label: 'Stok' },
    { path: '/add-vehicle', icon: PlusCircle, label: 'Ekle', special: true },
    { path: '/consignment', icon: MapIcon, label: 'B2B' },
    { path: '/customers', icon: Users, label: 'Müşteri' },
    // Ai Assistant removed from mobile nav for space, kept in sidebar
  ];

  const sidebarItems = [
    ...menuItems,
    { path: '/ai-assistant', icon: MessageSquare, label: 'AI Asistan' }
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden font-sans text-slate-900">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex-col shadow-sm">
        <div className="h-24 flex items-center px-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
              <Car className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">OtoVizyon</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-6">
          <div className="space-y-1.5">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Navigasyon</p>
            {sidebarItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 group",
                    isActive 
                      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon size={20} className={cn(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600")} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-sm font-bold text-white ring-4 ring-slate-50">
              FC
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">Ferhat Cengiz</p>
              <p className="text-xs text-slate-500 truncate font-medium">{userEmail}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onLogout}
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
          >
            <LogOut size={18} className="mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72 h-full relative">
        {/* Top Header (Desktop & Mobile) */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 sm:px-8 z-20 sticky top-0">
          <div className="flex items-center gap-4 lg:hidden">
             {/* Logo for mobile */}
             <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-md">
              <Car className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">OtoVizyon</span>
          </div>

          <div className="hidden lg:flex items-center text-slate-400 bg-white px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm w-96">
            <Search size={18} className="mr-3 text-slate-300" />
            <span className="text-sm font-medium">Araç, müşteri veya plaka ara...</span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
              <Settings size={22} />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-24 sm:p-8 sm:pb-8 scroll-smooth no-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-2 pb-safe z-50 flex justify-between items-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            if (item.special) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative -top-6"
                >
                  <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xl shadow-slate-900/30 transform transition-transform active:scale-95">
                    <PlusCircle size={28} />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center w-12 h-14 space-y-1"
              >
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2}
                  className={cn("transition-colors duration-200", isActive ? "text-slate-900" : "text-slate-300")} 
                />
                <span className={cn("text-[10px] font-bold transition-colors duration-200", isActive ? "text-slate-900" : "text-slate-300")}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Layout;