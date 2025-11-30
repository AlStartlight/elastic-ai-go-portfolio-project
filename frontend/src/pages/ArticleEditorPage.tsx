import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ArticleEditor from '../components/ArticleEditor';
import { useArticle, useArticleEditor } from '../hooks/useArticles';
import { CreateArticleRequest, UpdateArticleRequest, handleApiError } from '../services/api-service';

const ArticleEditorPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch existing article if editing
  const { data: article, isLoading: articleLoading } = useArticle(slug || '');
  
  // Use article editor hook
  const { categories, isLoading, error, handleSubmit, isSuccess, reset } = useArticleEditor(article);

  // Handle form submission
  const onSubmit = async (data: CreateArticleRequest | UpdateArticleRequest) => {
    try {
      await handleSubmit(data);
      
      setNotification({
        type: 'success',
        message: article ? 'Article updated successfully!' : 'Article created successfully!'
      });

      // Navigate back to articles list after a delay
      setTimeout(() => {
        navigate('/articles');
      }, 2000);

    } catch (err) {
      setNotification({
        type: 'error',
        message: handleApiError(err)
      });
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigate('/articles');
    }
  };

  // Clear notification after 5 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Loading state for existing article
  if (slug && articleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  // Article not found
  if (slug && !articleLoading && !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">The article you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/articles')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors duration-300"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500/90 border border-green-400' 
              : 'bg-red-500/90 border border-red-400'
          } backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-white font-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="text-white/80 hover:text-white ml-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="fixed top-20 right-4 z-40 p-4 bg-red-500/90 border border-red-400 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-white font-medium">{handleApiError(error)}</span>
          </div>
        </div>
      )}

      <ArticleEditor
        article={article}
        categories={categories}
        onSubmit={onSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ArticleEditorPage;

// CSS for fade-in animation (add to your CSS file)
const styles = `
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
`;