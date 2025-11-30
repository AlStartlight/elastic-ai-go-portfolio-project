import React from 'react';
import { Article } from '../types/article';

interface ArticleCardProps {
  article: Article;
  onClick?: (article: Article) => void;
  className?: string;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onClick,
  className = ''
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(article);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradientByCategory = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'architecture':
        return 'from-green-600 to-emerald-700';
      case 'backend':
        return 'from-purple-600 to-pink-600';
      case 'mobile':
        return 'from-blue-600 to-cyan-600';
      case 'frontend':
        return 'from-cyan-600 to-blue-600';
      case 'ux/ui':
        return 'from-yellow-500 to-orange-600';
      case 'devops':
        return 'from-indigo-600 to-purple-700';
      default:
        return 'from-gray-600 to-gray-700';
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'architecture':
        return (
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'backend':
        return (
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        );
      case 'mobile':
        return (
          <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
        );
      case 'ux/ui':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        );
      case 'devops':
        return (
          <div className="w-4 h-4 bg-indigo-500 rounded-full animate-pulse"></div>
        );
      default:
        return (
          <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
        );
    }
  };

  return (
    <div 
      className={`group relative bg-gray-800/40 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:shadow-${article.category.name.toLowerCase()}-500/10 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Header Image/Design */}
      <div className="relative overflow-hidden">
        <div className={`bg-gradient-to-br ${getGradientByCategory(article.category.name)} aspect-[4/3] p-6 flex items-center justify-center relative`}>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 w-full shadow-xl transform group-hover:scale-105 transition-transform duration-500">
            <div className="flex items-center gap-2 mb-3">
              {getCategoryIcon(article.category.name)}
              <span className="text-xs font-bold text-gray-700 uppercase">
                {article.category.name}
              </span>
            </div>
            <div className="space-y-2">
              <div className="h-2 bg-gray-300 rounded"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              {article.category.name.toLowerCase() === 'backend' && (
                <div className="h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded text-white flex items-center justify-center text-xs font-bold">
                  GO + REACT
                </div>
              )}
              {article.category.name.toLowerCase() === 'mobile' && (
                <div className="flex gap-1 mt-2">
                  <div className="w-6 h-8 bg-blue-500 rounded-sm"></div>
                  <div className="w-6 h-8 bg-cyan-500 rounded-sm"></div>
                  <div className="w-6 h-8 bg-blue-400 rounded-sm"></div>
                </div>
              )}
              {article.category.name.toLowerCase() === 'ux/ui' && (
                <div className="grid grid-cols-3 gap-1 mt-2">
                  <div className="h-4 bg-yellow-400 rounded"></div>
                  <div className="h-4 bg-orange-400 rounded"></div>
                  <div className="h-4 bg-yellow-500 rounded"></div>
                </div>
              )}
              {article.category.name.toLowerCase() === 'devops' && (
                <div className="flex justify-between mt-3">
                  <div className="w-8 h-6 bg-indigo-500 rounded text-white text-xs flex items-center justify-center">DEV</div>
                  <div className="w-8 h-6 bg-purple-500 rounded text-white text-xs flex items-center justify-center">OPS</div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Quick action button */}
        <div className="absolute bottom-4 right-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
          <button className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors duration-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`${article.category.bgColor} ${article.category.color} px-3 py-1 rounded-full text-xs font-medium`}>
            {article.category.name}
          </span>
          {article.tags && article.tags.slice(0, 1).map(tag => (
            <span key={tag} className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
        </div>
        
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-green-400 transition-colors duration-300">
          {article.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{article.readTime} min read</span>
          </div>
          <button className={`${article.category.color.replace('300', '400')} hover:${article.category.color.replace('300', '300')} font-medium text-sm transition-colors duration-300`}>
            Read →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;