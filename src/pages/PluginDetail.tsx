import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, Download, Shield, Server, Users, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ReviewForm } from "@/components/ReviewForm";
import { ReviewsList } from "@/components/ReviewsList";
import { PluginStats } from "@/components/PluginStats";

interface Plugin {
  id: string;
  title: string;
  description: string;
  content: string;
  price: number;
  rating: number;
  downloads: number;
  thumbnail: string;
  category: string;
  features: string[];
  requirements: {
    minecraft_version?: string;
    server_type?: string;
    ram?: string;
    players?: string;
  };
  is_featured: boolean;
  created_at: string;
}

const PluginDetail = () => {
  const { id } = useParams();
  const [plugin, setPlugin] = useState<Plugin | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user, userRole } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlugin = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('plugins')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        const formattedPlugin = {
          ...data,
          features: Array.isArray(data.features) ? data.features as string[] : [],
          content: data.content || '',
          requirements: (typeof data.requirements === 'object' && data.requirements !== null && !Array.isArray(data.requirements)) ? data.requirements as any : {}
        };
        setPlugin(formattedPlugin);
      } catch (error) {
        console.error('Error fetching plugin:', error);
        toast({
          title: "Error",
          description: "Failed to load plugin details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlugin();
  }, [id, user, toast]);

  const checkPurchaseStatus = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('items')
        .eq('customer_id', user.id)
        .in('status', ['paid', 'completed']);

      if (error) throw error;

      const purchased = data?.some(order => {
        const items = Array.isArray(order.items) ? order.items : [];
        return items.some((item: any) => item.plugin_id === id);
      });

      setHasPurchased(purchased || false);
    } catch (error) {
      console.error('Error checking purchase status:', error);
    }
  };

  const checkExistingReview = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('plugin_reviews')
        .select('id, rating, review_text')
        .eq('plugin_id', id)
        .eq('customer_id', user.id)
        .single();

      if (data && !error) {
        setExistingReview(data);
      }
    } catch (error) {
      // No existing review found
    }
  };

  const handleReviewSubmitted = () => {
    // Refresh plugin data and reviews
    setShowReviewForm(false);
    checkExistingReview();
    // The PluginStats and ReviewsList components will refresh automatically
  };

  const handleEditReview = (review: { id: string; rating: number; review_text: string; }) => {
    setExistingReview(review);
    setShowReviewForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!plugin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Plugin Not Found</h1>
          <p className="text-muted-foreground mb-8">The plugin you're looking for doesn't exist.</p>
          <Link to="/">
            <Button variant="hero">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-20 pb-12 bg-gradient-mesh">
        <div className="container mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plugins
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Plugin Image */}
            <div className="relative">
              <img 
                src={plugin.thumbnail} 
                alt={plugin.title}
                className="w-full h-96 object-cover rounded-lg shadow-2xl"
              />
              <Badge className="absolute top-4 left-4 bg-primary/90">
                {plugin.category}
              </Badge>
              {plugin.is_featured && (
                <Badge className="absolute top-4 right-4 bg-gaming-orange">
                  Featured
                </Badge>
              )}
            </div>

            {/* Plugin Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-bold mb-4">{plugin.title}</h1>
                <p className="text-xl text-muted-foreground mb-6">{plugin.description}</p>
                
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 fill-gaming-orange text-gaming-orange" />
                    <span className="font-medium">{plugin.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-5 h-5 text-muted-foreground" />
                    <span>{plugin.downloads.toLocaleString()}+ downloads</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-8">
                  <div className="text-3xl font-bold">${plugin.price}</div>
                  <Link to={`/checkout/${plugin.id}`}>
                    <Button variant="hero" size="lg">
                      Buy Now
                    </Button>
                  </Link>
                  {(userRole === 'admin' || userRole === 'staff') && (
                    <Link to={`/admin/plugins/${plugin.id}/edit`}>
                      <Button variant="outline">Edit Plugin</Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {plugin.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="justify-start">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Plugin Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Plugin</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-invert max-w-none">
                    {plugin.content?.split('\n\n').map((paragraph, index) => {
                      if (paragraph.startsWith('##')) {
                        return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{paragraph.replace('## ', '')}</h3>;
                      } else if (paragraph.startsWith('- **')) {
                        const items = paragraph.split('\n').filter(item => item.startsWith('- **'));
                        return (
                          <ul key={index} className="list-disc list-inside space-y-2 mb-4">
                            {items.map((item, i) => (
                              <li key={i}>{item.replace('- **', '').replace('**:', ':')}</li>
                            ))}
                          </ul>
                        );
                      } else {
                        return <p key={index} className="mb-4 leading-relaxed">{paragraph}</p>;
                      }
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Reviews Section */}
              <div className="space-y-6">
                {/* Review Form - Only for purchasers */}
                {hasPurchased && user && (
                  <div>
                    {!showReviewForm && !existingReview && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">Share Your Experience</h3>
                            <p className="text-muted-foreground mb-4">
                              Help other customers by writing a review for this plugin
                            </p>
                            <Button 
                              onClick={() => setShowReviewForm(true)}
                              variant="hero"
                            >
                              Write a Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {existingReview && !showReviewForm && (
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h3 className="text-lg font-semibold mb-2">Your Review</h3>
                            <div className="flex justify-center mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-5 h-5 ${
                                    star <= existingReview.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-muted-foreground mb-4">
                              {existingReview.review_text || "No written review"}
                            </p>
                            <Button 
                              onClick={() => setShowReviewForm(true)}
                              variant="outline"
                            >
                              Edit Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {showReviewForm && (
                      <ReviewForm
                        pluginId={plugin.id}
                        pluginTitle={plugin.title}
                        onReviewSubmitted={handleReviewSubmitted}
                        existingReview={existingReview}
                      />
                    )}
                  </div>
                )}

                {/* Reviews List */}
                <ReviewsList
                  pluginId={plugin.id}
                  onEditReview={handleEditReview}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Plugin Stats */}
              <PluginStats pluginId={plugin.id} />

              {/* Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="w-5 h-5 mr-2" />
                    Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minecraft Version:</span>
                    <span className="font-medium">{plugin.requirements?.minecraft_version || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Server Type:</span>
                    <span className="font-medium">{plugin.requirements?.server_type || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">RAM:</span>
                    <span className="font-medium">{plugin.requirements?.ram || 'N/A'}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Players:</span>
                    <span className="font-medium">{plugin.requirements?.players || 'N/A'}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Support */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Support & Guarantee
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">24/7 Premium Support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">30-Day Money Back</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Lifetime Updates</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Installation Help</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PluginDetail;