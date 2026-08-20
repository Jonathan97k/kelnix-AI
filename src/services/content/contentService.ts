import { supabase, isSupabaseConfigured } from '../../lib/supabase';

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

export interface GeneratedContentRecord {
  id: string;
  projectId: string;
  userId: string;
  script?: string;
  caption?: string;
  hashtags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scenePrompts?: any[];
  voiceScript?: string;
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToContent(row: any): GeneratedContentRecord {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    script: row.script || '',
    caption: row.caption || '',
    hashtags: row.hashtags || [],
    scenePrompts: row.scene_prompts || [],
    voiceScript: row.voice_script || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const contentService = {
  async getGeneratedContent(projectId: string) {
    if (!isSupabaseConfigured || !supabase) {
      try {
        const local = localStorage.getItem('kelnix_content_v1');
        const all: GeneratedContentRecord[] = local ? JSON.parse(local) : [];
        return all.find(c => c.projectId === projectId) || null;
      } catch {
        return null;
      }
    }

    try {
      const { data, error } = await supabase.from('generated_content').select('*').eq('project_id', projectId).single();
      if (error || !data) return null;
      return mapDbToContent(data);
    } catch {
      return null;
    }
  },


  async saveGeneratedContent(content: Omit<GeneratedContentRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<GeneratedContentRecord> {
    const userId = await getCurrentUserId();
    const newRow = {
      project_id: content.projectId,
      user_id: userId,
      script: content.script || '',
      caption: content.caption || '',
      hashtags: content.hashtags || [],
      scene_prompts: content.scenePrompts || [],
      voice_script: content.voiceScript || '',
    };

    if (!isSupabaseConfigured || !supabase) {
      const local = localStorage.getItem('kelnix_content_v1');
      const all: GeneratedContentRecord[] = local ? JSON.parse(local) : [];
      const existingIndex = all.findIndex(c => c.projectId === content.projectId);
      const now = new Date().toISOString();
      let saved: GeneratedContentRecord;
      if (existingIndex >= 0) {
        saved = { ...all[existingIndex], ...content, updatedAt: now };
        all[existingIndex] = saved;
      } else {
        saved = { id: 'content-' + Date.now(), userId, ...content, createdAt: now, updatedAt: now };
        all.push(saved);
      }
      localStorage.setItem('kelnix_content_v1', JSON.stringify(all));
      return saved;
    }

    try {
      const existing = await this.getGeneratedContent(content.projectId);
      let data, error;
      if (existing) {
        const res = await supabase.from('generated_content').update({
          script: content.script, caption: content.caption, hashtags: content.hashtags, scene_prompts: content.scenePrompts, voice_script: content.voiceScript
        }).eq('id', existing.id).select().single();
        data = res.data; error = res.error;
      } else {
        const res = await supabase.from('generated_content').insert(newRow).select().single();
        data = res.data; error = res.error;
      }
      if (error || !data) throw new Error(error?.message || 'Failed to save generated content');
      return mapDbToContent(data);
    } catch {
      const now = new Date().toISOString();
      return { id: 'content-' + Date.now(), userId, ...content, createdAt: now, updatedAt: now };
    }
  },

  async updateGeneratedContent(id: string, updates: Partial<GeneratedContentRecord>): Promise<GeneratedContentRecord> {
    const dbUpdates: Record<string, unknown> = {};
    if (updates.script !== undefined) dbUpdates.script = updates.script;
    if (updates.caption !== undefined) dbUpdates.caption = updates.caption;
    if (updates.hashtags !== undefined) dbUpdates.hashtags = updates.hashtags;
    if (updates.scenePrompts !== undefined) dbUpdates.scene_prompts = updates.scenePrompts;
    if (updates.voiceScript !== undefined) dbUpdates.voice_script = updates.voiceScript;

    if (!isSupabaseConfigured || !supabase) {
      const local = localStorage.getItem('kelnix_content_v1');
      const all: GeneratedContentRecord[] = local ? JSON.parse(local) : [];
      let updated: GeneratedContentRecord = all.find(c => c.id === id) || {
        id, projectId: 'proj-1', userId: FALLBACK_USER_ID, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      };
      updated = { ...updated, ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('kelnix_content_v1', JSON.stringify(all.map(c => c.id === id ? updated : c)));
      return updated;
    }

    try {
      const { data, error } = await supabase.from('generated_content').update(dbUpdates).eq('id', id).select().single();
      if (error || !data) throw new Error(error?.message || 'Failed to update generated content');
      return mapDbToContent(data);
    } catch {
      throw new Error('Failed to update generated content');
    }
  }
};
