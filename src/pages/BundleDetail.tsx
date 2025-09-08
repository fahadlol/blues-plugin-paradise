import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, ArrowLeft, ShoppingCart } from "lucide-react";
import { useBundles } from "@/hooks/useBundles";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BundleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBundleById, loading } = useBundles();
  const { toast } = useToast();
  const [bundle, setBundle] = useState<any>(null);

  useEffect(() => {
    document.title = "Bundle Details | Blues Marketplace";
  }, []);

  useEffect(() => {
    if (!loading && id) {
      const foundBundle = getBundleById(id);
      if (foundBundle) {
        setBundle(foundBundle);
      } else {
        toast({
          title: "Bundle not found",
          description: "The requested bundle could not be found.",
          variant: "destructive"
        });
        navigate("/");
      }
    }
  }, [id, getBundleById, loading, navigate, toast]);

  const handlePurchase = () => {
    if (bundle) {
      navigate(`/checkout/bundle/${bundle.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!bundle) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Bundle Not Found</h1>
          <Button onClick={() => navigate("/")} variant="hero">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <section className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Bundle Info */}
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <h1 className="text-4xl font-bold">{bundle.name}</h1>
                    {bundle.is_featured && (
                      <Badge className="bg-gradient-primary text-primary-foreground">
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-muted-foreground">{bundle.description}</p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>What's Included</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {bundle.features.map((feature: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Bundle Contents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      This bundle includes {bundle.plugin_ids.length} premium plugins:
                    </p>
                    <div className="space-y-2">
                      {bundle.plugin_ids.map((pluginId: string, index: number) => (
                        <div key={index} className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>Plugin #{index + 1} (ID: {pluginId.slice(0, 8)}...)</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Purchase Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-center">Get This Bundle</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        ${bundle.price.toFixed(2)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        One-time purchase, lifetime access
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Instant download access</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Lifetime updates</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>24/7 support included</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>30-day money back guarantee</span>
                      </div>
                    </div>

                    <Button 
                      variant="hero" 
                      size="lg" 
                      className="w-full"
                      onClick={handlePurchase}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Purchase Bundle
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                      Secure payment • 30-day guarantee • Instant access
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BundleDetail;