import React from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Shuffle, 
  Wand2,
  Sliders
} from 'lucide-react';
import { PhotoSlide, TransitionType } from '../types';

interface TimelineProps {
  slides: PhotoSlide[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onUpdateSlide: (index: number, partial: Partial<PhotoSlide>) => void;
  onDeleteSlide: (index: number) => void;
  onDuplicateSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
  onAddSlide: () => void;
  onAutoBeatSync: () => void;
  bpm: number;
  beatSyncEnabled: boolean;
}

const TRANSITIONS: { id: TransitionType; label: string; icon: string }[] = [
  { id: 'whip-left', label: 'Whip Left', icon: '←' },
  { id: 'whip-right', label: 'Whip Right', icon: '→' },
  { id: 'crossfade', label: 'Crossfade', icon: '◫' },
  { id: 'zoom-in', label: 'Zoom In', icon: '⊕' },
  { id: 'glitch', label: 'Glitch', icon: '⚡' },
  { id: 'flash', label: 'Flash Cut', icon: '✹' },
  { id: 'slide-up', label: 'Slide Up', icon: '↑' },
  { id: 'blur-fade', label: 'Blur Fade', icon: '◌' },
];

export const Timeline: React.FC<TimelineProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
  onUpdateSlide,
  onDeleteSlide,
  onDuplicateSlide,
  onMoveSlide,
  onAddSlide,
  onAutoBeatSync,
  bpm,
  beatSyncEnabled,
}) => {
  const totalDuration = slides.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-3 sm:p-4 z-20">
      {/* Top Bar of Timeline */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
            Timeline Storyboard
          </span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-purple-400 border border-purple-500/20">
            {slides.length} scenes • {totalDuration.toFixed(1)}s total
          </span>
        </div>

        {/* Action buttons on Timeline header */}
        <div className="flex items-center gap-2">
          <button
            onClick={onAutoBeatSync}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
              beatSyncEnabled
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Automatically snap all slide durations to match music BPM beats"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Snap to Beat ({bpm} BPM)</span>
          </button>
        </div>
      </div>

      {/* Horizontal Scrollable Thumbnails Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700">
        {slides.map((slide, index) => {
          const isSelected = index === currentSlideIndex;

          return (
            <React.Fragment key={slide.id}>
              {/* Slide Card Thumbnail */}
              <div
                onClick={() => onSelectSlide(index)}
                className={`group relative flex-shrink-0 w-28 sm:w-32 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-purple-500 ring-4 ring-purple-500/30 shadow-lg scale-[1.02]'
                    : 'border-slate-700/80 hover:border-slate-500 bg-slate-800'
                }`}
              >
                {/* Media Thumbnail (Photo or Video) */}
                {slide.isPlaceholder ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gradient-to-br from-slate-800 to-slate-950 px-2 text-center">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] text-slate-300">Scene {slide.generatedSceneNumber || index + 1}</span>
                  </div>
                ) : slide.mediaType === 'video' ? (
                  <video
                    src={slide.url}
                    className="w-full h-full object-cover pointer-events-none"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={slide.url}
                    alt={slide.name}
                    className="w-full h-full object-cover"
                  />
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Scene Number Index */}
                <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-black/60 backdrop-blur-xs flex items-center justify-center text-[10px] font-bold text-white border border-white/20">
                  {index + 1}
                </div>

                {/* Caption Sneak Peek */}
                <div className="absolute bottom-1.5 inset-x-1.5 text-[10px] text-white/90 truncate font-medium drop-shadow">
                  {slide.caption || 'No caption'}
                </div>

                {/* Duration Badge & Editor */}
                <div 
                  className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-black/75 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-300 border border-amber-500/20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                  <input
                    type="number"
                    step="0.1"
                    min="0.8"
                    max="8.0"
                    value={slide.duration}
                    onChange={(e) => onUpdateSlide(index, { duration: Math.max(0.5, parseFloat(e.target.value) || 1.5) })}
                    className="w-8 bg-transparent text-right text-amber-300 outline-hidden font-bold"
                  />
                  <span>s</span>
                </div>

                {/* Hover Quick Actions (Move left/right, Duplicate, Delete) */}
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 z-10">
                  {index > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSlide(index, index - 1);
                      }}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Move slide left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(index);
                    }}
                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
                    title="Duplicate slide"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(index);
                      }}
                      className="p-1 rounded-md bg-rose-500/20 hover:bg-rose-500/40 text-rose-400 border border-rose-500/30"
                      title="Delete slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {index < slides.length - 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveSlide(index, index + 1);
                      }}
                      className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Move slide right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Transition Indicator Pill between slides */}
              {index < slides.length - 1 && (
                <div className="flex flex-col items-center justify-center flex-shrink-0">
                  <select
                    value={slide.transition}
                    onChange={(e) => onUpdateSlide(index, { transition: e.target.value as TransitionType })}
                    className="text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-lg px-2 py-1 outline-hidden cursor-pointer shadow-xs"
                    title="Transition to next slide"
                  >
                    {TRANSITIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.icon} {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </React.Fragment>
          );
        })}

        {/* Add Photo Button at end of timeline */}
        <button
          onClick={onAddSlide}
          className="flex-shrink-0 w-24 sm:w-28 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-purple-500 hover:bg-purple-950/20 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-purple-300 transition-all cursor-pointer group"
        >
          <div className="w-7 h-7 rounded-full bg-slate-800 group-hover:bg-purple-600/30 flex items-center justify-center transition-all">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold">Add Scene</span>
        </button>
      </div>
    </div>
  );
};
