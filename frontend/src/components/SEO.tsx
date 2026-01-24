import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogType?: string;
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    tags?: string[];
  };
  structuredData?: any;
}

const SEO: React.FC<SEOProps> = ({
  title = 'Asep Jumadi - Full Stack Developer',
  description = 'Professional Full Stack Developer specializing in React, TypeScript, Go, and modern web technologies. Building scalable and performant web applications.',
  keywords = 'full stack developer, react developer, golang developer, typescript, web development, portfolio, software engineer, asep jumadi',
  author = 'Asep Jumadi',
  ogType = 'website',
  ogImage = '/og-image.jpg',
  canonicalUrl,
  noIndex = false,
  article,
  structuredData,
}) => {
  const location = useLocation();
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://asepjumadi.com';
  const fullUrl = canonicalUrl || `${siteUrl}${location.pathname}`;
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  // Default structured data for Person
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Asep Jumadi',
    url: siteUrl,
    jobTitle: 'Full Stack Developer',
    description: description,
    image: fullImageUrl,
    sameAs: [
      'https://github.com/asepjumadi',
      'https://linkedin.com/in/asepjumadi',
      'https://twitter.com/asepjumadi',
    ],
    knowsAbout: [
      'React.js',
      'TypeScript',
      'Go (Golang)',
      'Node.js',
      'PostgreSQL',
      'Full Stack Development',
      'Web Development',
      'Software Engineering',
    ],
  };

  const finalStructuredData = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Asep Jumadi Portfolio" />
      <meta property="og:locale" content="en_US" />
      <meta property="og:locale:alternate" content="id_ID" />
      
      {/* Article specific Open Graph tags */}
      {article && (
        <>
          {article.publishedTime && (
            <meta property="article:published_time" content={article.publishedTime} />
          )}
          {article.modifiedTime && (
            <meta property="article:modified_time" content={article.modifiedTime} />
          )}
          {article.author && (
            <meta property="article:author" content={article.author} />
          )}
          {article.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:creator" content="@asepjumadi" />
      <meta name="twitter:site" content="@asepjumadi" />
      
      {/* Additional SEO tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta httpEquiv="x-ua-compatible" content="ie=edge" />
      
      {/* Language */}
      <html lang="en" />
      
      {/* Structured Data (JSON-LD) */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
};

// Helper function to create Article structured data
export const createArticleStructuredData = (article: {
  title: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  image: article.image,
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  author: {
    '@type': 'Person',
    name: article.author,
    url: 'https://asepjumadi.com',
  },
  publisher: {
    '@type': 'Person',
    name: 'Asep Jumadi',
    logo: {
      '@type': 'ImageObject',
      url: 'https://asepjumadi.com/logo.png',
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': article.url,
  },
});

// Helper function to create Course structured data
export const createCourseStructuredData = (course: {
  title: string;
  description: string;
  image: string;
  provider: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.title,
  description: course.description,
  image: course.image,
  provider: {
    '@type': 'Person',
    name: course.provider,
  },
  url: course.url,
});

// Helper function to create Project/CreativeWork structured data
export const createProjectStructuredData = (project: {
  title: string;
  description: string;
  image: string;
  author: string;
  url: string;
  technologies: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: project.title,
  description: project.description,
  image: project.image,
  author: {
    '@type': 'Person',
    name: project.author,
  },
  url: project.url,
  keywords: project.technologies.join(', '),
});

export default SEO;
