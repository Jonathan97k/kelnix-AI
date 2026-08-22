import React, { useEffect, useRef, useState } from 'react';
import { 
  Type,
  Upload,
  Sparkles, 
  Sliders, 
  Move, 
  Volume2, 
  Clock, 
  Palette, 
  Layers,
  Wand2,
  Play,
  Pause,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { 
  PhotoSlide, 
  MotionEffect, 
  FilterStyle, 
  TextAnimationType, 
  TextFontFamily, 
  TextPosition 
} from '../types';
import { audioEngine } from '../utils/audioEngine';
import { generateVoiceover, GEMINI_VOICES, GeminiVoice } from '../services/ai/ttsService';
import { mediaService } from '../services/media/mediaService';
import { createVoiceoverMetadata, persistVoiceoverFile, removeVoiceoverMetadata } from '../services/editor/editorState';

let activeGeneratedAudio: HTMLAudioElement | null = null;

function stopActiveGeneratedAudio(): void {
  if (activeGeneratedAudio) {
    activeGeneratedAudio.pause();
    activeGeneratedAudio.currentTime = 0;
    activeGeneratedAudio = null;
  }
}

function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.onloadedmetadata = () => {
      if (Number.isFinite(audio.duration) && audio.duration > 0) resolve(audio.duration);
      else reject(new Error('Audio duration unavailable'));
    };
    audio.onerror = () => reject(new Error('Audio metadata unavailable'));
  });
}

interface SlideEditorProps {
  slide: PhotoSlide;
  projectId?: string | null;
  slideIndex: number;
  totalSlides: number;
  onUpdate: (partial: Partial<PhotoSlide>) => void;
  onReplaceMedia: () => void;
}

const MOTION_OPTIONS: { id: MotionEffect; label: string; desc: string }[] = [
  { id: 'kenburns-zoom-in', label: 'Slow Zoom In', desc: 'Cinematic forward push' },
  { id: 'kenburns-zoom-out', label: 'Slow Zoom Out', desc: 'Expansive reveal' },
  { id: 'pan-left', label: 'Pan Left', desc: 'Horizontal sweep' },
  { id: 'pan-right', label: 'Pan Right', desc: 'Horizontal sweep' },
  { id: 'pulse-zoom', label: 'Beat Pulse', desc: 'Rhythmic bass bounce' },
  { id: 'subtle-drift', label: 'Subtle Float', desc: 'Gentle organic drift' },
  { id: 'static', label: 'Static Hold', desc: 'No camera motion' },
];

const FILTER_OPTIONS: { id: FilterStyle; label: string; previewColor: string }[] = [
  { id: 'normal', label: 'Natural', previewColor: '#64748B' },
  { id: 'golden-hour', label: 'Golden Hour', previewColor: '#F59E0B' },
  { id: 'cinematic', label: 'Cinematic Teal', previewColor: '#0EA5E9' },
  { id: 'vintage-film', label: 'Vintage 35mm', previewColor: '#D97706' },
  { id: 'cyberpunk', label: 'Neon Cyber', previewColor: '#EC4899' },
  { id: 'bw-contrast', label: 'B&W Noir', previewColor: '#1E293B' },
  { id: 'nordic-cool', label: 'Nordic Blue', previewColor: '#38BDF8' },
  { id: 'pastel-warm', label: 'Pastel Dream', previewColor: '#F472B6' },
];

const FONT_OPTIONS: { id: TextFontFamily; label: string }[] = [
  { id: 'sans-bold', label: 'Modern Sans Bold' },
  { id: 'serif-editorial', label: 'Editorial Serif' },
  { id: 'condensed-impact', label: 'Impact / Viral' },
  { id: 'neon-display', label: 'Neon Glow' },
  { id: 'mono-clean', label: 'Tech Monospace' },
  { id: 'handwritten', label: 'Handwritten Vibe' },
];

const ANIMATION_OPTIONS: { id: TextAnimationType; label: string }[] = [
  { id: 'fade-up', label: 'Fade Up' },
  { id: 'pop-in', label: 'Pop In Scale' },
  { id: 'karaoke-bounce', label: 'Karaoke Bounce' },
  { id: 'neon-glow', label: 'Neon Glow Pulse' },
  { id: 'subtle-float', label: 'Subtle Float' },
];

export const SlideEditor: React.FC<SlideEditorProps> = ({
  slide,
  projectId,
  slideIndex,
  totalSlides,
  onUpdate,
  onReplaceMedia,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<GeminiVoice>((slide.voiceoverVoiceName as GeminiVoice) || 'Kore');
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(slide.voiceoverAudioUrl || null);
  const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState(false);
  const [voiceoverStage, setVoiceoverStage] = useState<string | null>(null);
  const [isPlayingGeneratedAudio, setIsPlayingGeneratedAudio] = useState(false);
  const [voiceoverError, setVoiceoverError] = useState<string | null>(null);
  const generatedAudioRef = useRef<HTMLAudioElement | null>(null);
  const textStyle = slide.textStyle;
  const adj = slide.filterAdjustments || { brightness: 1, contrast: 1, saturation: 1, vignette: 0, blur: 0, warmth: 0 };

  const handleUpdateAdjustments = (key: keyof typeof adj, val: number) => {
    onUpdate({
      filterAdjustments: {
        ...adj,
        [key]: val,
      },
    });
  };

  const handleTestNarration = () => {
    if (slide.narrationText) {
      audioEngine.speakNarration(slide.narrationText);
    }
  };

  useEffect(() => {
    setSelectedVoice((slide.voiceoverVoiceName as GeminiVoice) || 'Kore');
    setGeneratedAudioUrl(slide.voiceoverAudioUrl || null);
    setVoiceoverError(null);
    setIsPlayingGeneratedAudio(false);
    stopActiveGeneratedAudio();
  }, [slide.id]);

  useEffect(() => {
    return () => {
      if (generatedAudioUrl?.startsWith('blob:')) URL.revokeObjectURL(generatedAudioUrl);
      if (generatedAudioRef.current && generatedAudioRef.current === activeGeneratedAudio) {
        stopActiveGeneratedAudio();
      }
    };
  }, [generatedAudioUrl]);

  const handleGenerateVoiceover = async () => {
    if (!slide.narrationText?.trim() || isGeneratingVoiceover) return;
    stopActiveGeneratedAudio();
    setIsPlayingGeneratedAudio(false);
    setIsGeneratingVoiceover(true);
    setVoiceoverStage('Generating voice...');
    setVoiceoverError(null);
    try {
      const wavBlob = await generateVoiceover(slide.narrationText, selectedVoice);
      setVoiceoverStage('Preparing audio...');
      const temporaryUrl = URL.createObjectURL(wavBlob);
      setGeneratedAudioUrl((previousUrl) => {
        if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
        return temporaryUrl;
      });

      let duration: number | undefined;
      try {
        duration = await getAudioDuration(temporaryUrl);
      } catch {
        duration = undefined;
      }

      setVoiceoverError(null);
      const filename = `voiceover-scene-${slide.generatedSceneNumber || slideIndex + 1}-${Date.now()}.wav`;
      try {
        setVoiceoverStage('Saving voiceover...');
        const file = new File([wavBlob], filename, { type: 'audio/wav' });
        const asset = await persistVoiceoverFile(
          file,
          (voiceoverFile) => mediaService.uploadMedia(voiceoverFile, { projectId: projectId || undefined }),
        );
        onUpdate(createVoiceoverMetadata(asset, selectedVoice, duration, slide.voiceoverVolume ?? 1));
      } catch {
        setVoiceoverError('Voiceover generated, but saving it to the Media Library failed. The temporary preview is still available.');
      }
    } catch {
      setVoiceoverError('Real Gemini voiceover is unavailable. Use Test Voice for browser speech preview.');
    } finally {
      setIsGeneratingVoiceover(false);
      setVoiceoverStage(null);
    }
  };

  const handlePlayGeneratedAudio = () => {
    if (!generatedAudioUrl) return;
    stopActiveGeneratedAudio();
    const audio = new Audio(generatedAudioUrl);
    generatedAudioRef.current = audio;
    activeGeneratedAudio = audio;
    setIsPlayingGeneratedAudio(true);
    audio.onended = () => {
      if (activeGeneratedAudio === audio) activeGeneratedAudio = null;
      setIsPlayingGeneratedAudio(false);
    };
    audio.onerror = () => {
      if (activeGeneratedAudio === audio) activeGeneratedAudio = null;
      setIsPlayingGeneratedAudio(false);
      setVoiceoverError('Generated audio could not be played. Use Test Voice for browser speech preview.');
    };
    audio.play().catch(() => {
      setIsPlayingGeneratedAudio(false);
      setVoiceoverError('Generated audio could not be played. Use Test Voice for browser speech preview.');
    });
  };

  const handleStopGeneratedAudio = () => {
    stopActiveGeneratedAudio();
    setIsPlayingGeneratedAudio(false);
  };

  const handleNarrationChange = (narrationText: string) => {
    handleStopGeneratedAudio();
    setGeneratedAudioUrl(null);
    setVoiceoverError(null);
    onUpdate({ narrationText });
  };

  const handleRemoveVoiceover = () => {
    handleStopGeneratedAudio();
    setGeneratedAudioUrl((previousUrl) => {
      if (previousUrl?.startsWith('blob:')) URL.revokeObjectURL(previousUrl);
      return null;
    });
    setVoiceoverError(null);
    onUpdate(removeVoiceoverMetadata());
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">
            Scene Inspector: #{slideIndex + 1}
          </h3>
          <button
            onClick={onReplaceMedia}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Replace Media"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <p className="text-[11px] text-slate-400">
            Customize captions, camera motion, filter grading & audio
          </p>
        </div>
        <div className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          Slide {slideIndex + 1} / {totalSlides}
        </div>
      </div>

      {/* 1. Kinetic Text & Caption Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <Type className="w-3.5 h-3.5 text-purple-400" />
          <span>On-Screen Caption</span>
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Primary Caption Hook</label>
          <input
            type="text"
            value={slide.caption || ''}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            placeholder="e.g. Postcards from paradise 🌊"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-[11px] text-slate-400 mb-1">Secondary Subtitle (Optional)</label>
          <input
            type="text"
            value={slide.subCaption || ''}
            onChange={(e) => onUpdate({ subCaption: e.target.value })}
            placeholder="e.g. Positano, Italy"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
          />
        </div>

        {/* Typography Controls */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Font Style</label>
            <select
              value={textStyle.font}
              onChange={(e) => onUpdate({ textStyle: { ...textStyle, font: e.target.value as TextFontFamily } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-hidden cursor-pointer"
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Animation</label>
            <select
              value={textStyle.animation}
              onChange={(e) => onUpdate({ textStyle: { ...textStyle, animation: e.target.value as TextAnimationType } })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-hidden cursor-pointer"
            >
              {ANIMATION_OPTIONS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Text Position & Badge */}
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="block text-[11px] text-slate-400 mb-1">Position</label>
            <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
              {(['top', 'center', 'lower-third', 'bottom'] as TextPosition[]).map((pos) => (
                <button
                  key={pos}
                  onClick={() => onUpdate({ textStyle: { ...textStyle, position: pos } })}
                  className={`flex-1 text-[10px] font-semibold py-1 rounded-lg transition-all capitalize ${
                    textStyle.position === pos ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {pos === 'lower-third' ? 'Lower' : pos}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={() => onUpdate({ textStyle: { ...textStyle, hasBadge: !textStyle.hasBadge } })}
              className={`text-xs px-3 py-2 rounded-xl font-semibold border transition-all ${
                textStyle.hasBadge
                  ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              Badge Pill
            </button>
          </div>
        </div>
      </div>

      {/* 2. Ken Burns Camera Motion */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <Move className="w-3.5 h-3.5 text-blue-400" />
          <span>Camera Motion Effect</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {MOTION_OPTIONS.map((m) => {
            const isSelected = slide.motion === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onUpdate({ motion: m.id })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-blue-600/20 border-blue-500 text-white ring-2 ring-blue-500/20'
                    : 'bg-slate-800/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold">{m.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Color Grading & Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          <span>Color Grading Filter</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {FILTER_OPTIONS.map((f) => {
            const isSelected = slide.filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => onUpdate({ filter: f.id })}
                className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-white ring-2 ring-amber-500/20'
                    : 'bg-slate-800/70 border-slate-700/70 text-slate-400 hover:text-white'
                }`}
              >
                <div
                  className="w-5 h-5 rounded-full border border-white/20 shadow-xs"
                  style={{ backgroundColor: f.previewColor }}
                />
                <span className="text-[10px] font-semibold text-center leading-tight truncate w-full">
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Fine-Tuning Sliders */}
        <div className="bg-slate-800/50 p-3 rounded-2xl border border-slate-700/60 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
            <span>Filter Adjustments</span>
            <button
              onClick={() => onUpdate({ filterAdjustments: { brightness: 1, contrast: 1, saturation: 1, vignette: 0, blur: 0, warmth: 0 } })}
              className="text-[10px] text-slate-400 hover:text-purple-300"
            >
              Reset
            </button>
          </div>

          {/* Brightness */}
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="w-20">Brightness</span>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.05"
              value={adj.brightness}
              onChange={(e) => handleUpdateAdjustments('brightness', parseFloat(e.target.value))}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
            <span className="w-8 text-right font-mono text-slate-300">{adj.brightness.toFixed(2)}</span>
          </div>

          {/* Contrast */}
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="w-20">Contrast</span>
            <input
              type="range"
              min="0.6"
              max="1.5"
              step="0.05"
              value={adj.contrast}
              onChange={(e) => handleUpdateAdjustments('contrast', parseFloat(e.target.value))}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
            <span className="w-8 text-right font-mono text-slate-300">{adj.contrast.toFixed(2)}</span>
          </div>

          {/* Saturation */}
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="w-20">Saturation</span>
            <input
              type="range"
              min="0"
              max="2.0"
              step="0.05"
              value={adj.saturation}
              onChange={(e) => handleUpdateAdjustments('saturation', parseFloat(e.target.value))}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
            <span className="w-8 text-right font-mono text-slate-300">{adj.saturation.toFixed(2)}</span>
          </div>

          {/* Vignette */}
          <div className="flex items-center justify-between gap-3 text-[11px] text-slate-400">
            <span className="w-20">Vignette</span>
            <input
              type="range"
              min="0"
              max="0.8"
              step="0.05"
              value={adj.vignette}
              onChange={(e) => handleUpdateAdjustments('vignette', parseFloat(e.target.value))}
              className="flex-1 accent-purple-500 cursor-pointer"
            />
            <span className="w-8 text-right font-mono text-slate-300">{(adj.vignette * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* 4. Voiceover Narration Script for this Scene */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Voiceover Narration</span>
          </div>
          {slide.narrationText && (
            <button
              onClick={handleTestNarration}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <Volume2 className="w-3 h-3" /> Test Voice
            </button>
          )}
        </div>

        <textarea
          rows={2}
          value={slide.narrationText || ''}
          onChange={(e) => handleNarrationChange(e.target.value)}
          placeholder="Script line spoken during this slide (e.g. 'Finding magic in every quiet corner.')"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
        />

        {slide.narrationText?.trim() && (
          <div className="space-y-2 rounded-xl border border-slate-700/70 bg-slate-800/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-slate-300">Real Gemini voiceover</span>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value as GeminiVoice)}
                className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] text-white"
                disabled={isGeneratingVoiceover}
              >
                {GEMINI_VOICES.map((voice) => <option key={voice} value={voice}>{voice}</option>)}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateVoiceover}
                disabled={isGeneratingVoiceover}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {isGeneratingVoiceover ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
                {generatedAudioUrl ? 'Regenerate Voiceover' : 'Generate Voiceover'}
              </button>
              {generatedAudioUrl && !isPlayingGeneratedAudio && <button onClick={handlePlayGeneratedAudio} className="flex items-center gap-1.5 rounded-lg bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-600"><Play className="h-3 w-3" /> Preview Generated</button>}
              {isPlayingGeneratedAudio && <button onClick={handleStopGeneratedAudio} className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-500"><Pause className="h-3 w-3" /> Stop Preview</button>}
              {generatedAudioUrl && <button onClick={handleGenerateVoiceover} disabled={isGeneratingVoiceover} className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 hover:text-white disabled:opacity-50"><RefreshCw className="h-3 w-3" /> Regenerate</button>}
              {(generatedAudioUrl || slide.voiceoverAssetId) && <button onClick={handleRemoveVoiceover} disabled={isGeneratingVoiceover} className="rounded-lg border border-rose-500/30 px-2.5 py-1.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/10 disabled:opacity-50">Remove Voiceover</button>}
            </div>
            {voiceoverStage && <p className="text-[11px] text-emerald-300">{voiceoverStage}</p>}
            {voiceoverError && <p className="text-[11px] text-amber-300">{voiceoverError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
