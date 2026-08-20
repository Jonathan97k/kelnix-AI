import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getProjectEditorStorageKey } from '../editor/editorState';

const FALLBACK_USER_ID = '00000000-0000-0000-0000-000000000001';

async function getCurrentUserId(): Promise<string> {
  if (!isSupabaseConfigured || !supabase) return FALLBACK_USER_ID;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? user.id : FALLBACK_USER_ID;
  } catch {
    return FALLBACK_USER_ID;
  }
}

export interface ProjectRecord {
  id: string;
  userId: string;
  businessId?: string | null;
  title: string;
  description?: string;
  contentType: string;
  status: 'draft' | 'generating' | 'ready' | 'scheduled' | 'published' | 'failed';
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToProject(row: any): ProjectRecord {
  return {
    id: row.id,
    userId: row.user_id,
    businessId: row.business_id,
    title: row.title,
    description: row.description || '',
    contentType: row.content_type || 'video',
    status: row.status || 'draft',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const projectService = {
  async getMyProjects(): Promise<ProjectRecord[]> {
    return this.getProjects();
  },

  async getProjects(): Promise<ProjectRecord[]> {
    if (!isSupabaseConfigured || !supabase) {
      try {
        const local = localStorage.getItem('kelnix_projects_v1');
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }

    try {
      const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
      if (error || !data) {
        const local = localStorage.getItem('kelnix_projects_v1');
        return local ? JSON.parse(local) : [];
      }
      return data.map(mapDbToProject);
    } catch {
      const local = localStorage.getItem('kelnix_projects_v1');
      return local ? JSON.parse(local) : [];
    }
  },

  async getProject(id: string): Promise<ProjectRecord | null> {
    if (!isSupabaseConfigured || !supabase) {
      const projects = await this.getProjects();
      return projects.find(p => p.id === id) || null;
    }
    try {
      const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
      if (error || !data) return null;
      return mapDbToProject(data);
    } catch {
      return null;
    }
  },

  async createProject(project: Omit<ProjectRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<ProjectRecord> {
    const userId = await getCurrentUserId();
    const newRow = {
      user_id: userId,
      business_id: project.businessId || null,
      title: project.title || 'Untitled Project',
      description: project.description || '',
      content_type: project.contentType || 'video',
      status: project.status || 'draft',
    };

    if (!isSupabaseConfigured || !supabase) {
      const created: ProjectRecord = {
        id: 'proj-' + Date.now(),
        userId,
        businessId: project.businessId,
        title: project.title,
        description: project.description,
        contentType: project.contentType || 'video',
        status: project.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = await this.getProjects();
      localStorage.setItem('kelnix_projects_v1', JSON.stringify([created, ...all]));
      return created;
    }

    try {
      const { data, error } = await supabase.from('projects').insert(newRow).select().single();
      if (error || !data) throw new Error(error?.message || 'Failed to create project');
      const res = mapDbToProject(data);
      const all = await this.getProjects();
      localStorage.setItem('kelnix_projects_v1', JSON.stringify([res, ...all]));
      return res;
    } catch {
      const created: ProjectRecord = {
        id: 'proj-' + Date.now(),
        userId,
        businessId: project.businessId,
        title: project.title,
        description: project.description,
        contentType: project.contentType || 'video',
        status: project.status || 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const all = await this.getProjects();
      localStorage.setItem('kelnix_projects_v1', JSON.stringify([created, ...all]));
      return created;
    }
  },

  async updateProject(id: string, updates: Partial<ProjectRecord>): Promise<ProjectRecord> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.contentType !== undefined) dbUpdates.content_type = updates.contentType;
    if (updates.businessId !== undefined) dbUpdates.business_id = updates.businessId;

    if (!isSupabaseConfigured || !supabase) {
      const all = await this.getProjects();
      let updatedProj: ProjectRecord = all.find(p => p.id === id) || {
        id, userId: FALLBACK_USER_ID, title: updates.title || 'Untitled', contentType: 'video', status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      updatedProj = { ...updatedProj, ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('kelnix_projects_v1', JSON.stringify(all.map(p => p.id === id ? updatedProj : p)));
      return updatedProj;
    }

    try {
      const { data, error } = await supabase.from('projects').update(dbUpdates).eq('id', id).select().single();
      if (error || !data) throw new Error(error?.message || 'Failed to update project');
      const res = mapDbToProject(data);
      const all = await this.getProjects();
      localStorage.setItem('kelnix_projects_v1', JSON.stringify(all.map(p => p.id === id ? res : p)));
      return res;
    } catch {
      const all = await this.getProjects();
      let updatedProj = all.find(p => p.id === id)!;
      updatedProj = { ...updatedProj, ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('kelnix_projects_v1', JSON.stringify(all.map(p => p.id === id ? updatedProj : p)));
      return updatedProj;
    }
  },

  async deleteProject(id: string): Promise<void> {
    const all = await this.getProjects();
    localStorage.setItem('kelnix_projects_v1', JSON.stringify(all.filter(p => p.id !== id)));
    if (isSupabaseConfigured && supabase) {
      await supabase.from('projects').delete().eq('id', id);
    }
  },

  /**
   * Loads the editor state for a specific project.
   */
  async getEditorState(projectId: string): Promise<any | null> {
    if (!isSupabaseConfigured || !supabase) {
      try {
        return JSON.parse(localStorage.getItem(getProjectEditorStorageKey(projectId)) || 'null');
      } catch {
        return null;
      }
    }

    try {
      const { data, error } = await supabase.from('project_editor_state').select('state').eq('project_id', projectId).single();
      if (error || !data) return null;
      return data.state;
    } catch {
      try {
        return JSON.parse(localStorage.getItem(getProjectEditorStorageKey(projectId)) || 'null');
      } catch {
        return null;
      }
    }
  },

  /**
   * Saves the editor state for a specific project.
   */
  async saveEditorState(projectId: string, state: any): Promise<void> {
    if (!isSupabaseConfigured || !supabase) {
      localStorage.setItem(getProjectEditorStorageKey(projectId), JSON.stringify(state));
      return;
    }

    try {
      const { error } = await supabase.from('project_editor_state').upsert({
        project_id: projectId,
        state: state,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
    } catch (e) {
      console.error('Failed to save project editor state', e);
      localStorage.setItem(getProjectEditorStorageKey(projectId), JSON.stringify(state));
    }
  }
};
