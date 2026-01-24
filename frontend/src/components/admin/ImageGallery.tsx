import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle } from 'lucide-react';
import * as courseApi from '../../api/courseApi';

interface ImageGalleryProps {
  onSelectImage: (url: string) => void;
  selectedImage?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ onSelectImage, selectedImage }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('gallery');
  const [images, setImages] = useState<courseApi.CloudinaryImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (activeTab === 'gallery') {
      loadImages();
    }
  }, [activeTab]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await courseApi.listThumbnails(100);
      setImages(data);
    } catch (err: any) {
      console.error('Failed to load images:', err);
      setError('Gagal memuat gambar dari Cloudinary');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError('');
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }

      const url = await courseApi.uploadThumbnail(file);
      onSelectImage(url);
      
      // Reload gallery to show new image
      await loadImages();
      
      // Switch to gallery tab to see the uploaded image
      setActiveTab('gallery');
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError('Gagal upload gambar: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'gallery'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <ImageIcon size={18} />
            Gallery
          </div>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2 font-medium text-sm transition-colors ${
            activeTab === 'upload'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Upload size={18} />
            Upload Baru
          </div>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Gallery Tab */}
      {activeTab === 'gallery' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              Memuat gambar...
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon size={48} className="mx-auto mb-2 text-gray-400" />
              <p>Belum ada gambar di gallery</p>
              <p className="text-sm mt-1">Upload gambar baru untuk memulai</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto">
              {images.map((image) => (
                <button
                  type="button"
                  key={image.public_id}
                  onClick={() => onSelectImage(image.secure_url)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImage === image.secure_url
                      ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <img
                    src={image.secure_url}
                    alt={image.public_id}
                    className="w-full h-full object-cover"
                  />
                  {selectedImage === image.secure_url && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <CheckCircle className="text-blue-600" size={32} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <Upload
              className={`mx-auto mb-4 ${
                dragActive ? 'text-blue-500' : 'text-gray-400'
              }`}
              size={48}
            />
            <p className="text-gray-600 mb-2">
              {uploading ? 'Mengupload...' : 'Drag & drop gambar di sini'}
            </p>
            <p className="text-sm text-gray-500 mb-4">atau</p>
            <label className="inline-block">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                Pilih File
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <p className="text-xs text-gray-500 mt-4">
              Format: JPG, PNG, GIF (Max 5MB)
            </p>
          </div>

          {uploading && (
            <div className="text-center text-blue-600">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
              <p className="mt-2">Mengupload gambar...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
