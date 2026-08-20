import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, ProjectRecord } from '../services/projects/projectService';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  useEffect(() => {
    projectService.getMyProjects().then(setProjects).catch((error) => {
      console.error('Failed to load dashboard projects', error);
    });
  }, []);

  const recentProjects = projects.slice(0, 5);
  const contentOverview = {
    projects: projects.length,
    videosCreated: projects.filter((project) => ['ready', 'published'].includes(project.status)).length,
    scheduled: projects.filter((project) => project.status === 'scheduled').length,
    published: projects.filter((project) => project.status === 'published').length,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* The Sidebar will be provided by MainLayout */}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405a2.032 2.032 0 01-.495-1.063l1.03-1.031A2.032 2.032 0 0119 14l1.49-1.465a2.032 2.032 0 011.049-.415l1.458-1.409a2.032 2.032 0 01.415 1.063l-1.032 1.036a2.032 2.032 0 01-.495 1.063L18 19l-1.405 1.405a2.032 2.032 0 01-1.063.495l-1.036 1.032a2.032 2.032 0 01-1.495.495l-.495 1.031z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </button>
                <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c9.52 0 17.224-7.718 17.224-17.224 0-.388-.01-.776-.028-1.16A8.978 8.978 0 0016 5.08a8.978 8.978 0 01-3.298 2.272l-.045.03a4.48 4.48 0 00-5.87 2.46c-.37.09-.693.27-1.01.524A5.972 5.972 0 014.762 10.49a8.978 8.978 0 002.603 7.04 8.978 8.978 0 01-.496 3.105A12.017 12.017 0 015.121 17.804z" />
                  </svg>
                  <span className="hidden ml-2">Profile</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4H5m6 0h12a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2zm8 0v3a2 2 0 01-2 2H6a2 2 0 01-2-2v-3a1 1 0 011-1h11a1 1 0 011 1z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {/* Greeting Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome to Kelnix AI
            </h2>
            <p className="text-slate-400 text-lg">
              Create smarter content. Grow your business.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="mb-6">
            <button
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>+ Create Content</span>
            </button>
          </div>

          {/* Content Creation Cards */}
          <div className="grid gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Promotional Video */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-center h-16 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19l6-3V9l-6 3Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Promotional Video</h3>
              <p className="text-slate-400 text-sm">
                Create an AI-powered advertisement for a business or product.
              </p>
            </div>

            {/* Social Media Reel */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-center h-16 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Social Media Reel</h3>
              <p className="text-slate-400 text-sm">
                Create short engaging content for Facebook, Instagram or TikTok.
              </p>
            </div>

            {/* Product Advertisement */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-center h-16 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3-6 4-6-4 3-3V8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Product Advertisement</h3>
              <p className="text-slate-400 text-sm">
                Turn product information and images into a professional promotional video.
              </p>
            </div>

            {/* Story Video */}
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-center h-16 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 2L3 2l2 10h2l5 5V4l5 5h2l2-10H13Z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white mb-2">Story Video</h3>
              <p className="text-slate-400 text-sm">
                Create cinematic or engaging story-based video content.
              </p>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="mb-8">
            <h3 className="font-semibold text-white mb-4">Recent Projects</h3>
            <div className="space-y-4">
              {recentProjects.length === 0 ? (
                <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-dashed border-slate-800/50 text-slate-400">
                  No projects yet. Create your first AI reel to get started.
                </div>
              ) : recentProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/editor?project=${project.id}`)}
                  className="w-full text-left bg-slate-900/50 backdrop-blur-sm rounded-xl p-4 border border-slate-800/50 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="text-white">{project.title}</h4>
                      <p className="text-slate-400 text-xs">{new Date(project.updatedAt).toLocaleDateString()} · {project.status}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3-6 4-6-4 3-3V8z" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Overview */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 text-center">
              <h3 className="text-2xl font-bold text-emerald-400">{contentOverview.projects}</h3>
              <p className="text-slate-400">Projects</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 text-center">
              <h3 className="text-2xl font-bold text-emerald-400">{contentOverview.videosCreated}</h3>
              <p className="text-slate-400">Videos Created</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 text-center">
              <h3 className="text-2xl font-bold text-emerald-400">{contentOverview.scheduled}</h3>
              <p className="text-slate-400">Scheduled</p>
            </div>
            <div className="bg-slate-900/50 backdrop-blur-sm rounded-xl p-6 border border-slate-800/50 text-center">
              <h3 className="text-2xl font-bold text-emerald-400">{contentOverview.published}</h3>
              <p className="text-slate-400">Published</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;