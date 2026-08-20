import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  ArrowLeft, 
  Save, 
  Video, 
  CheckCircle2, 
  Loader2,
  ChevronRight,
  LayoutTemplate,
  Target,
  Smile,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  contentGenerationService 
} from '../services/ai/contentGenerationService';
import { 
  contentService 
} from '../services/content/contentService';
import { 
  businessService 
} from '../services/businesses/businessService';
import { 
  projectService 
} from '../services/projects/projectService';
import { contentToEditorAdapter } from '../services/editor/contentToEditorAdapter';

import { 
  AIContentRequest, 
  AIContentResponse, 
  AIContentScene, 
  ClientProfile 
} from '../types';

const CONTENT_TYPES = [
  'Promotional video',
  'Product advertisement',
  'Educational content',
  'Social media reel',
  'Business introduction',
  'Testimonial style',
  'Announcement',
];

const PLATFORMS = [
  'TikTok',
  'Instagram Reels',
  'Facebook Reels',
  'YouTube Shorts',
];

const TONES = [
  'Professional',
  'Friendly',
  'Exciting',
  'Funny',
  'Luxury',
  'Educational',
];

const LOADING_STAGES = [
  'Understanding your idea...',
  'Researching target audience...',
  'Creating your hook...',
  'Writing your script...',
  'Planning your scenes...',
  'Optimizing for platform...',
  'Finalizing captions...',
];

export const CreateContent: React.FC = () => {
  const navigate = useNavigate();
  
  const [userId] = useState<string>('user-123'); 
  const [businessId, setBusinessId] = useState<string>('');
  const [projectId, setProjectId] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [contentType, setContentType] = useState<string>(CONTENT_TYPES[0]);
  const [platform, setPlatform] = useState<string>(PLATFORMS[0]);
  const [audience, setAudience] = useState<string>('');
  const [tone, setTone] = useState<string>(TONES[0]);

  const [businesses, setBusinesses] = useState<ClientProfile[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<ClientProfile | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [generatedContent, setGeneratedContent] = useState<AIContentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const biz = await businessService.getMyBusinesses();
      setBusinesses(biz);
      const proj = await projectService.getMyProjects();
      setProjects(proj);
    } catch (e) {
      console.error('Failed to load initial data', e);
    }
  };

  useEffect(() => {
    if (isGenerating) {
      const interval = setInterval(() => {
        setLoadingStageIndex((prev) => (prev + 1) % LOADING_STAGES.length);
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!topic) {
      setError('Please provide a topic or idea.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLoadingStageIndex(0);

    try {
      const request: AIContentRequest = {
        userId,
        businessId,
        projectId,
        topic,
        contentType,
        targetPlatform: platform,
        targetAudience: audience || 'General Audience',
        tone,
        businessContext: selectedBusiness || undefined,
      };

      const result = await contentGenerationService.generateContent(request);
      setGeneratedContent(result);
    } catch (e: any) {
      setError(e.message || 'An error occurred while generating content.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (!generatedContent) return;
    setIsSaving(true);
    try {
      const activeProject = projectId
        ? await projectService.getProject(projectId)
        : await projectService.createProject({
            businessId: businessId || undefined,
            title: generatedContent.title || topic || 'Untitled Reel',
            description: generatedContent.shortDescription || generatedContent.hook || '',
            contentType: 'video',
            status: 'ready',
          });

      if (!activeProject) {
        throw new Error('The selected project could not be found. Please choose another project.');
      }

      const activeProjectId = activeProject.id;
      
      // 1. Save the AI content record
      const savedContent = await contentService.saveGeneratedContent({
        projectId: activeProjectId,
        script: generatedContent.fullScript,
        caption: generatedContent.caption,
        hashtags: generatedContent.hashtags.split(' ').filter(t => t.startsWith('#')),
        scenePrompts: generatedContent.scenes.map(s => s.visualDescription),
        voiceScript: generatedContent.voiceoverScript,
      });

      // 2. Convert AI content to editor state and save it
      const editorState = contentToEditorAdapter.convertToEditorState(generatedContent, {
        projectId: activeProjectId,
        generatedContentId: savedContent.id,
      });
      await projectService.saveEditorState(activeProjectId, editorState);

      // 3. Navigate to editor with the specific project ID
      navigate(`/editor?project=${activeProjectId}`);
    } catch (e) {
      setError('Failed to save content and project state.');
    } finally {
      setIsSaving(false);
    }
  };

  if (generatedContent) {
    return (
      <div className='max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
        <div className='flex items-center justify-between'>
          <button 
            onClick={() => setGeneratedContent(null)} 
            className='flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium'
          >
            <ArrowLeft className='w-4 h-4' /> Back to Edit
          </button>
          <div className='flex items-center gap-3'>
            <button 
              onClick={handleSaveAndExit}
              disabled={isSaving}
              className='flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all disabled:opacity-50'
            >
              {isSaving ? <Loader2 className='w-4 h-4 animate-spin' /> : <Save className='w-4 h-4' />}
              Save & Open Editor
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-6'>
            <section className='bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4'>
              <div className='flex items-center gap-2 text-purple-400 font-bold text-sm uppercase tracking-wider'>
                <Sparkles className='w-4 h-4' /> Script Overview
              </div>
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold text-slate-500 uppercase'>Project Title</label>
                  <input 
                    className='w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all'
                    value={generatedContent.title}
                    onChange={(e) => setGeneratedContent({...generatedContent, title: e.target.value})}
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold text-slate-500 uppercase'>The Hook</label>
                  <input 
                    className='w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-all'
                    value={generatedContent.hook}
                    onChange={(e) => setGeneratedContent({...generatedContent, hook: e.target.value})}
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold text-slate-500 uppercase'>Full Narrative</label>
                  <textarea 
                    rows={4}
                    className='w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all'
                    value={generatedContent.fullScript}
                    onChange={(e) => setGeneratedContent({...generatedContent, fullScript: e.target.value})}
                  />
                </div>
              </div>
            </section>

            <section className='bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4'>
              <div className='flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider'>
                <Video className='w-4 h-4' /> Scene Breakdown
              </div>
              <div className='space-y-3'>
                {generatedContent.scenes.map((scene, idx) => (
                  <div key={idx} className='p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30'>
                        Scene {scene.sceneNumber} ({scene.duration}s)
                      </span>
                    </div>
                    <div className='grid gap-3'>
                      <div className='space-y-1'>
                        <label className='text-[10px] font-bold text-slate-500 uppercase'>Visuals</label>
                        <input 
                          className='w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none'
                          value={scene.visualDescription}
                          onChange={(e) => {
                            const newScenes = [...generatedContent.scenes];
                            newScenes[idx].visualDescription = e.target.value;
                            setGeneratedContent({...generatedContent, scenes: newScenes});
                          }}
                        />
                      </div>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='space-y-1'>
                          <label className='text-[10px] font-bold text-slate-500 uppercase'>Narration</label>
                          <input 
                            className='w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none'
                            value={scene.narration}
                            onChange={(e) => {
                              const newScenes = [...generatedContent.scenes];
                              newScenes[idx].narration = e.target.value;
                              setGeneratedContent({...generatedContent, scenes: newScenes});
                            }}
                          />
                        </div>
                        <div className='space-y-1'>
                          <label className='text-[10px] font-bold text-slate-500 uppercase'>On-Screen Text</label>
                          <input 
                            className='w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 outline-none'
                            value={scene.onScreenText}
                            onChange={(e) => {
                              const newScenes = [...generatedContent.scenes];
                              newScenes[idx].onScreenText = e.target.value;
                              setGeneratedContent({...generatedContent, scenes: newScenes});
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className='space-y-6'>
            <section className='bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4'>
              <div className='flex items-center gap-2 text-emerald-400 font-bold text-sm uppercase tracking-wider'>
                <CheckCircle2 className='w-4 h-4' /> Final Delivery
              </div>
              <div className='space-y-4'>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold text-slate-500 uppercase'>Social Caption</label>
                  <textarea 
                    rows={5}
                    className='w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all'
                    value={generatedContent.caption}
                    onChange={(e) => setGeneratedContent({...generatedContent, caption: e.target.value})}
                  />
                </div>
                <div className='space-y-1'>
                  <label className='text-[10px] font-bold text-slate-500 uppercase'>Hashtags</label>
                  <input 
                    className='w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-emerald-400 font-mono text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all'
                    value={generatedContent.hashtags}
                    onChange={(e) => setGeneratedContent({...generatedContent, hashtags: e.target.value})}
                  />
                </div>
                <div className='pt-4 border-t border-slate-800'>
                  <div className='flex items-center justify-between text-xs mb-2'>
                    <span className='text-slate-400'>Estimated Duration:</span>
                    <span className='text-white font-bold'>{generatedContent.suggestedDuration}s</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-3xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='text-center space-y-2'>
        <div className='inline-flex items-center justify-center p-3 rounded-2xl bg-purple-500/10 text-purple-400 mb-4'>
          <Sparkles className='w-6 h-6' />
        </div>
        <h1 className='text-3xl font-bold text-white tracking-tight'>Create AI Content</h1>
        <p className='text-slate-400'>Turn your idea into a professional viral script in seconds.</p>
      </div>

      <div className='bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-8 shadow-xl'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider'>
              <LayoutTemplate className='w-3 h-3' /> Select Business (Optional)
            </label>
            <select 
              className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none'
              value={businessId}
              onChange={(e) => {
                setBusinessId(e.target.value);
                const biz = businesses.find(b => b.id === e.target.value);
                setSelectedBusiness(biz || null);
              }}
            >
              <option value=''>None / General</option>
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider'>
              <Video className='w-3 h-3' /> Select Project (Optional)
            </label>
            <select 
              className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none'
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
            >
              <option value=''>New Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name || p.id}</option>
              ))}
            </select>
          </div>
        </div>

        <div className='space-y-2'>
          <label className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider'>
            <Send className='w-3 h-3' /> What do you want to create?
          </label>
          <textarea 
            rows={4}
            placeholder='e.g. Promote our new eco-friendly school bags to students and parents. Make it exciting and suitable for Instagram Reels.'
            className='w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none'
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider'>
              <LayoutTemplate className='w-3 h-3' /> Content Type
            </label>
            <select 
              className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none'
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider'>
              <Globe className='w-3 h-3' /> Target Platform
            </label>
            <select 
              className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none'
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider'>
              <Target className='w-3 h-3' /> Target Audience
            </label>
            <input 
              type='text'
              placeholder='e.g. Gen-Z students, Small business owners'
              className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 outline-none transition-all'
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>
          <div className='space-y-2'>
            <label className='flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider'>
              <Smile className='w-3 h-3' /> Tone
            </label>
            <select 
              className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 outline-none transition-all appearance-none'
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            >
              {TONES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {error && (
          <div className='p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium'>
            {error}
          </div>
        )}

        <button 
          onClick={handleGenerate}
          disabled={isGenerating}
          className='w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-lg shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isGenerating ? (
            <>
              <Loader2 className='w-6 h-6 animate-spin' />
              <span>{LOADING_STAGES[loadingStageIndex]}</span>
            </>
          ) : (
            <>
              <Sparkles className='w-6 h-6' />
              <span>Generate Content</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
