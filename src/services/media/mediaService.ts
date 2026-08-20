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

export interface MediaAssetRecord {
  id: string;
  userId: string;
  businessId?: string | null;
  projectId?: string | null;
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl?: string;
  publicId?: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UploadOptions {
  businessId?: string;
  projectId?: string;
  folder?: string;
}

export interface UploadValidationResult {
  isValid: boolean;
  error?: string;
}

const FILE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 20 * 1024 * 1024, // 20MB
};

const SUPPORTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/m4a', 'audio/x-m4a'],
};

function mapDbToMedia(row: any): MediaAssetRecord {
  return {
    id: row.id,
    userId: row.user_id,
    businessId: row.business_id,
    projectId: row.project_id,
    name: row.name,
    type: row.type,
    url: row.url || row.secure_url,
    thumbnailUrl: row.thumbnail_url || '',
    publicId: row.public_id,
    resourceType: row.resource_type,
    format: row.format,
    bytes: row.bytes,
    width: row.width,
    height: row.height,
    duration: row.duration,
    metadata: row.metadata || {},
    createdAt: row.created_at,
  };
}

export const mediaService = {
  async validateFile(file: File): Promise<UploadValidationResult> {
    const type = file.type;
    let category: 'image' | 'video' | 'audio' | null = null;

    if (SUPPORTED_TYPES.image.includes(type)) category = 'image';
    else if (SUPPORTED_TYPES.video.includes(type)) category = 'video';
    else if (SUPPORTED_TYPES.audio.includes(type)) category = 'audio';

    if (!category) {
      return { isValid: false, error: 'This file type is not supported.' };
    }

    if (file.size > FILE_LIMITS[category]) {
      const limitMb = FILE_LIMITS[category] / (1024 * 1024);
      return { isValid: false, error: `This file is too large. Maximum size for ${category}s is ${limitMb}MB.` };
    }

    return { isValid: true };
  },

  async getMediaType(file: File): Promise<'image' | 'video' | 'audio'> {
    if (SUPPORTED_TYPES.image.includes(file.type)) return 'image';
    if (SUPPORTED_TYPES.video.includes(file.type)) return 'video';
    return 'audio';
  },

  async getMediaAssets(filters: { businessId?: string; projectId?: string } = {}): Promise<MediaAssetRecord[]> {
    if (!isSupabaseConfigured || !supabase) {
      try {
        const local = localStorage.getItem('kelnix_media_v1');
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }

    try {
      let query = supabase.from('media_assets').select('*');
      if (filters.businessId) query = query.eq('business_id', filters.businessId);
      if (filters.projectId) query = query.eq('project_id', filters.projectId);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error || !data) throw error;
      return data.map(mapDbToMedia);
    } catch (error) {
      console.error('Error fetching media assets:', error);
      try {
        const local = localStorage.getItem('kelnix_media_v1');
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }
  },

  async getMediaAsset(id: string): Promise<MediaAssetRecord | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.from('media_assets').select('*').eq('id', id).single();
    if (error || !data) return null;
    return mapDbToMedia(data);
  },

  async createMediaAsset(asset: Omit<MediaAssetRecord, 'id' | 'userId' | 'createdAt'>): Promise<MediaAssetRecord> {
    const userId = await getCurrentUserId();
    const newRow = {
      user_id: userId,
      business_id: asset.businessId || null,
      project_id: asset.projectId || null,
      name: asset.name || 'Untitled Media',
      type: asset.type || 'image',
      url: asset.url || '',
      thumbnail_url: asset.thumbnailUrl || null,
      public_id: asset.publicId || null,
      resource_type: asset.resourceType || null,
      format: asset.format || null,
      bytes: asset.bytes || null,
      width: asset.width || null,
      height: asset.height || null,
      duration: asset.duration || null,
      metadata: asset.metadata || {},
    };

    if (!isSupabaseConfigured || !supabase) {
      const created: MediaAssetRecord = {
        id: 'media-' + Date.now(),
        userId,
        businessId: asset.businessId,
        projectId: asset.projectId,
        name: asset.name,
        type: asset.type,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        publicId: asset.publicId,
        resourceType: asset.resourceType,
        format: asset.format,
        bytes: asset.bytes,
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
        metadata: asset.metadata,
        createdAt: new Date().toISOString(),
      };
      const all = await this.getMediaAssets();
      localStorage.setItem('kelnix_media_v1', JSON.stringify([created, ...all]));
      return created;
    }

    try {
      const { data, error } = await supabase.from('media_assets').insert(newRow).select().single();
      if (error || !data) throw new Error(error?.message || 'Failed to save media asset');
      const res = mapDbToMedia(data);
      const all = await this.getMediaAssets();
      localStorage.setItem('kelnix_media_v1', JSON.stringify([res, ...all]));
      return res;
    } catch (error) {
      console.error('Error creating media asset:', error);
      throw error;
    }
  },

  async deleteMediaAsset(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const response = await fetch('/api/cloudinary/destroy', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ mediaAssetId: id }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.error || errorData?.data?.error || 'Cloudinary deletion failed');
        }

        const { error } = await supabase.from('media_assets').delete().eq('id', id);
        if (error) throw error;
      } catch (error: any) {
        console.error('Error in deleteMediaAsset:', error);
        throw error;
      }
    }
    const all = await this.getMediaAssets();
    localStorage.setItem('kelnix_media_v1', JSON.stringify(all.filter(m => m.id !== id)));
  },

  async uploadMedia(file: File, options: UploadOptions = {}): Promise<MediaAssetRecord> {
    const validation = await this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const type = await this.getMediaType(file);
    
    // Get authentication token for the server-side signature request
    let token: string | null = null;
    if (isSupabaseConfigured && supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || null;
    }

    const signResponse = await fetch('/api/cloudinary/sign-upload', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({}), // Folder is now managed by the server for security
    });

    if (!signResponse.ok) {
      throw new Error('Failed to obtain upload signature from server.');
    }

    const signedResponse = await signResponse.json();
    if (signedResponse.success === false) {
      throw new Error(signedResponse.error || 'Failed to obtain upload signature from server.');
    }
    const { signature, timestamp, cloudName, apiKey, folder } = signedResponse.data || signedResponse;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('folder', folder);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${type === 'video' ? 'video' : type === 'audio' ? 'raw' : 'image'}/upload`;

    const cloudinaryResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!cloudinaryResponse.ok) {
      const errorData = await cloudinaryResponse.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed.');
    }

    const cloudinaryData = await cloudinaryResponse.json();

    return await this.createMediaAsset({
      name: file.name,
      type: type,
      url: cloudinaryData.secure_url,
      thumbnailUrl: type === 'video' ? cloudinaryData.secure_url.replace(/\.[^./?]+(?:\?.*)?$/, '.jpg') : undefined,
      publicId: cloudinaryData.public_id,
      resourceType: cloudinaryData.resource_type,
      format: cloudinaryData.format,
      bytes: cloudinaryData.bytes,
      width: cloudinaryData.width,
      height: cloudinaryData.height,
      duration: cloudinaryData.duration,
      businessId: options.businessId,
      projectId: options.projectId,
      metadata: {
        original_filename: file.name,
        ...cloudinaryData
      },
    });
  }
};

