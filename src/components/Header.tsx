import React from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Upload, 
  Download, 
  Smartphone, 
  Square, 
  RectangleVertical, 
  Music,
  FolderOpen,
  Users,
  Facebook,
  Globe,
  MessageSquare
} from 'lucide-react';
import { AspectRatio, ReelConfig, ClientProfile } from '../types';
import { PRESET_COLLECTIONS } from '../utils/presets';

interface HeaderProps {
  config: ReelConfig;
  onChangeConfig: (newConfig: Partial<ReelConfig>) => void;
  onOpenAIModal: () => void;
  onOpenResearchModal: () => void;
  onOpenChatModal: () => void;
  onOpenExportModal: () => void;
  onOpenClientModal: () => void;
  onOpenFacebookModal: () => void;
  activeClient: ClientProfile;
  onSelectPreset: (presetIndex: number) => void;
  onUploadPhotos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  totalSlides: number;
  totalDuration: number;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onChangeConfig,
  onOpenAIModal,
  onOpenResearchModal,
  onOpenChatModal,
  onOpenExportModal,
  onOpenClientModal,
  onOpenFacebookModal,
  activeClient,
  onSelectPreset,
  onUploadPhotos,
  totalSlides,
  totalDuration,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-30 sticky top-0">
      {/* Brand & Stats */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-amber-400 p-0.5 shadow-lg shadow-purple-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Clapperboard className="w-5 h-5 text-rose-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white tracking-tight">ReelCraft</h1>
            <span className="text-[10px] font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded-full">
              AI ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">
            {totalSlides} Photos • {totalDuration.toFixed(1)}s Reel • {config.musicTrack.bpm} BPM
          </p>
        </div>

        {/* Active Client Badge in Header */}
        <button
          onClick={onOpenClientModal}
          className="hidden md:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-purple-500/30 hover:border-purple-500/60 transition-all text-left group"
          title="Switch Active Customer Client"
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] text-white"
            style={{ backgroundColor: activeClient?.brandColor || '#8B5CF6' }}
          >
            {activeClient?.name?.substring(0, 2).toUpperCase() || 'CL'}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Client</span>
            <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate max-w-[130px]">
              {activeClient?.name || 'Select Client'}
            </span>
          </div>
          <Users className="w-3.5 h-3.5 text-purple-400 ml-1" />
        </button>
      </div>

      {/* Center Controls: Aspect Ratio & Preset Samples */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/50">
        {/* Preset Templates */}
        <div className="flex items-center gap-1.5 px-2 border-r border-slate-700/60">
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-300 font-medium mr-1">Presets:</span>
          {PRESET_COLLECTIONS.map((preset, idx) => (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(idx)}
              className="text-xs px-2.5 py-1 rounded-lg font-medium transition-all text-slate-300 hover:text-white hover:bg-slate-700/70"
            >
              {preset.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Aspect Ratio Selector */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChangeConfig({ aspectRatio: '9:16' })}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
              config.aspectRatio === '9:16'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="9:16 Reels / TikTok"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16</span>
          </button>
          <button
            onClick={() => onChangeConfig({ aspectRatio: '1:1' })}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
              config.aspectRatio === '1:1'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="1:1 Square Feed"
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1</span>
          </button>
          <button
            onClick={() => onChangeConfig({ aspectRatio: '4:5' })}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
              config.aspectRatio === '4:5'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="4:5 Instagram Portrait"
          >
            <RectangleVertical className="w-3.5 h-3.5" />
            <span>4:5</span>
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Upload Media input (Photos & Videos) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={onUploadPhotos}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shadow-sm"
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Add Media</span>
        </button>

        {/* Clients Manager */}
        <button
          onClick={onOpenClientModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 text-xs font-semibold border border-purple-500/40 transition-all shadow-sm"
          title="Customer & Client CRM"
        >
          <Users className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">Clients</span>
        </button>

        {/* AI Command Chat trigger */}
        <button
          onClick={onOpenChatModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-all shadow-sm"
          title="Describe what you want — the AI does it for you"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">AI Chat</span>
        </button>

        {/* Research Modal trigger */}
        <button
          onClick={onOpenResearchModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 text-sky-300 text-xs font-semibold border border-sky-500/40 transition-all shadow-sm"
          title="Free internet research: Wikipedia, DuckDuckGo & Google News"
        >
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Research</span>
        </button>

        {/* AI Director Modal trigger */}
        <button
          onClick={onOpenAIModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/40 hover:to-pink-600/40 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>AI Director</span>
        </button>

        {/* Facebook Direct Share Button */}
        <button
          onClick={onOpenFacebookModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/50 text-blue-300 text-xs font-semibold border border-blue-500/40 transition-all shadow-sm"
          title="Direct Publish to Facebook Page"
        >
          <Facebook className="w-3.5 h-3.5 text-blue-400 fill-current" />
          <span className="hidden sm:inline">Share FB</span>
        </button>

        {/* Export Video button */}
        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-400 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-rose-500/20 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
