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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to publish to Facebook');
      }

      const data = await response.json();
      
      // Assuming the API returns a post ID or URL in the response
      // Adjust this based on actual API response structure
      const postUrl = data.postUrl || data.id;
      if (!postUrl) throw new Error('Facebook did not return a published post reference.');
      
      setPublishedPostUrl(postUrl);
      setPublishStatus('success');
      setProgress(1.0);
      setStatusMessage('Successfully published to Facebook.');
      
      // Trigger confetti celebration
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (error: any) {
      console.error('Error publishing to Facebook:', error);
      setPublishStatus('error');
      setStatusMessage(error.message || 'An error occurred while publishing to Facebook');
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900/50 backdrop-blur-md border border-slate-800/50 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white">Publish to Facebook</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Post Caption</label>
            <textarea
              value={postCaption}
              onChange={(e) => setPostCaption(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
              placeholder="Add a caption for your Facebook post..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300">Publish Type</label>
            <div className="flex space-x-4">
              {['reel', 'feed_video', 'photo_carousel'].map((type) => (
                <label key={type} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value={type}
                    checked={publishType === type}
                    onChange={(e) => setPublishType(e.target.value as any)}
                    className="form-radio h-4 w-4 text-emerald-400"
                  />
                  <span className="text-sm font-medium text-slate-300">
                    {type === 'reel' ? 'Reel' : type === 'feed_video' ? 'Feed Video' : 'Photo Carousel'}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {showTokenSettings && (
            <div>
              <label className="block text-sm font-medium text-slate-300">Facebook Access Token</label>
              <input
                type="password"
                value={fbAccessToken}
                onChange={(e) => setFbAccessToken(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-emerald-500"
                placeholder="Enter your Facebook Graph API access token"
              />
              <button
                onClick={handleSavePageConfig}
                className="w-full px-3 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                disabled={!fbAccessToken.trim()}
              >
                {fbAccessToken.trim() ? 'Saving...' : 'Save Page Configuration'}
              </button>
            </div>
          )}
          
          {!showTokenSettings && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Using saved Facebook page configuration for {activeClient?.name || 'this client'}
              </p>
              <button
                onClick={() => setShowTokenSettings(true)}
                className="text-sm text-emerald-400 hover:underline"
              >
                Change Facebook Page / Access Token
              </button>
            </div>
          )}
        </form>
        
        <div className="mt-4">
          {publishStatus === 'idle' && (
            <button
              onClick={handleDirectPublishToFacebook}
              className="w-full px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
              disabled={publishStatus !== 'idle'}
            >
              Publish to Facebook
            </button>
          )}
          
          {publishStatus !== 'idle' && publishStatus !== 'success' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                {(publishStatus === 'rendering' || publishStatus === 'publishing') && (
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                )}
                <span className="text-sm text-slate-400">{statusMessage}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${progress * 100}%` }}></div>
              </div>
            </div>
          )}
          
          {publishStatus === 'success' && (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">Successfully published to Facebook.</p>
              {publishedPostUrl && (
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">View your post:</p>
                  <a
                    href={publishedPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline break-word max-w-xs"
                  >
                    {publishedPostUrl}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};