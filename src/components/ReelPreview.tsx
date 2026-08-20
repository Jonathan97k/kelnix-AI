import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Smartphone, 
  Heart, 
  MessageCircle, 
  Share2, 
  Music, 
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PhotoSlide, ReelConfig } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface ReelPreviewProps {
  slides: PhotoSlide[];
  config: ReelConfig;
  currentSlideIndex: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeekSlide: (index: number) => void;
  onToggleSocialOverlay: () => void;
  onTogglePhoneFrame: () => void;
}

export const ReelPreview: React.FC<ReelPreviewProps> = ({
  slides,
  config,
  currentSlideIndex,
  isPlaying,
  onTogglePlay,
  onSeekSlide,
  onToggleSocialOverlay,
  onTogglePhoneFrame,
}) => {
  const currentSlide = slides[currentSlideIndex] || slides[0];
  const [slideProgress, setSlideProgress] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([15, 25, 40, 60, 30, 70, 45, 20]);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Sound & Visualizer Loop
  useEffect(() => {
    let animId: number;
    const updateVisualizer = () => {
      if (isPlaying) {
        const data = audioEngine.getVisualizerData();
        if (data && data.length > 0) {
          const sampledBars = [
            data[2] || 20,
            data[4] || 40,
            data[6] || 60,
            data[8] || 80,
            data[10] || 50,
            data[12] || 70,
            data[14] || 35,
            data[16] || 20,
          ].map((v) => Math.max(10, Math.min(95, (v / 255) * 100)));
          setVisualizerBars(sampledBars);
        }
      }
      animId = requestAnimationFrame(updateVisualizer);
    };

    animId = requestAnimationFrame(updateVisualizer);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  // Motion animation progress reset on slide change
  useEffect(() => {
    startTimeRef.current = Date.now();
    setSlideProgress(0);

    // Speak narration if enabled
    if (isPlaying && config.voiceoverEnabled && currentSlide?.narrationText) {
      audioEngine.speakNarration(currentSlide.narrationText, config.voiceName);
    }
  }, [currentSlideIndex, isPlaying, config.voiceoverEnabled, currentSlide?.narrationText, config.voiceName]);

  // Progress ticker for smooth CSS transforms
  useEffect(() => {
    let interval: number;
    if (isPlaying && currentSlide) {
      const durationMs = currentSlide.duration * 1000;
      interval = window.setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const prog = Math.min(1, elapsed / durationMs);
        setSlideProgress(prog);
      }, 30);
    } else {
      setSlideProgress(0.3); // preview state
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSlide]);

  const handleToggleMute = () => {
    if (isMuted) {
      audioEngine.setMusicVolume(config.musicVolume);
      setIsMuted(false);
    } else {
      audioEngine.setMusicVolume(0);
      setIsMuted(true);
    }
  };

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
    }
  };

  if (!currentSlide) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500">
        No photos added yet.
      </div>
    );
  }

  // Calculate Aspect Ratio container classes
  const aspectClass = 
    config.aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[76vh]' :
    config.aspectRatio === '1:1' ? 'aspect-square max-h-[70vh]' :
    config.aspectRatio === '4:5' ? 'aspect-[4/5] max-h-[74vh]' : 'aspect-video max-h-[70vh]';

  // Calculate Filter CSS
  const adj = currentSlide.filterAdjustments || { brightness: 1, contrast: 1, saturation: 1, blur: 0, warmth: 0, vignette: 0 };
  let filterStyleString = `brightness(${adj.brightness}) contrast(${adj.contrast}) saturate(${adj.saturation})`;
  if (adj.blur > 0) filterStyleString += ` blur(${adj.blur}px)`;
  if (currentSlide.filter === 'bw-contrast') filterStyleString += ' grayscale(100%)';
  if (currentSlide.filter === 'vintage-film') filterStyleString += ' sepia(35%)';
  if (currentSlide.filter === 'cyberpunk') filterStyleString += ' hue-rotate(290deg) contrast(1.2)';
  if (currentSlide.filter === 'golden-hour') filterStyleString += ' sepia(20%) saturate(1.3)';
  if (currentSlide.filter === 'nordic-cool') filterStyleString += ' hue-rotate(180deg) saturate(0.85)';
  if (currentSlide.filter === 'pastel-warm') filterStyleString += ' saturate(0.9) brightness(1.05)';

  // Calculate Ken Burns motion transform CSS
  let motionTransform = 'scale(1.0)';
  switch (currentSlide.motion) {
    case 'kenburns-zoom-in':
      motionTransform = `scale(${1.0 + slideProgress * 0.18})`;
      break;
    case 'kenburns-zoom-out':
      motionTransform = `scale(${1.18 - slideProgress * 0.18})`;
      break;
    case 'pan-left':
      motionTransform = `scale(1.15) translateX(${(0.5 - slideProgress) * 6}%)`;
      break;
    case 'pan-right':
      motionTransform = `scale(1.15) translateX(${(slideProgress - 0.5) * 6}%)`;
      break;
    case 'pulse-zoom':
      const pulseScale = 1.04 + Math.sin(slideProgress * Math.PI * 4) * 0.05;
      motionTransform = `scale(${pulseScale})`;
      break;
    case 'subtle-drift':
      const driftX = Math.sin(slideProgress * Math.PI) * 3;
      const driftY = Math.cos(slideProgress * Math.PI) * 2;
      motionTransform = `scale(1.1) translate(${driftX}%, ${driftY}%)`;
      break;
    case 'static':
    default:
      motionTransform = 'scale(1.0)';
      break;
  }

  // Text Animation & Font classes
  const textStyle = currentSlide.textStyle;
  let fontClass = 'font-sans font-bold tracking-tight';
  if (textStyle.font === 'serif-editorial') fontClass = 'font-serif italic tracking-normal';
  if (textStyle.font === 'condensed-impact') fontClass = 'font-black uppercase tracking-wider';
  if (textStyle.font === 'mono-clean') fontClass = 'font-mono uppercase tracking-widest';
  if (textStyle.font === 'neon-display') fontClass = 'font-extrabold uppercase tracking-wide drop-shadow-[0_0_15px_rgba(56,189,248,0.9)]';

  const positionClass = 
    textStyle.position === 'top' ? 'top-16' :
    textStyle.position === 'center' ? 'top-1/2 -translate-y-1/2' :
    textStyle.position === 'lower-third' ? 'bottom-28' : 'bottom-20';

  const sizeClass =
    textStyle.fontSize === 'xl' ? 'text-2xl sm:text-3xl' :
    textStyle.fontSize === 'lg' ? 'text-xl sm:text-2xl' :
    textStyle.fontSize === 'md' ? 'text-base sm:text-lg' : 'text-sm sm:text-base';

  return (
    <div 
      ref={containerRef}
      className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-slate-950/80 relative overflow-hidden select-none"
    >
      {/* Background ambient glow matching music/filter */}
      <div 
        className="absolute inset-0 opacity-20 blur-3xl pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${config.musicTrack.color}, transparent 70%)`
        }}
      />

      {/* Main Reel Frame Container */}
      <div 
        className={`relative ${aspectClass} w-auto h-auto max-w-full rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
          config.showPhoneFrame 
            ? 'ring-12 ring-slate-800/90 border-4 border-slate-700/50 shadow-purple-950/40' 
            : 'border border-slate-800'
        }`}
      >
        {/* Smartphone Speaker & Camera Notch (if phone frame enabled) */}
        {config.showPhoneFrame && config.aspectRatio === '9:16' && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 bg-black/80 px-3 py-1 rounded-full pointer-events-none">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            <div className="w-10 h-1.5 rounded-full bg-slate-800" />
          </div>
        )}

        {/* Top Story / Slide Progress Indicator Bars */}
        <div className="absolute top-3 inset-x-3 z-30 flex items-center gap-1.5">
          {slides.map((s, idx) => {
            const isPast = idx < currentSlideIndex;
            const isCurrent = idx === currentSlideIndex;
            return (
              <div 
                key={s.id} 
                className="flex-1 h-1 rounded-full bg-white/30 backdrop-blur-sm overflow-hidden cursor-pointer"
                onClick={() => onSeekSlide(idx)}
              >
                <div 
                  className="h-full bg-white transition-all ease-linear"
                  style={{
                    width: isPast ? '100%' : isCurrent ? `${slideProgress * 100}%` : '0%'
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* The Slide Media Layer (Photo or Video) with Ken Burns Motion & CSS Filter */}
        <div className="w-full h-full bg-black relative overflow-hidden flex items-center justify-center">
          {currentSlide.isPlaceholder ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-slate-800 via-slate-900 to-black px-8 text-center">
              <Layers className="h-12 w-12 text-emerald-400" />
              <div>
                <p className="text-lg font-bold text-white">Scene {currentSlide.generatedSceneNumber || currentSlideIndex + 1}</p>
                <p className="mt-2 text-sm text-slate-300">Add media from your library to bring this scene to life.</p>
                {currentSlide.visualDescription && <p className="mt-4 max-w-sm text-xs leading-relaxed text-slate-400">{currentSlide.visualDescription}</p>}
              </div>
            </div>
          ) : currentSlide.mediaType === 'video' ? (
            <video
              src={currentSlide.url}
              className="w-full h-full object-cover will-change-transform transition-transform duration-100 ease-linear"
              autoPlay
              muted
              loop
              playsInline
              style={{
                filter: filterStyleString,
                transform: motionTransform,
              }}
            />
          ) : (
            <img
              src={currentSlide.url}
              alt={currentSlide.name}
              className="w-full h-full object-cover will-change-transform transition-transform duration-100 ease-linear"
              style={{
                filter: filterStyleString,
                transform: motionTransform,
              }}
            />
          )}

          {/* Vignette Layer */}
          {adj.vignette > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle, transparent 40%, rgba(0,0,0,${adj.vignette * 0.95}) 100%)`
              }}
            />
          )}

          {/* Global Overlays (Film grain, VHS, Light leak) */}
          {config.globalOverlay === 'film-grain' && (
            <div className="absolute inset-0 pointer-events-none opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px] mix-blend-overlay animate-pulse" />
          )}
          {config.globalOverlay === 'vhs-scanlines' && (
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-40" />
          )}
          {config.globalOverlay === 'light-leak' && (
            <div className="absolute -top-12 -left-12 w-72 h-72 rounded-full bg-gradient-to-br from-amber-500/40 via-rose-500/20 to-transparent blur-2xl pointer-events-none mix-blend-screen animate-pulse" />
          )}

          {/* Animated On-Screen Captions */}
          {currentSlide.caption && (
            <div 
              className={`absolute inset-x-4 z-20 flex flex-col items-center justify-center text-center pointer-events-none transition-all duration-300 ${positionClass}`}
            >
              <div
                className={`max-w-[90%] px-4 py-2 rounded-2xl ${sizeClass} ${fontClass} transition-all duration-300 ${
                  textStyle.animation === 'karaoke-bounce' ? 'animate-bounce' : ''
                }`}
                style={{
                  color: textStyle.textColor || '#FFFFFF',
                  backgroundColor: textStyle.hasBadge ? (textStyle.backgroundColor || 'rgba(0,0,0,0.6)') : 'transparent',
                  textShadow: textStyle.font === 'neon-display' 
                    ? `0 0 12px ${textStyle.textColor}` 
                    : '0 2px 8px rgba(0,0,0,0.85)',
                }}
              >
                {currentSlide.caption}
              </div>

              {currentSlide.subCaption && (
                <div className="mt-1 text-xs sm:text-sm font-medium text-slate-200/90 drop-shadow-md px-3 py-1 rounded-full bg-black/40 backdrop-blur-xs">
                  {currentSlide.subCaption}
                </div>
              )}
            </div>
          )}

          {/* Stickers / Location & Date Badges */}
          {currentSlide.stickers?.map((st) => (
            <div
              key={st.id}
              className="absolute z-20 px-3 py-1 rounded-full text-xs font-semibold text-white bg-slate-900/75 backdrop-blur-sm border border-white/20 shadow-lg flex items-center gap-1.5"
              style={{
                left: `${st.x}%`,
                top: `${st.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{st.text}</span>
            </div>
          ))}

          {/* Social Media Interface Simulation Overlay (Instagram/TikTok UI) */}
          {config.showSocialOverlay && (
            <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 bg-gradient-to-b from-black/40 via-transparent to-black/60">
              {/* Top Creator Info */}
              <div className="flex items-center gap-2 mt-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-rose-500 to-purple-600 p-0.5">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                    RC
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1 drop-shadow">
                    reelcraft_official
                    <span className="w-3 h-3 rounded-full bg-blue-500 text-[8px] flex items-center justify-center">✓</span>
                  </div>
                  <div className="text-[10px] text-slate-300 drop-shadow">Follow</div>
                </div>
              </div>

              {/* Right Side Social Actions (Heart, Comment, Share, Audio Disc) */}
              <div className="self-end flex flex-col items-center gap-4 mb-8">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-rose-500 shadow">
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </div>
                  <span className="text-[10px] font-bold text-white drop-shadow">48.2K</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white shadow">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-white drop-shadow">1,240</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white shadow">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-white drop-shadow">Share</span>
                </div>

                {/* Spinning Vinyl Audio Disc */}
                <div className={`w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 border-2 border-white/80 p-1 flex items-center justify-center shadow-lg ${isPlaying ? 'animate-spin' : ''}`}>
                  <Music className="w-4 h-4 text-purple-300" />
                </div>
              </div>
            </div>
          )}

          {/* Bottom Live Audio Beat Waveform Indicator */}
          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10">
            <Music className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[11px] font-medium text-slate-200 truncate max-w-[110px]">
              {config.musicTrack.title}
            </span>
            {/* Live Waveform Bars */}
            <div className="flex items-end gap-0.5 h-3 ml-1">
              {visualizerBars.map((val, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full bg-gradient-to-t from-purple-400 to-pink-400 transition-all duration-75"
                  style={{
                    height: isPlaying ? `${Math.max(20, val)}%` : '30%',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Center Big Play Overlay if paused */}
        {!isPlaying && (
          <div 
            onClick={onTogglePlay}
            className="absolute inset-0 z-30 bg-black/30 backdrop-blur-[2px] flex items-center justify-center cursor-pointer transition-all hover:bg-black/20"
          >
            <div className="w-16 h-16 rounded-full bg-rose-500/90 text-white flex items-center justify-center shadow-2xl transform hover:scale-110 active:scale-95 transition-all">
              <Play className="w-8 h-8 fill-white translate-x-0.5" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Transport Bar below phone */}
      <div className="mt-4 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 px-4 py-2 rounded-2xl shadow-xl z-20">
        {/* Previous Slide */}
        <button
          onClick={() => onSeekSlide((currentSlideIndex - 1 + slides.length) % slides.length)}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-all"
          title="Previous slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Play / Pause */}
        <button
          onClick={onTogglePlay}
          className="p-2 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white shadow-md hover:from-rose-400 hover:to-purple-500 transition-all active:scale-95"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
        </button>

        {/* Next Slide */}
        <button
          onClick={() => onSeekSlide((currentSlideIndex + 1) % slides.length)}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-all"
          title="Next slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Replay */}
        <button
          onClick={() => {
            onSeekSlide(0);
            if (!isPlaying) onTogglePlay();
          }}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-all"
          title="Replay from start"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-800 mx-1" />

        {/* Mute / Unmute */}
        <button
          onClick={handleToggleMute}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-all"
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Social Mock Overlay Toggle */}
        <button
          onClick={onToggleSocialOverlay}
          className={`p-1.5 rounded-xl transition-all ${
            config.showSocialOverlay ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Social UI mock overlay"
        >
          <Layers className="w-4 h-4" />
        </button>

        {/* Phone Bezel Frame Toggle */}
        <button
          onClick={onTogglePhoneFrame}
          className={`p-1.5 rounded-xl transition-all ${
            config.showPhoneFrame ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40' : 'hover:bg-slate-800 text-slate-400'
          }`}
          title="Toggle Smartphone device bezel"
        >
          <Smartphone className="w-4 h-4" />
        </button>

        {/* Fullscreen */}
        <button
          onClick={handleFullscreen}
          className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-all"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
