import React from 'react';
import { Sidebar } from './Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar 
        isCollapsed={isCollapsed} 
        onToggleCollapse={handleToggleCollapse}
        onNavigate={handleNavigate}
        currentPath={location.pathname}
      />
      <div className="flex-1 flex flex-col">
        {/* Top Area */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/50 bg-slate-900/50">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">
              Dashboard
            </h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-32 px-3 py-1 rounded-lg text-sm bg-slate-800 border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405a2.032 2.032 0 01-.495-1.063l1.03-1.031A2.032 2.032 0 0119 14l1.49-1.465a2.032 2.032 0 011.049-.415l1.458-1.409a2.032 2.032 0 011.415 1.063l-1.032 1.036a2.032 2.032 0 01-.495 1.063L18 19l-1.405 1.405a2.032 2.032 0 01-1.063.495l-1.036 1.032a2.032 2.032 0 01-1.495.495l-.495 1.031z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c9.52 0 17.224-7.718 17.224-17.224 0-.388-.01-.776-.028-1.16A8.978 8.978 0 0016 5.08a8.978 8.978 0 01-3.298 2.272l-.045.03a4.48 4.48 0 00-5.87 2.46c-.37.09-.693.27-1.01.524A5.972 5.972 0 004.762 10.49a8.978 8.978 0 002.603 7.04 8.978 8.978 0 01-.496 3.105A12.017 12.017 0 015.121 17.804z" />
                  </svg>
                  <span className="hidden ml-2">Profile</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4H5m6 0h12a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2 2v-6a2 2 0 012-2zm8 0v3a2 2 0 01-2 2H6a2 2 0 01-2 2v-3a1 1 0 011-1h11a1 1 0 011 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;