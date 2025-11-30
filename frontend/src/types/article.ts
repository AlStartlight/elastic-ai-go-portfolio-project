export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: {
    id?: string;
    name: string;
    color: string;
    bgColor: string;
    slug?: string;
  };
  publishedAt: string;
  readTime: number;
  slug: string;
  featured?: boolean;
  published?: boolean;
  author?: {
    id?: string;
    name: string;
    avatar?: string;
    email?: string;
  };
  thumbnail?: string;
  tags?: string[];
  viewCount?: number;
  likeCount?: number;
}

export interface ArticleCategory {
  name: string;
  color: string;
  bgColor: string;
  icon?: string;
}

export interface NewsletterSubscription {
  email: string;
}