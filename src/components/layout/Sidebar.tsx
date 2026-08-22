import React from 'react';
import {
  Home,
  FolderOpen,
  Film,
  Globe,
  Image,
  BarChart3,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isExpanded,
  onToggleExpand,
  onNavigate,
  currentPath,
}) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, href: '/dashboard' },
    { name: 'Create', icon: Sparkles, href: '/create' },
    { name: 'Editor', icon: Film, href: '/editor' },
    { name: 'Businesses', icon: Globe, href: '/businesses' },
    { name: 'Content', icon: FolderOpen, href: '/content' },
    { name: 'Media', icon: Image, href: '/media' },
    { name: 'Analytics', icon: BarChart3, href: '/analytics' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <aside
      className={`
        hidden md:flex flex-col h-full bg-[#1A1D27] border-r border-[#2E3140]
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-[220px]' : 'w-[64px]'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-[48px] border-b border-[#2E3140] ${isExpanded ? 'px-4' : 'px-3 justify-center'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#6C5CE7] flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {isExpanded && (
            <span className="text-sm font-semibold text-[#F0F0F5] whitespace-nowrap">
              KELNIX AI
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = currentPath === item.href || 
            (item.href === '/dashboard' && currentPath === '/');
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`
                flex items-center w-full transition-all duration-150
                ${isExpanded ? 'px-4 gap-3' : 'px-0 justify-center'}
                ${isActive ? 'h-[40px]' : 'h-[36px]'}
                ${isActive
                  ? 'bg-[#6C5CE7]/15 text-[#6C5CE7] border-l-[3px] border-[#6C5CE7]'
                  : 'text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] border-l-[3px] border-transparent'
                }
              `}
              title={isExpanded ? undefined : item.name}
            >
              <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
              {isExpanded && (
                <span className="text-[13px] font-medium truncate">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-[#2E3140] p-2">
        <button
          onClick={onToggleExpand}
          className="flex items-center justify-center w-full h-[32px] rounded-md text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] transition-colors"
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isExpanded ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>
    </aside>
  );
};
