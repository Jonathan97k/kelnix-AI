import React, { useEffect, useState } from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProjectRecord, projectService } from '../services/projects/projectService';

const Content: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  useEffect(() => { projectService.getMyProjects().then(setProjects).catch(() => setProjects([])); }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header><h1 className="text-3xl font-bold text-white">Content</h1><p className="mt-1 text-slate-400">Review every project and continue editing where you left off.</p></header>
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center text-slate-400">No content projects yet.</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
          {projects.map((project) => (
            <button key={project.id} onClick={() => navigate(`/editor?project=${project.id}`)} className="flex w-full items-center gap-4 border-b border-slate-800 p-4 text-left last:border-b-0 hover:bg-slate-800/60">
              <FileText className="h-5 w-5 text-emerald-400" />
              <span className="flex-1"><strong className="block text-white">{project.title}</strong><small className="text-slate-500">{project.contentType} · {project.status}</small></span>
              <ExternalLink className="h-4 w-4 text-slate-500" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Content;
