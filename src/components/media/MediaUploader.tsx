import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { mediaService, UploadOptions } from '../../services/media/mediaService';

interface MediaUploaderProps {
  onUploadSuccess?: (asset: any) => void;
  options?: UploadOptions;
  className?: string;
  label?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ 
  onUploadSuccess, 
  options, 
  className = '', 
  label = 'Upload Media' 
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    setError(null);
    setSuccess(false);
    setFile(selectedFile);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const asset = await mediaService.uploadMedia(file, options);
      setSuccess(true);
      if (onUploadSuccess) {
        onUploadSuccess(asset);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during upload.');
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      
      <div 
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center cursor-pointer
          ${file ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-600 bg-slate-50 dark:bg-slate-900/50'}
          ${uploading ? 'opacity-70 pointer-events-none' : ''}
        `}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
          accept="image/*,video/*,audio/*"
        />

        {!file && !uploading && (
          <>
            <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400">
              <Upload size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Click or drag and drop</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Images, Videos, or Audio files
              </p>
            </div>
          </>
        )}

        {uploading && (
          <>
            <Loader2 size={24} className="animate-spin text-rose-500" />
            <p className="text-sm font-medium text-slate-900 dark:text-white">Uploading to Cloudinary...</p>
          </>
        )}

        {file && !uploading && !success && (
          <>
            <div className="p-3 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <File size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                {file.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </>
        )}

        {success && (
          <>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
              <CheckCircle size={24} />
            </div>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">Upload Complete!</p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {file && !uploading && !success && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              uploadFile();
            }}
            className="flex-1 py-2 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Upload File
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            title="Clear selection"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <button
          onClick={clearSelection}
          className="py-2 px-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        >
          Upload Another
        </button>
      )}
    </div>
  );
};
