import React from 'react';
import { useArticles, useFeaturedArticle } from '../data/articles';
import { Article, NewsletterSubscription as NewsletterSubscriptionType } from '../types/article';
import ArticleCard from './ArticleCard';
import FeaturedArticle from './FeaturedArticle';
import NewsletterSubscription from './NewsletterSubscription';

interface ArticleSectionProps {
  onArticleClick?: (article: Article) => void;
  onNewsletterSubscribe?: (data: NewsletterSubscriptionType) => Promise<void>;
  showNewsletter?: boolean;
  className?: string;
}

const ArticleSection: React.FC<ArticleSectionProps> = ({
  onArticleClick,
  onNewsletterSubscribe,
  showNewsletter = true,
  className = ''
}) => {
  const { articles, isLoading: articlesLoading, error: articlesError } = useArticles();
  const { article: featuredArticle, isLoading: featuredLoading } = useFeaturedArticle();

  const handleArticleClick = (article: Article) => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      // Default behavior - could navigate to article detail page
      console.log('Navigating to article:', article.slug);
      // window.location.href = `/articles/${article.slug}`;
    }
  };

  const handleViewAllArticles = () => {
    // Navigate to articles listing page
    console.log('Navigating to all articles');
    // window.location.href = '/articles';
  };

  if (articlesError) {
    return (
      <section className={`mt-32 relative ${className}`}>
        <div className="text-center text-red-400">
          <p>Failed to load articles. Please try again later.</p>
        </div>
      </section>
    );
  }

  const regularArticles = articles.filter(article => !article.featured);

  return (
    <section className={`mt-32 relative ${className}`}>
      {/* Background decoration */}
      <div className="absolute top-20 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            My Key Notes <span className="text-green-500">Article</span>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-green-500 to-green-400 mx-auto rounded-full mb-8"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Insights, thoughts, and learnings from my journey as a developer. 
            Sharing knowledge that matters in the ever-evolving tech world.
          </p>
        </div>

        {/* Loading State */}
        {(articlesLoading || featuredLoading) && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading articles...</p>
          </div>
        )}

        {/* Articles Grid */}
        {!articlesLoading && !featuredLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
            {/* Featured Article */}
            {featuredArticle && (
              <FeaturedArticle 
                article={featuredArticle} 
                onClick={handleArticleClick}
              />
            )}

            {/* Regular Articles */}
            {regularArticles.slice(0, 5).map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={handleArticleClick}
                className={featuredArticle && index === 0 ? 'lg:col-start-3' : ''}
              />
            ))}
          </div>
        )}

        {/* Newsletter Subscription */}
        {showNewsletter && (
          <div className="mb-16">
            <NewsletterSubscription 
              onSubscribe={onNewsletterSubscribe}
            />
          </div>
        )}

        {/* View All Articles Button */}
        <div className="text-center">
          <button 
            onClick={handleViewAllArticles}
            className="group bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl hover:shadow-green-500/25"
          >
            <span className="flex items-center gap-2">
              View All Articles
              <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </button>
        </div>

        {/* Article Statistics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">
              {articles.length}+
            </div>
            <p className="text-gray-400">Articles Published</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">
              50k+
            </div>
            <p className="text-gray-400">Total Reads</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">
              1.2k+
            </div>
            <p className="text-gray-400">Newsletter Subscribers</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArticleSection;