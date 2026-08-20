import React from 'react';
import { 
  Users, 
  Upload, 
  MessageSquare,
  Globe,
  Folder,
  BarChart3,
  Settings,
  Sparkles, 
  Image, 
  Moon,
  Film
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  onToggleCollapse, 
  onNavigate, 
  currentPath 
}) => {
  const navItems: Array<{ name: string; icon: React.ComponentType<any>; href: string }> = [
    { name: 'Dashboard', icon: Users, href: '/dashboard' },
    { name: 'Create', icon: Upload, href: '/create' },
    { name: 'Editor', icon: Film, href: '/editor' },
    { name: 'Businesses', icon: Globe, href: '/businesses' },
    { name: 'Content', icon: Folder, href: '/content' },
    { name: 'Media Library', icon: Image, href: '/media' },
    { name: 'Analytics', icon: BarChart3, href: '/analytics' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside className={`flex-shrink-0 w-16 lg:w-64 bg-slate-900/50 backdrop-blur-sm border-r border-slate-800/50 
      transition-all duration-300 ${isCollapsed ? 'lg:w-16' : ''} overflow-hidden`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-blue-500 p-0.5">
            <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className={isCollapsed ? 'hidden' : 'text-lg font-bold text-white tracking-tight'}>
            Kelnix AI
          </span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          title="Toggle Sidebar"
        >
          {isCollapsed ? (
            <Users className="w-4 h-4" />
          ) : (
            <MessageSquare className="w-4 h-4" />
          )}
        </button>
      </div>

      <nav className="mt-6 space-y-1">
        {navItems.map((item, index) => {
          const isActive = currentPath === item.href;
          return (
            <button
              key={index}
              onClick={() => onNavigate(item.href)}
              className={`flex items-center gap-3 w-full px-4 py-3 text-left text-base font-medium 
                transition-all duration-200 ${isActive ? 
                  'bg-emerald-900/20 text-emerald-300 border-l-4 border-emerald-500' : 
                  'hover:bg-slate-800/50 hover:text-white'}`}
            >
              {item.icon && (
                <div className="w-5 h-5 flex items-center justify-center">
                  <item.icon className="w-4 h-4" />
                </div>
              )}
              {(!isCollapsed) && (
                <span className="flex-1">{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pb-4 border-t border-slate-800/50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Moon className="w-3 h-3 text-emerald-400" />
            </div>
            <span className={isCollapsed ? 'hidden' : 'block'}>Dark Mode</span>
          </div>
          <div className="w-2 h-2 bg-slate-400 rounded-full" />
        </div>
      </div>
    </aside>
  );
};