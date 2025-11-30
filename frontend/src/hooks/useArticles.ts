import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { articleApi, newsletterApi, analyticsApi, CreateArticleRequest, UpdateArticleRequest } from '../services/api-service';
import { Article } from '../types/article';

// Article Hooks

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

export const useArticle = (slug: string) => {
  return useQuery({
    queryKey: ['articles', slug],
    queryFn: () => articleApi.getArticle(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedArticle = () => {
  return useQuery({
    queryKey: ['featured-article'],
    queryFn: () => articleApi.getFeaturedArticle(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSearchArticles = (query: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['articles', 'search', query, page, limit],
    queryFn: () => articleApi.searchArticles(query, page, limit),
    enabled: !!query,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => articleApi.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Article Mutations

export const useCreateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (articleData: CreateArticleRequest) => articleApi.createArticle(articleData),
    onSuccess: (newArticle) => {
      // Invalidate articles cache
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      
      // If it's featured, also invalidate featured article
      if (newArticle.featured) {
        queryClient.invalidateQueries({ queryKey: ['featured-article'] });
      }
      
      // Add to cache
      queryClient.setQueryData(['articles', newArticle.slug], newArticle);
    },
  });
};

export const useUpdateArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArticleRequest }) => 
      articleApi.updateArticle(id, data),
    onSuccess: (updatedArticle:any) => {
      // Update specific article cache
      queryClient.setQueryData(['articles', updatedArticle.slug], updatedArticle);
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['articles'], exact: false });
      
      // If featured status changed, invalidate featured article
      queryClient.invalidateQueries({ queryKey: ['featured-article'] });
    },
  });
};

export const useDeleteArticle = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => articleApi.deleteArticle(id),
    onSuccess: () => {
      // Invalidate all article-related queries
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['featured-article'] });
    },
  });
};

// Newsletter Hooks

export const useNewsletterSubscribe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (email: string) => newsletterApi.subscribe(email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter'] });
    },
  });
};

export const useNewsletterUnsubscribe = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ email, token }: { email: string; token: string }) => 
      newsletterApi.unsubscribe(email, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter'] });
    },
  });
};

// Analytics Hooks

export const useTrackArticleView = () => {
  return useMutation({
    mutationFn: (articleId: string) => analyticsApi.trackArticleView(articleId),
    // Don't show loading states for analytics
    meta: {
      silent: true,
    },
  });
};

export const useTrackArticleLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (articleId: string) => analyticsApi.trackArticleLike(articleId),
    onSuccess: (data, articleId) => {
      // Update article cache with new like count
      queryClient.setQueryData(['articles', articleId], (old: Article | undefined) => {
        if (old) {
          return { ...old, likeCount: data.likes };
        }
        return old;
      });
    },
  });
};

export const useArticleStats = (articleId: string) => {
  return useQuery({
    queryKey: ['articles', articleId, 'stats'],
    queryFn: () => analyticsApi.getArticleStats(articleId),
    enabled: !!articleId,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Utility hook for optimistic updates
export const useOptimisticArticleUpdate = () => {
  const queryClient = useQueryClient();
  
  const optimisticUpdate = (slug: string, updates: Partial<Article>) => {
    queryClient.setQueryData(['articles', slug], (old: Article | undefined) => {
      if (old) {
        return { ...old, ...updates };
      }
      return old;
    });
  };

  return { optimisticUpdate };
};

// Custom hook for article editor state management
export const useArticleEditor = (initialArticle?: Article) => {
  const { data: categories } = useCategories();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();

  const isLoading = createMutation.isPending || updateMutation.isPending;
  const error = createMutation.error || updateMutation.error;

  const handleSubmit = async (data: CreateArticleRequest | UpdateArticleRequest) => {
    if (initialArticle) {
      // Update existing article
      await updateMutation.mutateAsync({ 
        id: initialArticle.id, 
        data: data as UpdateArticleRequest 
      });
    } else {
      // Create new article
      await createMutation.mutateAsync(data as CreateArticleRequest);
    }
  };

  return {
    categories: categories || [],
    isLoading,
    error,
    handleSubmit,
    isSuccess: createMutation.isSuccess || updateMutation.isSuccess,
    reset: () => {
      createMutation.reset();
      updateMutation.reset();
    },
  };
};