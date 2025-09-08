import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  is_active: boolean;
}

export const useFAQs = () => {
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      setFAQs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFAQsByCategory = (category?: string) => {
    if (!category) return faqs;
    return faqs.filter(faq => faq.category === category);
  };

  const getCategories = () => {
    const categories = [...new Set(faqs.map(faq => faq.category))];
    return categories;
  };

  return {
    faqs,
    loading,
    getFAQsByCategory,
    getCategories,
    refreshFAQs: fetchFAQs
  };
};