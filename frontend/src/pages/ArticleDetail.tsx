import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { articleApi } from '../services/api-service';
import { Article } from '../types/article';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useAuth } from '../context/AuthContext';
import SEO, { createArticleStructuredData } from '../components/SEO';

// Scroll to top on component mount
const ScrollToTop = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  return null;
};

// EditorJS Block Types
interface EditorJSBlock {
  id: string;
  type: string;
  data: any;
}

interface EditorJSContent {
  blocks: EditorJSBlock[];
  version?: string;
  time?: number;
}

// Component to render EditorJS content
const EditorJSRenderer: React.FC<{ content: string }> = ({ content }) => {
  try {
    const parsedContent: EditorJSContent = typeof content === 'string' ? JSON.parse(content) : content;
    
    console.log('Rendering EditorJS content:', parsedContent);
    console.log('Total blocks:', parsedContent.blocks?.length);
    
    return (
      <div className="space-y-6">
        {parsedContent.blocks.map((block, index) => {
          console.log(`Block ${index}:`, block.type, block.data);
          
          switch (block.type) {
            case 'header':
              const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
              const headerClasses: { [key: number]: string } = {
                1: 'text-4xl md:text-5xl font-bold text-white mb-6 mt-8',
                2: 'text-3xl md:text-4xl font-bold text-white mb-5 mt-7',
                3: 'text-2xl md:text-3xl font-bold text-white mb-4 mt-6',
                4: 'text-xl md:text-2xl font-bold text-white mb-3 mt-5',
                5: 'text-lg md:text-xl font-bold text-white mb-2 mt-4',
                6: 'text-base md:text-lg font-bold text-white mb-2 mt-3',
              };
              const headerClass = headerClasses[block.data.level] || 'text-2xl font-bold text-white mb-4';
              
              return (
                <HeaderTag key={block.id} className={headerClass}>
                  {block.data.text}
                </HeaderTag>
              );

            case 'paragraph':
              return (
                <p key={block.id} className="text-gray-300 leading-relaxed text-lg">
                  <span dangerouslySetInnerHTML={{ __html: block.data.text }} />
                </p>
              );

            case 'list':
              const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
              const listClass = block.data.style === 'ordered' 
                ? 'list-decimal list-inside text-gray-300 space-y-2 text-lg'
                : 'list-disc list-inside text-gray-300 space-y-2 text-lg';
              
              return (
                <ListTag key={block.id} className={listClass}>
                  {block.data.items.map((item: any, index: number) => (
                    <li key={index} className="leading-relaxed">
                      <span dangerouslySetInnerHTML={{ __html: item.content || item }} />
                    </li>
                  ))}
                </ListTag>
              );

            case 'code':
              return (
                <div key={block.id} className="my-6">
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={block.data.language || 'javascript'}
                    PreTag="div"
                    className="rounded-lg"
                  >
                    {block.data.code}
                  </SyntaxHighlighter>
                </div>
              );

            case 'quote':
              return (
                <blockquote key={block.id} className="border-l-4 border-green-500 pl-6 py-2 italic text-gray-400 my-6 text-lg">
                  <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                  {block.data.caption && (
                    <footer className="text-sm text-gray-500 mt-2">— {block.data.caption}</footer>
                  )}
                </blockquote>
              );

            case 'image':
              return (
                <figure key={block.id} className="my-8">
                  <img 
                    src={block.data.file?.url || block.data.url} 
                    alt={block.data.caption || 'Article image'} 
                    className="rounded-lg w-full shadow-xl"
                  />
                  {block.data.caption && (
                    <figcaption className="text-center text-gray-400 text-sm mt-3 italic">
                      {block.data.caption}
                    </figcaption>
                  )}
                </figure>
              );

            case 'delimiter':
              return (
                <div key={block.id} className="flex justify-center items-center my-8">
                  <div className="flex gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  </div>
                </div>
              );

            case 'warning':
              return (
                <div key={block.id} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 my-6">
                  <div className="flex gap-4">
                    <svg className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-yellow-500 font-semibold mb-1">{block.data.title}</h4>
                      <p className="text-gray-300">{block.data.message}</p>
                    </div>
                  </div>
                </div>
              );

            case 'table':
              return (
                <div key={block.id} className="overflow-x-auto my-6">
                  <table className="min-w-full border border-gray-700 rounded-lg">
                    <tbody>
                      {block.data.content.map((row: string[], rowIndex: number) => (
                        <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-800' : 'bg-gray-800/30'}>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="border border-gray-700 px-4 py-2 text-gray-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );

            default:
              return (
                <div key={block.id} className="text-gray-500 italic my-4">
                  [Unsupported block type: {block.type}]
                </div>
              );
          }
        })}
      </div>
    );
  } catch (error) {
    console.error('Error parsing EditorJS content:', error);
    return (
      <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-6">
        <p className="font-semibold mb-2">Error rendering content</p>
        <p className="text-sm">The article content could not be displayed properly.</p>
      </div>
    );
  }
};

const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const data = await articleApi.getArticle(slug);
        setArticle(data);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load article');
        console.error('Error loading article:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="mb-6">
            <svg className="w-20 h-20 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Article Not Found</h1>
          <p className="text-gray-400 mb-6">{error || 'The article you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <ScrollToTop />
      
      {/* SEO Component with Article Structured Data */}
      <SEO
        title={`${article.title} | Asep Jumadi`}
        description={article.excerpt}
        keywords={`${article.category.name}, article, blog, ${article.title}`}
        ogType="article"
        ogImage={article.thumbnail || '/og-image.jpg'}
        article={{
          publishedTime: article.publishedAt,
          author: article.author?.name || 'Asep Jumadi',
          tags: [article.category.name],
        }}
        structuredData={createArticleStructuredData({
          title: article.title,
          description: article.excerpt,
          image: article.thumbnail || 'https://asepjumadi.com/og-image.jpg',
          datePublished: article.publishedAt,
          dateModified: article.publishedAt,
          author: article.author?.name || 'Asep Jumadi',
          url: `https://asepjumadi.com/articles/${article.slug}`,
        })}
      />
      
      {/* Header/Hero Section */}
      <div className="relative py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Back Button and Edit Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors py-2"
            >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </button>
            
            {/* Edit Button - Only visible for admin */}
            {useAuth().user?.role === 'admin' && article && (
              <button
                onClick={() => navigate(`/admin/articles/edit/${article.id}`)}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105 shadow-lg text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Article
              </button>
            )}
          </div>

          {/* Category Badge */}
          <div className="mb-4">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${article.category.color} ${article.category.bgColor}`}
            >
              {article.category.name}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Excerpt */}
          <p className="text-base sm:text-lg md:text-xl text-gray-400 mb-6 sm:mb-8 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-400 pb-6 sm:pb-8 border-b border-gray-700">
            {/* Author */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-sm sm:text-lg">
                  {article.author?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">{article.author?.name || 'Anonymous'}</p>
                <p className="text-xs text-gray-500">Author</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>

            {/* Read Time */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{article.readTime} min read</span>
            </div>

         
            {article.viewCount && article.viewCount > 0 && (
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{article.viewCount.toLocaleString()} views</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {article.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-800 text-gray-400 rounded-full text-sm hover:bg-gray-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16 lg:pb-20">
        {article.content && <EditorJSRenderer content={article.content} />}

        {/* Share Section */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 lg:p-8 bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-700/50">
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Share this article</h3>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>
            <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 sm:py-3 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base min-h-[44px]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
              </svg>
              WhatsApp
            </button>
          </div>
        </div>

        {/* Back to Articles */}
        <div className="mt-8 sm:mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-2 text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Articles
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
