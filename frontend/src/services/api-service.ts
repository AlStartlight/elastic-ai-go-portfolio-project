// Example API service for articles
// Replace dummy data hooks in data/articles.ts with these API calls

import { Article, NewsletterSubscription } from '../types/article';

// Use import.meta.env for Vite or define globally
const API_BASE_URL = (typeof window !== 'undefined' && (window as any).__API_BASE_URL__) || 
                    'http://localhost:8080/api';

// Types for creating and updating articles
export interface CreateArticleRequest {
  title: string;
  excerpt: string;
  content: string;
  categoryId: string;
  featured?: boolean;
  published?: boolean;
  tags?: string[];
}

export interface UpdateArticleRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  categoryId?: string;
  featured?: boolean;
  published?: boolean;
  tags?: string[];
}

// Article API endpoints
export const articleApi = {
  // Get all articles with optional pagination and filtering
  getArticles: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
  }): Promise<{
    articles: Article[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());

    const response = await fetch(`${API_BASE_URL}/articles?${queryParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  },

  // Get single article by slug
  getArticle: async (slug: string): Promise<Article> => {
    const response = await fetch(`${API_BASE_URL}/articles/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch article');
    }
    return response.json();
  },

  // Get featured article
  getFeaturedArticle: async (): Promise<Article> => {
    const response = await fetch(`${API_BASE_URL}/articles/featured`);
    if (!response.ok) {
      throw new Error('Failed to fetch featured article');
    }
    return response.json();
  },

  // Search articles
  searchArticles: async (query: string, page = 1, limit = 10): Promise<{
    articles: Article[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    const response = await fetch(
      `${API_BASE_URL}/articles/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to search articles');
    }
    return response.json();
  },

  // Create new article
  createArticle: async (articleData: CreateArticleRequest): Promise<Article> => {
    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header when implementing auth
        // 'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create article');
    }
    
    return response.json();
  },

  // Update existing article
  updateArticle: async (id: string, articleData: UpdateArticleRequest): Promise<Article> => {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Add authorization header when implementing auth
        // 'Authorization': `Bearer ${getToken()}`,
      },
      body: JSON.stringify(articleData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update article');
    }
    
    return response.json();
  },

  // Delete article
  deleteArticle: async (id: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        // Add authorization header when implementing auth
        // 'Authorization': `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete article');
    }
    
    return response.json();
  },

  // Get article categories
  getCategories: async (): Promise<Array<{
    id: string;
    name: string;
    color: string;
    bgColor: string;
    slug: string;
  }>> => {
    const response = await fetch(`${API_BASE_URL}/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  },
};

// Newsletter API endpoints
export const newsletterApi = {
  // Subscribe to newsletter
  subscribe: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to subscribe to newsletter');
    }
    
    return response.json();
  },

  // Unsubscribe from newsletter
  unsubscribe: async (email: string, token: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unsubscribe from newsletter');
    }
    
    return response.json();
  },
};

// Analytics API endpoints (optional)
export const analyticsApi = {
  // Track article view
  trackArticleView: async (articleId: string): Promise<void> => {
    await fetch(`${API_BASE_URL}/analytics/articles/${articleId}/view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Track article like
  trackArticleLike: async (articleId: string): Promise<{ likes: number }> => {
    const response = await fetch(`${API_BASE_URL}/analytics/articles/${articleId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to like article');
    }
    
    return response.json();
  },

  // Get article statistics
  getArticleStats: async (articleId: string): Promise<{
    views: number;
    likes: number;
    comments: number;
  }> => {
    const response = await fetch(`${API_BASE_URL}/analytics/articles/${articleId}/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch article stats');
    }
    return response.json();
  },
};

// Error handler utility
export const handleApiError = (error: any): string => {
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again later.';
};

/* 
Usage example in React components:

// Using with React Query (recommended)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi, newsletterApi } from './api-service';

export const useArticles = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  featured?: boolean;
}) => {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => articleApi.getArticles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFeaturedArticle = () => {
  return useQuery({
    queryKey: ['featured-article'],
    queryFn: () => articleApi.getFeaturedArticle(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (articleData: CreateArticleRequest) => articleApi.createArticle(articleData),
    onSuccess: () => {
      // Invalidate articles cache to refetch
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['featured-article'] });
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleRequest }) => 
      articleApi.updateArticle(id, data),
    onSuccess: (updatedArticle) => {
      // Update cache with new data
      queryClient.setQueryData(['articles', updatedArticle.slug], updatedArticle);
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => articleApi.deleteArticle(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
};

export const useNewsletterSubscribe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (email: string) => newsletterApi.subscribe(email),
    onSuccess: () => {
      // Invalidate any newsletter-related queries
      queryClient.invalidateQueries({ queryKey: ['newsletter'] });
    },
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => articleApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Using in component:
const ArticleEditor = () => {
  const { data: categories } = useCategories();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  
  const handleSubmit = async (articleData: CreateArticleRequest) => {
    try {
      await createMutation.mutateAsync(articleData);
      toast.success('Article created successfully!');
      // Navigate to article or articles list
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };
  
  const handleUpdate = async (id: string, data: UpdateArticleRequest) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      toast.success('Article updated successfully!');
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };
  
  // ... component rendering with form
};

// Example article creation form data:
const exampleArticleData: CreateArticleRequest = {
  title: "Building Modern React Applications",
  excerpt: "Learn how to create scalable React apps with TypeScript and best practices.",
  content: `# Building Modern React Applications

React has evolved significantly over the years...

## Key Concepts

1. **Component Composition**: Building complex UIs from simple components
2. **State Management**: Using hooks and context effectively  
3. **Performance**: Optimization techniques for production

\`\`\`typescript
const MyComponent: React.FC = () => {
  const [state, setState] = useState(0);
  
  return (
    <div>
      <h1>Count: {state}</h1>
      <button onClick={() => setState(s => s + 1)}>
        Increment
      </button>
    </div>
  );
};
\`\`\`

## Conclusion

Modern React development focuses on...
`,
  categoryId: "react-frontend",
  featured: false,
  published: true,
  tags: ["React", "TypeScript", "Frontend"]
};
*/

// ============ HOMEPAGE API ============
export interface HomepageContent {
  id: string;
  section: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
  metadata?: Record<string, any>;
  isActive: boolean;
}

export interface TechStack {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  displayOrder: number;
  isActive: boolean;
}

export const homepageApi = {
  getContentBySection: async (section: string): Promise<HomepageContent> => {
    const response = await fetch(`${API_BASE_URL}/public/homepage/${section}`);
    if (!response.ok) throw new Error('Failed to fetch homepage content');
    return response.json();
  },
  
  getTechStacks: async (): Promise<TechStack[]> => {
    const response = await fetch(`${API_BASE_URL}/public/tech-stacks`);
    if (!response.ok) throw new Error('Failed to fetch tech stacks');
    return response.json();
  },
  
  // Admin endpoints
  updateContent: async (content: Partial<HomepageContent>): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/homepage`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(content),
    });
    if (!response.ok) throw new Error('Failed to update homepage content');
  },
  
  createTechStack: async (stack: Omit<TechStack, 'id'>): Promise<TechStack> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/tech-stacks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(stack),
    });
    if (!response.ok) throw new Error('Failed to create tech stack');
    return response.json();
  },
  
  updateTechStack: async (id: string, stack: Partial<TechStack>): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/tech-stacks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(stack),
    });
    if (!response.ok) throw new Error('Failed to update tech stack');
  },
  
  deleteTechStack: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/tech-stacks/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete tech stack');
  },
};

// ============ PROJECTS API ============
export interface Project {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string[];
  category: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  startedAt?: string;
  completedAt?: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectRequest {
  title: string;
  description: string;
  shortDescription: string;
  thumbnailUrl: string;
  projectUrl?: string;
  githubUrl?: string;
  technologies: string[];
  category: string;
  featured: boolean;
  status?: 'draft' | 'published' | 'archived';
  startedAt?: string;
  completedAt?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {}

export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await fetch(`${API_BASE_URL}/public/projects`);
    if (!response.ok) throw new Error('Failed to fetch projects');
    return response.json();
  },
  
  getBySlug: async (slug: string): Promise<Project> => {
    const response = await fetch(`${API_BASE_URL}/public/projects/${slug}`);
    if (!response.ok) throw new Error('Failed to fetch project');
    return response.json();
  },
  
  // Admin endpoints
  create: async (data: CreateProjectRequest): Promise<Project> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create project');
    return response.json();
  },
  
  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update project');
    return response.json();
  },
  
  delete: async (id: string): Promise<void> => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to delete project');
  },
};