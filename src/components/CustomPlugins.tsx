import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Zap, Users, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CustomPlugins = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: user?.email || "",
    serverType: "",
    description: "",
    budget: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const serverTypes = [
    "SMP (Survival Multiplayer)",
    "Creative Server",
    "PvP Arena",
    "Minigames",
    "Roleplay",
    "Economy Server",
    "Prison Server",
    "Skyblock",
    "Faction Server",
    "Other"
  ];

  const customFeatures = [
    {
      icon: Code,
      title: "Custom Development",
      description: "Tailored plugins built from scratch to match your exact specifications and requirements.",
      color: "text-primary"
    },
    {
      icon: Zap,
      title: "Fast Delivery",
      description: "Most custom plugins delivered within 1-2 weeks, with regular progress updates.",
      color: "text-accent"
    },
    {
      icon: Users,
      title: "Ongoing Support",
      description: "6 months of free updates and bug fixes, plus priority support for your custom plugin.",
      color: "text-gaming-green"
    },
    {
      icon: Gamepad2,
      title: "Performance Optimized",
      description: "Every plugin is optimized for performance and tested across different server configurations.",
      color: "text-gaming-orange"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const requestData = {
        name: formData.name,
        email: formData.email,
        server_type: formData.serverType,
        description: formData.description,
        budget_range: formData.budget,
        user_id: user?.id || null,
        status: 'pending'
      };

      const { error } = await supabase
        .from('custom_plugin_requests')
        .insert(requestData);

      if (error) throw error;

      toast({
        title: "Request Submitted!",
        description: "We'll get back to you within 24 hours with a detailed quote.",
      });

      // Reset form
      setFormData({
        name: "",
        email: user?.email || "",
        serverType: "",
        description: "",
        budget: ""
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="custom" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Custom Plugin Development
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Need something unique for your server? Our expert developers create custom plugins 
            tailored to your exact specifications and vision.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Request Form */}
          <Card className="bg-gradient-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Request Your Custom Plugin</CardTitle>
              <CardDescription>
                Tell us about your project and we'll get back to you within 24 hours with a detailed quote.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your Name</label>
                    <Input
                      placeholder="Enter your name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Server Type</label>
                  <Select value={formData.serverType} onValueChange={(value) => handleInputChange('serverType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your server type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serverTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Plugin Description</label>
                  <Textarea
                    placeholder="Describe your plugin idea in detail. Include features, functionality, and any specific requirements..."
                    className="min-h-32"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Budget Range</label>
                  <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50-200">$50 - $200</SelectItem>
                      <SelectItem value="200-500">$200 - $500</SelectItem>
                      <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                      <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                      <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                      <SelectItem value="over-5000">Over $5,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="space-y-8">
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">Why Choose Custom Development?</h3>
              <p className="text-muted-foreground">
                When existing plugins don't meet your needs, custom development is the perfect solution 
                to create exactly what your server requires.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {customFeatures.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-6 bg-gradient-card border border-border rounded-lg hover:border-primary/50 transition-colors duration-300"
                  >
                    <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{feature.title}</h4>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
              <h4 className="font-semibold mb-2 text-primary">💡 Development Process</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Initial consultation and requirements gathering</li>
                <li>• Detailed quote and timeline estimation</li>
                <li>• Regular progress updates during development</li>
                <li>• Testing and quality assurance</li>
                <li>• Delivery with documentation and support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomPlugins;