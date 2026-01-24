import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: {
    name: string;
    color: string;
  };
  publishedAt: string;
  readTime: number;
  featured: boolean;
  published: boolean;
  viewCount: number;
  likeCount: number;
}

const ManageArticles: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    categoryId: '',
    featured: false,
    published: false,
    tags: [] as string[],
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== FETCHING ARTICLES ===');
      console.log('Token:', token ? 'Token exists' : 'No token');
      console.log('API URL:', import.meta.env.VITE_API_URL);
      console.log('Full URL:', `${import.meta.env.VITE_API_URL}/api/admin/articles?all=true`);
      
      // Add ?all=true to get all articles including unpublished ones
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/articles?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('=== RESPONSE RECEIVED ===');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.status);
      
      const articlesData = response.data.articles || [];
      console.log('=== ARTICLES DATA ===');
      console.log('Articles array:', articlesData);
      console.log('Number of articles:', articlesData.length);
      console.log('Total from API:', response.data.total);
      console.log('Page:', response.data.page);
      console.log('Total Pages:', response.data.totalPages);
      
      if (articlesData.length > 0) {
        console.log('First article:', articlesData[0]);
        console.log('All article titles:', articlesData.map((a: any) => a.title));
      } else {
        console.warn('⚠️ NO ARTICLES FOUND!');
      }
      
      setArticles(articlesData);
      console.log('=== STATE UPDATED ===');
      console.log('Articles state set with', articlesData.length, 'articles');
    } catch (error: any) {
      console.error('=== ERROR FETCHING ARTICLES ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      toast.error('Failed to load articles');
    } finally {
      setLoading(false);
      console.log('=== FETCH COMPLETE ===');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingArticle) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/api/articles/${editingArticle.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/articles`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowModal(false);
      setEditingArticle(null);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error('Failed to save article:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/articles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticles();
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const toggleFeatured = async (article: Article) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/articles/${article.id}`,
        { featured: !article.featured },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchArticles();
    } catch (error) {
      console.error('Failed to update article:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      categoryId: '',
      featured: false,
      published: false,
      tags: [],
    });
  };

  const openEditModal = (article: Article) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      excerpt: article.excerpt,
      content: '',
      categoryId: '',
      featured: article.featured,
      published: article.published,
      tags: [],
    });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Key Notes Articles</h1>
        <button
          onClick={() => navigate('/admin/articles/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Article
        </button>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-6">
        {articles.map((article) => (
          <div key={article.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-xl font-bold">{article.title}</h3>
                  {article.featured && (
                    <span className="px-2 py-1 text-xs font-semibold bg-yellow-500/20 text-yellow-300 rounded">
                      Featured
                    </span>
                  )}
                  <span className={`px-2 py-1 text-xs font-semibold rounded ${
                    article.published 
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {article.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className={article.category.color}>{article.category.name}</span>
                  <span>•</span>
                  <span>{article.readTime} min read</span>
                  <span>•</span>
                  <span>👁️ {article.viewCount} views</span>
                  <span>•</span>
                  <span>❤️ {article.likeCount} likes</span>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => toggleFeatured(article)}
                  className="p-2 hover:bg-yellow-500/20 rounded transition-colors"
                  title="Toggle Featured"
                >
                  <svg className="w-5 h-5" fill={article.featured ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                  className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                  title="Edit Article"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(article.id)}
                  className="p-2 hover:bg-red-500/20 rounded transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-400 text-lg">No articles yet. Create your first article!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingArticle ? 'Edit Article' : 'Add New Article'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingArticle(null);
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt</label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary"
                    rows={10}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="mr-2"
                    />
                    Featured Article
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.published}
                      onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                      className="mr-2"
                    />
                    Published
                  </label>
                </div>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingArticle(null);
                    }}
                    className="px-6 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingArticle ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageArticles;
