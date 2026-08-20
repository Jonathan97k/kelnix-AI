import test from 'node:test';
import assert from 'node:assert/strict';
import { contentToEditorAdapter } from '../src/services/editor/contentToEditorAdapter';
import { getProjectEditorStorageKey, isEditorState, replaceSlideMedia } from '../src/services/editor/editorState';
import { AIContentResponse } from '../src/types';

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

