# SEO Implementation Guide - Enhanced with React Helmet Async

This project uses comprehensive SEO best practices with **react-helmet-async** for optimal search engine visibility and social media sharing.

## 🚀 Features Implemented

### 1. **React Helmet Async**
- Dynamic meta tag management
- Server-side rendering support
- Better performance than react-helmet
- Thread-safe meta tag updates

### 2. **Structured Data (JSON-LD)**
Implemented Schema.org structured data for:
- **Person** (default) - Developer profile
- **Article** - Blog posts with author, date, image
- **Course** - Educational content
- **CreativeWork** - Project portfolio items

### 3. **Meta Tags Coverage**
- Standard meta tags (title, description, keywords, author)
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Robots directives
- Canonical URLs
- Multi-language support (en_US, id_ID)

### 4. **Performance Optimizations**
```html
<!-- Preconnect to external domains -->
<link rel="preconnect" href="https://res.cloudinary.com" />
<link rel="dns-prefetch" href="https://res.cloudinary.com" />
```

## 📝 Usage Examples

### Basic Page SEO
```tsx
import SEO from '../components/SEO';

function HomePage() {
  return (
    <div>
      <SEO
        title="Asep Jumadi - Full Stack Developer"
        description="Professional Full Stack Developer..."
        keywords="react, typescript, golang, web development"
      />
      {/* Your content */}
    </div>
  );
}
```

### Article Page with Structured Data
```tsx
import SEO, { createArticleStructuredData } from '../components/SEO';

function ArticleDetail({ article }) {
  return (
    <div>
      <SEO
        title={`${article.title} | Asep Jumadi`}
        description={article.excerpt}
        ogType="article"
        ogImage={article.thumbnail}
        article={{
          publishedTime: article.publishedAt,
          modifiedTime: article.updatedAt,
          author: article.author.name,
          tags: [article.category.name],
        }}
        structuredData={createArticleStructuredData({
          title: article.title,
          description: article.excerpt,
          image: article.thumbnail,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          author: article.author.name,
          url: `https://asepjumadi.com/articles/${article.slug}`,
        })}
      />
      {/* Article content */}
    </div>
  );
}
```

## 🔧 Configuration

### Environment Variables
Add to your `.env` file:
```bash
VITE_SITE_URL=https://asepjumadi.com
VITE_API_URL=https://api.asepjumadi.com
```

### Update Social Media Links
In `src/components/SEO.tsx`, update:
```typescript
sameAs: [
  'https://github.com/YOUR_USERNAME',
  'https://linkedin.com/in/YOUR_USERNAME',
  'https://twitter.com/YOUR_USERNAME',
]
```

## 🧪 Testing SEO

### Tools to Test:
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **Lighthouse** (Chrome DevTools): Performance, SEO, Best Practices

Target Lighthouse scores:
- SEO: 100
- Performance: 90+
- Best Practices: 95+
- Accessibility: 95+

## 📊 SEO Best Practices Implemented

### ✅ Technical SEO
- [x] Proper HTML5 semantic structure
- [x] Mobile-responsive design
- [x] Fast loading times with Vite
- [x] Clean URLs with React Router
- [x] Sitemap.xml (in `/public`)
- [x] Robots.txt (in `/public`)
- [x] Canonical URLs
- [x] SSL/HTTPS ready

### ✅ On-Page SEO
- [x] Unique titles for each page
- [x] Meta descriptions (150-160 chars)
- [x] Header hierarchy (H1, H2, H3)
- [x] Alt text for images
- [x] Internal linking
- [x] Keyword optimization

### ✅ Social Media SEO
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Social sharing images (1200x630)
- [x] Rich social previews

---

**Last Updated**: January 2026
