import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, ProjectRecord } from '../services/projects/projectService';
import {
  Plus,
  Clock,
  Film,
  Globe,
  BarChart3,
  ArrowRight,
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);

  useEffect(() => {
    projectService.getMyProjects().then(setProjects).catch((error) => {
      console.error('Failed to load dashboard projects', error);
    });
  }, []);

  const recentProjects = projects.slice(0, 5);
  const stats = {
    total: projects.length,
    draft: projects.filter((p) => p.status === 'draft').length,
    ready: projects.filter((p) => p.status === 'ready').length,
    published: projects.filter((p) => p.status === 'published').length,
  };

  return (
    <div className="p-6 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[24px] font-semibold text-[#F0F0F5] mb-1">
          Welcome back
        </h1>
        <p className="text-[14px] text-[#8B8FA3]">
          Create smarter content. Grow your business.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/create')}
          className="flex items-center gap-3 px-5 py-3 rounded-xl bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white font-medium text-[14px] transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Reel</span>
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#1A1D27] border border-[#2E3140] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#6C5CE7]/15 flex items-center justify-center">
              <Film className="w-5 h-5 text-[#6C5CE7]" />
            </div>
            <div>
              <p className="text-[20px] font-semibold text-[#F0F0F5]">{stats.total}</p>
              <p className="text-[12px] text-[#8B8FA3]">Total Projects</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D27] border border-[#2E3140] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#F0F0F5]/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-[#8B8FA3]" />
            </div>
            <div>
              <p className="text-[20px] font-semibold text-[#F0F0F5]">{stats.draft}</p>
              <p className="text-[12px] text-[#8B8FA3]">Drafts</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D27] border border-[#2E3140] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00B894]/15 flex items-center justify-center">
              <Globe className="w-5 h-5 text-[#00B894]" />
            </div>
            <div>
              <p className="text-[20px] font-semibold text-[#F0F0F5]">{stats.ready}</p>
              <p className="text-[12px] text-[#8B8FA3]">Ready</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1A1D27] border border-[#2E3140] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#6C5CE7]/15 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-[#6C5CE7]" />
            </div>
            <div>
              <p className="text-[20px] font-semibold text-[#F0F0F5]">{stats.published}</p>
              <p className="text-[12px] text-[#8B8FA3]">Published</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-[#F0F0F5]">Recent Projects</h2>
          {projects.length > 0 && (
            <button
              onClick={() => navigate('/content')}
              className="text-[13px] text-[#6C5CE7] hover:text-[#8B7BF0] transition-colors"
            >
              View all
            </button>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="bg-[#1A1D27] border border-dashed border-[#2E3140] rounded-xl p-8 text-center">
            <Film className="w-10 h-10 text-[#8B8FA3]/30 mx-auto mb-3" />
            <p className="text-[14px] text-[#8B8FA3] mb-4">
              No projects yet. Create your first AI reel to get started.
            </p>
            <button
              onClick={() => navigate('/create')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#6C5CE7] hover:bg-[#5A4BD6] text-white text-[13px] font-medium transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/editor?project=${project.id}`)}
                className="w-full text-left bg-[#1A1D27] border border-[#2E3140] rounded-xl p-4 hover:border-[#6C5CE7]/50 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#252833] flex items-center justify-center flex-shrink-0 group-hover:bg-[#6C5CE7]/15 transition-colors">
                    <Film className="w-5 h-5 text-[#8B8FA3] group-hover:text-[#6C5CE7] transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[14px] font-medium text-[#F0F0F5] truncate">
                      {project.title}
                    </h3>
                    <p className="text-[12px] text-[#8B8FA3]">
                      {new Date(project.updatedAt).toLocaleDateString()} · {project.status}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#8B8FA3] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
