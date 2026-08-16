import React, { useState } from 'react';
import { 
  Music, 
  Volume2, 
  Mic, 
  Play, 
  Pause, 
  Sparkles, 
  Wand2, 
  Check,
  Radio
} from 'lucide-react';
import { MusicTrack, ReelConfig } from '../types';
import { DEFAULT_MUSIC_TRACKS } from '../utils/presets';
import { audioEngine } from '../utils/audioEngine';

interface AudioSettingsProps {
  config: ReelConfig;
  onChangeConfig: (newConfig: Partial<ReelConfig>) => void;
  onAutoBeatSync: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({
  config,
  onChangeConfig,
  onAutoBeatSync,
}) => {
  const [previewingTrackId, setPreviewingTrackId] = useState<string | null>(null);

  const handleSelectTrack = (track: MusicTrack) => {
    onChangeConfig({ musicTrack: track });
    audioEngine.play(track);
    setPreviewingTrackId(track.id);
  };

  const handleTogglePreview = (track: MusicTrack, e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewingTrackId === track.id) {
      audioEngine.stop();
      setPreviewingTrackId(null);
    } else {
      audioEngine.play(track);
      setPreviewingTrackId(track.id);
    }
  };

  const handleMusicVolumeChange = (val: number) => {
    onChangeConfig({ musicVolume: val });
    audioEngine.setMusicVolume(val);
  };

  const handleVoiceVolumeChange = (val: number) => {
    onChangeConfig({ voiceoverVolume: val });
    audioEngine.setVoiceVolume(val);
  };

  const handleTestVoice = () => {
    audioEngine.speakNarration(
      'Welcome to ReelCraft. Transform your photos into viral stories with artificial intelligence.',
      config.voiceName
    );
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
      {/* Title */}
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Music className="w-4 h-4 text-purple-400" />
          Music & Audio Sync
        </h3>
        <p className="text-[11px] text-slate-400">
          Curate beat-synced soundtrack tracks & voiceover narration
        </p>
      </div>

      {/* 1. Track Library */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Background Music Library
          </label>
          <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
            Procedural Audio
          </span>
        </div>

        <div className="space-y-2">
          {DEFAULT_MUSIC_TRACKS.map((track) => {
            const isSelected = config.musicTrack.id === track.id;
            const isPlayingThis = previewingTrackId === track.id;

            return (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 ring-2 ring-purple-500/30'
                    : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={(e) => handleTogglePreview(track, e)}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                      isPlayingThis
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    {isPlayingThis ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{track.title}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900 text-purple-300 border border-slate-700">
                        {track.bpm} BPM
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">{track.mood}</div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Beat Sync & Pacing */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-xs font-bold text-white">Intelligent Beat Sync</span>
          </div>
          <button
            onClick={() => onChangeConfig({ beatSync: !config.beatSync })}
            className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
              config.beatSync ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.beatSync ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        <p className="text-[11px] text-slate-400">
          Automatically calculates slide durations to ensure visual cuts snap directly onto musical beat drops ({config.musicTrack.bpm} BPM).
        </p>

        <button
          onClick={onAutoBeatSync}
          className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Wand2 className="w-3.5 h-3.5 text-amber-300" />
          <span>Align All Scenes to Beat ({config.musicTrack.bpm} BPM)</span>
        </button>
      </div>

      {/* 3. Audio Mixing & Volume Sliders */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-4">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
          Audio Mixing Console
        </span>

        {/* Music Volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Music className="w-3.5 h-3.5 text-purple-400" /> Background Track
            </span>
            <span className="font-mono text-purple-300 font-bold">
              {Math.round(config.musicVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.musicVolume}
            onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer"
          />
        </div>

        {/* Voiceover Volume */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-emerald-400" /> Voiceover Narration
            </span>
            <span className="font-mono text-emerald-300 font-bold">
              {Math.round(config.voiceoverVolume * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.voiceoverVolume}
            onChange={(e) => handleVoiceVolumeChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Voiceover Toggle & Voice Selector */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">AI Voiceover Narration</span>
          </div>
          <button
            onClick={() => onChangeConfig({ voiceoverEnabled: !config.voiceoverEnabled })}
            className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
              config.voiceoverEnabled ? 'bg-emerald-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.voiceoverEnabled ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {config.voiceoverEnabled && (
          <div className="space-y-2.5 pt-2 animate-fade-in">
            <div className="flex items-center gap-2">
              <select
                value={config.voiceName}
                onChange={(e) => onChangeConfig({ voiceName: e.target.value })}
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-hidden cursor-pointer"
              >
                <option value="Kore">Kore (Smooth & Natural Female)</option>
                <option value="Puck">Puck (Energetic & Dynamic)</option>
                <option value="Charon">Charon (Deep & Cinematic Male)</option>
                <option value="Fenrir">Fenrir (Bold & Confident)</option>
                <option value="Zephyr">Zephyr (Warm & Gentle)</option>
              </select>

              <button
                onClick={handleTestVoice}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-all flex-shrink-0"
              >
                Test Voice
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              When enabled, background music automatically ducks when voiceover lines play.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
