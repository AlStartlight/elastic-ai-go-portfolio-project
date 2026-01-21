import React, { useState, useEffect } from 'react';
import { articleApi } from '../services/api-service';
import { Article } from '../types/article';

interface KeyNotesArticlesProps {
  limit?: number;
}

const KeyNotesArticles: React.FC<KeyNotesArticlesProps> = ({ limit = 3 }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const data = await articleApi.getFeaturedArticles(limit);
        setArticles(data.articles);
        setError(null);
      } catch (err) {
        setError('Failed to load articles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [limit]);

  if (loading) {
    return (
      <section className="mt-32 relative">
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              My Key Notes <span className="text-green-500">Articles</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full"></div>
          </div>
          <div className="text-center text-gray-400">Loading articles...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="mt-32 relative">
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              My Key Notes <span className="text-green-500">Articles</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full"></div>
          </div>
          <div className="text-center text-red-400">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-32 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            My Key Notes <span className="text-green-500">Articles</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Insights, tutorials, and thoughts on software development
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {articles.map((article) => (
            <article
              key={article.id}
              className="group relative bg-gray-800/40 backdrop-blur-lg rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-3xl hover:shadow-green-500/10 cursor-pointer"
            >
              {/* Article Header */}
              <div className="p-6">
                {/* Category Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${article.category.bgColor} ${article.category.color}`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                    {article.category.name}
                  </span>
                  {article.featured && (
                    <span className="bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium">
                      ⭐ Featured
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-400 transition-colors duration-300">
                  {article.title}
                </h3>

                {/* Excerpt */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      {article.readTime} min read
                    </span>
                    {article.viewCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {article.viewCount}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-600/50 transition-colors duration-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-700/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
                    {article.author?.avatar ? (
                      <img 
                        src={article.author.avatar} 
                        alt={article.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      article.author?.name ? article.author.name.charAt(0).toUpperCase() : 'A'
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{article.author?.name || 'Anonymous'}</p>
                    <p className="text-gray-500 text-xs">Author</p>
                  </div>
                </div>

                {/* Read More Button */}
                <div className="mt-6">
                  <button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform group-hover:scale-105 flex items-center justify-center gap-2">
                    Read Article
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </article>
          ))}
        </div>

        {articles.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            No featured articles available yet.
          </div>
        )}

        {/* View All Button */}
        {articles.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-gray-800/50 hover:bg-gray-700/50 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 border border-gray-700 hover:border-green-500 hover:text-green-400">
              View All Articles
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default KeyNotesArticles;
