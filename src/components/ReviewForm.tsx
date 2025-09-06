import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ReviewFormProps {
  pluginId: string;
  pluginTitle: string;
  onReviewSubmitted: () => void;
  existingReview?: {
    id: string;
    rating: number;
    review_text: string;
  };
}

export const ReviewForm = ({ 
  pluginId, 
  pluginTitle, 
  onReviewSubmitted,
  existingReview 
}: ReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.review_text || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a review",
        variant: "destructive"
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from('plugin_reviews')
          .update({
            rating: rating,
            review_text: reviewText.trim() || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingReview.id);

        if (error) throw error;

        toast({
          title: "Review Updated!",
          description: "Your review has been updated successfully"
        });
      } else {
        // Create new review
        const { error } = await supabase
          .from('plugin_reviews')
          .insert({
            plugin_id: pluginId,
            customer_id: user.id,
            rating: rating,
            review_text: reviewText.trim() || null,
            is_verified_purchase: true
          });

        if (error) throw error;

        toast({
          title: "Review Submitted!",
          description: "Thank you for your review. It helps other customers make informed decisions."
        });
      }

      onReviewSubmitted();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      
      if (error.message?.includes('unique constraint')) {
        toast({
          title: "Review Already Exists",
          description: "You have already reviewed this plugin. You can edit your existing review.",
          variant: "destructive"
        });
      } else if (error.message?.includes('must have purchased')) {
        toast({
          title: "Purchase Required",
          description: "You must purchase this plugin before you can review it.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to submit review. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? "Update Your Review" : "Write a Review"} for {pluginTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"}
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Review (Optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this plugin..."
              className="min-h-[100px]"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewText.length}/1000 characters
            </p>
          </div>

          {/* Verified Purchase Badge */}
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Verified Purchase
              </span>
            </div>
            <p className="text-xs text-green-600 dark:text-green-300 mt-1">
              This review will be marked as a verified purchase
            </p>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            disabled={submitting || rating === 0}
            className="w-full"
            variant="hero"
          >
            {submitting 
              ? "Submitting..." 
              : existingReview 
                ? "Update Review" 
                : "Submit Review"
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};