import { postJson } from '../api/apiClient';
import { pcmToWavBlob } from '../../utils/pcmToWav';

export const GEMINI_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'] as const;
export type GeminiVoice = typeof GEMINI_VOICES[number];

interface TtsResponse {
  base64Audio?: string;
  mimeType?: string;
}

export async function generateVoiceover(text: string, voiceName: GeminiVoice): Promise<Blob> {
  if (!text.trim()) throw new Error('Add narration text before generating a voiceover.');

  try {
    const response = await postJson<TtsResponse>('/api/tts', { text: text.trim(), voiceName });
    if (!response.base64Audio) throw new Error('No audio was returned.');
    return pcmToWavBlob(response.base64Audio, response.mimeType || 'audio/pcm;rate=24000');
  } catch (error) {
    console.error('Voiceover generation failed:', error);
    throw new Error('Gemini voiceover is unavailable right now. You can still use browser speech preview.');
  }
}
