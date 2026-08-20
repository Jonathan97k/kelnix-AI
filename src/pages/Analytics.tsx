import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { ProjectRecord, projectService } from '../services/projects/projectService';

const Analytics: React.FC = () => {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  useEffect(() => { projectService.getMyProjects().then(setProjects).catch(() => setProjects([])); }, []);
  const counts = useMemo(() => projects.reduce<Record<string, number>>((result, project) => ({ ...result, [project.status]: (result[project.status] || 0) + 1 }), {}), [projects]);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header><h1 className="text-3xl font-bold text-white">Analytics</h1><p className="mt-1 text-slate-400">A lightweight view of your current project pipeline.</p></header>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {['draft', 'ready', 'scheduled', 'published'].map((status) => <div key={status} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"><BarChart3 className="mb-4 h-5 w-5 text-emerald-400" /><p className="text-3xl font-bold text-white">{counts[status] || 0}</p><p className="mt-1 text-sm capitalize text-slate-400">{status} projects</p></div>)}
      </div>
    </div>
  );
};

export default Analytics;
