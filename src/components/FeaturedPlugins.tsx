import PluginCard from "./PluginCard";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const FeaturedPlugins = () => {
  // Mock data for featured plugins
  const featuredPlugins = [
    {
      title: "EssentialsX Enhanced",
      description: "Complete server management toolkit with advanced features, permissions, and economy integration.",
      price: "$24.99",
      rating: 4.9,
      downloads: "50k+",
      thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
      category: "Management"
    },
    {
      title: "PvP Arena Pro",
      description: "Advanced PvP arena system with tournaments, rankings, and customizable game modes.",
      price: "$39.99",
      rating: 4.8,
      downloads: "25k+",
      thumbnail: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=400&h=300&fit=crop",
      category: "PvP"
    },
    {
      title: "Economy Plus",
      description: "Comprehensive economy plugin with shops, auctions, banking, and trading systems.",
      price: "$19.99",
      rating: 4.7,
      downloads: "75k+",
      thumbnail: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=400&h=300&fit=crop",
      category: "Economy"
    },
    {
      title: "Custom Enchants",
      description: "Add hundreds of unique enchantments to your server with custom effects and abilities.",
      price: "$29.99",
      rating: 4.6,
      downloads: "40k+",
      thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop",
      category: "Enchants"
    },
    {
      title: "World Generator",
      description: "Create stunning custom worlds with biomes, structures, and terrain generation tools.",
      price: "$34.99",
      rating: 4.8,
      downloads: "15k+",
      thumbnail: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
      category: "World"
    },
    {
      title: "Anti-Cheat Shield",
      description: "Advanced anti-cheat protection with machine learning detection and real-time monitoring.",
      price: "$49.99",
      rating: 4.9,
      downloads: "30k+",
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
          {featuredPlugins.map((plugin, index) => (
            <PluginCard
              key={index}
              title={plugin.title}
              description={plugin.description}
              price={plugin.price}
              rating={plugin.rating}
              downloads={plugin.downloads}
              thumbnail={plugin.thumbnail}
              category={plugin.category}
            />
          ))}
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