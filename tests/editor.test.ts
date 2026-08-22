import test from 'node:test';
import assert from 'node:assert/strict';
import { contentToEditorAdapter } from '../src/services/editor/contentToEditorAdapter';
import { createVoiceoverMetadata, getProjectEditorStorageKey, isEditorState, persistVoiceoverFile, removeVoiceoverMetadata, replaceSlideMedia } from '../src/services/editor/editorState';
import { AIContentResponse } from '../src/types';
import { decodeBase64, parsePcmAudioInfo, pcmToWavBlob } from '../src/utils/pcmToWav';

const response: AIContentResponse = {
  title: 'Three Scene Story',
  hook: 'A clear opening hook',
  shortDescription: 'A short description',
  fullScript: 'Full script',
  scenes: [
    { sceneNumber: 1, duration: 2.5, visualDescription: 'A sunrise', narration: 'Good morning', onScreenText: 'Begin here' },
    { sceneNumber: 2, duration: 4, visualDescription: 'A busy street', narration: 'Keep moving', onScreenText: 'Keep going' },
  ],
  caption: 'A story in motion',
  hashtags: '#story #reel',
  voiceoverScript: 'Good morning. Keep moving.',
  suggestedDuration: 6.5,
};

test('converts every AI scene into an ordered placeholder slide', () => {
  const state = contentToEditorAdapter.convertToEditorState(response, {
    projectId: 'project-a',
    generatedContentId: 'content-a',
  });

  assert.equal(state.projectId, 'project-a');
  assert.equal(state.generatedContentId, 'content-a');
  assert.equal(state.slides.length, 2);
  assert.deepEqual(state.slides.map((slide) => slide.generatedSceneNumber), [1, 2]);
  assert.deepEqual(state.slides.map((slide) => slide.duration), [2.5, 4]);
  assert.equal(state.slides[0].isPlaceholder, true);
  assert.equal(state.slides[1].visualDescription, 'A busy street');
  assert.equal(state.slides[0].narrationText, 'Good morning');
});

test('project editor keys isolate projects', () => {
  assert.notEqual(getProjectEditorStorageKey('project-a'), getProjectEditorStorageKey('project-b'));
  assert.equal(getProjectEditorStorageKey('project-a'), 'reel_editor_state_project-a');
});

test('replaces only the selected slide media', () => {
  const state = contentToEditorAdapter.convertToEditorState(response);
  const originalSecondSlide = state.slides[1];
  const updated = replaceSlideMedia(state.slides, 0, {
    url: 'https://cdn.example/scene-one.jpg',
    name: 'Scene one photo',
    type: 'image',
    thumbnailUrl: 'https://cdn.example/scene-one-thumb.jpg',
  });

  assert.equal(updated[0].url, 'https://cdn.example/scene-one.jpg');
  assert.equal(updated[0].isPlaceholder, false);
  assert.equal(updated[0].mediaType, 'photo');
  assert.equal(updated[1], originalSecondSlide);
  assert.equal(updated[1].isPlaceholder, true);
});

test('rejects malformed editor state values', () => {
  assert.equal(isEditorState(null), false);
  assert.equal(isEditorState({ slides: [], config: {} }), true);
  assert.equal(isEditorState({ slides: 'not-an-array', config: {} }), false);
});

test('decodes base64 PCM bytes', () => {
  const encoded = Buffer.from([0, 1, 255, 128]).toString('base64');
  assert.deepEqual(Array.from(decodeBase64(encoded)), [0, 1, 255, 128]);
});

test('parses PCM sample rate and defaults safely', () => {
  assert.deepEqual(parsePcmAudioInfo('audio/pcm;rate=16000'), {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
  });
  assert.equal(parsePcmAudioInfo('audio/pcm').sampleRate, 24000);
});

test('wraps PCM bytes in a WAV container', async () => {
  const pcm = Buffer.from([0, 0, 255, 127]).toString('base64');
  const blob = pcmToWavBlob(pcm, 'audio/pcm;rate=16000');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  assert.equal(blob.type, 'audio/wav');
  assert.equal(bytes.length, 48);
  assert.equal(String.fromCharCode(...bytes.slice(0, 4)), 'RIFF');
  assert.equal(new DataView(bytes.buffer).getUint32(24, true), 16000);
  assert.deepEqual(Array.from(bytes.slice(44)), [0, 0, 255, 127]);
});

test('rejects invalid PCM audio', () => {
  assert.throws(() => pcmToWavBlob('', 'audio/pcm;rate=24000'), /Audio data could not be decoded/);
  assert.throws(() => pcmToWavBlob(Buffer.from([1]).toString('base64')), /invalid/);
});

test('maps a saved media asset to scene voiceover metadata', () => {
  assert.deepEqual(createVoiceoverMetadata({ id: 'audio-1', url: 'https://cdn.example/voice.wav', duration: 2 }, 'Kore', 2.4, 0.8), {
    voiceoverAssetId: 'audio-1',
    voiceoverAudioUrl: 'https://cdn.example/voice.wav',
    voiceoverDuration: 2.4,
    voiceoverVolume: 0.8,
    voiceoverVoiceName: 'Kore',
  });
});

test('removes only scene voiceover references', () => {
  assert.deepEqual(removeVoiceoverMetadata(), {
    voiceoverAssetId: undefined,
    voiceoverAudioUrl: undefined,
    voiceoverDuration: undefined,
    voiceoverVolume: undefined,
    voiceoverVoiceName: undefined,
  });
});

test('keeps upload failure separate from successful generated audio', async () => {
  await assert.rejects(
    () => persistVoiceoverFile(new File(['wav'], 'voiceover.wav', { type: 'audio/wav' }), async () => {
      throw new Error('Cloudinary unavailable');
    }),
    /saving it to the Media Library failed/,
  );
});

