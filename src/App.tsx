import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Music, 
  Sparkles, 
  Upload, 
  Layers, 
  Film,
  Plus,
  Play,
  Pause,
  Wand2
} from 'lucide-react';
import { PhotoSlide, ReelConfig, TransitionType, FilterStyle, ClientProfile } from './types';
import { createDefaultReel, PRESET_COLLECTIONS } from './utils/presets';
import { getSavedClients, saveClients, getActiveClientId, setActiveClientId } from './utils/clientStorage';
import { audioEngine } from './utils/audioEngine';
import { Header } from './components/Header';
import { ReelPreview } from './components/ReelPreview';
import { Timeline } from './components/Timeline';
import { SlideEditor } from './components/SlideEditor';
import { AudioSettings } from './components/AudioSettings';
import { EffectsPanel } from './components/EffectsPanel';
import { AIStoryDirector } from './components/AIStoryDirector';
import { ResearchPanel } from './components/ResearchPanel';
import { CommandChat } from './components/CommandChat';
import { ExportModal } from './components/ExportModal';
import { ClientManagerModal } from './components/ClientManagerModal';
import { FacebookPublishModal } from './components/FacebookPublishModal';

export default function App() {
  // Initialize with the first curated preset
  const [initialData] = useState(() => createDefaultReel(0));
  const [slides, setSlides] = useState<PhotoSlide[]>(initialData.slides);
  const [config, setConfig] = useState<ReelConfig>(initialData.config);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'slide' | 'audio' | 'effects'>('slide');

  // Customer / Client CRM Profiles
  const [clients, setClients] = useState<ClientProfile[]>(() => getSavedClients());
  const [activeClientIdState, setActiveClientIdState] = useState<string>(() => getActiveClientId());

  const activeClient = clients.find((c) => c.id === activeClientIdState) || clients[0];

  // Modals
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isResearchModalOpen, setIsResearchModalOpen] = useState<boolean>(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);
  const [isFacebookModalOpen, setIsFacebookModalOpen] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // Playback timer ref
  const playbackTimerRef = useRef<number | null>(null);

  // Total Duration
  const totalDuration = slides.reduce((acc, s) => acc + s.duration, 0);

  // Update Config
  const handleUpdateConfig = (newConfig: Partial<ReelConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Client Profile Handlers
  const handleSelectActiveClient = (client: ClientProfile) => {
    setActiveClientIdState(client.id);
    setActiveClientId(client.id);
    handleUpdateConfig({
      title: `${client.name} • Highlights`,
      socialCaption: `✨ Experience the best of ${client.name}. ${client.callToAction}`,
      hashtags: client.defaultHashtags,
      clientId: client.id,
    });
  };

  const handleSaveClient = (updatedClient: ClientProfile) => {
    setClients((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedClient.id);
      let next: ClientProfile[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = updatedClient;
      } else {
        next = [updatedClient, ...prev];
      }
      saveClients(next);
      return next;
    });
  };

  const handleDeleteClient = (clientIdToDelete: string) => {
    setClients((prev) => {
      const next = prev.filter((c) => c.id !== clientIdToDelete);
      saveClients(next);
      if (activeClientIdState === clientIdToDelete && next.length > 0) {
        setActiveClientIdState(next[0].id);
        setActiveClientId(next[0].id);
      }
      return next;
    });
  };

  // Play / Pause Toggle
  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      audioEngine.pause();
    } else {
      setIsPlaying(true);
      audioEngine.play(config.musicTrack);
    }
  };

  // Playback Engine Loop
  useEffect(() => {
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }

    if (isPlaying && slides.length > 0) {
      const currentSlide = slides[currentSlideIndex] || slides[0];
      const durationMs = (currentSlide.duration || 2.2) * 1000;

      playbackTimerRef.current = window.setTimeout(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
      }, durationMs);
    }

    return () => {
      if (playbackTimerRef.current) {
        clearTimeout(playbackTimerRef.current);
      }
    };
  }, [isPlaying, currentSlideIndex, slides]);

  // Select Preset
  const handleSelectPreset = (presetIndex: number) => {
    const { slides: newSlides, config: newConfig } = createDefaultReel(presetIndex);
    setSlides(newSlides);
    setConfig(newConfig);
    setCurrentSlideIndex(0);
    if (isPlaying) {
      audioEngine.play(newConfig.musicTrack);
    }
  };

  // Auto Beat Sync
  const handleAutoBeatSync = () => {
    const bpm = config.musicTrack.bpm || 120;
    // Calculate 2-bar or 4-beat interval
    const beatInterval = 60 / bpm;
    // Pacing choices: 2 beats (~1.0s), 4 beats (~2.0s), 6 beats (~3.0s)
    let targetSlideDuration = Number((beatInterval * 4).toFixed(2));
    if (targetSlideDuration < 1.4) targetSlideDuration = Number((beatInterval * 8).toFixed(2));

    const updatedSlides = slides.map((s) => ({
      ...s,
      duration: targetSlideDuration,
    }));

    setSlides(updatedSlides);
    handleUpdateConfig({ beatSync: true });
  };

  // Slide CRUD Operations
  const handleUpdateSlide = (index: number, partial: Partial<PhotoSlide>) => {
    setSlides((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], ...partial };
      }
      return next;
    });
  };

  const handleDeleteSlide = (index: number) => {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    if (currentSlideIndex >= index && currentSlideIndex > 0) {
      setCurrentSlideIndex((prev) => prev - 1);
    }
  };

  const handleDuplicateSlide = (index: number) => {
    const slideToCopy = slides[index];
    if (!slideToCopy) return;
    const newSlide: PhotoSlide = {
      ...slideToCopy,
      id: `slide-${Date.now()}`,
      name: `${slideToCopy.name} (Copy)`,
    };
    setSlides((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, newSlide);
      return next;
    });
    setCurrentSlideIndex(index + 1);
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
    setCurrentSlideIndex(toIndex);
  };

  // Media Upload Handler (Images and Video Clips)
  const processUploadedFiles = (files: FileList | File[]) => {
    const mediaFiles = Array.from(files).filter(
      (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    if (mediaFiles.length === 0) return;

    const readPromises = mediaFiles.map((file, idx) => {
      return new Promise<PhotoSlide>((resolve) => {
        const isVideo = file.type.startsWith('video/');
        const reader = new FileReader();
        reader.onload = (e) => {
          const resultUrl = e.target?.result as string;
          const cleanName = file.name.replace(/\.[^/.]+$/, '');
          resolve({
            id: `uploaded-${Date.now()}-${idx}`,
            url: resultUrl,
            mediaType: isVideo ? 'video' : 'photo',
            name: cleanName,
            caption: `Moment: ${cleanName}`,
            subCaption: isVideo ? 'Video Clip' : 'Captured live',
            duration: isVideo ? 3.5 : 2.2,
            motion: isVideo ? 'static' : (idx % 2 === 0 ? 'kenburns-zoom-in' : 'kenburns-zoom-out'),
            transition: 'whip-left',
            filter: 'normal',
            filterAdjustments: { brightness: 1.0, contrast: 1.0, saturation: 1.0, vignette: 0, blur: 0, warmth: 0 },
            textStyle: {
              font: 'sans-bold',
              position: 'lower-third',
              textColor: '#FFFFFF',
              backgroundColor: 'rgba(0,0,0,0.6)',
              animation: 'fade-up',
              fontSize: 'lg',
              hasBadge: true,
            },
            narrationText: isVideo ? `Watch this video scene.` : `Here is ${cleanName}, captured in high definition.`,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readPromises).then((newSlides) => {
      setSlides((prev) => [...prev, ...newSlides]);
      setCurrentSlideIndex(slides.length); // jump to first newly added slide
    });
  };

  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processUploadedFiles(e.target.files);
    }
  };

  // Drag and Drop Zone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      processUploadedFiles(e.dataTransfer.files);
    }
  };

  // Bulk Apply Effects
  const handleApplyGlobalTransition = (trans: TransitionType) => {
    setSlides((prev) => prev.map((s) => ({ ...s, transition: trans })));
  };

  const handleApplyGlobalFilter = (fil: FilterStyle) => {
    setSlides((prev) => prev.map((s) => ({ ...s, filter: fil })));
  };

  // Apply AI Director Result
  const handleApplyAIResult = (result: any) => {
    if (result.title) handleUpdateConfig({ title: result.title });
    if (result.socialCaption) handleUpdateConfig({ socialCaption: result.socialCaption });
    if (result.hashtags) handleUpdateConfig({ hashtags: result.hashtags });

    setSlides((prev) =>
      prev.map((slide, idx) => {
        const generatedCaption = result.captions?.[idx] || slide.caption;
        const generatedNarration = result.narrations?.[idx] || slide.narrationText;
        return {
          ...slide,
          caption: generatedCaption,
          narrationText: generatedNarration,
          duration: result.recommendedPacing || slide.duration,
          transition: result.recommendedTransition || slide.transition,
        };
      })
    );
  };

  const currentSlide = slides[currentSlideIndex] || slides[0];

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-purple-950/80 backdrop-blur-md border-4 border-dashed border-purple-400 flex flex-col items-center justify-center pointer-events-none animate-pulse">
          <Upload className="w-16 h-16 text-purple-300 mb-4 animate-bounce" />
          <h2 className="text-2xl font-bold text-white">Drop Photos to Create Reel Scenes</h2>
          <p className="text-sm text-purple-200 mt-2">Instant multi-photo import & AI story sequencing</p>
        </div>
      )}

      {/* Top Header */}
      <Header
        config={config}
        onChangeConfig={handleUpdateConfig}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenResearchModal={() => setIsResearchModalOpen(true)}
        onOpenChatModal={() => setIsChatModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenClientModal={() => setIsClientModalOpen(true)}
        onOpenFacebookModal={() => setIsFacebookModalOpen(true)}
        activeClient={activeClient}
        onSelectPreset={handleSelectPreset}
        onUploadPhotos={handleUploadPhotos}
        totalSlides={slides.length}
        totalDuration={totalDuration}
      />

      {/* Main Workspace (Split View) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Center / Left: Interactive Reel Preview Simulator */}
        <ReelPreview
          slides={slides}
          config={config}
          currentSlideIndex={currentSlideIndex}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
          onSeekSlide={(idx) => setCurrentSlideIndex(idx)}
          onToggleSocialOverlay={() => handleUpdateConfig({ showSocialOverlay: !config.showSocialOverlay })}
          onTogglePhoneFrame={() => handleUpdateConfig({ showPhoneFrame: !config.showPhoneFrame })}
        />

        {/* Right Side: Tabbed Studio Inspector Panels */}
        <div className="w-full lg:w-96 xl:w-[420px] bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col flex-shrink-0">
          {/* Tabs Selector */}
          <div className="flex border-b border-slate-800 bg-slate-950/40 p-1">
            <button
              onClick={() => setActiveTab('slide')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'slide'
                  ? 'bg-slate-800 text-purple-300 shadow-xs border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Scene</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'audio'
                  ? 'bg-slate-800 text-purple-300 shadow-xs border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>Audio</span>
            </button>

            <button
              onClick={() => setActiveTab('effects')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'effects'
                  ? 'bg-slate-800 text-purple-300 shadow-xs border border-purple-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Effects & Copy</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'slide' && currentSlide && (
              <SlideEditor
                slide={currentSlide}
                slideIndex={currentSlideIndex}
                totalSlides={slides.length}
                onUpdate={(partial) => handleUpdateSlide(currentSlideIndex, partial)}
              />
            )}

            {activeTab === 'audio' && (
              <AudioSettings
                config={config}
                onChangeConfig={handleUpdateConfig}
                onAutoBeatSync={handleAutoBeatSync}
              />
            )}

            {activeTab === 'effects' && (
              <EffectsPanel
                config={config}
                onChangeConfig={handleUpdateConfig}
                onApplyGlobalTransition={handleApplyGlobalTransition}
                onApplyGlobalFilter={handleApplyGlobalFilter}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom Timeline Storyboard */}
      <Timeline
        slides={slides}
        currentSlideIndex={currentSlideIndex}
        onSelectSlide={(idx) => setCurrentSlideIndex(idx)}
        onUpdateSlide={handleUpdateSlide}
        onDeleteSlide={handleDeleteSlide}
        onDuplicateSlide={handleDuplicateSlide}
        onMoveSlide={handleMoveSlide}
        onAddSlide={() => {
          // Open file picker or add a duplicate
          handleDuplicateSlide(slides.length - 1);
        }}
        onAutoBeatSync={handleAutoBeatSync}
        bpm={config.musicTrack.bpm}
        beatSyncEnabled={config.beatSync}
      />

      {/* AI Story Director Modal */}
      <AIStoryDirector
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        activeClient={activeClient}
        slides={slides}
        config={config}
        onApplyDirectorResult={handleApplyAIResult}
      />

      {/* Internet Research Modal */}
      <ResearchPanel
        isOpen={isResearchModalOpen}
        onClose={() => setIsResearchModalOpen(false)}
        onUseAsCaption={(text) => handleUpdateConfig({ socialCaption: text })}
      />

      {/* AI Command Chat Modal */}
      <CommandChat
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        slideCount={slides.length}
        theme={config.theme || 'Travel & Adventure'}
        tone={activeClient?.brandVoice ? `${activeClient.brandVoice} & Engaging` : 'Cinematic & Inspiring'}
        aspectRatio={config.aspectRatio}
        title={config.title || ''}
        onApplyScript={handleApplyAIResult}
        onUpdateConfig={handleUpdateConfig}
        onUpdateSlide={handleUpdateSlide}
        onBulkEffect={(effect, value) => {
          if (effect === 'transition') handleApplyGlobalTransition(value as any);
          else handleApplyGlobalFilter(value as any);
        }}
      />

      {/* Export Video Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        slides={slides}
        config={config}
      />

      {/* Client CRM & Registration Hub Modal */}
      <ClientManagerModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clients={clients}
        activeClientId={activeClientIdState}
        onSelectActiveClient={handleSelectActiveClient}
        onSaveClient={handleSaveClient}
        onDeleteClient={handleDeleteClient}
      />

      {/* Facebook Direct Page Publishing Modal */}
      <FacebookPublishModal
        isOpen={isFacebookModalOpen}
        onClose={() => setIsFacebookModalOpen(false)}
        slides={slides}
        config={config}
        activeClient={activeClient}
        onUpdateClient={handleSaveClient}
      />
    </div>
  );
}
