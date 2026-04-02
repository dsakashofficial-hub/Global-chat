import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { 
  MessageSquare, 
  Globe, 
  User, 
  Settings, 
  LogOut, 
  Search,
  Bell
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navItems = [
    { icon: MessageSquare, label: 'Chats', path: '/' },
    { icon: Globe, label: 'Global', path: '/global' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-20 md:w-64 flex flex-col border-r border-white/5 glass-dark">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary p-2 rounded-xl text-white">
            <MessageSquare size={24} />
          </div>
          <span className="hidden md:block font-bold text-xl tracking-tight">Messenger</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-4 p-3 rounded-xl transition-all group",
                isActive ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon size={24} />
              <span className="hidden md:block font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-4">
          <div className="hidden md:flex items-center gap-3 p-2 rounded-xl bg-white/5">
            <img 
              src={profile?.photoURL} 
              alt="Profile" 
              className="w-10 h-10 rounded-full object-cover border border-white/10"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{profile?.username}</p>
              <p className="text-xs text-slate-500 truncate">Online</p>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
          >
            <LogOut size={24} />
            <span className="hidden md:block font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 glass">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search conversations..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="md:hidden">
              <img 
                src={profile?.photoURL} 
                alt="Profile" 
                className="w-8 h-8 rounded-full border border-white/10"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
