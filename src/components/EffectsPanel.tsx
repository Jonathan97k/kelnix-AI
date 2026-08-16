import React from 'react';
import { 
  Sparkles, 
  Layers, 
  Smartphone, 
  Square, 
  RectangleVertical, 
  Tv, 
  Flame, 
  Film, 
  Share2, 
  Copy, 
  Check,
  Wand2
} from 'lucide-react';
import { 
  ReelConfig, 
  OverlayEffect, 
  AspectRatio, 
  TransitionType, 
  FilterStyle 
} from '../types';

interface EffectsPanelProps {
  config: ReelConfig;
  onChangeConfig: (newConfig: Partial<ReelConfig>) => void;
  onApplyGlobalTransition: (trans: TransitionType) => void;
  onApplyGlobalFilter: (filter: FilterStyle) => void;
}

const OVERLAY_OPTIONS: { id: OverlayEffect; label: string; desc: string; icon: any }[] = [
  { id: 'none', label: 'Clean / None', desc: 'Raw original presentation', icon: Layers },
  { id: 'film-grain', label: 'Cinematic Grain', desc: 'Analog 35mm texture', icon: Film },
  { id: 'vhs-scanlines', label: 'Retro VHS Cam', desc: '90s scanlines & glitch', icon: Tv },
  { id: 'light-leak', label: 'Golden Light Leak', desc: 'Warm ambient lens flare', icon: Flame },
];

export const EffectsPanel: React.FC<EffectsPanelProps> = ({
  config,
  onChangeConfig,
  onApplyGlobalTransition,
  onApplyGlobalFilter,
}) => {
  const [copiedCaption, setCopiedCaption] = React.useState<boolean>(false);
  const [copiedTags, setCopiedTags] = React.useState<boolean>(false);

  const handleCopyCaption = () => {
    if (config.socialCaption) {
      navigator.clipboard.writeText(config.socialCaption);
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    }
  };

  const handleCopyTags = () => {
    if (config.hashtags) {
      navigator.clipboard.writeText(config.hashtags);
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
      {/* Title */}
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          Effects, Framing & Viral Copy
        </h3>
        <p className="text-[11px] text-slate-400">
          Global video overlays, aspect ratio, frame simulations & captions
        </p>
      </div>

      {/* 1. Aspect Ratio Format */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
          Aspect Ratio & Output Format
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: '9:16' as AspectRatio, label: '9:16 Vertical', sub: 'Reels / TikTok', icon: Smartphone },
            { id: '1:1' as AspectRatio, label: '1:1 Square', sub: 'Instagram Feed', icon: Square },
            { id: '4:5' as AspectRatio, label: '4:5 Portrait', sub: 'Feed Post', icon: RectangleVertical },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = config.aspectRatio === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeConfig({ aspectRatio: item.id })}
                className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-500 text-white ring-2 ring-purple-500/30'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 text-purple-400" />
                <span className="text-xs font-bold">{item.label}</span>
                <span className="text-[10px] text-slate-500">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Global Video Overlays */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
          Atmospheric Video Overlays
        </label>
        <div className="grid grid-cols-2 gap-2">
          {OVERLAY_OPTIONS.map((ov) => {
            const Icon = ov.icon;
            const isSelected = config.globalOverlay === ov.id;
            return (
              <button
                key={ov.id}
                onClick={() => onChangeConfig({ globalOverlay: ov.id })}
                className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                  isSelected
                    ? 'bg-pink-600/20 border-pink-500 text-white ring-2 ring-pink-500/30'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 text-pink-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{ov.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{ov.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Global Bulk Apply Transitions */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="flex items-center gap-2">
          <Wand2 className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white">Apply Transition to All Scenes</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'whip-left' as TransitionType, label: 'Whip Left' },
            { id: 'crossfade' as TransitionType, label: 'Crossfade' },
            { id: 'zoom-in' as TransitionType, label: 'Zoom In' },
            { id: 'glitch' as TransitionType, label: 'Glitch' },
            { id: 'flash' as TransitionType, label: 'Flash Cut' },
            { id: 'slide-up' as TransitionType, label: 'Slide Up' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onApplyGlobalTransition(t.id)}
              className="text-xs px-2.5 py-1.5 rounded-xl font-medium bg-slate-800 hover:bg-purple-600 hover:text-white text-slate-300 border border-slate-700 transition-all"
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Display Simulation Toggles */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
        <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
          Studio Simulation Modes
        </span>

        {/* Social UI Mock */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-white">Social Media UI Overlay</div>
            <div className="text-[10px] text-slate-400">Simulate TikTok/Reels likes, comments & creator tags</div>
          </div>
          <button
            onClick={() => onChangeConfig({ showSocialOverlay: !config.showSocialOverlay })}
            className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
              config.showSocialOverlay ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.showSocialOverlay ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Phone Frame Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <div>
            <div className="text-xs font-bold text-white">Smartphone Bezel Frame</div>
            <div className="text-[10px] text-slate-400">Display realistic iPhone bezel frame during preview</div>
          </div>
          <button
            onClick={() => onChangeConfig({ showPhoneFrame: !config.showPhoneFrame })}
            className={`w-10 h-6 rounded-full transition-colors p-0.5 ${
              config.showPhoneFrame ? 'bg-purple-600' : 'bg-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                config.showPhoneFrame ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 5. Social Media Copy & Viral Hashtags */}
      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">Ready-to-Post Social Caption</span>
          </div>
          <button
            onClick={handleCopyCaption}
            className="text-[11px] font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            {copiedCaption ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCaption ? 'Copied!' : 'Copy Caption'}</span>
          </button>
        </div>

        <textarea
          rows={3}
          value={config.socialCaption || ''}
          onChange={(e) => onChangeConfig({ socialCaption: e.target.value })}
          placeholder="Instagram / TikTok caption copy..."
          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-hidden"
        />

        <div className="pt-2 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Viral Hashtags Bundle</span>
            <button
              onClick={handleCopyTags}
              className="text-[10px] font-semibold text-slate-400 hover:text-white flex items-center gap-1"
            >
              {copiedTags ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedTags ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <input
            type="text"
            value={config.hashtags || ''}
            onChange={(e) => onChangeConfig({ hashtags: e.target.value })}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-purple-300 font-mono focus:border-purple-500 focus:outline-hidden"
          />
        </div>
      </div>
    </div>
  );
};
