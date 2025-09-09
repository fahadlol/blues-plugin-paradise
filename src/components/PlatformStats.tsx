import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Download, Users, Package, TrendingUp, ShoppingCart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalPlugins: number;
  totalDownloads: number;
  totalUsers: number;
  totalOrders: number;
  averageRating: number;
  activeBundles: number;
}

const PlatformStats = () => {
  const [stats, setStats] = useState<PlatformStats>({
    totalPlugins: 0,
    totalDownloads: 0,
    totalUsers: 0,
    totalOrders: 0,
    averageRating: 0,
    activeBundles: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get plugin count and total downloads
      const { data: pluginsData } = await supabase
        .from('plugins')
        .select('download_count')
        .eq('is_active', true);

      // Get user count
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id');

      // Get orders count
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .in('status', ['paid', 'completed']);

      // Get average rating across all plugins
      const { data: reviewsData } = await supabase
        .from('plugin_reviews')
        .select('rating');

      // Get active bundles count
      const { data: bundlesData } = await supabase
        .from('bundles')
        .select('id')
        .eq('is_active', true);

      const totalPlugins = pluginsData?.length || 0;
      const totalDownloads = pluginsData?.reduce((sum, plugin) => sum + (plugin.download_count || 0), 0) || 0;
      const totalUsers = profilesData?.length || 0;
      const totalOrders = ordersData?.length || 0;
      const activeBundles = bundlesData?.length || 0;
      
      let averageRating = 0;
      if (reviewsData && reviewsData.length > 0) {
        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
        averageRating = Number((totalRating / reviewsData.length).toFixed(1));
      }

      setStats({
        totalPlugins,
        totalDownloads,
        totalUsers,
        totalOrders,
        averageRating,
        activeBundles
      });

    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const statItems = [
    {
      title: "Total Plugins",
      value: formatNumber(stats.totalPlugins),
      icon: Package,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Total Downloads", 
      value: formatNumber(stats.totalDownloads),
      icon: Download,
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Active Users",
      value: formatNumber(stats.totalUsers),
      icon: Users,
      color: "text-purple-500", 
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Completed Orders",
      value: formatNumber(stats.totalOrders),
      icon: ShoppingCart,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Average Rating",
      value: stats.averageRating > 0 ? `${stats.averageRating}★` : 'N/A',
      icon: Star,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Plugin Bundles",
      value: formatNumber(stats.activeBundles),
      icon: TrendingUp,
      color: "text-red-500",
      bgColor: "bg-red-500/10"
    }
  ];

  if (loading) {
    return (
      <section className="py-12 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Platform Statistics
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of server owners who trust our platform for their plugin needs
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statItems.map((stat, index) => (
            <Card key={index} className="group hover:shadow-glow transition-all duration-300 hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.title}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformStats;