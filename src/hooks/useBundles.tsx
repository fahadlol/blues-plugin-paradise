import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Bundle {
  id: string;
  name: string;
  description: string;
  price: number;
  plugin_ids: string[];
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useBundles = () => {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedData = data?.map(bundle => ({
        id: bundle.id,
        name: bundle.name,
        description: bundle.description || '',
        price: bundle.price,
        plugin_ids: Array.isArray(bundle.plugin_ids) ? bundle.plugin_ids.map(String) : [],
        features: Array.isArray(bundle.features) ? bundle.features.map(String) : [],
        is_active: bundle.is_active,
        is_featured: bundle.is_featured,
        created_at: bundle.created_at,
        updated_at: bundle.updated_at
      })) || [];

      setBundles(transformedData);
    } catch (error) {
      console.error('Error fetching bundles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBundleById = (id: string) => {
    return bundles.find(bundle => bundle.id === id);
  };

  const getFeaturedBundles = () => {
    return bundles.filter(bundle => bundle.is_featured);
  };

  return {
    bundles,
    loading,
    getBundleById,
    getFeaturedBundles,
    refreshBundles: fetchBundles
  };
};