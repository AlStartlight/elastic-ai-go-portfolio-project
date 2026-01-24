import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../types/article';
import { CreateArticleRequest, UpdateArticleRequest, articleApi } from '../services/api-service';

interface ArticleEditorProps {
  article?: Article; // For editing existing article
  categories?: Array<{
    id: string;
    name: string;
    color: string;
    bgColor: string;
    slug: string;
  }>;
  onSubmit: (data: CreateArticleRequest | UpdateArticleRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article,
  categories = [],
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    categoryId: article?.category?.id || '',
    featured: article?.featured || false,
    published: article?.published !== false, // Default to true for new articles
    tags: article?.tags?.join(', ') || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showCloudinaryGallery, setShowCloudinaryGallery] = useState(false);
  const [cloudinaryImages, setCloudinaryImages] = useState<Array<{
    publicId: string;
    url: string;
    secureUrl: string;
    width: number;
    height: number;
    format: string;
    createdAt: string;
  }>>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content || '',
        categoryId: article.category.id || '',
        featured: article.featured || false,
        published: article.published !== false,
        tags: article.tags?.join(', ') || '',
      });
    }
  }, [article]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Extract first image URL from content for thumbnail
    const extractFirstImage = (content: string): string => {
      // Match markdown images: ![alt](url)
      const markdownImageRegex = /!\[.*?\]\((https?:\/\/[^\)]+)\)/;
      const match = content.match(markdownImageRegex);
      return match ? match[1] : '';
    };

    const submitData = {
      title: formData.title.trim(),
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
      thumbnail: extractFirstImage(formData.content.trim()),
      categoryId: formData.categoryId,
      featured: formData.featured,
      published: formData.published,
      tags: formData.tags 
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : [],
    };

    try {
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting article:', error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    try {
      const result = await articleApi.uploadImage(file);
      const imageUrl = result.file.url;
      
      // Insert markdown image syntax at cursor position
      const textarea = textareaRef.current;
      if (textarea) {
        const cursorPos = textarea.selectionStart;
        const textBefore = formData.content.substring(0, cursorPos);
        const textAfter = formData.content.substring(cursorPos);
        const imageMarkdown = `\n![${file.name}](${imageUrl})\n`;
        
        const newContent = textBefore + imageMarkdown + textAfter;
        handleChange('content', newContent);
        
        // Set cursor position after inserted image
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = textarea.selectionEnd = cursorPos + imageMarkdown.length;
        }, 0);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle paste event for images
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          await handleImageUpload(file);
        }
        break;
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith('image/')) {
      await handleImageUpload(file);
    }
  };

  // Handle file input
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    e.target.value = '';
  };

  // Load Cloudinary gallery
  const loadCloudinaryGallery = async () => {
    setLoadingGallery(true);
    try {
      const response = await articleApi.listImages(100);
      console.log('Cloudinary API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      
      // Handle both formats: { images: [], total: N } or { data: [] }
      let images = [];
      if (response && response.images && Array.isArray(response.images)) {
        images = response.images;
      } else if (response && (response as any).data && Array.isArray((response as any).data)) {
        images = (response as any).data;
      } else if (Array.isArray(response)) {
        images = response;
      }
      
      console.log('Parsed images array:', images);
      console.log('Total images found:', images.length);
      
      // Validate image objects have required fields
      const validImages = images.filter((img: any) => {
        const isValid = img && (img.url || img.secureUrl);
        if (!isValid) {
          console.warn('Invalid image object:', img);
        }
        return isValid;
      });
      
      console.log('Valid images after filtering:', validImages.length);
      
      setCloudinaryImages(validImages);
      setShowCloudinaryGallery(true);
      
      if (validImages.length === 0) {
        console.warn('No valid images found in Cloudinary. Upload some images first.');
      }
    } catch (error: any) {
      console.error('Error loading Cloudinary images:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Failed to load images from Cloudinary.\n\nError: ${errorMessage}\n\nPlease check your authentication and Cloudinary configuration`);
    } finally {
      setLoadingGallery(false);
    }
  };

  // Insert image from Cloudinary gallery
  const insertCloudinaryImage = (imageUrl: string, imageName: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPos = textarea.selectionStart;
      const textBefore = formData.content.substring(0, cursorPos);
      const textAfter = formData.content.substring(cursorPos);
      const imageMarkdown = `\n![${imageName}](${imageUrl})\n`;
      
      const newContent = textBefore + imageMarkdown + textAfter;
      handleChange('content', newContent);
      
      // Set cursor position after inserted image
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = cursorPos + imageMarkdown.length;
      }, 0);
    }
    setShowCloudinaryGallery(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-white">
              {article ? 'Edit Article' : 'Create New Article'}
            </h1>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPreview(!preview)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-300"
              >
                {preview ? 'Edit' : 'Preview'}
              </button>
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
          
          {/* Article Stats */}
          {formData.content && (
            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <span>Words: {formData.content.trim().split(/\s+/).length}</span>
              <span>Read time: ~{calculateReadTime(formData.content)} min</span>
              <span>Characters: {formData.content.length}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter article title..."
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 ${
                    errors.title 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                  }`}
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-white font-semibold mb-2">
                  Excerpt *
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => handleChange('excerpt', e.target.value)}
                  placeholder="Brief description of your article..."
                  rows={3}
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 resize-y ${
                    errors.excerpt 
                      ? 'border-red-500 focus:ring-red-500/20' 
                      : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                  }`}
                />
                {errors.excerpt && (
                  <p className="text-red-400 text-sm mt-1">{errors.excerpt}</p>
                )}
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-white font-semibold">
                    Content * 
                    <span className="text-gray-400 font-normal text-sm ml-2">
                      (Markdown supported)
                    </span>
                  </label>
                  <div className="flex items-center gap-2">
                    {uploadingImage && (
                      <span className="text-sm text-green-400 flex items-center gap-1">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={loadCloudinaryGallery}
                      disabled={loadingGallery || isLoading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200 flex items-center gap-1"
                    >
                      {loadingGallery ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      )}
                      Browse Gallery
                    </button>
                    <label className="cursor-pointer bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors duration-200 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Upload New
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                        disabled={uploadingImage || isLoading}
                      />
                    </label>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mb-2 bg-gray-800/30 p-2 rounded border border-gray-700/50">
                  💡 <strong>Tip:</strong> You can paste images directly (Ctrl/Cmd+V) or drag & drop images into the editor
                </div>
                {preview ? (
                  <div className="w-full min-h-[400px] px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white">
                    <div className="prose prose-invert max-w-none">
                      {/* Simple markdown preview - you can integrate a proper markdown parser */}
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {formData.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={formData.content}
                      onChange={(e) => handleChange('content', e.target.value)}
                      onPaste={handlePaste}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      placeholder="Write your article content here... (Markdown supported)

Try pasting an image or dragging one here!"
                      rows={20}
                      disabled={isLoading}
                      className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 resize-y font-mono ${
                        isDragging 
                          ? 'border-green-500 ring-2 ring-green-500/50 bg-green-500/10'
                          : errors.content 
                            ? 'border-red-500 focus:ring-red-500/20' 
                            : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                      }`}
                    />
                    {isDragging && (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500/10 border-2 border-dashed border-green-500 rounded-lg pointer-events-none">
                        <div className="bg-gray-900/90 px-6 py-4 rounded-lg">
                          <p className="text-green-400 font-semibold flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Drop your image here
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {errors.content && (
                  <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <div className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-2xl border border-gray-700/50">
                <h3 className="text-white font-semibold mb-4">Publish Settings</h3>
                
                {/* Category */}
                <div className="mb-4">
                  <label className="block text-white font-medium mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                    disabled={isLoading}
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 ${
                      errors.categoryId 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                  >
                    <option value="">Select category...</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="text-red-400 text-sm mt-1">{errors.categoryId}</p>
                  )}
                </div>

                {/* Featured Toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => handleChange('featured', e.target.checked)}
                      disabled={isLoading}
                      className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-white">Featured Article</span>
                  </label>
                </div>

                {/* Published Toggle */}
                <div className="mb-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => handleChange('published', e.target.checked)}
                      disabled={isLoading}
                      className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                    />
                    <span className="text-white">Publish immediately</span>
                  </label>
                </div>
              </div>

              {/* Tags */}
              <div className="bg-gray-800/40 backdrop-blur-lg p-6 rounded-2xl border border-gray-700/50">
                <h3 className="text-white font-semibold mb-4">Tags</h3>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => handleChange('tags', e.target.value)}
                  placeholder="React, TypeScript, Tutorial"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300 disabled:opacity-50"
                />
                <p className="text-gray-400 text-xs mt-2">
                  Separate tags with commas
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {article ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      {article ? 'Update Article' : 'Create Article'}
                    </>
                  )}
                </button>

                {article && (
                  <button
                    type="button"
                    disabled={isLoading}
                    className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    Save as Draft
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Cloudinary Gallery Modal */}
        {showCloudinaryGallery && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-2xl max-w-6xl w-full max-h-[80vh] overflow-hidden border border-gray-700 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <div>
                  <h2 className="text-2xl font-bold text-white">Select from Gallery</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {cloudinaryImages.length} images available
                  </p>
                </div>
                <button
                  onClick={() => setShowCloudinaryGallery(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Gallery Grid */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
                {cloudinaryImages.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-400 text-lg">No images found in Cloudinary</p>
                    <p className="text-gray-500 text-sm mt-2">Upload some images first</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {cloudinaryImages.map((image, index) => {
                      const imageName = image.publicId ? (image.publicId.split('/').pop() || image.publicId) : `image-${index}`;
                      return (
                      <button
                        key={index}
                        onClick={() => insertCloudinaryImage(image.secureUrl || image.url, imageName)}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-gray-900 border-2 border-gray-700 hover:border-green-500 transition-all duration-300 transform hover:scale-105"
                      >
                        <img
                          src={image.secureUrl}
                          alt={image.publicId || 'Gallery image'}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center p-4">
                            <svg className="w-8 h-8 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-white text-xs font-semibold">Click to Insert</p>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-white text-xs truncate">{imageName}</p>
                          <p className="text-gray-400 text-xs">{image.width} × {image.height}</p>
                        </div>
                      </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleEditor;