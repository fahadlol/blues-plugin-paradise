import { useState, useEffect } from "react";
import PluginCard from "./PluginCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Plugin {
  id: string;
  title: string;
  description: string;
  price: number;
  rating: number;
  downloads: number;
  thumbnail: string;
  category: string;
}

const FeaturedPlugins = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchFeaturedPlugins = async () => {
      try {
        const { data, error } = await supabase
          .from('plugins')
          .select('id, title, description, price, rating, downloads, thumbnail, category')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('rating', { ascending: false })
          .limit(6);

        if (error) throw error;
        setPlugins(data || []);
      } catch (error) {
        console.error('Error fetching plugins:', error);
        toast({
          title: "Error",
          description: "Failed to load featured plugins",
          variant: "destructive"
        });
        // Fallback to mock data if database fails
        setPlugins(mockPlugins);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPlugins();
  }, [toast]);

  // Fallback mock data
  const mockPlugins = [
    {
      id: "mock-1",
      title: "EssentialsX Enhanced",
      description: "Complete server management toolkit with advanced features, permissions, and economy integration.",
      price: 24.99,
      rating: 4.9,
      downloads: 50000,
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      category: "Management"
    },
    {
      id: "mock-2",
      title: "PvP Arena Pro",
      description: "Advanced PvP arena system with tournaments, rankings, and customizable game modes.",
      price: 39.99,
      rating: 4.8,
      downloads: 25000,
      thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop",
      category: "PvP"
    },
    {
      id: "mock-3",
      title: "Economy Plus",
      description: "Comprehensive economy plugin with shops, auctions, banking, and trading systems.",
      price: 19.99,
      rating: 4.7,
      downloads: 75000,
      thumbnail: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&h=300&fit=crop",
      category: "Economy"
    },
    {
      id: "mock-4",
      title: "Custom Enchants",
      description: "Add hundreds of unique enchantments to your server with custom effects and abilities.",
      price: 29.99,
      rating: 4.6,
      downloads: 40000,
      thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      category: "Enchants"
    },
    {
      id: "mock-5",
      title: "World Generator",
      description: "Create stunning custom worlds with biomes, structures, and terrain generation tools.",
      price: 34.99,
      rating: 4.8,
      downloads: 15000,
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      category: "World"
    },
    {
      id: "mock-6",
      title: "Anti-Cheat Shield",
      description: "Advanced anti-cheat protection with machine learning detection and real-time monitoring.",
      price: 49.99,
      rating: 4.9,
      downloads: 30000,
      thumbnail: "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=400&h=300&fit=crop",
      category: "Security"
    }
  ];

  return (
    <section id="prebuilt" className="py-20 bg-gradient-mesh">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Featured Plugins
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Discover our most popular and trusted plugins, crafted by expert developers 
            and loved by thousands of server owners worldwide.
          </p>
        </div>

        {/* Plugin Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : (
            plugins.map((plugin) => (
              <PluginCard
                key={plugin.id}
                id={plugin.id}
                title={plugin.title}
                description={plugin.description}
                price={plugin.price}
                rating={plugin.rating}
                downloads={plugin.downloads}
                thumbnail={plugin.thumbnail}
                category={plugin.category}
              />
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button variant="outline" size="lg">
            View All Plugins
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPlugins;