import { MediaAssetRecord } from '../media/mediaService';
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
