import type { MediaAssetRecord } from '../media/mediaService';
import { PhotoSlide } from '../../types';

export function getProjectEditorStorageKey(projectId: string): string {
  return `reel_editor_state_${projectId}`;
}

export function replaceSlideMedia(
  slides: PhotoSlide[],
  targetIndex: number,
  asset: Pick<MediaAssetRecord, 'url' | 'name' | 'type' | 'thumbnailUrl'>,
): PhotoSlide[] {
  if (targetIndex < 0 || targetIndex >= slides.length) return slides;

  return slides.map((slide, index) => index === targetIndex
    ? {
        ...slide,
        url: asset.url,
        name: asset.name,
        mediaType: asset.type === 'video' ? 'video' : 'photo',
        thumbnailUrl: asset.thumbnailUrl,
        isPlaceholder: false,
      }
    : slide
  );
}

export function isEditorState(value: unknown): value is { slides: PhotoSlide[]; config: unknown } {
  if (!value || typeof value !== 'object') return false;
  const state = value as { slides?: unknown; config?: unknown };
  return Array.isArray(state.slides) && Boolean(state.config && typeof state.config === 'object');
}

export function createVoiceoverMetadata(
  asset: Pick<MediaAssetRecord, 'id' | 'url' | 'duration'>,
  voiceName: string,
  duration?: number,
  volume = 1,
): Partial<PhotoSlide> {
  return {
    voiceoverAssetId: asset.id,
    voiceoverAudioUrl: asset.url,
    voiceoverDuration: duration || asset.duration,
    voiceoverVolume: volume,
    voiceoverVoiceName: voiceName,
  };
}

export function removeVoiceoverMetadata(): Partial<PhotoSlide> {
  return {
    voiceoverAssetId: undefined,
    voiceoverAudioUrl: undefined,
    voiceoverDuration: undefined,
    voiceoverVolume: undefined,
    voiceoverVoiceName: undefined,
  };
}

export async function persistVoiceoverFile(
  file: File,
  upload: (file: File) => Promise<MediaAssetRecord>,
): Promise<MediaAssetRecord> {
  try {
    return await upload(file);
  } catch {
    throw new Error('Voiceover generated, but saving it to the Media Library failed.');
  }
}
