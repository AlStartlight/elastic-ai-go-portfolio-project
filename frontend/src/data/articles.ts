import { Article } from '../types/article';

export const ARTICLE_CATEGORIES = {
  ARCHITECTURE: {
    name: 'Architecture',
    color: 'text-green-300',
    bgColor: 'bg-green-500/20'
  },
  BACKEND: {
    name: 'Backend', 
    color: 'text-purple-300',
    bgColor: 'bg-purple-500/20'
  },
  MOBILE: {
    name: 'Mobile',
    color: 'text-blue-300', 
    bgColor: 'bg-blue-500/20'
  },
  FRONTEND: {
    name: 'Frontend',
    color: 'text-cyan-300',
    bgColor: 'bg-cyan-500/20'
  },
  UXUI: {
    name: 'UX/UI',
    color: 'text-yellow-300',
    bgColor: 'bg-yellow-500/20'
  },
  DEVOPS: {
    name: 'DevOps',
    color: 'text-indigo-300',
    bgColor: 'bg-indigo-500/20'
  }
};

export const DUMMY_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Mastering Clean Architecture in Modern React Applications',
    excerpt: 'Discover how to build maintainable and scalable React applications using clean architecture principles. Learn about separation of concerns, dependency inversion, and creating testable code.',
    category: ARTICLE_CATEGORIES.ARCHITECTURE,
    publishedAt: '2024-11-15',
    readTime: 8,
    slug: 'mastering-clean-architecture-react',
    featured: true,
    author: {
      name: 'Asep Jumadi'
    },
    tags: ['React', 'Architecture', 'Clean Code']
  },
  {
    id: '2', 
    title: 'Building APIs with Go and React Integration',
    excerpt: 'A comprehensive guide on creating robust REST APIs using Go and integrating them seamlessly with React frontends.',
    category: ARTICLE_CATEGORIES.BACKEND,
    publishedAt: '2024-10-28',
    readTime: 6,
    slug: 'building-apis-go-react-integration',
    author: {
      name: 'Asep Jumadi'
    },
    tags: ['Go', 'React', 'API', 'Backend']
  },
  {
    id: '3',
    title: 'React Native Performance Optimization',
    excerpt: 'Tips and tricks for building lightning-fast React Native applications that provide native-like user experience.',
    category: ARTICLE_CATEGORIES.MOBILE,
    publishedAt: '2024-10-20',
    readTime: 5,
    slug: 'react-native-performance-optimization',
    author: {
      name: 'Asep Jumadi'
    },
    tags: ['React Native', 'Performance', 'Mobile']
  },
  {
    id: '4',
    title: 'Design Systems That Scale',
    excerpt: 'Creating consistent and maintainable design systems for large-scale applications using modern tools and methodologies.',
    category: ARTICLE_CATEGORIES.UXUI,
    publishedAt: '2024-10-12',
    readTime: 7,
    slug: 'design-systems-that-scale',
    author: {
      name: 'Asep Jumadi'
    },
    tags: ['Design Systems', 'UX', 'UI', 'Scalability']
  },
  {
    id: '5',
    title: 'Docker & CI/CD Pipeline Setup',
    excerpt: 'Step-by-step guide to setting up robust CI/CD pipelines using Docker, GitHub Actions, and cloud deployment strategies.',
    category: ARTICLE_CATEGORIES.DEVOPS,
    publishedAt: '2024-09-30',
    readTime: 10,
    slug: 'docker-cicd-pipeline-setup',
    author: {
      name: 'Asep Jumadi'
    },
    tags: ['Docker', 'CI/CD', 'DevOps', 'GitHub Actions']
  },
  {
    id: '6',
    title: 'Advanced TypeScript Patterns for React',
    excerpt: 'Explore advanced TypeScript patterns that will make your React components more type-safe and maintainable.',
    category: ARTICLE_CATEGORIES.FRONTEND,
    publishedAt: '2024-09-15',
    readTime: 9,
    slug: 'advanced-typescript-patterns-react',
    author: {
      name: 'Asep Jumadi'
    },
    tags: ['TypeScript', 'React', 'Patterns', 'Type Safety']
  }
];

// API Hooks (Ready for real API integration)
export const useArticles = () => {
  // TODO: Replace with actual API call
  // const { data, isLoading, error } = useQuery('articles', fetchArticles);
  return {
    articles: DUMMY_ARTICLES,
    isLoading: false,
    error: null
  };
};

export const useFeaturedArticle = () => {
  // TODO: Replace with actual API call
  // const { data, isLoading, error } = useQuery('featured-article', fetchFeaturedArticle);
  return {
    article: DUMMY_ARTICLES.find(article => article.featured),
    isLoading: false,
    error: null
  };
};

export const useArticlesByCategory = (category?: string) => {
  // TODO: Replace with actual API call
  const filteredArticles = category 
    ? DUMMY_ARTICLES.filter(article => article.category.name.toLowerCase() === category.toLowerCase())
    : DUMMY_ARTICLES;
  
  return {
    articles: filteredArticles,
    isLoading: false,
    error: null
  };
};