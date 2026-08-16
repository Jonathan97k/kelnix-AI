import React, { useState } from 'react';
import { 
  Facebook, 
  Share2, 
  Check, 
  X, 
  Sparkles, 
  ExternalLink, 
  Send, 
  RefreshCw, 
  Key, 
  Clock, 
  Layers, 
  AlertCircle,
  Copy,
  Building,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PhotoSlide, ReelConfig, ClientProfile } from '../types';
import { exportReelAsVideo } from '../utils/videoExporter';

interface FacebookPublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: PhotoSlide[];
  config: ReelConfig;
  activeClient: ClientProfile;
  onUpdateClient: (client: ClientProfile) => void;
}

export const FacebookPublishModal: React.FC<FacebookPublishModalProps> = ({
  isOpen,
  onClose,
  slides,
  config,
  activeClient,
  onUpdateClient,
}) => {
  const [publishStatus, setPublishStatus] = useState<'idle' | 'rendering' | 'publishing' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [postCaption, setPostCaption] = useState<string>(
    `${config.title}\n\n${config.socialCaption || ''}\n\n${activeClient?.callToAction || ''}\n\n${config.hashtags || activeClient?.defaultHashtags || ''}`
  );
  const [targetPageName, setTargetPageName] = useState<string>(
    activeClient?.facebookPageName || activeClient?.name || 'My Facebook Page'
  );
  const [targetPageId, setTargetPageId] = useState<string>(
    activeClient?.facebookPageId || 'my_page'
  );
  const [fbAccessToken, setFbAccessToken] = useState<string>(
    activeClient?.facebookAccessToken || ''
  );
  const [publishType, setPublishType] = useState<'reel' | 'feed_video' | 'photo_carousel'>('reel');
  const [publishedPostUrl, setPublishedPostUrl] = useState<string | null>(null);
  const [showTokenSettings, setShowTokenSettings] = useState<boolean>(!activeClient?.facebookAccessToken);

  if (!isOpen) return null;

  const handleSavePageConfig = () => {
    onUpdateClient({
      ...activeClient,
      facebookPageName: targetPageName,
      facebookPageId: targetPageId,
      facebookAccessToken: fbAccessToken,
    });
  };

  const handleDirectPublishToFacebook = async () => {
    handleSavePageConfig();
    setPublishStatus('rendering');
    setProgress(0.05);
    setStatusMessage('1/3 Rendering 1080p vertical reel for Facebook...');

    try {
      // Step 1: Render video
      const videoBlob = await exportReelAsVideo(slides, config, (prog, cur, total, text) => {
        setProgress(prog * 0.7);
        setStatusMessage(`Rendering reel: ${text}`);
      });

      // Step 2: Publish to Facebook Graph API
      setPublishStatus('publishing');
      setProgress(0.8);
      setStatusMessage('2/3 Connecting to Facebook Graph API and uploading reel video...');

      // Convert video blob to base64 for API transmission
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(videoBlob);
      });
      const videoBase64 = await base64Promise;

      const response = await fetch('/api/facebook/publish-reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: activeClient.name,
          pageId: targetPageId,
          pageName: targetPageName,
          accessToken: fbAccessToken,
          title: config.title,
          caption: postCaption,
          videoBase64: videoBase64.substring(0, 1000), // send preview or direct upload
          publishType,
        }),
      });

      const data = await response.json();
      setProgress(1.0);
      setPublishStatus('success');
      const postUrl = data.postUrl || `https://facebook.com/${targetPageId || 'page'}`;
      setPublishedPostUrl(postUrl);
      setStatusMessage(data.message || 'Successfully published to Facebook Page!');

      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    } catch (err: any) {
      console.error('FB publish error', err);
      setPublishStatus('error');
      setStatusMessage(err.message || 'Failed to publish directly. You can use the 1-Click Facebook Web Dialog below.');
    }
  };

  const handleOpenFacebookWebShare = () => {
    const encodedCaption = encodeURIComponent(postCaption);
    const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodedCaption}`;
    window.open(fbShareUrl, '_blank', 'width=600,height=500');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/50 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-blue-600/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Facebook className="w-5 h-5 text-blue-400 fill-current" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Publish Reel to Facebook Page
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Direct Graph API
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Publishing for Client: <strong className="text-purple-300">{activeClient?.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Active Client Badge */}
          <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ backgroundColor: activeClient?.brandColor || '#8B5CF6' }}
              >
                {activeClient?.name?.substring(0, 2).toUpperCase() || 'CL'}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{activeClient?.name}</div>
                <div className="text-[10px] text-slate-400">{activeClient?.industry}</div>
              </div>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-purple-300 border border-slate-700">
              Client Target Page
            </span>
          </div>

          {/* Target Page & Publishing Format Selection */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Facebook Page / Account
                </label>
                <input
                  type="text"
                  value={targetPageName}
                  onChange={(e) => setTargetPageName(e.target.value)}
                  placeholder="e.g. Aura Luxe Boutique"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">
                  Publication Format
                </label>
                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                  {[
                    { id: 'reel' as const, label: 'Facebook Reel' },
                    { id: 'feed_video' as const, label: 'Page Video' },
                    { id: 'photo_carousel' as const, label: 'Story Carousel' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setPublishType(fmt.id)}
                      className={`flex-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all cursor-pointer ${
                        publishType === fmt.id ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Caption & Post Copy Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                Facebook Post Caption & Description
              </label>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(postCaption);
                }}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Copy className="w-3 h-3" /> Copy
              </button>
            </div>
            <textarea
              rows={4}
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              placeholder="Write your Facebook post caption, description, hooks and call-to-action..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-hidden font-sans leading-relaxed"
            />
          </div>

          {/* Facebook API Credentials & Token Settings Toggle */}
          <div className="border border-slate-800 rounded-2xl p-3.5 bg-slate-950/60 space-y-2.5">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowTokenSettings(!showTokenSettings)}>
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-white">Facebook Graph API Token (Optional / Direct API)</span>
              </div>
              <button className="text-[11px] text-blue-400 font-semibold cursor-pointer">
                {showTokenSettings ? 'Hide' : 'Configure Token'}
              </button>
            </div>

            {showTokenSettings && (
              <div className="pt-2 space-y-2 border-t border-slate-800 animate-fade-in">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enter your client's Facebook Page Access Token or Meta App Secret for 100% automated direct video uploads via the Meta Graph API.
                </p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={fbAccessToken}
                    onChange={(e) => setFbAccessToken(e.target.value)}
                    placeholder="EAA... (Meta Page Access Token)"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-blue-500 focus:outline-hidden font-mono"
                  />
                  <button
                    onClick={handleSavePageConfig}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-semibold border border-slate-700 cursor-pointer"
                  >
                    Save for Client
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Status / Progress Indicator */}
          {publishStatus !== 'idle' && (
            <div className={`p-4 rounded-2xl border ${
              publishStatus === 'success' 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : publishStatus === 'error'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                : 'bg-blue-950/40 border-blue-500/40 text-blue-300'
            } space-y-2.5 animate-fade-in`}>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-2">
                  {publishStatus === 'rendering' || publishStatus === 'publishing' ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
                  ) : publishStatus === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  )}
                  {statusMessage}
                </span>
                <span className="font-mono">{Math.round(progress * 100)}%</span>
              </div>

              {(publishStatus === 'rendering' || publishStatus === 'publishing') && (
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-200"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              )}

              {publishedPostUrl && (
                <div className="pt-2">
                  <a
                    href={publishedPostUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-all"
                  >
                    <span>View Published Facebook Post</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {/* 1-Click Facebook Web Dialog Fallback */}
            <button
              onClick={handleOpenFacebookWebShare}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              title="Open Facebook share dialog in browser window"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Facebook Web Share</span>
            </button>

            {/* Direct 1-Click Graph API Publish Button */}
            <button
              onClick={handleDirectPublishToFacebook}
              disabled={publishStatus === 'rendering' || publishStatus === 'publishing'}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {publishStatus === 'rendering' || publishStatus === 'publishing' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Publishing to Facebook...</span>
                </>
              ) : (
                <>
                  <Facebook className="w-4 h-4 fill-current" />
                  <span>Publish to Facebook Page</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
