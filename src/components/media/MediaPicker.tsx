import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  Upload as UploadIcon, 
  Search, 
  X, 
  Loader2, 
  CheckCircle2,
} from 'lucide-react';
import { mediaService, MediaAssetRecord } from '../../services/media/mediaService';
import { MediaUploader } from './MediaUploader';

type FilterType = 'all' | 'image' | 'video' | 'audio';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (assets: MediaAssetRecord[]) => void;
}

export const MediaPicker: React.FC<MediaPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getMediaAssets();
      setAssets(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load media assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen]);

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  const handleConfirm = () => {
    const selectedAssets = assets.filter(asset => selectedIds.has(asset.id));
    onSelect(selectedAssets);
    onClose();
  };

  const filteredAssets = assets.filter(asset => {
    const matchesFilter = filter === 'all' || asset.type === filter;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl h-[80vh] overflow-hidden shadow-2xl flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Media Library</h2>
            <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl">
              {(['all', 'image', 'video', 'audio'] as FilterType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    filter === type ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors text-sm font-semibold"
            >
              <UploadIcon className="w-4 h-4" />
              Upload
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-900/30 border-b border-slate-800/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Loading library...</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center text-red-400 gap-3">
              <X className="w-8 h-8" />
              <p>{error}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id}
                  onClick={() => toggleSelection(asset.id)}
                  className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-2 ${
                    selectedIds.has(asset.id) ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-transparent hover:border-slate-700'
                  }`}
                >
                  {asset.type === 'image' && (
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  )}
                  {asset.type === 'video' && (
                    <div className="w-full h-full relative bg-slate-800">
                      <img src={asset.thumbnailUrl || asset.url} alt={asset.name} className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  )}
                  {asset.type === 'audio' && (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 p-4 text-center">
                      <Music className="w-8 h-8 text-emerald-400 mb-2" />
                      <span className="text-[10px] font-medium text-slate-400 truncate w-full">{asset.name}</span>
                    </div>
                  )}
                  {selectedIds.has(asset.id) && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500 bg-white rounded-full" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[10px] text-white font-medium truncate">{asset.name}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            <span className="text-white font-bold">{selectedIds.size}</span> assets selected
          </p>
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={selectedIds.size === 0}
              className="px-6 py-2 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-bold shadow-lg shadow-emerald-500/20"
            >
              Add to Timeline
            </button>
          </div>
        </div>
        {isUploadOpen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Upload New Asset</h3>
                <button onClick={() => setIsUploadOpen(false)} className="p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <MediaUploader 
                  onUploadSuccess={() => {
                    loadMedia();
                    setIsUploadOpen(false);
                  }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


