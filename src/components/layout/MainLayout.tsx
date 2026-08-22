import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search,
  Bell,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
  rightPanel?: React.ReactNode;
  showRightPanel?: boolean;
  onToggleRightPanel?: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  rightPanel,
  showRightPanel = false,
  onToggleRightPanel,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const userInitials = profile?.fullName
    ? profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() || 'U';

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-[#0F1117] text-[#F0F0F5]">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[220px] bg-[#1A1D27] transform transition-transform duration-300 md:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar
          isExpanded={true}
          onToggleExpand={() => setMobileMenuOpen(false)}
          onNavigate={handleNavigate}
          currentPath={location.pathname}
        />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar
          isExpanded={sidebarExpanded}
          onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
          onNavigate={handleNavigate}
          currentPath={location.pathname}
        />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Top Bar */}
        <header className="h-[48px] flex items-center justify-between px-4 border-b border-[#2E3140] bg-[#1A1D27]/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className={`
              flex items-center gap-2 px-3 h-[32px] rounded-lg border transition-all duration-200
              ${searchFocused
                ? 'w-[280px] border-[#6C5CE7] bg-[#252833]'
                : 'w-[200px] border-[#2E3140] bg-[#1A1D27]'
              }
            `}>
              <Search className="w-4 h-4 text-[#8B8FA3] flex-shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 bg-transparent text-[13px] text-[#F0F0F5] placeholder-[#8B8FA3] outline-none"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Chat Toggle */}
            {onToggleRightPanel && (
              <button
                onClick={onToggleRightPanel}
                className={`
                  hidden sm:flex items-center gap-2 px-3 h-[32px] rounded-lg text-[13px] font-medium transition-all
                  ${showRightPanel
                    ? 'bg-[#6C5CE7] text-white'
                    : 'text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] border border-[#2E3140]'
                  }
                `}
              >
                <span>AI Assistant</span>
              </button>
            )}

            {/* Notifications */}
            <button className="p-2 rounded-lg text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] transition-colors relative">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00B894] rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#252833] transition-colors"
              >
                <div className="w-[28px] h-[28px] rounded-full bg-[#6C5CE7] flex items-center justify-center text-[11px] font-semibold text-white">
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    userInitials
                  )}
                </div>
                <ChevronDown className="w-3 h-3 text-[#8B8FA3] hidden sm:block" />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-[200px] bg-[#1A1D27] border border-[#2E3140] rounded-lg shadow-xl z-50 py-1">
                    <div className="px-3 py-2 border-b border-[#2E3140]">
                      <p className="text-[13px] font-medium text-[#F0F0F5] truncate">
                        {profile?.fullName || 'User'}
                      </p>
                      <p className="text-[11px] text-[#8B8FA3] truncate">
                        {user?.email}
                      </p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-3 py-2 text-[13px] text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex min-h-0 overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* Right Panel (AI Chat) */}
          {rightPanel && (
            <div className={`
              hidden lg:block border-l border-[#2E3140] bg-[#1A1D27]
              transition-all duration-300 flex-shrink-0
              ${showRightPanel ? 'w-[380px]' : 'w-0 overflow-hidden'}
            `}>
              {showRightPanel && rightPanel}
            </div>
          )}
        </div>
      </div>

      {/* Mobile AI Chat Overlay */}
      {rightPanel && showRightPanel && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onToggleRightPanel}
          />
          <div className="ml-auto w-full max-w-[380px] bg-[#1A1D27] relative z-10 flex flex-col">
            <button
              onClick={onToggleRightPanel}
              className="absolute top-3 left-3 p-1.5 rounded-lg text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#252833] transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            {rightPanel}
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
