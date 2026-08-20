import React from 'react';
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
  Wand2
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

interface SlideEditorProps {
  slide: PhotoSlide;
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
  slideIndex,
  totalSlides,
  onUpdate,
  onReplaceMedia,
}) => {
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
          onChange={(e) => onUpdate({ narrationText: e.target.value })}
          placeholder="Script line spoken during this slide (e.g. 'Finding magic in every quiet corner.')"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
        />
      </div>
    </div>
  );
};
