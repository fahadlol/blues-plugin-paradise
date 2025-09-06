import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ThumbsUp, Flag, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  customer_id: string;
  is_verified_purchase: boolean;
  profiles: {
    full_name: string;
    email: string;
  } | null;
}

interface ReviewsListProps {
  pluginId: string;
  onEditReview: (review: { id: string; rating: number; review_text: string; }) => void;
}

export const ReviewsList = ({ pluginId, onEditReview }: ReviewsListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });

  useEffect(() => {
    fetchReviews();
  }, [pluginId]);

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error } = await supabase
        .from('plugin_reviews')
        .select(`
          id,
          rating,
          review_text,
          created_at,
          customer_id,
          is_verified_purchase
        `)
        .eq('plugin_id', pluginId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately for users who left reviews
      const reviewsWithProfiles = await Promise.all(
        (reviewsData || []).map(async (review) => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', review.customer_id)
            .single();

          return {
            ...review,
            profiles: profileData
          };
        })
      );

      setReviews(reviewsWithProfiles);

      // Calculate stats
      if (reviewsData && reviewsData.length > 0) {
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
        const average = sum / total;
        
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviewsData.forEach(review => {
          distribution[review.rating as keyof typeof distribution]++;
        });

        setStats({ average, total, distribution });
      } else {
        setStats({ average: 0, total: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } });
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDisplayName = (review: Review) => {
    if (review.profiles?.full_name) {
      return review.profiles.full_name;
    }
    if (review.profiles?.email) {
      const emailParts = review.profiles.email.split('@');
      return emailParts[0];
    }
    return 'Anonymous User';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
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
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.total > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="text-4xl font-bold">{stats.average.toFixed(1)}</div>
                <div>
                  {renderStars(Math.round(stats.average))}
                  <div className="text-sm text-muted-foreground mt-1">
                    Based on {stats.total} review{stats.total !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm w-8">{rating}★</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${stats.total > 0 ? (stats.distribution[rating as keyof typeof stats.distribution] / stats.total) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-8">
                      {stats.distribution[rating as keyof typeof stats.distribution]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to review this plugin!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {getDisplayName(review).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{getDisplayName(review)}</span>
                        {review.is_verified_purchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {user && user.id === review.customer_id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditReview({
                        id: review.id,
                        rating: review.rating,
                        review_text: review.review_text || ""
                      })}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                {review.review_text && (
                  <p className="text-muted-foreground leading-relaxed">
                    {review.review_text}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};