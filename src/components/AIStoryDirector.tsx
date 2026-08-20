import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Film, 
  Music, 
  Hash, 
  Check, 
  RefreshCw, 
  X, 
  Camera, 
  Flame, 
  Palmtree, 
  Coffee, 
  Zap, 
  Heart,
  Bot
} from 'lucide-react';
import { PhotoSlide, ReelConfig, TransitionType, ClientProfile } from '../types';
import { postJson } from '../services/api/apiClient';

interface AIStoryDirectorProps {
  isOpen: boolean;
  onClose: () => void;
  activeClient?: ClientProfile;
  slides: PhotoSlide[];
  config: ReelConfig;
  onApplyDirectorResult: (data: {
    title: string;
    captions: string[];
    narrations: string[];
    socialCaption: string;
    hashtags: string;
    musicMood: string;
    recommendedBpm?: number;
    recommendedTransition?: TransitionType;
  }) => void;
}

const THEME_OPTIONS = [
  { id: 'Travel & Adventure', label: 'Travel & Wanderlust', icon: Palmtree, color: 'from-amber-500 to-rose-500' },
  { id: 'Aesthetic Vlog', label: 'Aesthetic / Cozy Day', icon: Coffee, color: 'from-orange-400 to-amber-600' },
  { id: 'High Energy / Fitness', label: 'Fitness & Motivation', icon: Flame, color: 'from-red-500 to-rose-600' },
  { id: 'Urban & Street', label: 'Street & Cyberpunk', icon: Zap, color: 'from-cyan-500 to-blue-600' },
  { id: 'Romantic & Celebration', label: 'Love & Memories', icon: Heart, color: 'from-pink-500 to-rose-500' },
  { id: 'Cinematic Story', label: 'Cinematic Epic', icon: Film, color: 'from-purple-500 to-indigo-600' },
];

const TONE_OPTIONS = [
  'Cinematic & Inspiring',
  'Chill & Aesthetic',
  'High Energy & Bold',
  'Playful & Viral',
  'Emotional & Poetic',
  'Minimalist & Elegant',
];

export const AIStoryDirector: React.FC<AIStoryDirectorProps> = ({
  isOpen,
  onClose,
  activeClient,
  slides,
  config,
  onApplyDirectorResult,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<string>(config.theme || 'Travel & Adventure');
  const [selectedTone, setSelectedTone] = useState<string>(activeClient?.brandVoice ? `${activeClient.brandVoice} & Engaging` : 'Cinematic & Inspiring');
  const [customPrompt, setCustomPrompt] = useState<string>(
    activeClient ? `Client: ${activeClient.name} (${activeClient.industry}). Target audience: ${activeClient.targetAudience}. Key points: ${activeClient.keySellingPoints}. CTA: ${activeClient.callToAction}` : ''
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isVisionScanning, setIsVisionScanning] = useState<boolean>(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateScript = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const data = await postJson<any>('/api/generate-script', {
        theme: selectedTheme,
        tone: selectedTone,
        photoCount: slides.length,
        photoDescriptions: slides.map((s, idx) => `Slide ${idx + 1}: ${s.name || s.caption || (s.mediaType === 'video' ? 'Video Scene' : 'Photo')}`),
        customPrompt,
        clientProfile: activeClient,
      });

      setGeneratedResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Error communicating with AI director');
    } finally {
      setIsLoading(false);
    }
  };

  // Vision scanning for photo comprehension
  const handleScanPhotosWithVision = async () => {
    setIsVisionScanning(true);
    setErrorMsg(null);

    try {
      // Collect image URLs or samples
      const imagePayloads: any[] = [];
      for (const slide of slides.slice(0, 4)) {
        if (slide.url.startsWith('data:image')) {
          imagePayloads.push({ base64: slide.url });
        }
      }

      const data = await postJson<any>('/api/analyze-photos', { images: imagePayloads });
      if (data) {
        const d = data;
        if (d.detectedTheme) setSelectedTheme(d.detectedTheme);
        if (d.suggestedCaptions && d.suggestedCaptions.length) {
          setCustomPrompt(`Detected visual elements: ${d.detectedTheme} (${d.detectedVibe}). Make captions fit these photos accurately.`);
        }
      }
    } catch (err: any) {
      console.warn('Vision scan error', err);
    } finally {
      setIsVisionScanning(false);
      // Trigger full script generation with detected info
      handleGenerateScript();
    }
  };

  const handleApply = () => {
    if (!generatedResult) return;
    onApplyDirectorResult(generatedResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Gemini AI Story Director
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  FLASH 3.7
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Auto-generate cinematic captions, hooks, voiceover narrations & viral hashtags
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

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Theme Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              1. Choose Reel Vibe & Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_OPTIONS.map((th) => {
                const Icon = th.icon;
                const isSelected = selectedTheme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setSelectedTheme(th.id)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border-purple-500 text-white ring-2 ring-purple-500/30'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${th.color} flex items-center justify-center text-white shadow-sm flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold leading-tight">{th.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tone Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Select Tone of Voice
            </label>
            <div className="flex flex-wrap gap-1.5">
              {TONE_OPTIONS.map((tone) => (
                <button
                  key={tone}
                  onClick={() => setSelectedTone(tone)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                    selectedTone === tone
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Guidance Prompt */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              3. Specific Story Angle or Instructions (Optional)
            </label>
            <input
              type="text"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Highlight our weekend in Positano, mention the sunset boat tour, focus on gratitude..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden transition-all"
            />
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={handleGenerateScript}
              disabled={isLoading || isVisionScanning}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Gemini is Crafting Reel...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 text-amber-300" />
                  <span>Auto-Direct Reel ({slides.length} Scenes)</span>
                </>
              )}
            </button>

            <button
              onClick={handleScanPhotosWithVision}
              disabled={isLoading || isVisionScanning}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              title="Scan uploaded photos with Gemini Vision to extract photo-specific details"
            >
              <Camera className="w-4 h-4 text-cyan-400" />
              <span>Vision Scan</span>
            </button>
          </div>

          {/* Generated Result Preview */}
          {generatedResult && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-950/80 border border-purple-500/30 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">Generated Concept: {generatedResult.title}</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Ready to Apply
                </span>
              </div>

              {/* Hook */}
              {generatedResult.hook && (
                <div className="text-xs text-amber-300 font-semibold bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                  🎯 Opening Hook: "{generatedResult.hook}"
                </div>
              )}

              {/* Scene Captions & Narrations list */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Scene-by-Scene Captions ({generatedResult.captions?.length || 0})
                </span>
                <div className="grid gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {generatedResult.captions?.map((cap: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                      <span className="w-5 h-5 rounded bg-purple-600/30 text-purple-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-200">{cap}</div>
                        {generatedResult.narrations?.[idx] && (
                          <div className="text-[11px] text-slate-400 italic mt-0.5">
                            🎙️ "{generatedResult.narrations[idx]}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Caption & Hashtags */}
              {generatedResult.socialCaption && (
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-slate-400 text-[10px] uppercase">Instagram/TikTok Copy:</div>
                  <div className="text-xs line-clamp-2">{generatedResult.socialCaption}</div>
                  <div className="text-[10px] text-purple-400 font-mono truncate">{generatedResult.hashtags}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>

          {generatedResult && (
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Apply Story to Reel</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
