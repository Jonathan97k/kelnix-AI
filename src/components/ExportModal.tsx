import React, { useState } from 'react';
import { 
  Download, 
  Check, 
  X, 
  Film, 
  Sparkles, 
  Copy, 
  Share2, 
  RefreshCw, 
  Smartphone,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhotoSlide, ReelConfig } from '../types';
import { exportReelAsVideo, downloadBlob } from '../utils/videoExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: PhotoSlide[];
  config: ReelConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  slides,
  config,
}) => {
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Ready to render');
  const [exportedBlob, setExportedBlob] = useState<Blob | null>(null);
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [copiedText, setCopiedText] = useState<boolean>(false);

  if (!isOpen) return null;

  const totalDuration = slides.reduce((acc, s) => acc + s.duration, 0);
  const unresolvedSlides = slides.filter((slide) => slide.isPlaceholder || !slide.url);

  const handleStartExport = async () => {
    if (unresolvedSlides.length > 0) {
      setStatusText(`${unresolvedSlides.length} scene(s) still need real media before export.`);
      return;
    }

    setIsRendering(true);
    setProgress(0.01);
    setStatusText('Initializing video rendering engine...');
    setExportedBlob(null);

    try {
      const blob = await exportReelAsVideo(slides, config, (prog, cur, total, text) => {
        setProgress(prog);
        setStatusText(text);
      });

      setExportedBlob(blob);
      setIsRendering(false);
      setProgress(1.0);
      setStatusText('Reel rendered successfully!');

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe confetti fallback
      }
    } catch (err: any) {
      console.error('Export error:', err);
      setIsRendering(false);
      setStatusText(`Render failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDownloadVideo = () => {
    if (!exportedBlob) return;
    const cleanTitle = config.title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'my_reel';
    const filename = `${cleanTitle}_reelcraft_${config.aspectRatio.replace(':', 'x')}.webm`;
    downloadBlob(exportedBlob, filename);
  };

  const handleDownloadStoryImages = async () => {
    // Generate snapshot image downloads for each slide
    slides.forEach((slide, idx) => {
      const a = document.createElement('a');
      a.href = slide.url;
      a.download = `story_frame_${idx + 1}_${slide.name || 'photo'}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  };

  const handleCopyCaptionAndTags = () => {
    const fullText = `${config.socialCaption || config.title}\n\n${config.hashtags || ''}`;
    navigator.clipboard.writeText(fullText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-purple-600 p-0.5 shadow-lg shadow-rose-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Film className="w-5 h-5 text-rose-400" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                Export & Download Reel
              </h2>
              <p className="text-xs text-slate-400">
                {slides.length} Photos • {totalDuration.toFixed(1)}s • {config.aspectRatio} Aspect Ratio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Resolution / Quality */}
          {!exportedBlob && !isRendering && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Export Quality & Format
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setResolution('1080p')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    resolution === '1080p'
                      ? 'bg-purple-600/20 border-purple-500 text-white ring-2 ring-purple-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">1080p Full HD</span>
                    <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    High bitrate 60fps video for Instagram Reels, TikTok & Shorts
                  </p>
                </button>

                <button
                  onClick={() => setResolution('720p')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    resolution === '720p'
                      ? 'bg-purple-600/20 border-purple-500 text-white ring-2 ring-purple-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">720p Fast HD</span>
                    <span className="text-[10px] text-slate-400">Lightweight</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Faster rendering for quick sharing and previewing
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Render Progress Bar & Status */}
          {unresolvedSlides.length > 0 && !exportedBlob && !isRendering && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              Attach media to {unresolvedSlides.length} placeholder scene{unresolvedSlides.length === 1 ? '' : 's'} before exporting. AI has created the scene plan, but it has not generated images or videos.
            </div>
          )}

          {(isRendering || exportedBlob) && (
            <div className="bg-slate-950/80 p-5 rounded-2xl border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-2">
                  {isRendering ? (
                    <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                  {statusText}
                </span>
                <span className="font-mono font-bold text-purple-400 text-sm">
                  {Math.round(progress * 100)}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-500 via-purple-500 to-emerald-400 transition-all duration-200"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>

              {exportedBlob && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Your video is fully rendered and ready for download ({ (exportedBlob.size / (1024 * 1024)).toFixed(2) } MB)!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Social Caption & Hashtag Quick Copy */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">
                Instagram / TikTok Caption Bundle
              </span>
              <button
                onClick={handleCopyCaptionAndTags}
                className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied!' : 'Copy to Clipboard'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 line-clamp-2 italic">
              "{config.socialCaption || config.title}"
            </p>
            <p className="text-[10px] text-purple-400 font-mono truncate">
              {config.hashtags || '#reel #aesthetic #photography'}
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* Download Story Frames */}
            <button
              onClick={handleDownloadStoryImages}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Download individual photos as story slides"
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Story JPGs</span>
            </button>

            {/* Start Render / Download Video Button */}
            {!exportedBlob ? (
              <button
                onClick={handleStartExport}
                disabled={isRendering}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-purple-600 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                {isRendering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Rendering Video...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" />
                    <span>Render & Download Video</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDownloadVideo}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center gap-2 transition-all active:scale-95 animate-bounce"
              >
                <Download className="w-4 h-4" />
                <span>Save Video File</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
