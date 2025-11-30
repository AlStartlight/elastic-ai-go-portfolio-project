import React, { useState, useEffect } from 'react';
import { Article } from '../types/article';
import { CreateArticleRequest, UpdateArticleRequest } from '../services/api-service';

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

    const submitData = {
      title: formData.title.trim(),
      excerpt: formData.excerpt.trim(),
      content: formData.content.trim(),
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
                <label className="block text-white font-semibold mb-2">
                  Content * 
                  <span className="text-gray-400 font-normal text-sm ml-2">
                    (Markdown supported)
                  </span>
                </label>
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
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleChange('content', e.target.value)}
                    placeholder="Write your article content here... (Markdown supported)"
                    rows={20}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 disabled:opacity-50 resize-y font-mono ${
                      errors.content 
                        ? 'border-red-500 focus:ring-red-500/20' 
                        : 'border-gray-600 focus:border-green-500 focus:ring-green-500/20'
                    }`}
                  />
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
      </div>
    </div>
  );
};

export default ArticleEditor;