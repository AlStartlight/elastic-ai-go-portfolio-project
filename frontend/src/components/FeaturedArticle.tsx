import React from 'react';
import { Article } from '../types/article';

interface FeaturedArticleProps {
  article: Article;
  onClick?: (article: Article) => void;
  className?: string;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ 
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

  return (
    <div 
      className={`md:col-span-2 lg:col-span-2 group relative bg-gray-800/40 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl hover:shadow-green-500/10 cursor-pointer ${className}`}
      onClick={handleClick}
    >
      {/* Header Image/Design */}
      <div className="relative overflow-hidden">
        <div className="bg-gradient-to-br from-green-600 to-emerald-700 aspect-[16/9] p-8 flex items-center justify-center relative">
          {/* Article Preview Mockup */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 w-full max-w-md shadow-2xl transform group-hover:scale-105 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-green-600 font-semibold text-sm">FEATURED</span>
            </div>
            <h3 className="text-gray-800 font-bold text-lg mb-3 line-clamp-2">
              {article.title}
            </h3>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {article.excerpt}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{article.readTime} min read</span>
              <span>•</span>
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          </div>
          
          {/* Reading icon overlay */}
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Quick actions */}
          <div className="absolute bottom-4 left-4 flex gap-2 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm">
              Read Full Article
            </button>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 text-sm">
              Share
            </button>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className={`${article.category.bgColor} ${article.category.color} px-3 py-1 rounded-full text-xs font-medium`}>
            {article.category.name}
          </span>
          {article.tags && article.tags.slice(0, 2).map(tag => (
            <span key={tag} className="bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full text-xs">
              {tag}
            </span>
          ))}
          <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium ml-auto">
            ⭐ Featured
          </span>
        </div>
        
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors duration-300">
          {article.title}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {article.excerpt}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              {article.author?.avatar ? (
                <img 
                  src={article.author.avatar} 
                  alt={article.author.name}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {article.author?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
              <span>{article.author?.name}</span>
            </div>
            <span>•</span>
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span>{article.readTime} min read</span>
          </div>
          
          <button className="text-green-400 hover:text-green-300 font-medium text-sm transition-colors duration-300 flex items-center gap-1">
            Read More 
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
        
        {/* Article stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-700/50">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>2.4k views</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>156 likes</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>23 comments</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedArticle;