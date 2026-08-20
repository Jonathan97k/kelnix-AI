import { AIContentResponse, EditorState, PhotoSlide, ReelConfig } from '../../types';
import { createDefaultReel } from '../../utils/presets';

export const contentToEditorAdapter = {
  /**
   * Converts AI generated structured content into the editor's internal state.
   */
  convertToEditorState(
    aiResponse: AIContentResponse,
    metadata: Pick<EditorState, 'projectId' | 'generatedContentId'> = {},
  ): EditorState {
    const defaultReel = createDefaultReel(0);
    
    const slides: PhotoSlide[] = aiResponse.scenes.map((scene, index) => ({
      id: `ai-scene-${index}-${Date.now()}`,
      url: '',
      mediaType: 'photo',
      isPlaceholder: true,
      visualDescription: scene.visualDescription,
      generatedSceneNumber: scene.sceneNumber,
      name: `Scene ${scene.sceneNumber}`,
      caption: scene.onScreenText,
      duration: scene.duration || 3,
      motion: 'static',
      transition: 'crossfade',
      filter: 'normal',
      textStyle: {
        font: 'sans-bold',
        position: 'bottom',
        textColor: '#ffffff',
        backgroundColor: 'rgba(0,0,0,0.6)',
        animation: 'fade-up',
        fontSize: 'md',
        hasBadge: false,
      },
      narrationText: scene.narration,
      subCaption: scene.visualDescription,
    }));

    const config: ReelConfig = {
      ...defaultReel.config,
      title: aiResponse.title,
      socialCaption: aiResponse.caption,
      hashtags: aiResponse.hashtags,
      // Voiceover settings can be set based on voiceoverScript existence
      voiceoverEnabled: !!aiResponse.voiceoverScript,
    };

    return { slides, config, ...metadata };
  }
};
