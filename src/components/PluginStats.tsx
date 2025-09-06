import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Download, Users, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PluginStatsProps {
  pluginId: string;
}

interface Stats {
  average_rating: number;
  total_reviews: number;
  download_count: number;
  verified_purchases: number;
  rating_distribution: { [key: number]: number };
}

export const PluginStats = ({ pluginId }: PluginStatsProps) => {
  const [stats, setStats] = useState<Stats>({
    average_rating: 0,
    total_reviews: 0,
    download_count: 0,
    verified_purchases: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [pluginId]);

  const fetchStats = async () => {
    try {
      // Get plugin download count
      const { data: pluginData } = await supabase
        .from('plugins')
        .select('download_count, downloads')
        .eq('id', pluginId)
        .single();

      // Get reviews stats
      const { data: reviewsData } = await supabase
        .from('plugin_reviews')
        .select('rating, is_verified_purchase')
        .eq('plugin_id', pluginId);

      // Get verified purchases count
      const { data: ordersData } = await supabase
        .from('orders')
        .select('items')
        .in('status', ['paid', 'completed']);

      // Calculate stats
      const reviews = reviewsData || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
        : 0;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating as keyof typeof ratingDistribution]++;
      });

      // Count verified purchases
      let verifiedPurchases = 0;
      if (ordersData) {
        ordersData.forEach(order => {
          const items = Array.isArray(order.items) ? order.items : [];
          items.forEach((item: any) => {
            if (item.plugin_id === pluginId) {
              verifiedPurchases++;
            }
          });
        });
      }

      setStats({
        average_rating: Number(averageRating.toFixed(1)),
        total_reviews: totalReviews,
        download_count: pluginData?.download_count || 0,
        verified_purchases: verifiedPurchases,
        rating_distribution: ratingDistribution
      });

    } catch (error) {
      console.error('Error fetching plugin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5" />
          <span>Plugin Statistics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Overview */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-3xl font-bold">
              {stats.average_rating > 0 ? stats.average_rating : 'N/A'}
            </div>
            <div>
              {renderStars(stats.average_rating)}
              <div className="text-sm text-muted-foreground mt-1">
                {stats.total_reviews} review{stats.total_reviews !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        {stats.total_reviews > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Rating Breakdown</h4>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2 text-sm">
                <span className="w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{
                      width: `${stats.total_reviews > 0 ? (stats.rating_distribution[rating] / stats.total_reviews) * 100 : 0}%`
                    }}
                  />
                </div>
                <span className="w-8 text-muted-foreground">
                  {stats.rating_distribution[rating]}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Download Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Download className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Downloads</span>
            </div>
            <div className="text-xl font-bold">
              {formatNumber(stats.download_count)}
            </div>
          </div>
          
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <Users className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Purchases</span>
            </div>
            <div className="text-xl font-bold">
              {formatNumber(stats.verified_purchases)}
            </div>
          </div>
        </div>

        {/* Quality Indicators */}
        <div className="pt-4 border-t">
          <h4 className="font-medium text-sm mb-3">Quality Indicators</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Customer Satisfaction</span>
              <span className={`font-medium ${
                stats.average_rating >= 4.5 ? 'text-green-500' :
                stats.average_rating >= 4.0 ? 'text-yellow-500' :
                stats.average_rating >= 3.0 ? 'text-orange-500' : 'text-red-500'
              }`}>
                {stats.average_rating >= 4.5 ? 'Excellent' :
                 stats.average_rating >= 4.0 ? 'Very Good' :
                 stats.average_rating >= 3.0 ? 'Good' :
                 stats.average_rating > 0 ? 'Needs improvement' : 'No ratings yet'}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span>Review Coverage</span>
              <span className="font-medium">
                {stats.verified_purchases > 0 
                  ? `${Math.round((stats.total_reviews / stats.verified_purchases) * 100)}%`
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};