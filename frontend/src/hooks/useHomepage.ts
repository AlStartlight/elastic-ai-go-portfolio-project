import { useState, useEffect } from 'react';
import { homepageApi, HomepageContent, TechStack } from '../services/api-service';

export const useHomepageContent = (section: string) => {
  const [content, setContent] = useState<HomepageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await homepageApi.getContentBySection(section);
        setContent(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [section]);

  return { content, loading, error };
};

export const useTechStacks = () => {
  const [stacks, setStacks] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStacks = async () => {
      try {
        setLoading(true);
        const data = await homepageApi.getTechStacks();
        setStacks(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load tech stacks');
      } finally {
        setLoading(false);
      }
    };

    fetchStacks();
  }, []);

  return { stacks, loading, error };
};
