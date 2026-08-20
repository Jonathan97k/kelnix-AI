import React from 'react';
import { X, Copy, Trash2, FileText, Calendar, Maximize2, Clock, HardDrive } from 'lucide-react';
import { MediaAssetRecord } from '../../services/media/mediaService';

interface MediaDetailModalProps {
  asset: MediaAssetRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const MediaDetailModal: React.FC<MediaDetailModalProps> = ({ asset, isOpen, onClose, onDelete }) => {
  if (!asset) return null;

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(asset.url);
      alert('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let i = 0;
    let size = bytes;
    while (size >= 1024 && i < sizes.length - 1) {
      size /= 1024;
      i++;
    }
    return `${size.toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Preview Section */}
        <div className="flex-1 bg-black flex items-center justify-center p-4 relative group min-h-[300px]">
          {asset.type === 'image' && (
            <img src={asset.url} alt={asset.name} className="max-w-full max-h-full object-contain rounded-lg" />
          )}
          {asset.type === 'video' && (
            <video src={asset.url} controls className="max-w-full max-h-full rounded-lg" />
          )}
          {asset.type === 'audio' && (
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border border-emerald-500/30">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
              <audio src={asset.url} controls className="w-full max-w-xs" />
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Details Section */}
        <div className="w-full md:w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col overflow-y-auto">
          <h3 className="text-xl font-bold text-white mb-6 truncate" title={asset.name}>
            {asset.name}
          </h3>

          <div className="space-y-4 flex-1">
            <DetailItem icon={<FileText className="w-4 h-4" />} label="Type" value={asset.type} />
            <DetailItem icon={<Maximize2 className="w-4 h-4" />} label="Dimensions" value={`${asset.width || '?'} x ${asset.height || '?'} px`} />
            <DetailItem icon={<HardDrive className="w-4 h-4" />} label="File Size" value={formatSize(asset.bytes)} />
            <DetailItem icon={<Clock className="w-4 h-4" />} label="Duration" value={asset.duration ? `${asset.duration.toFixed(2)}s` : 'N/A'} />
            <DetailItem icon={<Calendar className="w-4 h-4" />} label="Uploaded" value={formatDate(asset.createdAt)} />
            
            {asset.businessId && (
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-400">
                Associated with Business ID: {asset.businessId}
              </div>
            )}
            {asset.projectId && (
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 text-xs text-slate-400">
                Associated with Project ID: {asset.projectId}
              </div>
            )}
          </div>

          <div className="mt-8 space-y-3">
            <button 
              onClick={copyUrl}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 text-white hover:bg-slate-700 transition-colors text-sm font-medium"
            >
              <Copy className="w-4 h-4" />
              Copy URL
            </button>
            <button 
              onClick={() => onDelete(asset.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete Asset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 py-2 border-b border-slate-800/50">
    <div className="text-slate-500">{icon}</div>
    <div className="flex-1">
      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</div>
      <div className="text-sm text-slate-200">{value}</div>
    </div>
  </div>
);
