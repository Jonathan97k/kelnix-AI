import React, { useState, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  Video, 
  Music, 
  Upload as UploadIcon, 
  Search, 
  X, 
  AlertCircle, 
  Loader2,
  FileImage
} from 'lucide-react';
import { mediaService, MediaAssetRecord } from '../services/media/mediaService';
import { MediaUploader } from '../components/media/MediaUploader';
import { MediaDetailModal } from '../components/media/MediaDetailModal';

type FilterType = 'all' | 'image' | 'video' | 'audio';

const Media: React.FC = () => {
  const [assets, setAssets] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MediaAssetRecord | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

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
    loadMedia();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this media? This action cannot be undone and may affect projects using this asset.')) {
      return;
    }

    try {
      await mediaService.deleteMediaAsset(id);
      await loadMedia();
      setIsDetailOpen(false);
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesFilter = filter === 'all' || asset.type === filter;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Media Library</h1>
          <p className="text-slate-400 mt-1">Manage all your images, videos and audio in one place.</p>
        </div>
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-semibold shadow-lg shadow-emerald-500/20"
        >
          <UploadIcon className="w-5 h-5" />
          Upload Media
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['all', 'image', 'video', 'audio'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                filter === type 
                ? 'bg-emerald-500 text-white shadow-sm' 
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {type === 'all' && <FileImage className="w-4 h-4" />}
              {type === 'image' && <ImageIcon className="w-4 h-4" />}
              {type === 'video' && <Video className="w-4 h-4" />}
              {type === 'audio' && <Music className="w-4 h-4" />}
              {type}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
          <p className="text-lg">Loading your media library...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-4 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-lg font-medium">{error}</p>
          <button 
            onClick={loadMedia}
            className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
          <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 text-slate-600">
            <ImageIcon className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No media yet</h3>
          <p className="text-slate-400 max-w-md mb-8">
            Upload images, videos, or audio to start building your content.
          </p>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-semibold shadow-lg shadow-emerald-500/20"
          >
            <UploadIcon className="w-5 h-5" />
            Upload Your First Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 pb-12">
          {filteredAssets.map((asset) => (
            <div 
              key={asset.id}
              onClick={() => {
                setSelectedAsset(asset);
                setIsDetailOpen(true);
              }}
              className="group relative bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10"
            >
              <div className="aspect-square bg-black relative overflow-hidden flex items-center justify-center">
                {asset.type === 'image' && (
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                )}
                {asset.type === 'video' && (
                  <>
                    <img src={asset.thumbnailUrl || asset.url} alt={asset.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="p-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white">
                        <Video className="w-5 h-5" />
                      </div>
                    </div>
                  </>
                )}
                {asset.type === 'audio' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3 text-emerald-400">
                      <Music className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-medium text-slate-300 truncate w-full px-2">{asset.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <span className="text-xs text-white font-medium truncate">{asset.name}</span>
                </div>
              </div>
              <div className="p-3 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 py-0.5 px-2 rounded-md bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {asset.type === 'image' && <ImageIcon className="w-3 h-3" />}
                    {asset.type === 'video' && <Video className="w-3 h-3" />}
                    {asset.type === 'audio' && <Music className="w-3 h-3" />}
                    {asset.type}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {asset.bytes ? `${(asset.bytes / 1024 / 1024).toFixed(1)}MB` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h2 className="text-xl font-bold text-white">Upload Media</h2>
              <button 
                onClick={() => setIsUploadOpen(false)}
                className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
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

      {/* Detail Modal */}
      <MediaDetailModal 
        asset={selectedAsset} 
        isOpen={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        onDelete={handleDelete}
      />
    </div>
  );
};

export default Media;
