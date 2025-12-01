import React, { useEffect } from 'react';
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
}) => {
  const location = useLocation();
  const siteUrl = 'https://asepjumadi.com'; // Update dengan URL production Anda
  const fullUrl = canonicalUrl || `${siteUrl}${location.pathname}`;

  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    updateMetaTag('author', author);

    // Open Graph meta tags
    updateMetaTag('og:title', title, 'property');
    updateMetaTag('og:description', description, 'property');
    updateMetaTag('og:type', ogType, 'property');
    updateMetaTag('og:url', fullUrl, 'property');
    updateMetaTag('og:image', `${siteUrl}${ogImage}`, 'property');
    updateMetaTag('og:site_name', 'Asep Jumadi Portfolio', 'property');

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', `${siteUrl}${ogImage}`);
    updateMetaTag('twitter:creator', '@asepjumadi'); // Update dengan Twitter handle Anda

    // Robots meta tag
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Canonical URL
    let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullUrl);

    // Language
    document.documentElement.lang = 'en';

    // Structured Data (JSON-LD)
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Asep Jumadi',
      url: siteUrl,
      jobTitle: 'Full Stack Developer',
      description: description,
      sameAs: [
        'https://github.com/asepjumadi',
        'https://linkedin.com/in/asepjumadi',
        'https://twitter.com/asepjumadi',
      ],
    };

    let scriptTag = document.querySelector('script[type="application/ld+json"]');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(structuredData);
  }, [title, description, keywords, author, ogType, ogImage, fullUrl, noIndex]);

  return null;
};

export default SEO;
