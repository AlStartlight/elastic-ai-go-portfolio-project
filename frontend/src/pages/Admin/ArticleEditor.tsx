import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { OutputData } from '@editorjs/editorjs';
import EditorJSComponent from '../../components/EditorJS';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  bgColor: string;
}

const ArticleEditor: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    categoryId: '',
    featured: false,
    published: false,
    tags: [] as string[],
  });

  const [editorData, setEditorData] = useState<OutputData | undefined>(undefined);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEditMode && id) {
      fetchArticle(id);
    }
  }, [id, isEditMode]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/public/categories`
      );
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('Fetching article with ID:', articleId);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/admin/articles/${articleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      console.log('Article data received:', response.data);
      const article = response.data;
      
      setFormData({
        title: article.title || '',
        excerpt: article.excerpt || '',
        categoryId: article.category?.id || '',
        featured: article.featured || false,
        published: article.published || false,
        tags: article.tags || [],
      });

      // Parse content if it's a string
      if (article.content) {
        try {
          const parsedContent = typeof article.content === 'string' 
            ? JSON.parse(article.content) 
            : article.content;
          console.log('Parsed content:', parsedContent);
          setEditorData(parsedContent);
        } catch (error) {
          console.error('Error parsing article content:', error);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch article:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load article: ' + (error.response?.data?.error || error.message));
      navigate('/admin/articles');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (data: OutputData) => {
    setEditorData(data);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.excerpt.trim()) {
      toast.error('Excerpt is required');
      return;
    }

    if (!formData.categoryId) {
      toast.error('Category is required');
      return;
    }

    if (!editorData || !editorData.blocks || editorData.blocks.length === 0) {
      toast.error('Content is required');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Extract first image from EditorJS blocks for thumbnail
      const extractFirstImage = (): string => {
        if (!editorData || !editorData.blocks) return '';
        
        for (const block of editorData.blocks) {
          if (block.type === 'image' && block.data) {
            // Check for image URL in various formats
            return block.data.file?.url || block.data.url || '';
          }
        }
        return '';
      };
      
      const payload = {
        ...formData,
        content: JSON.stringify(editorData),
        thumbnail: extractFirstImage()
      };

      if (isEditMode && id) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/admin/articles/${id}`,
          payload,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Article updated successfully!');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/admin/articles`,
          payload,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        toast.success('Article created successfully!');
      }

      navigate('/admin/articles');
    } catch (error: any) {
      console.error('Failed to save article:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save article';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to discard changes?')) {
      navigate('/admin/articles');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-xl">Loading article...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto p-6 lg:p-8">
        {/* Animated Header with Gradient */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20 blur-3xl animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                      {isEditMode ? 'Edit Article' : 'Create New Article'}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-gray-400 text-sm">
                        {isEditMode ? 'Update your article content and settings' : 'Craft your next amazing story'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="w-32 h-1 bg-gradient-to-r from-green-500 to-transparent rounded-full"></div>
              </div>
              <button
                onClick={handleCancel}
                className="group p-3 rounded-xl bg-gray-800/50 hover:bg-red-500/20 border border-gray-700 hover:border-red-500/50 transition-all duration-300"
                title="Close"
              >
                <svg className="w-6 h-6 text-gray-400 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title Section */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-gray-300">
                  Article Title <span className="text-red-400 ml-1">*</span>
                </label>
              </div>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-white text-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                placeholder="Enter a captivating title..."
                required
              />
            </div>
          </div>

          {/* Excerpt Section */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-gray-300">
                  Article Excerpt <span className="text-red-400 ml-1">*</span>
                </label>
              </div>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="w-full px-5 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all duration-300"
                placeholder="Write a compelling summary that draws readers in..."
                rows={4}
                required
              />
              <div className="flex items-center gap-2 mt-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-gray-500">
                  This appears in article previews, search results, and social media shares
                </p>
              </div>
            </div>
          </div>

          {/* Category and Settings Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
              <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 shadow-xl h-full">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <label className="text-sm font-semibold text-gray-300">
                    Category <span className="text-red-400 ml-1">*</span>
                  </label>
                </div>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full px-5 py-4 bg-gray-900/80 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 cursor-pointer"
                  required
                >
                  <option value="" className="bg-gray-900">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-gray-900">
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Settings */}
            <div className="group relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
              <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 shadow-xl h-full">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <label className="text-sm font-semibold text-gray-300">
                    Publication Settings
                  </label>
                </div>
                <div className="space-y-4">
                  <label className="group/checkbox flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-900/50 transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 rounded-md border-2 border-gray-600 bg-gray-900 checked:bg-gradient-to-br checked:from-green-500 checked:to-emerald-600 checked:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 transition-all duration-200 cursor-pointer"
                      />
                      <svg className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-300 group-hover/checkbox:text-green-400 transition-colors">Featured Article</span>
                      <p className="text-xs text-gray-500">Highlight on homepage</p>
                    </div>
                  </label>
                  <label className="group/checkbox flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-900/50 transition-colors">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.published}
                        onChange={(e) => {
                          const newValue = e.target.checked;
                          // Warn if unpublishing an existing article
                          if (!newValue && isEditMode && formData.published) {
                            if (!confirm('Are you sure you want to unpublish this article? It will no longer be visible to the public.')) {
                              return;
                            }
                          }
                          setFormData({ ...formData, published: newValue });
                        }}
                        className="w-5 h-5 rounded-md border-2 border-gray-600 bg-gray-900 checked:bg-gradient-to-br checked:from-green-500 checked:to-emerald-600 checked:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 transition-all duration-200 cursor-pointer"
                      />
                      <svg className="w-3 h-3 text-white absolute top-1 left-1 pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-medium text-gray-300 group-hover/checkbox:text-green-400 transition-colors">
                        {formData.published ? '✓ Published' : 'Publish Now'}
                      </span>
                      <p className="text-xs text-gray-500">
                        {formData.published ? 'Article is visible to public' : 'Make article public'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-gray-300">
                  Tags
                </label>
                <span className="text-xs text-gray-500 ml-auto">Press Enter to add</span>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-5 py-3 bg-gray-900/80 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                  placeholder="Add relevant tags..."
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-gray-900/50 rounded-xl border border-gray-700/50">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="group/tag inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 rounded-lg text-sm font-medium hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200"
                    >
                      <span className="text-green-400">#</span>{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 p-1 rounded-md hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all duration-200"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Editor Section */}
          <div className="group relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
            <div className="relative bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                  <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <label className="text-sm font-semibold text-gray-300">
                  Article Content <span className="text-red-400 ml-1">*</span>
                </label>
              </div>
              <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-2">
                <EditorJSComponent 
                  data={editorData}
                  onChange={handleEditorChange}
                  holder="article-editor"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="sticky bottom-6 z-10">
            <div className="bg-gradient-to-r from-gray-800/95 via-gray-800/98 to-gray-800/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="group px-6 py-3 border-2 border-gray-700 hover:border-red-500/50 text-gray-300 hover:text-red-400 rounded-xl transition-all duration-300 font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </button>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    onClick={(e) => {
                      setFormData({ ...formData, published: false });
                      setTimeout(() => handleSubmit(e), 0);
                    }}
                    className="group px-6 py-3 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500 text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-semibold shadow-lg flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="group relative px-8 py-3 bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none font-bold shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60 flex items-center gap-2 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                    <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="relative z-10">
                      {saving ? 'Publishing...' : isEditMode ? 'Update Article' : 'Publish Article'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArticleEditor;
